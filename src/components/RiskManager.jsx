import { useState, useMemo } from "react";

const mono = "'DM Mono', monospace";
const syne = "'Syne', sans-serif";

const inp = {
  background: "#080a14", border: "1px solid #181b2e", color: "#dde1f5",
  padding: "9px 13px", borderRadius: 8, fontSize: 13,
  fontFamily: mono, outline: "none", transition: "border-color 0.2s", width: "100%",
};

const useRiskSettings = () => {
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tj_risk_settings") || "null") || {
      accountSize: 10000, maxDailyRisk: 2, maxWeeklyRisk: 5,
      maxOpenTrades: 3, maxRiskPerTrade: 1, maxCorrelation: 2,
    }; } catch { return { accountSize: 10000, maxDailyRisk: 2, maxWeeklyRisk: 5, maxOpenTrades: 3, maxRiskPerTrade: 1, maxCorrelation: 2 }; }
  });

  const save = (next) => { setSettings(next); localStorage.setItem("tj_risk_settings", JSON.stringify(next)); };
  return { settings, save };
};

const GaugeBar = ({ label, used, max, color = "#00e5a0", unit = "$" }) => {
  const pct = Math.min(100, max > 0 ? (Math.abs(used) / max) * 100 : 0);
  const c = pct >= 90 ? "#ff4d6d" : pct >= 70 ? "#f5a623" : color;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: "#4a5070", fontFamily: mono }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: c, fontFamily: mono }}>
          {Math.abs(used).toFixed(0)}{unit} / {max}{unit}
        </span>
      </div>
      <div style={{ height: 5, background: "#0a0d18", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: c, borderRadius: 3, transition: "width 0.5s ease" }} />
      </div>
      {pct >= 100 && (
        <div style={{ fontSize: 10, color: "#ff4d6d", fontFamily: mono, marginTop: 4, letterSpacing: "0.06em" }}>
          LIMITE ATTEINTE — STOP TRADING
        </div>
      )}
    </div>
  );
};

export const RiskManager = ({ trades }) => {
  const { settings, save } = useRiskSettings();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(settings);
  const [calc, setCalc] = useState({ entry: "", sl: "", riskPct: "1" });

  // Daily risk used
  const dailyRisk = useMemo(() => {
    const today = new Date().toDateString();
    return trades
      .filter(t => t.result !== "" && new Date(t.createdAt ?? 0).toDateString() === today)
      .reduce((a, t) => a + Math.min(0, Number(t.result)), 0);
  }, [trades]);

  // Weekly risk used
  const weeklyRisk = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000;
    return trades
      .filter(t => t.result !== "" && (t.createdAt ?? 0) >= weekAgo)
      .reduce((a, t) => a + Math.min(0, Number(t.result)), 0);
  }, [trades]);

  // Open trades (no result)
  const openTrades = trades.filter(t => t.result === "").length;

  const maxDailyLoss = (settings.accountSize * settings.maxDailyRisk) / 100;
  const maxWeeklyLoss = (settings.accountSize * settings.maxWeeklyRisk) / 100;
  const maxRiskPerTrade = (settings.accountSize * settings.maxRiskPerTrade) / 100;

  // Position size calculator
  const calcPositionSize = () => {
    const entry = Number(calc.entry);
    const sl = Number(calc.sl);
    const riskAmt = (settings.accountSize * Number(calc.riskPct)) / 100;
    if (!entry || !sl) return null;
    const distance = Math.abs(entry - sl);
    if (!distance) return null;
    const units = Math.floor(riskAmt / distance);
    const lotSize = (units / 100000).toFixed(2);
    return { units, lotSize, riskAmt };
  };

  const posCalc = calcPositionSize();

  const statusOk = Math.abs(dailyRisk) < maxDailyLoss && openTrades < settings.maxOpenTrades;

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 10, color: "#3a4060", letterSpacing: "0.15em", fontFamily: mono, marginBottom: 4 }}>RISK MANAGER</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: syne, margin: 0, letterSpacing: "-0.02em" }}>Gestion du Risque</h2>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{
            padding: "7px 14px", borderRadius: 20,
            background: statusOk ? "rgba(0,229,160,0.08)" : "rgba(255,77,109,0.08)",
            border: `1px solid ${statusOk ? "rgba(0,229,160,0.2)" : "rgba(255,77,109,0.2)"}`,
            fontSize: 10, color: statusOk ? "#00e5a0" : "#ff4d6d", fontFamily: mono, letterSpacing: "0.08em",
          }}>
            {statusOk ? "RISQUE OK" : "ATTENTION"}
          </div>
          <button onClick={() => { setDraft(settings); setEditing(e => !e); }} style={{
            padding: "7px 14px", borderRadius: 7, border: "1px solid #181b2e",
            background: "transparent", color: "#3a4060", cursor: "pointer",
            fontSize: 10, fontFamily: mono, letterSpacing: "0.06em",
          }}>
            {editing ? "ANNULER" : "CONFIGURER"}
          </button>
        </div>
      </div>

      {/* Config form */}
      {editing && (
        <div style={{ background: "#080a14", border: "1px solid #0e1120", borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 14 }}>
            {[
              { k: "accountSize", label: "Capital ($)" },
              { k: "maxDailyRisk", label: "Risque max/jour (%)" },
              { k: "maxWeeklyRisk", label: "Risque max/semaine (%)" },
              { k: "maxRiskPerTrade", label: "Risque max/trade (%)" },
              { k: "maxOpenTrades", label: "Trades ouverts max" },
              { k: "maxCorrelation", label: "Paires corrélées max" },
            ].map(({ k, label }) => (
              <div key={k}>
                <label style={{ fontSize: 9, color: "#2d3352", display: "block", marginBottom: 4, fontFamily: mono, letterSpacing: "0.08em" }}>{label.toUpperCase()}</label>
                <input type="number" value={draft[k]} onChange={e => setDraft(d => ({ ...d, [k]: Number(e.target.value) }))}
                  style={inp} onFocus={e => e.target.style.borderColor = "#00e5a0"} onBlur={e => e.target.style.borderColor = "#181b2e"} />
              </div>
            ))}
          </div>
          <button onClick={() => { save(draft); setEditing(false); }} style={{
            padding: "9px 20px", borderRadius: 8, border: "none", background: "#00e5a0",
            color: "#000", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: mono, letterSpacing: "0.06em",
          }}>SAUVEGARDER</button>
        </div>
      )}

      {/* Risk gauges */}
      <div style={{ background: "linear-gradient(135deg, #0a0d18, #080a14)", border: "1px solid #13162a", borderRadius: 16, padding: "20px 18px", marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: "#3a4060", letterSpacing: "0.12em", fontFamily: mono, marginBottom: 16 }}>EXPOSITION ACTUELLE</div>
        <GaugeBar label="Perte journalière" used={Math.abs(dailyRisk)} max={maxDailyLoss} />
        <GaugeBar label="Perte hebdomadaire" used={Math.abs(weeklyRisk)} max={maxWeeklyLoss} color="#f5a623" />
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: "#4a5070", fontFamily: mono }}>Trades ouverts</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: openTrades >= settings.maxOpenTrades ? "#ff4d6d" : "#00e5a0", fontFamily: mono }}>
              {openTrades} / {settings.maxOpenTrades}
            </span>
          </div>
          <div style={{ height: 5, background: "#0a0d18", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3,
              width: `${Math.min(100, (openTrades / settings.maxOpenTrades) * 100)}%`,
              background: openTrades >= settings.maxOpenTrades ? "#ff4d6d" : "#00e5a0",
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
        {[
          { label: "Capital", value: `${settings.accountSize.toLocaleString()}$`, color: "#dde1f5" },
          { label: "Risque/trade max", value: `${maxRiskPerTrade.toFixed(0)}$`, color: "#f5a623" },
          { label: "Marge disponible", value: `${Math.max(0, maxDailyLoss - Math.abs(dailyRisk)).toFixed(0)}$`, color: "#00e5a0" },
        ].map(s => (
          <div key={s.label} style={{ background: "#080a14", border: "1px solid #0e1120", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 9, color: "#3a4060", fontFamily: mono, letterSpacing: "0.1em", marginBottom: 5 }}>{s.label.toUpperCase()}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: syne }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Position size calculator */}
      <div style={{ background: "linear-gradient(135deg, #0a0d18, #080a14)", border: "1px solid #13162a", borderRadius: 16, padding: "20px 18px" }}>
        <div style={{ fontSize: 10, color: "#3a4060", letterSpacing: "0.12em", fontFamily: mono, marginBottom: 16 }}>CALCULATEUR DE POSITION</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[
            { k: "entry", label: "Entrée", ph: "104500" },
            { k: "sl", label: "Stop Loss", ph: "104000" },
            { k: "riskPct", label: "Risque (%)", ph: "1" },
          ].map(({ k, label, ph }) => (
            <div key={k}>
              <label style={{ fontSize: 9, color: "#2d3352", display: "block", marginBottom: 4, fontFamily: mono, letterSpacing: "0.08em" }}>{label.toUpperCase()}</label>
              <input type="number" value={calc[k]} onChange={e => setCalc(c => ({ ...c, [k]: e.target.value }))}
                placeholder={ph} style={inp}
                onFocus={e => e.target.style.borderColor = "#00e5a0"}
                onBlur={e => e.target.style.borderColor = "#181b2e"}
              />
            </div>
          ))}
        </div>

        {posCalc ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {[
              { label: "Risque $", value: `${posCalc.riskAmt.toFixed(2)}$`, color: "#f5a623" },
              { label: "Unités", value: posCalc.units.toLocaleString(), color: "#00e5a0" },
              { label: "Lot size", value: posCalc.lotSize, color: "#dde1f5" },
            ].map(s => (
              <div key={s.label} style={{ background: "#06080f", border: "1px solid #13162a", borderRadius: 9, padding: "12px 14px" }}>
                <div style={{ fontSize: 9, color: "#2d3352", fontFamily: mono, letterSpacing: "0.08em", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: syne }}>{s.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "#1e2235", fontSize: 12, fontFamily: mono }}>Entre une entrée et un SL pour calculer la taille de position.</div>
        )}
      </div>
    </div>
  );
};
