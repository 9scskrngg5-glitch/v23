import { useState } from "react";
import { C, F } from "../lib/design";

const inp = {
  background: C.bgCard, border: "1px solid #181b2e", color: C.text,
  padding: "9px 13px", borderRadius: 8, width: "100%",
  fontSize: 13, fontFamily: "'DM Mono', monospace", outline: "none",
  transition: "border-color 0.2s",
};

export const PositionCalculator = () => {
  const [account, setAccount] = useState("10000");
  const [risk, setRisk] = useState("1");
  const [entry, setEntry] = useState("");
  const [sl, setSl] = useState("");

  const riskAmount = (Number(account) * Number(risk)) / 100;
  const pips = entry && sl ? Math.abs(Number(entry) - Number(sl)) : 0;
  const lotSize = pips > 0 ? (riskAmount / pips).toFixed(4) : null;
  const units = pips > 0 ? Math.floor(riskAmount / pips) : null;

  const field = (label, value, setValue, ph) => (
    <div>
      <label style={{ fontSize: 10, color: C.textDim, display: "block", marginBottom: 5, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>
        {label}
      </label>
      <input value={value} onChange={e => setValue(e.target.value)} placeholder={ph}
        type="number" style={inp}
        onFocus={e => e.target.style.borderColor = C.green}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  );

  return (
    <div style={{ background: C.bgCard, border: "1px solid #0e1120", borderRadius: 14, padding: 22 }}>
      <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>
        Calculateur de position
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {field("Capital ($)", account, setAccount, "10000")}
        {field("Risque (%)", risk, setRisk, "1")}
        {field("Entrée", entry, setEntry, "104500")}
        {field("Stop Loss", sl, setSl, "104000")}
      </div>

      {/* Results */}
      <div style={{ background: C.bg, border: "1px solid #13162a", borderRadius: 10, padding: "14px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontSize: 9, color: C.textDim, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: 4 }}>RISQUE $</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.orange, fontFamily: "'DM Mono', monospace" }}>
              {riskAmount.toFixed(2)}$
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: C.textDim, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: 4 }}>UNITÉS</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.green, fontFamily: "'DM Mono', monospace" }}>
              {units ? units.toLocaleString() : "—"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: C.textDim, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: 4 }}>DISTANCE SL</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: "'DM Mono', monospace" }}>
              {pips > 0 ? pips.toFixed(2) : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
