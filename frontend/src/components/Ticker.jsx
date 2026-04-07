/**
 * Live data ticker bar at the top of every page.
 */
import React from "react";

export default function Ticker({ latest }) {
  if (!latest) return null;
  const now = new Date(latest.timestamp);
  const items = [
    { label: "PM2.5", value: `${latest.pm25}µg`, unit: "" },
    { label: "PM10",  value: `${latest.pm10}µg`, unit: "" },
    { label: "CO2",   value: `${latest.co2}`,    unit: "ppm" },
    { label: "NO2",   value: `${latest.no2}`,    unit: "ppb" },
    { label: "SO2",   value: `${latest.so2}`,    unit: "ppb" },
    { label: "VOC",   value: `${latest.voc}`,    unit: "ppb" },
    { label: "AQI",   value: `${latest.aqi}`,    unit: "" },
  ];

  const statusColor =
    latest.status === "Safe"      ? "#10B981" :
    latest.status === "Moderate"  ? "#F59E0B" :
    latest.status === "Unhealthy" ? "#EF4444" : "#EF4444";

  return (
    <div style={{
      background: "var(--surface)", borderBottom: "1px solid var(--border)",
      padding: "6px 20px", fontSize: 11, color: "var(--text2)",
      fontFamily: "JetBrains Mono, monospace", display: "flex",
      gap: 24, alignItems: "center", overflowX: "auto", whiteSpace: "nowrap",
      flexShrink: 0,
    }}>
      {items.map(({ label, value, unit }) => (
        <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{ color: "var(--text3)" }}>{label}</span>
          <span style={{ color: "var(--text)", fontWeight: 500 }}>{value}{unit}</span>
        </span>
      ))}
      <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{
          background: `${statusColor}22`, color: statusColor,
          padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600,
        }}>● {latest.status}</span>
        <span style={{ color: "var(--text3)" }}>{now.toLocaleTimeString()}</span>
      </span>
    </div>
  );
}
