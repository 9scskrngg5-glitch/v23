import { useMemo } from "react";
import { C, F } from "../lib/design";

export const DrawdownAlert = ({ trades, limitPct = 3, accountSize = 10000 }) => {
  const { todayPnL, consecLosses } = useMemo(() => {
    const today = new Date();
    const todayStr = today.toDateString();
    const todayTrades = trades.filter(t => {
      if (t.result === "") return false;
      return new Date(t.createdAt ?? 0).toDateString() === todayStr;
    });
    const pnl = todayTrades.reduce((acc, t) => acc + Number(t.result), 0);

    // Count consecutive losses from latest
    const closed = trades.filter(t => t.result !== "").slice(-10);
    let consec = 0;
    for (let i = closed.length - 1; i >= 0; i--) {
      if (Number(closed[i].result) < 0) consec++;
      else break;
    }
    return { todayPnL: pnl, consecLosses: consec };
  }, [trades]);

  const limitAmount = (accountSize * limitPct) / 100;
  const exceeded = todayPnL < -limitAmount;
  const warning = todayPnL < -(limitAmount * 0.7) && !exceeded;
  const tilt = consecLosses >= 3;

  if (todayPnL >= 0 && !tilt) return null;
  if (todayPnL < 0 && !exceeded && !warning && !tilt) return null;

  const level = exceeded ? "danger" : tilt ? "tilt" : "warning";
  const bg = level === "danger" ? C.redDim : level === "tilt" ? "rgba(139,108,255,0.08)" : "rgba(245,166,35,0.07)";
  const borderColor = level === "danger" ? C.redBord : level === "tilt" ? "rgba(139,108,255,0.25)" : "rgba(245,166,35,0.25)";
  const textColor = level === "danger" ? C.red : level === "tilt" ? C.purple : C.orange;

  const title = level === "danger"
    ? "LIMITE DE DRAWDOWN ATTEINTE"
    : level === "tilt"
    ? `TILT PROBABLE — ${consecLosses} PERTES D\'AFFILÉE`
    : "ATTENTION — DRAWDOWN ÉLEVÉ";

  const msg = level === "danger"
    ? "Arrête de trader pour aujourd\'hui. Protège ton capital."
    : level === "tilt"
    ? "Prends une pause avant le prochain trade. Les revenge trades détruisent les comptes."
    : `PnL aujourd\'hui : ${todayPnL.toFixed(2)}$ — Limite à ${(-limitAmount).toFixed(0)}$.`;

  return (
    <div style={{
      background: bg, border: `1px solid ${borderColor}`,
      borderRadius: 12, padding: "14px 18px", marginBottom: 16,
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      animation: "fadeIn 0.2s ease forwards",
    }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, fontFamily: F.mono, letterSpacing: "0.08em", color: textColor, marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: C.textDim, fontFamily: F.mono, lineHeight: 1.5 }}>{msg}</div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, fontFamily: F.mono, color: textColor, whiteSpace: "nowrap" }}>
        {level === "tilt" ? `${consecLosses}×` : `${((todayPnL / accountSize) * 100).toFixed(1)}%`}
      </div>
    </div>
  );
};
