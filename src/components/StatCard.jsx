import { C, F } from "../lib/design";

export const StatCard = ({ label, value, sub, color, trend }) => (
  <div style={{
    background: C.bgCard, border: `1px solid ${C.border}`,
    borderRadius: 13, padding: "16px 18px",
    display: "flex", flexDirection: "column", gap: 6,
  }}>
    <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", textTransform: "uppercase" }}>
      {label}
    </div>
    <div style={{
      fontSize: 22, fontWeight: 800, fontFamily: F.display,
      color: color || C.text, letterSpacing: "-0.02em", lineHeight: 1,
    }}>
      {value}
    </div>
    {sub && (
      <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono }}>
        {sub}
      </div>
    )}
  </div>
);
