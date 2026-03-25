import { useMemo } from "react";
import { C, F } from "../lib/design";

const mono = "'DM Mono', monospace";

const Delta = ({ label, current, prev, unit = "", invert = false }) => {
  const diff = Number(current) - Number(prev);
  const better = invert ? diff < 0 : diff > 0;
  const color = diff === 0 ? C.textDim : better ? C.green : C.red;
  const arrow = diff > 0 ? "↑" : diff < 0 ? "↓" : "=";

  return (
    <div style={{ background: C.bgInner, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 9, color: C.textDim, fontFamily: mono, letterSpacing: "0.12em", marginBottom: 6 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: mono, marginBottom: 4 }}>
        {current}{unit}
      </div>
      <div style={{ fontSize: 11, color, fontFamily: mono }}>
        {arrow} {diff >= 0 ? "+" : ""}{typeof diff === "number" ? diff.toFixed(unit === "%" ? 1 : 2) : diff}{unit} vs mois dernier
      </div>
    </div>
  );
};

const getMonthStats = (trades, monthsAgo) => {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const closed = trades.filter(t => {
    if (t.result === "") return false;
    const d = new Date(t.createdAt ?? 0);
    return d.getMonth() === target.getMonth() && d.getFullYear() === target.getFullYear();
  });
  if (!closed.length) return null;
  const wins = closed.filter(t => Number(t.result) > 0);
  const losses = closed.filter(t => Number(t.result) < 0);
  const pnl = closed.reduce((a, t) => a + Number(t.result), 0);
  const winRate = ((wins.length / closed.length) * 100).toFixed(1);
  const totalWin = wins.reduce((a, t) => a + Number(t.result), 0);
  const totalLoss = Math.abs(losses.reduce((a, t) => a + Number(t.result), 0));
  const pf = totalLoss ? (totalWin / totalLoss).toFixed(2) : "0";
  return { pnl: pnl.toFixed(2), winRate, trades: closed.length, pf };
};

export const ComparisonPanel = ({ trades }) => {
  const current = useMemo(() => getMonthStats(trades, 0), [trades]);
  const prev = useMemo(() => getMonthStats(trades, 1), [trades]);

  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthName = (d) => d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  if (!current && !prev) return (
    <div style={{ background: `linear-gradient(135deg, ${C.bgInner}, ${C.bg})`, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 18px", marginBottom: 14 }}>
      <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.12em", fontFamily: mono, marginBottom: 12 }}>COMPARAISON MENSUELLE</div>
      <div style={{ color: C.textGhost, fontSize: 12, fontFamily: mono }}>Pas assez de données sur deux mois.</div>
    </div>
  );

  return (
    <div style={{ background: `linear-gradient(135deg, ${C.bgInner}, ${C.bg})`, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 18px", marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: mono }}>
          Comparaison mensuelle
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <span style={{ fontSize: 11, color: C.green, fontFamily: mono }}>{monthName(now)}</span>
          <span style={{ fontSize: 11, color: C.textDim, fontFamily: mono }}>vs {monthName(prevMonth)}</span>
        </div>
      </div>

      {current && prev ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
          <Delta label="PnL" current={current.pnl} prev={prev.pnl} unit="$" />
          <Delta label="Win Rate" current={current.winRate} prev={prev.winRate} unit="%" />
          <Delta label="Trades" current={current.trades} prev={prev.trades} />
          <Delta label="Profit Factor" current={current.pf} prev={prev.pf} />
        </div>
      ) : (
        <div style={{ color: C.textDim, fontSize: 12, fontFamily: mono }}>
          {!current ? `Pas de trades en ${monthName(now)}.` : `Pas de trades en ${monthName(prevMonth)}.`}
        </div>
      )}
    </div>
  );
};
