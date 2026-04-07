/**
 * Sidebar navigation component
 */
import React from "react";
import { CITIES } from "../services/utils.js";

const NAV = [
  { group: "MONITORING", items: [
    { id: "dashboard",    label: "Dashboard",    icon: "⊞" },
    { id: "realtime",     label: "Real-Time",    icon: "〜" },
    { id: "heatmap",      label: "Heatmap",      icon: "◉" },
  ]},
  { group: "ANALYSIS", items: [
    { id: "predictions",  label: "Predictions",  icon: "↗" },
    { id: "alerts",       label: "Alerts",       icon: "⚠" },
    { id: "recommendations", label: "AI Decisions", icon: "✓" },
  ]},
  { group: "TOOLS", items: [
    { id: "chatbot",      label: "AI Chatbot",   icon: "💬" },
    { id: "admin",        label: "Admin",        icon: "⚙" },
  ]},
];

export default function Sidebar({ page, onNavigate, city, onCityChange, alertCount }) {
  return (
    <aside style={{
      background: "var(--surface)", borderRight: "1px solid var(--border)",
      width: 220, height: "100vh", position: "fixed", left: 0, top: 0,
      display: "flex", flexDirection: "column", zIndex: 100, overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: "var(--primary)", borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, flexShrink: 0,
          }}>🌿</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", letterSpacing: "0.04em" }}>
              EcoSentinel
            </div>
            <div style={{ fontSize: 10, color: "var(--primary)", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.1em" }}>
              AI MONITOR v2.1
            </div>
          </div>
        </div>
      </div>

      {/* Live badge */}
      <div style={{
        margin: "12px 14px", background: "rgba(16,185,129,0.10)",
        border: "1px solid rgba(16,185,129,0.28)", borderRadius: 6,
        padding: "6px 10px", display: "flex", alignItems: "center", gap: 8,
        fontSize: 11, color: "var(--primary)", fontFamily: "JetBrains Mono, monospace",
      }}>
        <div className="pulse" style={{
          width: 7, height: 7, background: "var(--primary)", borderRadius: "50%",
        }} />
        LIVE MONITORING
      </div>

      {/* Nav */}
      {NAV.map(({ group, items }) => (
        <div key={group}>
          <div style={{
            padding: "14px 16px 6px", fontSize: 10, color: "var(--text3)",
            letterSpacing: "0.12em", fontFamily: "JetBrains Mono, monospace",
          }}>{group}</div>
          {items.map(({ id, label, icon }) => (
            <button key={id} onClick={() => onNavigate(id)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "9px 16px", cursor: "pointer", background: "none", border: "none",
              borderLeft: `2px solid ${page === id ? "var(--primary)" : "transparent"}`,
              color: page === id ? "var(--primary)" : "var(--text2)",
              background: page === id ? "rgba(16,185,129,0.08)" : "transparent",
              fontSize: 13, fontWeight: 500, fontFamily: "Syne, sans-serif",
              textAlign: "left", transition: "all 0.15s", cursor: "pointer",
            }}>
              <span style={{ fontSize: 14, opacity: page === id ? 1 : 0.65 }}>{icon}</span>
              {label}
              {id === "alerts" && alertCount > 0 && (
                <span style={{
                  marginLeft: "auto", background: "var(--red)", color: "#fff",
                  fontSize: 10, padding: "1px 6px", borderRadius: 8, fontWeight: 700,
                }}>{alertCount}</span>
              )}
            </button>
          ))}
        </div>
      ))}

      {/* City selector */}
      <div style={{ marginTop: "auto", padding: 16, borderTop: "1px solid var(--border)" }}>
        <div style={{
          fontSize: 10, color: "var(--text3)", marginBottom: 6,
          fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.08em",
        }}>MONITORING CITY</div>
        <select
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          style={{
            width: "100%", background: "var(--surface2)", border: "1px solid var(--border2)",
            borderRadius: 8, padding: "8px 10px", color: "var(--text)", fontSize: 12,
            fontFamily: "Syne, sans-serif", cursor: "pointer", outline: "none",
          }}
        >
          {Object.entries(CITIES).map(([key, c]) => (
            <option key={key} value={key} style={{ background: "var(--surface)" }}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
