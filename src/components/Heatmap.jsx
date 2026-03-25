import { useMemo } from "react";
import { C, F } from "../lib/design";

const MONTHS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
const DAYS = ["L","M","M","J","V","S","D"];

export const Heatmap = ({ trades }) => {
  const closed = trades.filter(t => t.result !== "");

  const pnlByDay = useMemo(() => {
    const map = {};
    closed.forEach(t => {
      const d = new Date(t.createdAt ?? Date.now());
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      if (!map[key]) map[key] = { pnl: 0, count: 0 };
      map[key].pnl += Number(t.result);
      map[key].count++;
    });
    return map;
  }, [closed]);

  // Build last 12 weeks grid
  const today = new Date();
  const weeks = [];
  // Go back to last Monday
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + 1 - 7 * 17);

  for (let w = 0; w < 18; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
      week.push({ date, key, data: pnlByDay[key] || null });
    }
    weeks.push(week);
  }

  const getColor = (data) => {
    if (!data) return ${C.bgInner};
    if (data.pnl > 200) return ${C.green};
    if (data.pnl > 50) return "rgba(0,229,160,0.5)";
    if (data.pnl > 0) return "rgba(0,229,160,0.25)";
    if (data.pnl < -200) return ${C.red};
    if (data.pnl < -50) return "rgba(255,77,109,0.5)";
    return "rgba(255,77,109,0.25)";
  };

  if (closed.length === 0) return (
    <div style={{ color: ${C.textGhost}, fontSize: 12, fontFamily: "'DM Mono', monospace", padding: "20px 0" }}>
      Pas assez de données
    </div>
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", gap: 3, minWidth: "fit-content" }}>
        {/* Day labels */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginRight: 4 }}>
          <div style={{ height: 14 }} />
          {DAYS.map((d, i) => (
            <div key={i} style={{ height: 12, fontSize: 8, color: ${C.textDim}, fontFamily: "'DM Mono', monospace", display: "flex", alignItems: "center" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Month label */}
            <div style={{ height: 14, fontSize: 8, color: ${C.textDim}, fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>
              {week[0].date.getDate() <= 7 ? MONTHS[week[0].date.getMonth()] : ""}
            </div>
            {week.map((day, di) => (
              <div key={di} title={day.data ? `${day.key}: ${day.data.pnl >= 0 ? "+" : ""}${day.data.pnl.toFixed(0)}$ (${day.data.count} trade${day.data.count > 1 ? "s" : ""})` : day.key}
                style={{
                  width: 12, height: 12, borderRadius: 2,
                  background: getColor(day.data),
                  border: "1px solid rgba(255,255,255,0.03)",
                  cursor: day.data ? "pointer" : "default",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, justifyContent: "flex-end" }}>
        <span style={{ fontSize: 9, color: C.textDim, fontFamily: "'DM Mono', monospace" }}>Moins</span>
        {["rgba(255,77,109,0.5)", "rgba(255,77,109,0.25)", C.bgInner, "rgba(0,229,160,0.25)", "rgba(0,229,160,0.5)", C.green].map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
        ))}
        <span style={{ fontSize: 9, color: C.textDim, fontFamily: "'DM Mono', monospace" }}>Plus</span>
      </div>
    </div>
  );
};
