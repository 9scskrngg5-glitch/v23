import { C, F } from "../lib/design";

export const TradeRow = ({ trade, onClick, onDelete }) => {
  const pnl = trade.result !== "" ? Number(trade.result) : null;
  const hasPnL = pnl !== null;
  const win = hasPnL && pnl > 0;

  return (
    <div onClick={onClick} style={{
      background: C.bgCard, border: `1px solid ${C.border}`,
      borderRadius: 11, padding: "13px 16px",
      display: "flex", alignItems: "center", gap: 14,
      cursor: "pointer",
      transition: "border-color 0.15s, background 0.15s, transform 0.1s, box-shadow 0.15s",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = C.borderHov;
        e.currentTarget.style.background = C.bgInner;
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.25)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.background = C.bgCard;
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Status dot */}
      <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: !hasPnL ? C.textDim : win ? C.green : C.red }} />

      {/* Pair */}
      <div style={{ fontFamily: F.mono, fontSize: 13, fontWeight: 600, color: C.text, minWidth: 80 }}>
        {trade.pair || "—"}
      </div>

      {/* Setup */}
      {trade.setup && (
        <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {trade.setup}
        </div>
      )}

      {/* RR */}
      {trade.rr && (
        <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono, whiteSpace: "nowrap" }}>
          RR {trade.rr}
        </div>
      )}

      {/* Flags */}
      {trade.flags?.length > 0 && (
        <div style={{ fontSize: 10, color: C.orange, fontFamily: F.mono, whiteSpace: "nowrap" }}>
          ⚠ {trade.flags[0]}
        </div>
      )}

      {/* PnL */}
      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: !hasPnL ? C.textDim : win ? C.green : C.red, minWidth: 70, textAlign: "right", marginLeft: "auto" }}>
        {!hasPnL ? "En cours" : `${win ? "+" : ""}${pnl.toFixed(2)}$`}
      </div>

      {/* Delete */}
      <button onClick={e => { e.stopPropagation(); onDelete(); }} style={{
        background: "none", border: "none", color: C.textGhost, cursor: "pointer",
        fontSize: 14, padding: "2px 4px", borderRadius: 4, transition: "color 0.15s", flexShrink: 0,
      }}
        onMouseEnter={e => e.currentTarget.style.color = C.red}
        onMouseLeave={e => e.currentTarget.style.color = C.textGhost}
      >×</button>
    </div>
  );
};
