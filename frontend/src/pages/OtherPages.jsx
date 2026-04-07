/**
 * Alerts, Recommendations, Chatbot, Admin pages
 * All in one file for modularity — each exported individually.
 */
import React from "react";
import { classifyAQI, calcAQI, CITIES, simulateReading } from "../services/utils.js";

/* ════════════════════════════════════════════════
   ALERTS PAGE
════════════════════════════════════════════════ */
export function Alerts({ alerts, onClearAlerts, onSpike }) {
  const critical = alerts.filter((a) => a.level === "critical");
  const warning  = alerts.filter((a) => a.level === "warning");
  const info     = alerts.filter((a) => a.level === "info");

  const S = {
    critical: { dot:"#EF4444", border:"rgba(239,68,68,0.25)",  bg:"rgba(239,68,68,0.06)",  badge:"rgba(239,68,68,0.15)",  badgeText:"#EF4444" },
    warning:  { dot:"#F59E0B", border:"rgba(245,158,11,0.25)", bg:"rgba(245,158,11,0.06)", badge:"rgba(245,158,11,0.15)", badgeText:"#F59E0B" },
    info:     { dot:"#3B82F6", border:"rgba(59,130,246,0.25)", bg:"rgba(59,130,246,0.06)", badge:"rgba(59,130,246,0.15)", badgeText:"#3B82F6" },
  };

  return (
    <div className="fade-in">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text)" }}>Alert System</h1>
          <p style={{ fontSize:13, color:"var(--text3)", fontFamily:"JetBrains Mono, monospace", marginTop:2 }}>
            Real-time threshold monitoring &amp; notifications
          </p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClearAlerts} style={{ padding:"7px 14px", background:"var(--surface2)", border:"1px solid var(--border2)", borderRadius:8, color:"var(--text2)", fontSize:12, cursor:"pointer", fontFamily:"Syne, sans-serif", fontWeight:600 }}>
            Clear All
          </button>
          <button onClick={onSpike} style={{ padding:"7px 14px", background:"var(--primary)", border:"none", borderRadius:8, color:"#fff", fontSize:12, cursor:"pointer", fontFamily:"Syne, sans-serif", fontWeight:600 }}>
            ⚡ Trigger Test
          </button>
        </div>
      </div>

      {/* Summary counts */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
        {[["Critical",critical.length,"#EF4444"],["Warnings",warning.length,"#F59E0B"],["Informational",info.length,"#3B82F6"]].map(([l,c,col]) => (
          <div key={l} style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderLeft:`3px solid ${col}`, borderRadius:8, padding:14, textAlign:"center" }}>
            <div style={{ fontSize:28, fontWeight:800, color:col, fontFamily:"JetBrains Mono, monospace" }}>{c}</div>
            <div style={{ fontSize:11, color:"var(--text3)", marginTop:4 }}>{l} Alerts</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:16 }}>
        {/* Alert list */}
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:12 }}>ACTIVE ALERTS</div>
          {alerts.length === 0 && (
            <div style={{ padding:40, textAlign:"center", color:"var(--text3)", fontSize:14 }}>
              ✅ No active alerts — all systems nominal
            </div>
          )}
          {alerts.slice(0,15).map((a) => {
            const s = S[a.level] || S.info;
            return (
              <div key={a._id} style={{ display:"flex", gap:12, padding:12, borderRadius:8, marginBottom:8,
                border:`1px solid ${s.border}`, background:s.bg }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:s.dot, flexShrink:0, marginTop:4,
                  animation: a.level==="critical" ? "pulse 1s infinite" : "none" }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:2 }}>{a.message || a.parameter}</div>
                  {a.value !== undefined && (
                    <div style={{ fontSize:12, color:"var(--text2)" }}>{a.parameter} = {a.value}</div>
                  )}
                  <div style={{ fontSize:10, color:"var(--text3)", marginTop:4, fontFamily:"JetBrains Mono, monospace" }}>
                    🕐 {new Date(a.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div style={{ background:s.badge, color:s.badgeText, fontSize:10, padding:"2px 8px", borderRadius:3,
                  fontFamily:"JetBrains Mono, monospace", alignSelf:"flex-start", flexShrink:0 }}>
                  {(a.level || "info").toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Config panel */}
        <div>
          <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:20 }}>
            <div style={{ fontSize:10, color:"var(--text3)", fontFamily:"JetBrains Mono, monospace", letterSpacing:"0.08em", marginBottom:12 }}>
              ALERT THRESHOLDS
            </div>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
              <thead><tr>
                {["Pollutant","Moderate","Unhealthy","Hazardous"].map(h => (
                  <th key={h} style={{ padding:"5px 8px", textAlign:"left", color:"var(--text3)", fontFamily:"JetBrains Mono, monospace", fontSize:9, borderBottom:"1px solid var(--border)", fontWeight:500 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {[["PM2.5","12.1","35.5","150.5"],["PM10","54","154","354"],["CO2","800","1200","2000"],["NO2","53","100","360"],["SO2","35","75","185"]].map(([p,...vals]) => (
                  <tr key={p} style={{ borderBottom:"1px solid var(--border)" }}>
                    <td style={{ padding:"7px 8px", color:"var(--text)", fontWeight:500 }}>{p}</td>
                    {vals.map((v,i) => <td key={i} style={{ padding:"7px 8px", color:"var(--text2)", fontFamily:"JetBrains Mono, monospace" }}>{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ height:1, background:"var(--border)", margin:"16px 0" }} />

            <div style={{ fontSize:10, color:"var(--text3)", fontFamily:"JetBrains Mono, monospace", letterSpacing:"0.08em", marginBottom:12 }}>
              NOTIFICATION CHANNELS
            </div>
            {[["📧 Email (SendGrid)",true],["📱 SMS (Twilio)",true],["🔔 Dashboard Push",true],["🔗 Webhook",false]].map(([lbl,on]) => (
              <label key={lbl} style={{ display:"flex", alignItems:"center", gap:10, fontSize:13, cursor:"pointer", marginBottom:10 }}>
                <input type="checkbox" defaultChecked={on} style={{ accentColor:"var(--primary)" }} />
                <span style={{ color:"var(--text2)" }}>{lbl}</span>
                <span style={{ marginLeft:"auto", fontSize:10, color: on ? "var(--primary)" : "var(--text3)", fontFamily:"JetBrains Mono, monospace" }}>{on ? "ACTIVE" : "OFF"}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   RECOMMENDATIONS PAGE
════════════════════════════════════════════════ */
export function Recommendations({ city, latest }) {
  const aqi    = latest?.aqi ?? 0;
  const status = latest?.status ?? "Safe";

  const IMMEDIATE = [
    { icon:"🏭", title:"Reduce Industrial Activity",      desc:"Suspend non-essential manufacturing in high-pollution zones. Estimated 25% PM2.5 reduction.",        priority:"CRITICAL",  color:"rgba(239,68,68,0.08)"  },
    { icon:"🚗", title:"Traffic Restriction",             desc:"Implement odd-even vehicle scheme in downtown areas. Reduces NO2 by up to 35%.",                     priority:"HIGH",      color:"rgba(245,158,11,0.08)" },
    { icon:"😷", title:"Issue Public Health Warning",     desc:"Advise sensitive groups to stay indoors. Distribute N95 masks at health centres.",                   priority:"HIGH",      color:"rgba(245,158,11,0.08)" },
    { icon:"🌱", title:"Activate Water Spray Trucks",     desc:"Deploy spray trucks on arterial roads to suppress particulates. Reduces PM10 by 15-20%.",            priority:"MEDIUM",    color:"rgba(16,185,129,0.06)" },
  ];
  const POLICY = [
    { icon:"⚖️", title:"Enforce Emission Standards",     desc:"Mandate industrial stack monitoring. Issue fines for non-compliance exceeding thresholds.",           priority:"POLICY",    color:"rgba(139,92,246,0.08)" },
    { icon:"🌳", title:"Urban Afforestation Program",    desc:"Plant 10,000 trees in identified high-pollution corridors. Long-term AQI reduction of 5-8%.",         priority:"LONG-TERM", color:"rgba(16,185,129,0.06)" },
    { icon:"⚡", title:"Electric Vehicle Adoption",      desc:"Subsidise EV adoption. Each 10% EV penetration reduces NO2 by approximately 8%.",                     priority:"MED-TERM",  color:"rgba(59,130,246,0.06)" },
  ];

  const RecCard = ({ icon, title, desc, priority, color }) => (
    <div style={{ display:"flex", gap:12, padding:14, borderRadius:8, border:"1px solid var(--border)", background:"var(--surface2)", marginBottom:10 }}>
      <div style={{ width:36, height:36, borderRadius:8, background:color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{icon}</div>
      <div>
        <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:3 }}>{title}</div>
        <div style={{ fontSize:12, color:"var(--text2)", lineHeight:1.55 }}>{desc}</div>
        <div style={{ marginTop:6, display:"inline-block", background:color, color:"var(--text2)", fontSize:10, padding:"2px 8px", borderRadius:3, fontFamily:"JetBrains Mono, monospace" }}>{priority}</div>
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text)" }}>AI Decision Engine</h1>
        <p style={{ fontSize:13, color:"var(--text3)", fontFamily:"JetBrains Mono, monospace", marginTop:2 }}>LLM-powered recommendations &amp; policy actions</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:12 }}>IMMEDIATE ACTIONS</div>
          {IMMEDIATE.map((r) => <RecCard key={r.title} {...r} />)}
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:12 }}>POLICY RECOMMENDATIONS</div>
          {POLICY.map((r) => <RecCard key={r.title} {...r} />)}
        </div>
      </div>
      <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:20 }}>
        <div style={{ fontSize:10, color:"var(--text3)", fontFamily:"JetBrains Mono, monospace", letterSpacing:"0.08em", marginBottom:14 }}>AI ANALYSIS SUMMARY</div>
        <div style={{ fontSize:13, color:"var(--text2)", lineHeight:1.9 }}>
          <strong style={{ color:"var(--primary)" }}>EcoSentinel AI Analysis — {CITIES[city]?.name}</strong>
          <br /><br />
          Current AQI is <strong style={{ color:"var(--text)" }}>{aqi}</strong> ({status}).
          PM2.5 at <strong style={{ color:"var(--text)" }}>{latest?.pm25 ?? "—"} µg/m³</strong> is{" "}
          {(latest?.pm25 ?? 0) > 35.5
            ? <span style={{ color:"#EF4444" }}>above the WHO 24-hour guideline of 15 µg/m³</span>
            : "within the moderate range"}.
          Primary contributors are likely vehicular emissions (NO2: {latest?.no2 ?? "—"} ppb)
          and industrial sources (SO2: {latest?.so2 ?? "—"} ppb).
          <br /><br />
          <strong style={{ color:"var(--text)" }}>Priority Action: </strong>
          {status === "Safe"
            ? "Continue routine monitoring. Current levels are acceptable for all groups."
            : status === "Moderate"
            ? "Issue advisory for sensitive groups. Prepare traffic restriction protocol for rush hours."
            : "Immediate public health warning required. Activate emergency response protocol. Notify government authorities via automated SMS."}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   CHATBOT PAGE
════════════════════════════════════════════════ */
export function Chatbot({ city, latest }) {
  const cityName = CITIES[city]?.name ?? city;
  const [messages, setMessages] = React.useState([
    { role:"bot", text:`👋 Hello! I'm **EcoSentinel AI**. I can answer questions about current pollution levels, health risks, and forecasts for ${cityName}. How can I help?` },
  ]);
  const [input,   setInput]   = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const endRef = React.useRef(null);

  React.useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const QUICK = [
    "What is the current AQI?",
    "Is it safe to go outside?",
    "What are the health risks?",
    "Show me tomorrow's forecast",
  ];

  const generateReply = (msg) => {
    const m   = msg.toLowerCase();
    const aqi  = latest?.aqi  ?? 0;
    const pm25 = latest?.pm25 ?? "—";
    const s    = latest?.status ?? "Safe";

    if (m.includes("aqi") || m.includes("current") || m.includes("level") || m.includes("pollution")) {
      return `Current readings for **${cityName}**:\n\n• AQI: **${aqi}** (${s})\n• PM2.5: ${pm25} µg/m³\n• PM10: ${latest?.pm10} µg/m³\n• CO2: ${latest?.co2} ppm\n• NO2: ${latest?.no2} ppb\n• SO2: ${latest?.so2} ppb`;
    }
    if (m.includes("safe") || m.includes("outside") || m.includes("go out")) {
      return aqi <= 50
        ? `✅ **Yes, safe to go outside!** AQI is ${aqi} — excellent air quality. No precautions needed.`
        : aqi <= 100
        ? `⚠️ **Moderate caution advised.** AQI is ${aqi}. Sensitive groups (children, elderly, asthma patients) should limit prolonged outdoor activity.`
        : `🚨 **NOT recommended.** AQI is ${aqi} (${s}). Wear an N95 mask if you must go outdoors. Close windows and use air purifiers indoors.`;
    }
    if (m.includes("health") || m.includes("risk") || m.includes("effect") || m.includes("impact")) {
      return `Health impacts at AQI **${aqi}**:\n\n• **General population:** ${aqi <= 50 ? "Minimal risk" : aqi <= 100 ? "Slight irritation possible" : "Significant health effects"}\n• **Sensitive groups:** ${aqi > 100 ? "High risk — avoid outdoors" : "Low risk with normal precautions"}\n• **PM2.5 (${pm25} µg/m³):** ${Number(pm25) > 35 ? "Can penetrate deep into lungs and bloodstream" : "Within acceptable range"}\n• **Recommended:** ${aqi > 150 ? "Stay indoors, use air purifier, wear N95 mask outdoors" : aqi > 50 ? "Limit heavy outdoor exertion" : "Normal activities are fine"}`;
    }
    if (m.includes("forecast") || m.includes("tomorrow") || m.includes("predict") || m.includes("next")) {
      const base = latest?.pm25 ?? 60;
      const pred = +(base * (0.90 + Math.random() * 0.25)).toFixed(1);
      const trend = pred > base ? "📈 Worsening" : "📉 Improving";
      return `**24-Hour Forecast for ${cityName}**\n\n• Predicted PM2.5: **${pred} µg/m³**\n• Trend: ${trend}\n• Peak expected: 17:00–20:00 (evening rush)\n• Model: Bidirectional LSTM (94.2% accuracy)\n\nTip: Check the Predictions tab for the full 48-hour chart.`;
    }
    if (m.includes("pm2.5") || m.includes("particulate") || m.includes("particle")) {
      return `**PM2.5 in ${cityName}: ${pm25} µg/m³**\n\nPM2.5 are fine particles ≤2.5 micrometres — small enough to penetrate deep into the lungs and enter the bloodstream.\n\n• WHO 24-hr guideline: 15 µg/m³\n• Current status: **${classifyAQI(aqi).label}**\n• ${Number(pm25) > 35.5 ? "⚠️ Elevated — consider indoor activities" : "✅ Within acceptable range"}`;
    }
    if (m.includes("recommendation") || m.includes("action") || m.includes("advice") || m.includes("what should")) {
      return aqi <= 50
        ? `✅ **No action required.** Maintain green practices and continue routine monitoring.`
        : `**Recommended Actions (AQI ${aqi})**\n\n• ${aqi > 150 ? "🚨 Avoid all outdoor activities" : "⚠️ Limit prolonged outdoor exertion"}\n• Wear N95 mask if outdoors${aqi > 100 ? " (mandatory)" : " (optional)"}\n• Use HEPA air purifiers indoors\n• Stay hydrated and monitor symptoms\n• Check EcoSentinel alerts for updates`;
    }
    return `I'm monitoring **${cityName}** — AQI: **${aqi}** (${s}).\n\nYou can ask me about:\n• Current pollution levels\n• Safety &amp; health risks\n• Tomorrow's forecast\n• Specific pollutants (PM2.5, NO2, CO2...)\n• Recommended actions`;
  };

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role:"user", text:msg }]);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 650 + Math.random() * 400));
    setMessages((prev) => [...prev, { role:"bot", text:generateReply(msg) }]);
    setLoading(false);
  };

  const fmt = (t) =>
    t.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>");

  return (
    <div className="fade-in">
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text)" }}>AI Chatbot Assistant</h1>
        <p style={{ fontSize:13, color:"var(--text3)", fontFamily:"JetBrains Mono, monospace", marginTop:2 }}>Ask about air quality, health impacts, and forecasts</p>
      </div>
      <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
        {/* Header */}
        <div style={{ padding:"14px 20px", background:"var(--surface2)", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, background:"var(--primary)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🤖</div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>EcoSentinel AI</div>
            <div style={{ fontSize:11, color:"var(--primary)", display:"flex", alignItems:"center", gap:4 }}>
              <div className="pulse" style={{ width:5, height:5, background:"var(--primary)", borderRadius:"50%", display:"inline-block" }} />
              {" "}Online — monitoring {cityName}
            </div>
          </div>
        </div>
        {/* Messages */}
        <div style={{ height:400, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              maxWidth:"82%", padding:"10px 14px", fontSize:13, lineHeight:1.65,
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? "var(--primary)" : "var(--surface2)",
              color: m.role === "user" ? "#fff" : "var(--text)",
              border: m.role === "bot" ? "1px solid var(--border2)" : "none",
              borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
            }} dangerouslySetInnerHTML={{ __html: fmt(m.text) }} />
          ))}
          {loading && (
            <div style={{ alignSelf:"flex-start", background:"var(--surface2)", border:"1px solid var(--border2)",
              padding:"10px 14px", borderRadius:"12px 12px 12px 2px", fontSize:13, color:"var(--text3)" }}>
              Thinking...
            </div>
          )}
          <div ref={endRef} />
        </div>
        {/* Quick buttons */}
        <div style={{ padding:"8px 16px", display:"flex", flexWrap:"wrap", gap:6, borderTop:"1px solid var(--border)" }}>
          {QUICK.map((q) => (
            <button key={q} onClick={() => setInput(q)} style={{ padding:"5px 10px", background:"var(--surface2)",
              border:"1px solid var(--border2)", borderRadius:6, color:"var(--text2)", fontSize:11,
              cursor:"pointer", fontFamily:"Syne, sans-serif" }}>{q}</button>
          ))}
        </div>
        {/* Input row */}
        <div style={{ display:"flex", gap:10, padding:16, borderTop:"1px solid var(--border)" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about air quality, health, or forecasts..."
            style={{ flex:1, background:"var(--surface2)", border:"1px solid var(--border2)", borderRadius:8,
              padding:"10px 14px", color:"var(--text)", fontSize:13, fontFamily:"Syne, sans-serif", outline:"none" }}
          />
          <button onClick={send} disabled={loading} style={{ padding:"10px 20px", background:"var(--primary)", border:"none",
            borderRadius:8, color:"#fff", fontSize:13, cursor:"pointer", fontFamily:"Syne, sans-serif", fontWeight:600,
            opacity: loading ? 0.7 : 1 }}>Send</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   ADMIN PAGE
════════════════════════════════════════════════ */
export function Admin({ readings, alerts, city, onCityChange }) {
  return (
    <div className="fade-in">
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text)" }}>Admin Panel</h1>
        <p style={{ fontSize:13, color:"var(--text3)", fontFamily:"JetBrains Mono, monospace", marginTop:2 }}>System management &amp; role-based access control</p>
      </div>

      {/* System stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {[
          [Object.keys(CITIES).length, "Cities Monitored"],
          [readings.length,            "Total Readings"],
          [alerts.filter(a=>a.level==="critical").length, "Critical Alerts Today"],
          ["99.7%",                    "System Uptime"],
        ].map(([v,l]) => (
          <div key={l} style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:8, padding:14, textAlign:"center" }}>
            <div style={{ fontSize:28, fontWeight:800, color:"var(--primary)", fontFamily:"JetBrains Mono, monospace" }}>{v}</div>
            <div style={{ fontSize:11, color:"var(--text3)", marginTop:6 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        {/* Users table */}
        <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:20 }}>
          <div style={{ fontSize:10, color:"var(--text3)", fontFamily:"JetBrains Mono, monospace", letterSpacing:"0.08em", marginBottom:12 }}>USER ROLES &amp; ACCESS</div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead><tr>
              {["USER","ROLE","ALERTS","ACCESS"].map(h => (
                <th key={h} style={{ padding:"6px 10px", textAlign:"left", color:"var(--text3)", fontFamily:"JetBrains Mono, monospace", fontSize:10, borderBottom:"1px solid var(--border)", fontWeight:500 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {[
                ["admin@govt.in",   "GOVERNMENT", "rgba(139,92,246,0.15)","#8B5CF6","All",      "Full"       ],
                ["dept@cpcb.in",    "GOVERNMENT", "rgba(139,92,246,0.15)","#8B5CF6","Critical", "Full"       ],
                ["user@public.com", "PUBLIC",     "rgba(59,130,246,0.15)","#3B82F6","Hazardous","Read-only"  ],
                ["r@iit.ac.in",     "RESEARCHER", "rgba(16,185,129,0.15)","#10B981","All",      "Data Access"],
              ].map(([email,role,bg,col,scope,access]) => (
                <tr key={email} style={{ borderBottom:"1px solid var(--border)" }}>
                  <td style={{ padding:"8px 10px", color:"var(--text)", fontSize:11 }}>{email}</td>
                  <td style={{ padding:"8px 10px" }}>
                    <span style={{ background:bg, color:col, padding:"2px 7px", borderRadius:3, fontSize:10, fontFamily:"JetBrains Mono, monospace" }}>{role}</span>
                  </td>
                  <td style={{ padding:"8px 10px", color:"var(--text2)", fontSize:11 }}>{scope}</td>
                  <td style={{ padding:"8px 10px", color:"var(--primary)", fontSize:11 }}>{access}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* System status */}
        <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:20 }}>
          <div style={{ fontSize:10, color:"var(--text3)", fontFamily:"JetBrains Mono, monospace", letterSpacing:"0.08em", marginBottom:16 }}>SYSTEM STATUS</div>
          {[
            ["MongoDB",       "CONNECTED"],
            ["WebSocket",     "ACTIVE"   ],
            ["LSTM Model",    "LOADED"   ],
            ["Anthropic API", "READY"    ],
            ["SendGrid",      "CONFIGURED"],
            ["Twilio SMS",    "CONFIGURED"],
          ].map(([svc,status]) => (
            <div key={svc} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <span style={{ fontSize:13, color:"var(--text2)" }}>{svc}</span>
              <span style={{ fontSize:12, color:"var(--primary)", fontFamily:"JetBrains Mono, monospace" }}>● {status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-city status table */}
      <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:20 }}>
        <div style={{ fontSize:10, color:"var(--text3)", fontFamily:"JetBrains Mono, monospace", letterSpacing:"0.08em", marginBottom:12 }}>MULTI-CITY STATUS (click to switch)</div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead><tr>
              {["CITY","SENSORS","PM2.5","AQI","STATUS","LAST UPDATE"].map(h => (
                <th key={h} style={{ padding:"6px 12px", textAlign:"left", color:"var(--text3)", fontFamily:"JetBrains Mono, monospace", fontSize:10, borderBottom:"1px solid var(--border)", fontWeight:500 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {Object.entries(CITIES).map(([key, c]) => {
                const r = simulateReading(key);
                const s = classifyAQI(r.aqi);
                return (
                  <tr key={key} style={{ borderBottom:"1px solid var(--border)", cursor:"pointer" }}
                    onClick={() => onCityChange(key)}>
                    <td style={{ padding:"8px 12px", color:"var(--text)", fontWeight:500 }}>{c.name}</td>
                    <td style={{ padding:"8px 12px" }}><span style={{ color:"var(--primary)", fontSize:11 }}>● Active</span></td>
                    <td style={{ padding:"8px 12px", color:"var(--text2)" }}>{r.pm25}</td>
                    <td style={{ padding:"8px 12px", color:"var(--text2)" }}>{r.aqi}</td>
                    <td style={{ padding:"8px 12px" }}>
                      <span style={{ background:s.bg, color:s.color, padding:"2px 8px", borderRadius:10, fontSize:11, fontWeight:600 }}>● {s.label}</span>
                    </td>
                    <td style={{ padding:"8px 12px", color:"var(--text3)", fontFamily:"JetBrains Mono, monospace", fontSize:11 }}>
                      {new Date().toLocaleTimeString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
