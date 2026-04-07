/**
 * KPI Card — displays a single pollutant metric with status indicator.
 */
import React from "react";

const STATUS_STYLES = {
  safe:      { border: "#10B981", badge: "rgba(16,185,129,0.12)",  text: "#10B981" },
  moderate:  { border: "#F59E0B", badge: "rgba(245,158,11,0.12)",  text: "#F59E0B" },
  unhealthy: { border: "#EF4444", badge: "rgba(239,68,68,0.12)",   text: "#EF4444" },
  hazardous: { border: "#EF4444", badge: "rgba(239,68,68,0.20)",   text: "#EF4444" },
};

export default function KPICard({ label, value, unit, status, trend, trendVal }) {
  const s = STATUS_STYLES[status?.cls || "safe"];
  const trendUp = parseFloat(trendVal) > 0;

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderTop: `2px solid ${s.border}`, borderRadius: 12, padding: 16,
      display: "flex", flexDirection: "column", gap: 4,
    }}>
      <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace",
        letterSpacing: "0.1em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>
        {value ?? "—"}
      </div>
      <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "JetBrains Mono, monospace" }}>
        {unit}
      </div>
      {status && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6,
          background: s.badge, color: s.text, padding: "3px 8px", borderRadius: 4,
          fontSize: 11, fontWeight: 600, alignSelf: "flex-start",
        }}>
          ● {status.label}
        </div>
      )}
      {trendVal !== undefined && (
        <div style={{
          fontSize: 11, color: trendUp ? "#EF4444" : "#10B981",
          fontFamily: "JetBrains Mono, monospace", marginTop: 4,
        }}>
          {trendUp ? "▲" : "▼"} {Math.abs(parseFloat(trendVal))} from last
        </div>
      )}
    </div>
  );
}
