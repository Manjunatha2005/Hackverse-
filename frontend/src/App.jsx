/**
 * EcoSentinel — Root Application Component
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
import Sidebar      from "./components/Sidebar.jsx";
import Dashboard    from "./pages/Dashboard.jsx";
import RealTime     from "./pages/RealTime.jsx";
import Heatmap      from "./pages/Heatmap.jsx";
import Predictions  from "./pages/Predictions.jsx";
import Ticker       from "./components/Ticker.jsx";
import { Alerts, Recommendations, Chatbot, Admin } from "./pages/OtherPages.jsx";
import wsClient     from "./services/websocket.js";
import { simulateReading, CITIES } from "./services/utils.js";

export default function App() {
  const [page,      setPage]      = useState("dashboard");
  const [city,      setCity]      = useState("delhi");
  const [readings,  setReadings]  = useState([]);
  const [latest,    setLatest]    = useState(null);
  const [alerts,    setAlerts]    = useState([]);
  const [paused,    setPaused]    = useState(false);
  const pausedRef = useRef(false);

  // ── Local simulation (works without backend) ──────────────────────────────
  useEffect(() => {
    let interval;
    const tick = () => {
      if (pausedRef.current) return;
      const r = simulateReading(city);
      setLatest(r);
      setReadings((prev) => {
        const next = [...prev, r];
        return next.length > 300 ? next.slice(-300) : next;
      });
      // Auto threshold alerts
      if (r.pm25 > 55.5) {
        pushAlert({ level:"critical", parameter:"PM2.5", value:r.pm25, city,
          message:`PM2.5 CRITICAL: ${r.pm25} µg/m³ in ${CITIES[city]?.name}`,
          timestamp: r.timestamp });
      } else if (r.pm25 > 35.5) {
        pushAlert({ level:"warning", parameter:"PM2.5", value:r.pm25, city,
          message:`PM2.5 elevated: ${r.pm25} µg/m³ in ${CITIES[city]?.name}`,
          timestamp: r.timestamp });
      }
    };
    tick();
    interval = setInterval(tick, 3000);
    return () => clearInterval(interval);
  }, [city]);

  const pushAlert = useCallback((alert) => {
    setAlerts((prev) => {
      const now = Date.now();
      const dup = prev.find(
        (a) => a.message === alert.message && now - new Date(a.timestamp).getTime() < 30_000
      );
      if (dup) return prev;
      return [{ ...alert, _id: Math.random().toString(36).slice(2) }, ...prev].slice(0, 50);
    });
  }, []);

  const handlePause = () => {
    const next = !paused;
    setPaused(next);
    pausedRef.current = next;
  };

  const handleCityChange = (c) => {
    setCity(c);
    setReadings([]);
    setLatest(null);
  };

  const simulateSpike = () => {
    const r = simulateReading(city);
    r.pm25 = 185; r.pm10 = 290; r.no2 = 185; r.aqi = 325; r.status = "Hazardous";
    setLatest(r);
    setReadings((prev) => [...prev, r].slice(-300));
    pushAlert({ level:"critical", parameter:"PM2.5", value:185, city,
      message:`⚡ SUDDEN SPIKE — PM2.5: 185 µg/m³ in ${CITIES[city]?.name}. Emergency protocol activated.`,
      timestamp: r.timestamp });
  };

  const shared = {
    city, latest, readings, alerts, paused,
    onPause: handlePause, onCityChange: handleCityChange,
    onSpike: simulateSpike, onAlert: pushAlert,
    onClearAlerts: () => setAlerts([]),
  };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", minHeight:"100vh" }}>
      <Sidebar
        page={page} onNavigate={setPage}
        city={city} onCityChange={handleCityChange}
        alertCount={alerts.filter(a => a.level === "critical").length}
      />
      <div style={{ display:"flex", flexDirection:"column" }}>
        <Ticker latest={latest} />
        <div style={{ flex:1, padding:24 }}>
          {page === "dashboard"       && <Dashboard       {...shared} />}
          {page === "realtime"        && <RealTime        {...shared} />}
          {page === "heatmap"         && <Heatmap         {...shared} />}
          {page === "predictions"     && <Predictions     {...shared} />}
          {page === "alerts"          && <Alerts          {...shared} />}
          {page === "recommendations" && <Recommendations {...shared} />}
          {page === "chatbot"         && <Chatbot         {...shared} />}
          {page === "admin"           && <Admin           {...shared} />}
        </div>
      </div>
    </div>
  );
}
