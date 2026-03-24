import { useMemo } from "react";
import { C, F } from "../lib/design";

const getStreakData = (trades) => {
  const tradeDays = new Set(trades.map(t => new Date(t.createdAt ?? 0).toDateString()));
  const today = new Date();
  let streak = 0;
  let i = 0;
  while (true) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (tradeDays.has(d.toDateString())) { streak++; i++; }
    else break;
  }
  return streak;
};

export const JournalingStreak = ({ trades }) => {
  const streak = useMemo(() => getStreakData(trades), [trades]);

  // Last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toDateString();
    const hasTrade = trades.some(t => new Date(t.createdAt ?? 0).toDateString() === key);
    return { key, label: d.toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 2).toUpperCase(), active: hasTrade };
  });

  const color = streak >= 7 ? C.green : streak >= 3 ? C.orange : C.textDim;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12 }}>
      {/* Streak count */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif", color }}>{streak}</span>
        <div>
          <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.1em" }}>JOURS</div>
          <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.1em" }}>STREAK</div>
        </div>
      </div>

      <div style={{ width: 1, height: 28, background: C.border }} />

      {/* 7 day dots */}
      <div style={{ display: "flex", gap: 5 }}>
        {last7.map(d => (
          <div key={d.key} title={d.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: d.active ? color : C.bgInner, border: `1px solid ${d.active ? color + "40" : C.border}`, transition: "all 0.2s" }} />
            <div style={{ fontSize: 8, color: C.textDim, fontFamily: F.mono }}>{d.label}</div>
          </div>
        ))}
      </div>

      {streak === 0 && (
        <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono }}>Ajoute un trade pour démarrer ta série !</div>
      )}
    </div>
  );
};
