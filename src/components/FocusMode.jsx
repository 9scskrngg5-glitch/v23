import { useState, useEffect } from "react";
import { C, F } from "../lib/design";

export const FocusMode = ({ stats, trades, onExit }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Today's trades
  const today = new Date().toDateString();
  const todayTrades = trades.filter(t => t.result !== "" && new Date(t.createdAt ?? 0).toDateString() === today);
  const todayPnL = todayTrades.reduce((a, t) => a + Number(t.result), 0);
  const todayWins = todayTrades.filter(t => Number(t.result) > 0).length;

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onExit(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onExit]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#020308", zIndex: 1000,
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 40,
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* Clock */}
      <div style={{ fontSize: "clamp(48px, 10vw, 96px)", fontWeight: 800, fontFamily: "'Syne', sans-serif", color: C.text, letterSpacing: "-0.04em", lineHeight: 1 }}>
        {time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
      </div>

      {/* Today stats */}
      <div style={{ display: "flex", gap: 48, alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", marginBottom: 6 }}>PNL AUJOURD'HUI</div>
          <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: todayPnL >= 0 ? C.green : C.red, letterSpacing: "-0.02em" }}>
            {todayPnL >= 0 ? "+" : ""}{todayPnL.toFixed(2)}$
          </div>
        </div>
        <div style={{ width: 1, height: 48, background: C.border }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", marginBottom: 6 }}>TRADES</div>
          <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: C.text, letterSpacing: "-0.02em" }}>
            {todayTrades.length}
          </div>
        </div>
        <div style={{ width: 1, height: 48, background: C.border }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", marginBottom: 6 }}>WIN RATE</div>
          <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: todayTrades.length > 0 && (todayWins / todayTrades.length) >= 0.5 ? C.green : C.red, letterSpacing: "-0.02em" }}>
            {todayTrades.length > 0 ? Math.round((todayWins / todayTrades.length) * 100) : 0}%
          </div>
        </div>
        {stats && (
          <>
            <div style={{ width: 1, height: 48, background: C.border }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", marginBottom: 6 }}>PNL TOTAL</div>
              <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: Number(stats.totalPnL) >= 0 ? C.green : C.red, letterSpacing: "-0.02em" }}>
                {Number(stats.totalPnL) >= 0 ? "+" : ""}{stats.totalPnL}$
              </div>
            </div>
          </>
        )}
      </div>

      {/* Motivational quote based on performance */}
      <div style={{ fontSize: 14, color: C.textDim, fontFamily: F.mono, textAlign: "center", maxWidth: 500 }}>
        {todayPnL > 0 ? "Bonne journée. Continue de suivre ton plan." :
         todayPnL < -100 ? "Journée difficile. Respecte ta limite de drawdown." :
         "Focus sur le processus, pas le résultat."}
      </div>

      {/* Exit hint */}
      <button onClick={onExit} style={{ position: "fixed", bottom: 28, right: 28, background: "none", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textDim, cursor: "pointer", fontSize: 11, fontFamily: F.mono, padding: "8px 16px", letterSpacing: "0.08em" }}>
        ESC — QUITTER LE FOCUS
      </button>
    </div>
  );
};
