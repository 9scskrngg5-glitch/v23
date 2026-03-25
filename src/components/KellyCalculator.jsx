
import { useState, useMemo } from "react";
import { C, F, card } from "../lib/design";

export const KellyCalculator = ({ trades }) => {
  const [capital, setCapital] = useState("10000");
  const [fraction, setFraction] = useState(50); // % of Kelly to use

  const closed = trades.filter(t => t.result !== "");
  const stats = useMemo(() => {
    if (closed.length < 5) return null;
    const wins = closed.filter(t => Number(t.result) > 0);
    const losses = closed.filter(t => Number(t.result) < 0);
    const winRate = wins.length / closed.length;
    const avgWin = wins.length ? wins.reduce((a, t) => a + Number(t.result), 0) / wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((a, t) => a + Number(t.result), 0) / losses.length) : 0;
    if (!avgLoss) return null;
    const b = avgWin / avgLoss; // win/loss ratio
    const p = winRate;
    const q = 1 - p;
    const kelly = (p * b - q) / b; // Kelly formula
    return { kelly: Math.max(0, kelly), winRate, avgWin, avgLoss, b };
  }, [closed]);

  if (!stats) return (
    <div style={{ ...card(), color: C.textGhost, fontSize: 12, fontFamily: F.mono, textAlign: "center" }}>
      Ajoute au moins 5 trades pour calculer le critère de Kelly.
    </div>
  );

  const kellyPct = stats.kelly * 100;
  const adjustedPct = kellyPct * (fraction / 100);
  const riskAmount = Number(capital) * (adjustedPct / 100);

  return (
    <div style={{ ...card() }}>
      <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", marginBottom: 16, textTransform: "uppercase" }}>
        Critère de Kelly — Taille optimale
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.1em", display: "block", marginBottom: 5 }}>CAPITAL ($)</label>
          <input type="number" value={capital} onChange={e => setCapital(e.target.value)}
            style={{ background: "#0b0e1a", border: `1px solid ${C.border}`, color: C.text, padding: "9px 12px", borderRadius: 8, width: "100%", fontSize: 13, fontFamily: F.mono, outline: "none" }}
            onFocus={e => e.target.style.borderColor = C.green}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>
        <div>
          <label style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.1em", display: "block", marginBottom: 5 }}>FRACTION KELLY ({fraction}%)</label>
          <input type="range" min="10" max="100" step="10" value={fraction} onChange={e => setFraction(Number(e.target.value))}
            style={{ width: "100%", marginTop: 10, accentColor: C.green }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
        {[
          { label: "Kelly complet", value: `${kellyPct.toFixed(1)}%`, color: ${C.orange}, sub: "Risque théorique max" },
          { label: `Kelly ${fraction}%`, value: `${adjustedPct.toFixed(1)}%`, color: ${C.green}, sub: "Recommandé" },
          { label: "Montant à risquer", value: `${riskAmount.toFixed(0)}$`, color: ${C.text}, sub: `Sur ${Number(capital).toLocaleString()}$` },
        ].map(s => (
          <div key={s.label} style={{ background: "#0b0e1a", border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.1em", marginBottom: 5 }}>{s.label.toUpperCase()}</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono, background: "#0b0e1a", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px" }}>
        Basé sur WR: {(stats.winRate * 100).toFixed(0)}% · Avg win: +{stats.avgWin.toFixed(0)}$ · Avg loss: -{stats.avgLoss.toFixed(0)}$ · Ratio W/L: {stats.b.toFixed(2)}
      </div>
    </div>
  );
};
