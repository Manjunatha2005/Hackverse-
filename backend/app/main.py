"""
EcoSentinel FastAPI Backend
Real-time pollution monitoring with WebSocket streaming.
"""
import os, asyncio, random, logging
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .db.mongodb import get_db, close_db
from .routes import data, alerts, predict
from .services.analyzer import analyze_reading, detect_spike
from .services.alerter import check_and_dispatch

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Simulated city baselines (used when no live CSV feed) ---
CITY_BASELINES = {
    "delhi":     {"pm25":85,"pm10":140,"co2":520,"no2":65,"so2":28,"voc":45,"lat":28.61,"lon":77.20},
    "mumbai":    {"pm25":55,"pm10":95, "co2":490,"no2":48,"so2":18,"voc":32,"lat":19.07,"lon":72.87},
    "bangalore": {"pm25":38,"pm10":68, "co2":440,"no2":32,"so2":12,"voc":24,"lat":12.97,"lon":77.59},
    "beijing":   {"pm25":110,"pm10":175,"co2":580,"no2":88,"so2":45,"voc":62,"lat":39.90,"lon":116.40},
    "la":        {"pm25":18,"pm10":38, "co2":420,"no2":28,"so2":8, "voc":18,"lat":34.05,"lon":-118.24},
    "london":    {"pm25":22,"pm10":45, "co2":430,"no2":35,"so2":10,"voc":20,"lat":51.50,"lon":-0.12},
}

_last_readings: dict = {}


def simulate_reading(city: str) -> dict:
    b = CITY_BASELINES.get(city, CITY_BASELINES["delhi"])
    hr = datetime.utcnow().hour
    rush = 1.4 if (7 <= hr <= 9 or 17 <= hr <= 20) else 1.0
    night = 0.7 if hr < 5 else 1.0
    mult = rush * night

    def jitter(base, pct=0.25):
        return round(max(0, base * mult * (1 + (random.random() - 0.5) * pct)), 1)

    return {
        "timestamp": datetime.utcnow().isoformat(),
        "city": city,
        "lat":  b["lat"], "lon": b["lon"],
        "pm25": jitter(b["pm25"]),
        "pm10": jitter(b["pm10"]),
        "co2":  round(jitter(b["co2"]), 0),
        "no2":  jitter(b["no2"]),
        "so2":  jitter(b["so2"]),
        "voc":  jitter(b["voc"]),
    }


# --- WebSocket connection manager ---
class WSManager:
    def __init__(self):
        self.connections: dict[str, list[WebSocket]] = {}  # city -> [ws]

    async def connect(self, ws: WebSocket, city: str):
        await ws.accept()
        self.connections.setdefault(city, []).append(ws)
        logger.info(f"WS connected: {city} ({len(self.connections[city])} clients)")

    def disconnect(self, ws: WebSocket, city: str):
        if city in self.connections:
            self.connections[city] = [c for c in self.connections[city] if c != ws]

    async def broadcast_city(self, city: str, data: dict):
        dead = []
        for ws in self.connections.get(city, []):
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws, city)

    async def broadcast_all(self, data: dict):
        for city in list(self.connections.keys()):
            await self.broadcast_city(city, data)


manager = WSManager()


# --- Background streaming task ---
async def sensor_loop():
    """Continuously generate readings and broadcast to subscribers."""
    while True:
        try:
            db = await get_db()
            for city in CITY_BASELINES:
                reading = simulate_reading(city)
                enriched = analyze_reading(reading)

                # Spike detection
                prev = _last_readings.get(city)
                if prev:
                    spikes = detect_spike(enriched, prev)
                    if spikes:
                        enriched["spike_detected"] = spikes

                _last_readings[city] = enriched

                # Persist to MongoDB
                await db.readings.insert_one({**enriched, "_id_omit": True})

                # Check thresholds → dispatch alerts
                new_alerts = check_and_dispatch(enriched, prev)
                if new_alerts:
                    await db.alerts.insert_many(new_alerts)
                    enriched["alerts"] = new_alerts

                # Broadcast to subscribed WS clients
                await manager.broadcast_city(city, enriched)

            await asyncio.sleep(3)  # 3-second update cycle
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Sensor loop error: {e}")
            await asyncio.sleep(5)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🌿 EcoSentinel starting up...")
    task = asyncio.create_task(sensor_loop())
    yield
    # Shutdown
    task.cancel()
    await close_db()
    logger.info("EcoSentinel shut down.")


app = FastAPI(
    title="EcoSentinel API",
    version="2.1.0",
    description="AI-powered Environmental Pollution Monitoring System",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(data.router,    prefix="/data",    tags=["Data"])
app.include_router(alerts.router,  prefix="/alerts",  tags=["Alerts"])
app.include_router(predict.router, prefix="/predict", tags=["Predictions"])


@app.get("/")
async def root():
    return {"name": "EcoSentinel API", "version": "2.1.0", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "ok", "cities": list(CITY_BASELINES.keys())}


@app.websocket("/ws/{city}")
async def websocket_endpoint(websocket: WebSocket, city: str):
    """Real-time WebSocket stream for a specific city."""
    if city not in CITY_BASELINES:
        await websocket.close(code=4004)
        return
    await manager.connect(websocket, city)
    try:
        # Send latest reading immediately on connect
        if city in _last_readings:
            await websocket.send_json(_last_readings[city])
        while True:
            # Keep alive — listen for client ping
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, city)


@app.post("/chat")
async def chat_endpoint(body: dict):
    """AI chatbot endpoint using Claude."""
    from .services.ai_agent import chat_response
    message = body.get("message", "")
    city    = body.get("city", "delhi")
    reading = _last_readings.get(city, {})
    reply = await chat_response(message, {"city": city, "reading": reading})
    return {"reply": reply}


@app.post("/ai/analyze")
async def ai_analyze(body: dict):
    """AI Decision Agent — generate recommendations."""
    from .services.ai_agent import get_ai_analysis
    city    = body.get("city", "delhi")
    reading = _last_readings.get(city, simulate_reading(city))
    result  = get_ai_analysis(reading, city)
    return result
