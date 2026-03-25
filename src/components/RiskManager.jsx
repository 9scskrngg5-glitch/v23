import { useState, useMemo } from "react";
import { C, F, card, label as labelStyle } from "../lib/design";

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

const GaugeBar = ({ label, used, max, color, unit = "$" }) => {
  const pct = Math.min(100, max > 0 ? (Math.abs(used) / max) * 100 : 0);
  const c = pct >= 90 ? C.red : pct >= 70 ? C.orange : (color || C.green);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: c, fontFamily: F.mono }}>
          {Math.abs(used).toFixed(0)}{unit} / {max}{unit}
        </span>
      </div>
      <div style={{ height: 5, background: C.bgInner, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: c, borderRadius: 3, transition: "width 0.5s ease" }} />
      </div>
      {pct >= 100 && (
        <div style={{ fontSize: 10, color: ${C.red}, fontFamily: F.mono, marginTop: 4, letterSpacing: "0.06em" }}>
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

  const dailyRisk = useMemo(() => {
    const today = new Date().toDateString();
    return trades.filter(t => t.result !== "" && new Date(t.createdAt ?? 0).toDateString() === today)
      .reduce((a, t) => a + Math.min(0, Number(t.result)), 0);
  }, [trades]);

  const weeklyRisk = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000;
    return trades.filter(t => t.result !== "" && (t.createdAt ?? 0) >= weekAgo)
      .reduce((a, t) => a + Math.min(0, Number(t.result)), 0);
  }, [trades]);

  const openTrades = trades.filter(t => t.result === "").length;
  const maxDailyLoss = (settings.accountSize * settings.maxDailyRisk) / 100;
  const maxWeeklyLoss = (settings.accountSize * settings.maxWeeklyRisk) / 100;
  const maxRiskPerTrade = (settings.accountSize * settings.maxRiskPerTrade) / 100;

  const calcPositionSize = () => {
    const entry = Number(calc.entry), sl = Number(calc.sl);
    const riskAmt = (settings.accountSize * Number(calc.riskPct)) / 100;
    if (!entry || !sl) return null;
    const distance = Math.abs(entry - sl);
    if (!distance) return null;
    const units = Math.floor(riskAmt / distance);
    return { units, lotSize: (units / 100000).toFixed(2), riskAmt };
  };

  const posCalc = calcPositionSize();
  const statusOk = Math.abs(dailyRisk) < maxDailyLoss && openTrades < settings.maxOpenTrades;

  const inp = {
    background: ${C.bgInner}, border: `1px solid ${C.border}`, color: ${C.text},
    padding: "9px 13px", borderRadius: 8, fontSize: 13,
    fontFamily: F.mono, outline: "none", transition: "border-color 0.2s", width: "100%",
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ ...labelStyle(), marginBottom: 4 }}>RISK MANAGER</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: F.display, margin: 0, letterSpacing: "-0.02em", color: ${C.text} }}>Gestion du Risque</h2>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{
            padding: "7px 14px", borderRadius: 20,
            background: statusOk ? ${C.greenDim} : ${C.redDim},
            border: `1px solid ${statusOk ? ${C.greenBord} : ${C.redBor}d}`,
            fontSize: 10, color: statusOk ? ${C.green} : ${C.red}, fontFamily: F.mono, letterSpacing: "0.08em",
          }}>
            {statusOk ? "RISQUE OK" : "ATTENTION"}
          </div>
          <button onClick={() => { setDraft(settings); setEditing(e => !e); }} style={{
            padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`,
            background: "transparent", color: ${C.textDim}, cursor: "pointer",
            fontSize: 10, fontFamily: F.mono, letterSpacing: "0.06em", transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = ${C.borderHov}; e.currentTarget.style.color = ${C.textMid}; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = ${C.border}; e.currentTarget.style.color = ${C.textDim}; }}>
            {editing ? "ANNULER" : "CONFIGURER"}
          </button>
        </div>
      </div>

      {/* Config form */}
      {editing && (
        <div style={{ ...card(), marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 14 }}>
            {[
              { k: "accountSize", label: "Capital ($)" },
              { k: "maxDailyRisk", label: "Risque max/jour (%)" },
              { k: "maxWeeklyRisk", label: "Risque max/semaine (%)" },
              { k: "maxRiskPerTrade", label: "Risque max/trade (%)" },
              { k: "maxOpenTrades", label: "Trades ouverts max" },
              { k: "maxCorrelation", label: "Paires corrélées max" },
            ].map(({ k, label }) => (
              <div key={k}>
                <label style={{ fontSize: 9, color: ${C.textDim}, display: "block", marginBottom: 4, fontFamily: F.mono, letterSpacing: "0.08em" }}>{label.toUpperCase()}</label>
                <input type="number" value={draft[k]} onChange={e => setDraft(d => ({ ...d, [k]: Number(e.target.value) }))}
                  style={inp}
                  onFocus={e => e.target.style.borderColor = ${C.gree}n}
                  onBlur={e => e.target.style.borderColor = ${C.borde}r} />
              </div>
            ))}
          </div>
          <button onClick={() => { save(draft); setEditing(false); }} style={{
            padding: "9px 20px", borderRadius: 8, border: "none", background: ${C.green},
            color: ${C.bg}, cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: F.mono, letterSpacing: "0.06em",
            transition: "opacity 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            SAUVEGARDER
          </button>
        </div>
      )}

      {/* Risk gauges */}
      <div style={{ ...card(), marginBottom: 14 }}>
        <div style={{ ...labelStyle(), marginBottom: 16 }}>EXPOSITION ACTUELLE</div>
        <GaugeBar label="Perte journalière" used={Math.abs(dailyRisk)} max={maxDailyLoss} />
        <GaugeBar label="Perte hebdomadaire" used={Math.abs(weeklyRisk)} max={maxWeeklyLoss} color={${C.orang}e} />
        <div style={{ marginBottom: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: ${C.textDim}, fontFamily: F.mono }}>Trades ouverts</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: openTrades >= settings.maxOpenTrades ? ${C.red} : ${C.green}, fontFamily: F.mono }}>
              {openTrades} / {settings.maxOpenTrades}
            </span>
          </div>
          <div style={{ height: 5, background: ${C.bgInner}, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 3, width: `${Math.min(100, (openTrades / settings.maxOpenTrades) * 100)}%`, background: openTrades >= settings.maxOpenTrades ? ${C.red} : ${C.green}, transition: "width 0.5s ease" }} />
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
        {[
          { label: "Capital", value: `${settings.accountSize.toLocaleString()}$`, color: ${C.text} },
          { label: "Risque/trade max", value: `${maxRiskPerTrade.toFixed(0)}$`, color: ${C.orange} },
          { label: "Marge disponible", value: `${Math.max(0, maxDailyLoss - Math.abs(dailyRisk)).toFixed(0)}$`, color: ${C.green} },
        ].map(s => (
          <div key={s.label} style={{ background: ${C.bgInner}, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 9, color: ${C.textDim}, fontFamily: F.mono, letterSpacing: "0.1em", marginBottom: 5 }}>{s.label.toUpperCase()}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: F.display }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Position size calculator */}
      <div style={{ ...card() }}>
        <div style={{ ...labelStyle(), marginBottom: 16 }}>CALCULATEUR DE POSITION</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[
            { k: "entry", label: "Entrée", ph: "104500" },
            { k: "sl", label: "Stop Loss", ph: "104000" },
            { k: "riskPct", label: "Risque (%)", ph: "1" },
          ].map(({ k, label, ph }) => (
            <div key={k}>
              <label style={{ fontSize: 9, color: ${C.textDim}, display: "block", marginBottom: 4, fontFamily: F.mono, letterSpacing: "0.08em" }}>{label.toUpperCase()}</label>
              <input type="number" value={calc[k]} onChange={e => setCalc(c => ({ ...c, [k]: e.target.value }))}
                placeholder={ph} style={inp}
                onFocus={e => e.target.style.borderColor = ${C.gree}n}
                onBlur={e => e.target.style.borderColor = ${C.borde}r} />
            </div>
          ))}
        </div>
        {posCalc ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {[
              { label: "Risque $", value: `${posCalc.riskAmt.toFixed(2)}$`, color: ${C.orange} },
              { label: "Unités", value: posCalc.units.toLocaleString(), color: ${C.green} },
              { label: "Lot size", value: posCalc.lotSize, color: ${C.text} },
            ].map(s => (
              <div key={s.label} style={{ background: ${C.bgInner}, border: `1px solid ${C.border}`, borderRadius: 9, padding: "12px 14px" }}>
                <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.08em", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: F.display }}>{s.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: C.textGhost, fontSize: 12, fontFamily: F.mono }}>Entre une entrée et un SL pour calculer la taille de position.</div>
        )}
      </div>
    </div>
  );
};
