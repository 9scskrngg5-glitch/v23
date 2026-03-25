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
  // Record streak
  let record = 0, cur = 0;
  const sortedDays = [...tradeDays].map(d => new Date(d).getTime()).sort((a, b) => a - b);
  for (let j = 0; j < sortedDays.length; j++) {
    if (j === 0 || sortedDays[j] - sortedDays[j - 1] <= 86400000 * 1.5) { cur++; record = Math.max(record, cur); }
    else cur = 1;
  }
  return { streak, record };
};

export const JournalingStreak = ({ trades }) => {
  const { streak, record } = useMemo(() => getStreakData(trades), [trades]);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toDateString();
    const hasTrade = trades.some(t => new Date(t.createdAt ?? 0).toDateString() === key);
    return { key, label: d.toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 2).toUpperCase(), active: hasTrade };
  });

  const color = streak >= 30 ? C.purple : streak >= 7 ? C.green : streak >= 3 ? C.orange : C.textDim;
  const flame = streak >= 30 ? "🔥" : streak >= 7 ? "⚡" : streak >= 3 ? "✦" : "○";
  const isRecord = streak > 0 && streak >= record;
  const reward30 = streak >= 30;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
      background: C.bgCard, border: `1px solid ${streak >= 7 ? color + "30" : ${C.borde}r}`,
      borderRadius: 12, flexWrap: "wrap", gap: 10,
      transition: "border-color 0.3s",
    }}>
      {/* Streak count */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 80 }}>
        <span style={{ fontSize: 18 }}>{flame}</span>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Syne', sans-serif", color, lineHeight: 1 }}>{streak}</div>
          <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.1em" }}>JOURS</div>
        </div>
        {isRecord && streak > 1 && (
          <div style={{ fontSize: 9, color: C.orange, fontFamily: F.mono, background: C.orangeDim, border: `1px solid ${C.orangeBord}`, borderRadius: 20, padding: "2px 7px", letterSpacing: "0.08em" }}>
            RECORD
          </div>
        )}
      </div>

      <div style={{ width: 1, height: 28, background: C.border, flexShrink: 0 }} />

      {/* 7 day dots */}
      <div style={{ display: "flex", gap: 5 }}>
        {last7.map(d => (
          <div key={d.key} title={d.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: d.active ? color + "25" : C.bgInner,
              border: `1px solid ${d.active ? color + "60" : ${C.borde}r}`,
              transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {d.active && <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />}
            </div>
            <div style={{ fontSize: 8, color: C.textDim, fontFamily: F.mono }}>{d.label}</div>
          </div>
        ))}
      </div>

      {/* Record + 30j reward */}
      <div style={{ marginLeft: "auto", textAlign: "right", flexShrink: 0 }}>
        {reward30 ? (
          <div style={{ fontSize: 10, color: C.purple, fontFamily: F.mono, background: "rgba(139,108,255,0.1)", border: "1px solid rgba(139,108,255,0.25)", borderRadius: 20, padding: "4px 10px" }}>
            30j streak → 1 mois Pro offert !
          </div>
        ) : record > 0 ? (
          <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono }}>
            Record: <span style={{ color: C.textMid }}>{record}j</span>
          </div>
        ) : null}
        {streak === 0 && (
          <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono }}>Ajoute un trade pour démarrer !</div>
        )}
      </div>
    </div>
  );
};
