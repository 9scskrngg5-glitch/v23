import { useMemo } from "react";

/**
 * Shows an alert if daily drawdown exceeds the limit
 */
export const DrawdownAlert = ({ trades, limitPct = 3, accountSize = 10000 }) => {
  const todayPnL = useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    return trades
      .filter(t => {
        if (t.result === "") return false;
        const d = new Date(t.createdAt ?? 0);
        const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
        return ds === todayStr;
      })
      .reduce((acc, t) => acc + Number(t.result), 0);
  }, [trades]);

  const limitAmount = (accountSize * limitPct) / 100;
  const exceeded = todayPnL < -limitAmount;
  const warning = todayPnL < -(limitAmount * 0.7) && !exceeded;

  if (todayPnL >= 0 || (!exceeded && !warning)) return null;

  return (
    <div style={{
      background: exceeded ? "rgba(255,77,109,0.08)" : "rgba(245,166,35,0.07)",
      border: `1px solid ${exceeded ? "rgba(255,77,109,0.25)" : "rgba(245,166,35,0.25)"}`,
      borderRadius: 12, padding: "14px 18px", marginBottom: 16,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 12,
    }}>
      <div>
        <div style={{
          fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace",
          letterSpacing: "0.08em",
          color: exceeded ? "#ff4d6d" : "#f5a623",
          marginBottom: 4,
        }}>
          {exceeded ? "LIMITE DE DRAWDOWN ATTEINTE" : "ATTENTION — DRAWDOWN ÉLEVÉ"}
        </div>
        <div style={{ fontSize: 12, color: "#4a5070", fontFamily: "'DM Mono', monospace" }}>
          PnL aujourd'hui : <span style={{ color: "#ff4d6d", fontWeight: 700 }}>{todayPnL.toFixed(2)}$</span>
          {exceeded && " — Arrête de trader pour aujourd'hui."}
          {warning && ` — Limite à ${(-limitAmount).toFixed(0)}$.`}
        </div>
      </div>
      <div style={{
        fontSize: 22, fontWeight: 800, fontFamily: "'DM Mono', monospace",
        color: exceeded ? "#ff4d6d" : "#f5a623", whiteSpace: "nowrap",
      }}>
        {((todayPnL / accountSize) * 100).toFixed(1)}%
      </div>
    </div>
  );
};
