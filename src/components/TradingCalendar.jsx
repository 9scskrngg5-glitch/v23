import { useState, useMemo } from "react";
import { C, F } from "../lib/design";

export const TradingCalendar = ({ trades }) => {
  const [date, setDate] = useState(new Date());
  const year = date.getFullYear();
  const month = date.getMonth();

  const dayData = useMemo(() => {
    const map = {};
    trades.filter(t => t.result !== "").forEach(t => {
      const d = new Date(t.createdAt ?? 0);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.getDate();
        if (!map[key]) map[key] = { pnl: 0, count: 0, wins: 0 };
        map[key].pnl += Number(t.result);
        map[key].count++;
        if (Number(t.result) > 0) map[key].wins++;
      }
    });
    return map;
  }, [trades, year, month]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Monday first

  const monthPnL = Object.values(dayData).reduce((a, d) => a + d.pnl, 0);
  const tradingDays = Object.keys(dayData).length;
  const winDays = Object.values(dayData).filter(d => d.pnl > 0).length;

  const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

  const getDayColor = (d) => {
    if (!dayData[d]) return "transparent";
    if (dayData[d].pnl > 0) return `rgba(0,229,160,${Math.min(0.8, 0.2 + dayData[d].pnl / 200)})`;
    return `rgba(255,77,109,${Math.min(0.8, 0.2 + Math.abs(dayData[d].pnl) / 200)})`;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 16, gap: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: C.text, marginRight: "auto" }}>{MONTHS[month]} {year}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setDate(new Date(year, month - 1, 1))} style={{ background: C.bgCard, border: `1px solid C.border`, borderRadius: 7, color: C.textMid, cursor: "pointer", padding: "7px 14px", fontFamily: F.mono, fontSize: 14 }}>‹</button>
          <button onClick={() => setDate(new Date())} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, color: ${C.textDim}, cursor: "pointer", padding: "7px 14px", fontFamily: F.mono, fontSize: 10, letterSpacing: "0.08em" }}>AUJOURD'HUI</button>
          <button onClick={() => setDate(new Date(year, month + 1, 1))} style={{ background: C.bgCard, border: `1px solid C.border`, borderRadius: 7, color: C.textMid, cursor: "pointer", padding: "7px 14px", fontFamily: F.mono, fontSize: 14 }}>›</button>
        </div>
      </div>

      {/* Monthly summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "PnL du mois", value: `${monthPnL >= 0 ? "+" : ""}${monthPnL.toFixed(2)}$`, color: monthPnL >= 0 ? ${C.green} : ${C.red} },
          { label: "Jours tradés", value: tradingDays, color: C.text },
          { label: "Jours gagnants", value: tradingDays > 0 ? `${winDays}/${tradingDays}` : "—", color: ${C.green} },
        ].map(s => (
          <div key={s.label} style={{ background: C.bgCard, border: `1px solid C.border`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: "'Syne', sans-serif" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ background: C.bgCard, border: `1px solid C.border`, borderRadius: 14, overflow: "hidden" }}>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `1px solid ${C.border}` }}>
          {DAYS.map(d => (
            <div key={d} style={{ padding: "8px 0", textAlign: "center", fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.1em" }}>{d}</div>
          ))}
        </div>

        {/* Days */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {/* Empty cells for offset */}
          {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${i}`} style={{ aspectRatio: "1", borderRight: `1px solid ${C.bgInner}`, borderBottom: `1px solid ${C.bgInner}` }} />)}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const d = dayData[day];
            const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
            const bg = getDayColor(day);

            return (
              <div key={day} style={{ aspectRatio: "1", background: bg, borderRight: `1px solid ${C.bgInner}`, borderBottom: `1px solid ${C.bgInner}`, padding: "6px", position: "relative", cursor: d ? "pointer" : "default", transition: "opacity 0.15s" }}
                title={d ? `${d.count} trade${d.count > 1 ? "s" : ""} · ${d.pnl >= 0 ? "+" : ""}${d.pnl.toFixed(2)}$ · WR ${Math.round(d.wins/d.count*100)}%` : ""}
                onMouseEnter={e => { if (d) e.currentTarget.style.opacity = "0.8"; }}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                <div style={{ fontSize: 11, fontWeight: isToday ? 700 : 400, color: isToday ? C.green : d ? (d.pnl >= 0 ? "rgba(0,229,160,0.9)" : "rgba(255,77,109,0.9)") : C.textDim, fontFamily: F.mono }}>{day}</div>
                {d && (
                  <div style={{ fontSize: 9, color: d.pnl >= 0 ? "rgba(0,229,160,0.8)" : "rgba(255,77,109,0.8)", fontFamily: F.mono, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {d.pnl >= 0 ? "+" : ""}{d.pnl.toFixed(0)}$
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
