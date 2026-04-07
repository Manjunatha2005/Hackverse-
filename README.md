# 🌿 EcoSentinel AI — Environmental Pollution Monitoring System

> An AI-powered, real-time pollution monitoring platform with LSTM forecasting,
> multi-channel alerts, and an LLM chatbot assistant.

![EcoSentinel Dashboard](https://img.shields.io/badge/version-2.1.0-10B981?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge&logo=mongodb)

---

## 📋 Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Quick Start (Local)](#quick-start-local)
6. [Docker Deployment](#docker-deployment)
7. [API Reference](#api-reference)
8. [LSTM Model Training](#lstm-model-training)
9. [Alert Configuration](#alert-configuration)
10. [Environment Variables](#environment-variables)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Real-Time Dashboard** | Live KPI cards, charts, and data tables updating every 3 seconds |
| 🧠 **LSTM Predictions** | 24–48 hour PM2.5 forecasts with confidence intervals |
| 🚨 **Multi-Channel Alerts** | Email (SendGrid), SMS (Twilio), WebSocket push |
| 🤖 **AI Chatbot** | Claude-powered assistant for pollution queries |
| 🗺️ **Spatial Heatmap** | Zone-wise pollution distribution grid |
| 🌍 **Multi-City** | Monitor 6 cities simultaneously |
| 👥 **Role-Based Access** | Government, Public, Researcher tiers |
| 📈 **Trend Detection** | Linear regression slope analysis |
| 🐳 **Docker Ready** | One-command deployment |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ECOSENTINEL SYSTEM                     │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │   CSV Data   │──▶│  FastAPI     │───▶│   MongoDB     │  │
│  │   Sensors    │    │  Backend     │    │   Database    │  │
│  └──────────────┘    │  Port 8000   │    └───────────────┘  │
│                      │              │                       │
│  ┌──────────────┐    │  ┌────────┐  │    ┌───────────────┐  │
│  │  LSTM Model  │──▶│  │WebSocket│ │───▶│ React Frontend│  │
│  │  TensorFlow  │    │  │  /ws   │  │    │  Port 3000    │  │
│  └──────────────┘    │  └────────┘  │    └───────────────┘  │
│                      │              │                       │
│  ┌──────────────┐    │  ┌────────┐  │    ┌───────────────┐  │
│  │  Anthropic   │◀─▶│  │AI Agent│  │    │    Nginx      │  │
│  │  Claude API  │    │  └────────┘  │    │  Port 80      │  │
│  └──────────────┘    └──────────────┘    └───────────────┘  │
│                              │                              │
│                    ┌─────────┴──────────┐                   │
│                    ▼                    ▼                   │
│             ┌──────────┐        ┌──────────┐                │
│             │ SendGrid │        │  Twilio  │                │
│             │  Email   │        │   SMS    │                │
│             └──────────┘        └──────────┘                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
ecosentinel/
├── 📂 backend/
│   ├── 📂 app/
│   │   ├── main.py                 # FastAPI app + WebSocket
│   │   ├── 📂 db/
│   │   │   └── mongodb.py          # Async MongoDB driver
│   │   ├── 📂 models/
│   │   │   └── reading.py          # Pydantic schemas
│   │   ├── 📂 routes/
│   │   │   ├── data.py             # GET/POST /data
│   │   │   ├── alerts.py           # GET /alerts
│   │   │   └── predict.py          # GET /predict
│   │   └── 📂 services/
│   │       ├── analyzer.py         # AQI calc + classification
│   │       ├── alerter.py          # Email + SMS dispatcher
│   │       └── ai_agent.py         # Anthropic LLM agent
│   ├── requirements.txt
│   └── Dockerfile
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── App.jsx                 # Root component + routing
│   │   ├── 📂 components/
│   │   │   ├── Sidebar.jsx         # Navigation sidebar
│   │   │   ├── Ticker.jsx          # Live data ticker bar
│   │   │   └── KPICard.jsx         # Metric display card
│   │   ├── 📂 pages/
│   │   │   ├── Dashboard.jsx       # Main overview
│   │   │   ├── RealTime.jsx        # Live streaming charts
│   │   │   ├── Heatmap.jsx         # Spatial distribution
│   │   │   ├── Predictions.jsx     # LSTM forecast
│   │   │   ├── Alerts.jsx          # Alert management
│   │   │   ├── Recommendations.jsx # AI decisions
│   │   │   ├── Chatbot.jsx         # AI assistant
│   │   │   └── Admin.jsx           # Admin panel
│   │   └── 📂 services/
│   │       ├── api.js              # Axios REST client
│   │       ├── websocket.js        # WS client singleton
│   │       └── utils.js            # AQI helpers + simulation
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── Dockerfile
│
├── 📂 ml/
│   ├── train_lstm.py               # LSTM training script
│   └── 📂 model/                   # Saved weights (.h5 + scaler)
│
├── 📂 data/
│   └── sample_pollution.csv        # Sample dataset (52 rows)
│
├── 📂 nginx/
│   └── nginx.conf                  # Reverse proxy config
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 📦 Prerequisites

| Tool | Version | Install |
|---|---|---|
| Python | 3.11+ | [python.org](https://python.org) |
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| MongoDB | 7+ | [mongodb.com](https://mongodb.com) |
| Docker | 24+ | [docker.com](https://docker.com) *(optional)* |

---

## 🚀 Quick Start (Local)

### Step 1 — Clone & configure

```bash
git clone https://github.com/your-org/ecosentinel.git
cd ecosentinel

# Copy environment template
cp .env.example .env

# Edit .env with your API keys
# (ANTHROPIC_API_KEY is required for chatbot; others optional)
nano .env
```

### Step 2 — Start MongoDB

```bash
# Option A: Local MongoDB
mongod --dbpath /data/db

# Option B: Docker MongoDB only
docker run -d -p 27017:27017 --name mongo mongo:7
```

### Step 3 — Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at → **http://localhost:8000**
API docs at → **http://localhost:8000/docs**

### Step 4 — Ingest sample data

```bash
# From project root
curl -X POST http://localhost:8000/data/ingest \
  -H "Content-Type: application/json" \
  -d "{\"csv_content\": \"$(cat data/sample_pollution.csv | tr '\n' '|' | sed 's/|/\\n/g')\"}"

# OR use the Python helper
cd backend
python -c "
import httpx, pathlib
csv = pathlib.Path('../data/sample_pollution.csv').read_text()
r = httpx.post('http://localhost:8000/data/ingest', json={'csv_content': csv})
print(r.json())
"
```

### Step 5 — Train the LSTM model (optional)

```bash
cd ml
pip install tensorflow scikit-learn pandas numpy joblib

# Train with sample data
python train_lstm.py --csv ../data/sample_pollution.csv

# Train for a specific city only
python train_lstm.py --csv ../data/sample_pollution.csv --city delhi --epochs 100
```

Model saves to `ml/model/lstm_pollution.h5` and `ml/model/scaler.pkl`.

### Step 6 — Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at → **http://localhost:3000**

---

## 🐳 Docker Deployment

### One-command start (all services)

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with your API keys

# Build and start all containers
docker compose up --build -d

# Watch logs
docker compose logs -f

# Stop all services
docker compose down
```

Services started:
| Service | URL |
|---|---|
| React Dashboard | http://localhost:3000 |
| FastAPI Backend | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Nginx Proxy | http://localhost:80 |
| MongoDB | localhost:27017 |

### Individual container commands

```bash
# Rebuild only backend
docker compose up --build backend -d

# View backend logs
docker compose logs -f backend

# Access MongoDB shell
docker exec -it ecosentinel-mongo mongosh ecosentinel

# Scale backend for load (optional)
docker compose up --scale backend=3 -d
```

---

## 🛣️ API Reference

### Data Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/data/?city=delhi&limit=100` | Fetch latest readings |
| `GET` | `/data/latest?city=delhi` | Single latest reading |
| `GET` | `/data/stats?city=delhi` | Aggregate stats |
| `POST` | `/data/ingest` | Bulk CSV ingestion |
| `GET` | `/data/export?city=delhi` | Export as CSV |

### Alert Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/alerts/?city=delhi&level=critical` | Fetch alerts |
| `GET` | `/alerts/summary` | Count by severity |
| `POST` | `/alerts/` | Create manual alert |
| `DELETE` | `/alerts/clear?city=delhi` | Clear alerts |

### Prediction Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/predict/?city=delhi&hours_ahead=48` | PM2.5 forecast |
| `GET` | `/predict/aqi?city=delhi&hours_ahead=24` | Full AQI forecast |

### WebSocket

```javascript
// Connect to live stream
const ws = new WebSocket("ws://localhost:8000/ws/delhi");

ws.onmessage = (event) => {
  const { reading, alerts } = JSON.parse(event.data);
  console.log(reading.pm25, reading.aqi, alerts);
};
```

---

## 🧠 LSTM Model Training

The model uses a **Bidirectional LSTM** with 24-hour look-back to predict 48-hour PM2.5 levels.

```
Architecture:
  Input (24h × 8 features)
    → BiLSTM(128) + BatchNorm + Dropout(0.25)
    → BiLSTM(64)  + BatchNorm + Dropout(0.20)
    → LSTM(32)    + Dropout(0.15)
    → Dense(128, relu)
    → Dense(64,  relu)
    → Dense(48)   ← 48-hour forecast output

Features: pm25, pm10, co2, no2, so2, voc, hour, day_of_week
Loss:      Huber (robust to spikes)
Optimizer: Adam (lr=1e-3)
```

### Training commands

```bash
cd ml

# Basic training
python train_lstm.py

# With custom parameters
python train_lstm.py \
  --csv ../data/sample_pollution.csv \
  --city delhi \
  --epochs 100

# Model will save to:
#   ml/model/lstm_pollution.h5  (Keras model)
#   ml/model/scaler.pkl          (MinMaxScaler)
```

**Note:** The sample CSV has 52 rows. For production accuracy, use 6-12 months of hourly data (4,000+ rows). The model falls back to a statistical simulation if the H5 file is not found.

---

## 🚨 Alert Configuration

### Email (SendGrid)

1. Create account at [sendgrid.com](https://sendgrid.com)
2. Create an API key with **Mail Send** permission
3. Add to `.env`:

```bash
SENDGRID_API_KEY=SG.your-api-key-here
GOVT_EMAILS=official@cpcb.gov.in,admin@env.ministry.in
```

### SMS (Twilio)

1. Create account at [twilio.com](https://twilio.com)
2. Buy a phone number
3. Add to `.env`:

```bash
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_TOKEN=your_auth_token
TWILIO_FROM=+1XXXXXXXXXX
GOVT_PHONES=+911234567890,+919876543210
```

### Alert Threshold Customization

Edit `backend/app/services/alerter.py`:

```python
ALERT_THRESHOLDS = {
    "pm25": {"warning": 35.5,  "critical": 55.5},   # µg/m³
    "pm10": {"warning": 154.0, "critical": 254.0},  # µg/m³
    "co2":  {"warning": 1000,  "critical": 1500},   # ppm
    "no2":  {"warning": 100.0, "critical": 200.0},  # ppb
    "so2":  {"warning": 75.0,  "critical": 185.0},  # ppb
}
```

---

## 🔐 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URL` | ✅ | MongoDB connection string |
| `ANTHROPIC_API_KEY` | 🔶 | Claude API for chatbot (optional — fallback built-in) |
| `SENDGRID_API_KEY` | 🔶 | Email alert delivery |
| `TWILIO_SID` | 🔶 | SMS alert delivery |
| `TWILIO_TOKEN` | 🔶 | Twilio auth token |
| `TWILIO_FROM` | 🔶 | Twilio sender phone number |
| `GOVT_EMAILS` | 🔶 | Comma-separated alert recipient emails |
| `GOVT_PHONES` | 🔶 | Comma-separated alert recipient phones |
| `LSTM_MODEL_PATH` | 🔶 | Path to trained `.h5` model file |
| `VITE_API_URL` | ✅ | Backend URL for frontend (e.g. `http://localhost:8000`) |
| `VITE_WS_URL` | ✅ | WebSocket URL (e.g. `ws://localhost:8000`) |

✅ = Required · 🔶 = Optional (graceful fallback)

---

## 🎨 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Chart.js |
| **Backend** | FastAPI, Uvicorn, WebSocket |
| **Database** | MongoDB 7, Motor (async driver) |
| **AI Model** | TensorFlow/Keras, Bidirectional LSTM |
| **AI Agent** | Anthropic Claude (claude-sonnet-4-20250514) |
| **Email** | SendGrid |
| **SMS** | Twilio |
| **Proxy** | Nginx |
| **Container** | Docker, Docker Compose |

---

## 🔒 Security Notes

- Never commit `.env` to version control (it's in `.gitignore`)
- Use environment-specific API keys
- Rotate Twilio/SendGrid keys periodically
- Enable MongoDB authentication in production
- Place the app behind HTTPS (use Let's Encrypt + Certbot)

---

## 📊 Sample Data Format

The system accepts CSV with these columns:

```csv
timestamp,city,lat,lon,pm25,pm10,co2,no2,so2,voc,aqi,status
2024-01-15 08:00:00,delhi,28.61,77.20,105.4,168.2,545,78.5,32.6,54.8,195,Unhealthy
```

All columns except `aqi` and `status` can be auto-calculated if omitted.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/add-ozone-sensor`)
3. Commit your changes (`git commit -m 'Add O3 monitoring'`)
4. Push to branch (`git push origin feature/add-ozone-sensor`)
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with ❤️ by EcoSentinel Team — protecting communities through data-driven environmental intelligence.*
