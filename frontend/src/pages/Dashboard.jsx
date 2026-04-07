/**
 * Dashboard — Main overview page with KPIs, charts, and recent data table.
 */
import React, { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import KPICard from "../components/KPICard.jsx";
import { classifyAQI, classifyPollutant, CITIES, THRESHOLDS, downloadCSV } from "../services/utils.js";

Chart.register(...registerables);

const CHART_OPTS = {
  responsive: true, maintainAspectRatio: false, animation: { duration: 400 },
  plugins: { legend: { display: false },
    tooltip: { backgroundColor: "#1E293B", titleColor: "#94A3B8",
      bodyColor: "#F1F5F9", borderColor: "rgba(241,245,249,0.1)", borderWidth: 1 } },
  scales: {
    x: { grid: { color: "rgba(241,245,249,0.04)" }, ticks: { color: "#64748B", font: { size: 10, family: "JetBrains Mono" }, maxTicksLimit: 8 } },
    y: { grid: { color: "rgba(241,245,249,0.04)" }, ticks: { color: "#64748B", font: { size: 10, family: "JetBrains Mono" } } },
  },
};

export default function Dashboard({ city, latest, readings, onSpike }) {
  const pmRef   = useRef(null);
  const gasRef  = useRef(null);
  const pmChart = useRef(null);
  const gasChart = useRef(null);

  // Init charts
  useEffect(() => {
    if (pmRef.current && !pmChart.current) {
      pmChart.current = new Chart(pmRef.current, {
        type: "line",
        data: { labels: [], datasets: [
          { label: "PM2.5", data: [], borderColor: "#10B981", tension: 0.4, pointRadius: 0, borderWidth: 2, backgroundColor: "rgba(16,185,129,0.08)", fill: true },
          { label: "PM10",  data: [], borderColor: "#3B82F6", tension: 0.4, pointRadius: 0, borderWidth: 2, backgroundColor: "rgba(59,130,246,0.04)", fill: true },
        ]},
        options: { ...CHART_OPTS, plugins: { ...CHART_OPTS.plugins,
          legend: { display: true, labels: { color: "#94A3B8", boxWidth: 12, font: { size: 11 } } } } },
      });
    }
    if (gasRef.current && !gasChart.current) {
      gasChart.current = new Chart(gasRef.current, {
        type: "line",
        data: { labels: [], datasets: [
          { label: "CO2÷10", data: [], borderColor: "#F59E0B", tension: 0.4, pointRadius: 0, borderWidth: 2, backgroundColor: "rgba(245,158,11,0.06)", fill: true },
          { label: "NO2",    data: [], borderColor: "#8B5CF6", tension: 0.4, pointRadius: 0, borderWidth: 2, fill: false },
        ]},
        options: { ...CHART_OPTS, plugins: { ...CHART_OPTS.plugins,
          legend: { display: true, labels: { color: "#94A3B8", boxWidth: 12, font: { size: 11 } } } } },
      });
    }
    return () => {
      pmChart.current?.destroy();  pmChart.current  = null;
      gasChart.current?.destroy(); gasChart.current = null;
    };
  }, []);

  // Push new reading to charts
  useEffect(() => {
    if (!latest) return;
    const lbl = new Date(latest.timestamp).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });
    const push = (chart, label, vals, maxLen = 30) => {
      chart.data.labels.push(label);
      vals.forEach((v, i) => chart.data.datasets[i].data.push(v));
      if (chart.data.labels.length > maxLen) {
        chart.data.labels.shift();
        chart.data.datasets.forEach((d) => d.data.shift());
      }
      chart.update("none");
    };
    if (pmChart.current)  push(pmChart.current,  lbl, [latest.pm25, latest.pm10]);
    if (gasChart.current) push(gasChart.current, lbl, [+(latest.co2 / 10).toFixed(1), latest.no2]);
  }, [latest]);

  if (!latest) return <div style={{ color: "var(--text3)", padding: 40 }}>Loading sensor data...</div>;

  const prev   = readings[readings.length - 2] || latest;
  const status = classifyAQI(latest.aqi);
  const city_  = CITIES[city];

  const kpis = [
    { label: "PM2.5",    value: latest.pm25, unit: "µg/m³", key: "pm25",  trend: (latest.pm25 - prev.pm25).toFixed(1) },
    { label: "PM10",     value: latest.pm10, unit: "µg/m³", key: "pm10",  trend: (latest.pm10 - prev.pm10).toFixed(1) },
    { label: "CO2",      value: latest.co2,  unit: "ppm",   key: "co2",   trend: (latest.co2  - prev.co2).toFixed(0)  },
    { label: "AQI INDEX",value: latest.aqi,  unit: "Air Quality Index", key: null, trend: (latest.aqi - prev.aqi).toFixed(0), overrideStatus: status },
  ];

  const secondary = [
    { label: "NO2 — Nitrogen Dioxide",     value: latest.no2, unit: "ppb", key: "no2" },
    { label: "SO2 — Sulfur Dioxide",       value: latest.so2, unit: "ppb", key: "so2" },
    { label: "VOC — Volatile Organic Cmpd",value: latest.voc, unit: "ppb", key: "voc" },
  ];

  // Threshold progress bars
  const bars = [
    { key: "pm25", val: latest.pm25, max: 200, label: "PM2.5" },
    { key: "pm10", val: latest.pm10, max: 400, label: "PM10"  },
    { key: "no2",  val: latest.no2,  max: 400, label: "NO2"   },
    { key: "so2",  val: latest.so2,  max: 304, label: "SO2"   },
    { key: "voc",  val: latest.voc,  max: 400, label: "VOC"   },
  ];

  const barColors = { safe: "#10B981", moderate: "#F59E0B", unhealthy: "#EF4444", hazardous: "#EF4444" };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>{city_?.name}</h1>
          <p style={{ fontSize: 13, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace", marginTop: 2 }}>
            AQI {latest.aqi} — {status.label} · Updated {new Date(latest.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => downloadCSV(readings)} style={{
            padding: "7px 14px", background: "var(--surface2)", border: "1px solid var(--border2)",
            borderRadius: 8, color: "var(--text2)", fontSize: 12, cursor: "pointer", fontFamily: "Syne, sans-serif", fontWeight: 600,
          }}>↓ Export CSV</button>
          <button onClick={onSpike} style={{
            padding: "7px 14px", background: "var(--primary)", border: "none",
            borderRadius: 8, color: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "Syne, sans-serif", fontWeight: 600,
          }}>⚡ Simulate Spike</button>
        </div>
      </div>

      {/* Primary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
        {kpis.map((k) => (
          <KPICard key={k.label} label={k.label} value={k.value} unit={k.unit}
            status={k.overrideStatus || (k.key ? classifyPollutant(k.key, k.value) : status)}
            trendVal={k.trend} />
        ))}
      </div>

      {/* Secondary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        {secondary.map((k) => (
          <KPICard key={k.label} label={k.label} value={k.value} unit={k.unit}
            status={classifyPollutant(k.key, k.value)} />
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace",
            letterSpacing: "0.08em", marginBottom: 12 }}>PM2.5 & PM10 — 24HR TREND</div>
          <div style={{ position: "relative", height: 260 }}><canvas ref={pmRef} /></div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace",
            letterSpacing: "0.08em", marginBottom: 12 }}>CO2 & NO2 TREND</div>
          <div style={{ position: "relative", height: 260 }}><canvas ref={gasRef} /></div>
        </div>
      </div>

      {/* Threshold bars + Recent table */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace",
            letterSpacing: "0.08em", marginBottom: 16 }}>POLLUTANT LEVELS vs THRESHOLDS</div>
          {bars.map((b) => {
            const pct = Math.min(100, (b.val / b.max) * 100);
            const cls = classifyPollutant(b.key, b.val);
            return (
              <div key={b.key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "var(--text2)", width: 44, fontFamily: "JetBrains Mono, monospace" }}>{b.label}</div>
                <div style={{ flex: 1, height: 6, background: "rgba(241,245,249,0.08)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct.toFixed(1)}%`,
                    background: barColors[cls.cls], borderRadius: 3, transition: "width 0.8s ease" }} />
                </div>
                <div style={{ fontSize: 11, color: "var(--text3)", width: 48, textAlign: "right",
                  fontFamily: "JetBrains Mono, monospace" }}>{b.val}</div>
              </div>
            );
          })}
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace",
            letterSpacing: "0.08em", marginBottom: 12 }}>RECENT READINGS</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>{["TIME","PM2.5","PM10","CO2","AQI","STATUS"].map((h) => (
                  <th key={h} style={{ padding: "6px 10px", textAlign: "left", color: "var(--text3)",
                    fontFamily: "JetBrains Mono, monospace", fontSize: 10, borderBottom: "1px solid var(--border)",
                    fontWeight: 500, letterSpacing: "0.06em" }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {readings.slice(-8).reverse().map((r, i) => {
                  const s = classifyAQI(r.aqi);
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "8px 10px", color: "var(--text3)", fontFamily: "JetBrains Mono, monospace", fontSize: 11 }}>
                        {new Date(r.timestamp).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: "8px 10px", color: "var(--text2)" }}>{r.pm25}</td>
                      <td style={{ padding: "8px 10px", color: "var(--text2)" }}>{r.pm10}</td>
                      <td style={{ padding: "8px 10px", color: "var(--text2)" }}>{r.co2}</td>
                      <td style={{ padding: "8px 10px", color: "var(--text2)" }}>{r.aqi}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <span style={{
                          background: s.bg, color: s.color, padding: "2px 8px",
                          borderRadius: 10, fontSize: 11, fontWeight: 600,
                        }}>● {s.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
