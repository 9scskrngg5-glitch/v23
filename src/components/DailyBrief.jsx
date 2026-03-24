import { useState, useMemo } from "react";
import { C, F } from "../lib/design";

const GREETINGS = ["Bonjour", "Bonne journée", "Prêt à trader"];
const TIPS = [
  "Respecte toujours ton SL, peu importe l'émotion.",
  "Un bon trade raté vaut mieux qu'un mauvais trade pris.",
  "La discipline bât la performance à long terme.",
  "Qualité > Quantité. Attends le bon setup.",
  "Ton edge ne fonctionne que si tu le respectes.",
  "La gestion des pertes est plus importante que les gains.",
  "Les meilleurs traders sont les plus ennuyeux à observer.",
  "Si tu doutes, n'entre pas. Le marché sera là demain.",
  "Journaliser chaque trade = te différencier de 95% des traders.",
  "Un trader profitable est d'abord un bon gestionnaire du risque.",
];

export const DailyBrief = ({ trades, stats }) => {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem("tj_brief_dismissed") === new Date().toDateString(); } catch { return false; }
  });

  const tip = useMemo(() => TIPS[new Date().getDate() % TIPS.length], []);
  const greeting = GREETINGS[new Date().getHours() < 12 ? 0 : new Date().getHours() < 18 ? 1 : 2];

  // Yesterday's performance
  const yesterday = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() - 1);
    const yd = d.toDateString();
    const yt = trades.filter(t => t.result !== "" && new Date(t.createdAt ?? 0).toDateString() === yd);
    if (!yt.length) return null;
    const pnl = yt.reduce((a, t) => a + Number(t.result), 0);
    const wins = yt.filter(t => Number(t.result) > 0).length;
    return { pnl, count: yt.length, wr: Math.round((wins / yt.length) * 100) };
  }, [trades]);

  // This week
  const weekStats = useMemo(() => {
    const monday = new Date(); const day = monday.getDay(); monday.setDate(monday.getDate() - day + (day === 0 ? -6 : 1)); monday.setHours(0,0,0,0);
    const wt = trades.filter(t => t.result !== "" && (t.createdAt ?? 0) >= monday.getTime());
    if (!wt.length) return null;
    const pnl = wt.reduce((a, t) => a + Number(t.result), 0);
    return { pnl, count: wt.length };
  }, [trades]);

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem("tj_brief_dismissed", new Date().toDateString()); } catch {}
  };

  if (dismissed) return null;

  return (
    <div style={{ background: `linear-gradient(135deg, ${C.bgCard} 0%, ${C.bgInner} 100%)`, border: `1px solid ${C.greenBord}`, borderRadius: 14, padding: "18px 20px", marginBottom: 16, position: "relative" }}>
      <button onClick={dismiss} style={{ position: "absolute", top: 12, right: 14, background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 10, color: C.green, fontFamily: F.mono, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>
            {greeting} · {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </div>
          <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.65, fontStyle: "italic" }}>"{tip}"</div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {yesterday && (
            <div style={{ background: C.bgInner, borderRadius: 10, padding: "10px 14px", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>Hier</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: yesterday.pnl >= 0 ? C.green : C.red, fontFamily: "'Syne', sans-serif" }}>{yesterday.pnl >= 0 ? "+" : ""}{yesterday.pnl.toFixed(0)}$</div>
              <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono }}>{yesterday.count} trades · {yesterday.wr}% WR</div>
            </div>
          )}
          {weekStats && (
            <div style={{ background: C.bgInner, borderRadius: 10, padding: "10px 14px", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>Cette semaine</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: weekStats.pnl >= 0 ? C.green : C.red, fontFamily: "'Syne', sans-serif" }}>{weekStats.pnl >= 0 ? "+" : ""}{weekStats.pnl.toFixed(0)}$</div>
              <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono }}>{weekStats.count} trades</div>
            </div>
          )}
          {stats && (
            <div style={{ background: C.bgInner, borderRadius: 10, padding: "10px 14px", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>Win Rate</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: Number(stats.winRate) >= 50 ? C.green : C.red, fontFamily: "'Syne', sans-serif" }}>{stats.winRate}%</div>
              <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono }}>{stats.total} trades</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
