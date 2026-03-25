import { useState } from "react";
import { C, F } from "../lib/design";

const CHART_PAIRS = [
  "BTCUSDT", "ETHUSDT", "SOLUSDT", "EURUSD", "GBPUSD", "XAUUSD",
  "AAPL", "TSLA", "SPY", "QQQ", "NVDA", "MSFT",
];

const INTERVALS = [
  { label: "1m", tv: "1" }, { label: "5m", tv: "5" }, { label: "15m", tv: "15" },
  { label: "1h", tv: "60" }, { label: "4h", tv: "240" }, { label: "1D", tv: "D" },
];

export const SplitScreen = ({ onClose }) => {
  const [pair, setPair] = useState("BTCUSDT");
  const [customPair, setCustomPair] = useState("");
  const [interval, setInterval] = useState("60");
  const [layout, setLayout] = useState("50/50"); // 50/50 | 60/40 | 40/60

  const activePair = customPair.trim().toUpperCase() || pair;
  const tvUrl = `https://www.tradingview.com/widgetembed/?frameElementId=tv_chart&symbol=${activePair}&interval=${interval}&theme=dark&style=1&locale=fr&toolbar_bg=%23090c15&hide_side_toolbar=0&allow_symbol_change=1&save_image=1&studies=[]&hideideas=1&withdateranges=1&container_id=tv_chart`;

  const leftWidth = layout === "50/50" ? "50%" : layout === "60/40" ? "60%" : "40%";
  const rightWidth = layout === "50/50" ? "50%" : layout === "60/40" ? "40%" : "60%";

  return (
    <div style={{ position: "fixed", inset: 0, background: C.bg, zIndex: 400, display: "flex", flexDirection: "column" }}>
      {/* Controls bar */}
      <div style={{ height: 48, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", flexShrink: 0, background: ${C.bg}, overflowX: "auto", scrollbarWidth: "none" }}>
        <span style={{ fontSize: 11, color: C.green, fontFamily: F.mono, fontWeight: 700, letterSpacing: "0.12em", marginRight: 6 }}>SPLIT</span>

        {/* Quick pairs */}
        <div style={{ display: "flex", gap: 4 }}>
          {CHART_PAIRS.slice(0, 6).map(p => (
            <button key={p} onClick={() => { setPair(p); setCustomPair(""); }} style={{
              padding: "4px 8px", borderRadius: 5, border: "1px solid",
              borderColor: activePair === p ? `${C.green}50` : ${C.border},
              background: activePair === p ? C.greenDim : "transparent",
              color: activePair === p ? C.green : C.textDim,
              cursor: "pointer", fontSize: 9, fontFamily: F.mono,
            }}>{p.replace("USDT", "")}</button>
          ))}
        </div>

        {/* Custom pair */}
        <input value={customPair} onChange={e => setCustomPair(e.target.value)}
          placeholder="Paire..." style={{ background: C.bgCard, border: `1px solid C.border`, color: C.text, padding: "7px 14px", borderRadius: 6, fontSize: 11, fontFamily: F.mono, outline: "none", width: 90 }}
          onFocus={e => e.target.style.borderColor = C.green}
          onBlur={e => e.target.style.borderColor = C.border}
        />

        <div style={{ width: 1, height: 20, background: C.border, flexShrink: 0 }} />

        {/* Intervals */}
        <div style={{ display: "flex", gap: 3 }}>
          {INTERVALS.map(i => (
            <button key={i.tv} onClick={() => setInterval(i.tv)} style={{
              padding: "4px 8px", borderRadius: 5, border: "1px solid",
              borderColor: interval === i.tv ? `${C.green}50` : ${C.border},
              background: interval === i.tv ? C.greenDim : "transparent",
              color: interval === i.tv ? C.green : C.textDim,
              cursor: "pointer", fontSize: 9, fontFamily: F.mono,
            }}>{i.label}</button>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: C.border, flexShrink: 0 }} />

        {/* Layout */}
        {["50/50", "60/40", "40/60"].map(l => (
          <button key={l} onClick={() => setLayout(l)} style={{
            padding: "4px 8px", borderRadius: 5, border: "1px solid",
            borderColor: layout === l ? `${C.green}50` : ${C.border},
            background: layout === l ? C.greenDim : "transparent",
            color: layout === l ? C.green : C.textDim,
            cursor: "pointer", fontSize: 9, fontFamily: F.mono,
          }}>{l}</button>
        ))}

        <button onClick={onClose} style={{ marginLeft: "auto", padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: ${C.textDim}, cursor: "pointer", fontSize: 10, fontFamily: F.mono, flexShrink: 0 }}>
          FERMER ✕
        </button>
      </div>

      {/* Split content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left — TradingView */}
        <div style={{ width: leftWidth, borderRight: `1px solid ${C.border}`, transition: "width 0.2s ease", overflow: "hidden" }}>
          <iframe
            key={`${activePair}-${interval}`}
            src={tvUrl}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="TradingView Chart"
            allow="fullscreen"
          />
        </div>

        {/* Right — Journal overlay */}
        <div style={{ width: rightWidth, overflow: "auto", padding: "16px", transition: "width 0.2s ease" }}>
          <div style={{ fontSize: 11, color: C.green, fontFamily: F.mono, letterSpacing: "0.12em", marginBottom: 12 }}>
            NOTES — {activePair}
          </div>
          <QuickTradeNote pair={activePair} />
        </div>
      </div>
    </div>
  );
};

const QuickTradeNote = ({ pair }) => {
  const key = `tj_split_notes_${pair}`;
  const [note, setNote] = useState(() => { try { return localStorage.getItem(key) || ""; } catch { return ""; } });

  const save = (v) => { setNote(v); try { localStorage.setItem(key, v); } catch {} };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <textarea value={note} onChange={e => save(e.target.value)}
        placeholder={`Notes pour ${pair}...\n\nNiveaux clés, biais, plan...`}
        style={{ width: "100%", minHeight: 200, background: C.bgCard, border: `1px solid C.border`, color: C.text, borderRadius: 10, padding: "12px 14px", fontSize: 13, fontFamily: F.mono, outline: "none", resize: "vertical", lineHeight: 1.6 }}
        onFocus={e => e.target.style.borderColor = C.green}
        onBlur={e => e.target.style.borderColor = C.border}
      />
      <div style={{ fontSize: 10, color: C.textGhost, fontFamily: F.mono }}>
        Notes sauvegardées automatiquement par paire
      </div>
    </div>
  );
};
