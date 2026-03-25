import { useState, useEffect, useMemo } from "react";
import { C, F } from "../lib/design";

const COOLDOWN_KEY = "tj_cooldown_until";
const SETTINGS_KEY = "tj_cooldown_settings";

const defaultSettings = () => {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || { losses: 3, minutes: 30 }; }
  catch { return { losses: 3, minutes: 30 }; }
};

/**
 * Returns { active, until, clear } — consume in App to block trade addition
 */
export const useCooldown = (trades) => {
  const [until, setUntil] = useState(() => {
    try { return Number(localStorage.getItem(COOLDOWN_KEY)) || 0; } catch { return 0; }
  });

  // Detect consecutive losses and trigger cooldown
  useEffect(() => {
    const closed = trades.filter(t => t.result !== "").slice(-20);
    if (!closed.length) return;
    const settings = defaultSettings();
    let consec = 0;
    for (let i = closed.length - 1; i >= 0; i--) {
      if (Number(closed[i].result) < 0) consec++;
      else break;
    }
    if (consec >= settings.losses) {
      const now = Date.now();
      const existing = Number(localStorage.getItem(COOLDOWN_KEY)) || 0;
      // Only set if not already in cooldown
      if (existing <= now) {
        const newUntil = now + settings.minutes * 60 * 1000;
        localStorage.setItem(COOLDOWN_KEY, String(newUntil));
        setUntil(newUntil);
      }
    }
  }, [trades]);

  const active = until > Date.now();
  const clear = () => {
    localStorage.removeItem(COOLDOWN_KEY);
    setUntil(0);
  };

  return { active, until, clear };
};

export const CooldownModal = ({ until, onClose }) => {
  const [remaining, setRemaining] = useState(Math.max(0, until - Date.now()));

  useEffect(() => {
    const iv = setInterval(() => {
      const r = Math.max(0, until - Date.now());
      setRemaining(r);
      if (r === 0) onClose();
    }, 1000);
    return () => clearInterval(iv);
  }, [until, onClose]);

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const pct = Math.min(100, (remaining / (30 * 60 * 1000)) * 100);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, backdropFilter: "blur(8px)",
      animation: "fadeIn 0.2s ease forwards",
    }}>
      <div style={{
        width: "min(440px, 92vw)", background: C.bgCard,
        border: `1px solid ${C.redBord}`, borderRadius: 20,
        padding: "36px 32px", textAlign: "center",
        animation: "scaleIn 0.2s ease forwards",
        boxShadow: `0 0 60px rgba(240,71,112,0.15)`,
      }}>
        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: ${C.redDim}, border: `1px solid ${C.redBord}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", fontSize: 28,
        }}>⏸</div>

        <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: ${C.text}, marginBottom: 8 }}>
          Pause obligatoire
        </div>
        <div style={{ fontSize: 13, color: ${C.textDim}, fontFamily: F.mono, marginBottom: 28, lineHeight: 1.6 }}>
          Tu viens d'enchaîner plusieurs pertes consécutives.<br />
          Prends le temps de te recentrer avant de continuer.
        </div>

        {/* Timer */}
        <div style={{
          fontSize: 52, fontWeight: 800, fontFamily: "'Syne', sans-serif",
          color: ${C.red}, letterSpacing: "-0.04em", marginBottom: 20,
        }}>
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: ${C.bgInner}, borderRadius: 2, marginBottom: 28, overflow: "hidden" }}>
          <div style={{
            height: "100%", background: ${C.red}, borderRadius: 2,
            width: `${pct}%`, transition: "width 1s linear",
          }} />
        </div>

        {/* Tips */}
        <div style={{
          background: ${C.bgInner}, borderRadius: 12, padding: "14px 18px",
          marginBottom: 24, textAlign: "left",
        }}>
          <div style={{ fontSize: 10, color: ${C.textDim}, fontFamily: F.mono, letterSpacing: "0.12em", marginBottom: 10 }}>PENDANT CE TEMPS</div>
          {[
            "Éloigne-toi de l'écran",
            "Analyse tes derniers trades ratés",
            "Respire — le marché sera encore là après",
            "Est-ce que tu trades ton plan ou tes émotions ?",
          ].map((tip, i) => (
            <div key={i} style={{ fontSize: 12, color: ${C.textMid}, fontFamily: F.mono, marginBottom: 6, display: "flex", gap: 8 }}>
              <span style={{ color: ${C.textDim} }}>→</span>{tip}
            </div>
          ))}
        </div>

        <button onClick={onClose} style={{
          background: "transparent", border: `1px solid ${C.border}`,
          color: C.textDim, cursor: "pointer", borderRadius: 10,
          padding: "10px 24px", fontSize: 11, fontFamily: F.mono,
          letterSpacing: "0.08em", width: "100%",
        }}>
          Ignorer (déconseillé)
        </button>
      </div>
    </div>
  );
};
