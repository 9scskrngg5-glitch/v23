import { useState, useMemo } from "react";

const mono = "'DM Mono', monospace";
const sans = "'DM Sans', sans-serif";
const syne = "'Syne', sans-serif";

const RULE_TYPES = [
  { id: "rr_min",       label: "RR minimum",           op: ">=", field: "rr",         ph: "1.5" },
  { id: "confidence_min", label: "Confiance minimum",  op: ">=", field: "confidence", ph: "6"   },
  { id: "session",      label: "Session autorisée",     op: "==", field: "session",    ph: "New York" },
  { id: "no_revenge",   label: "Pas de revenge trade",  op: "!=", field: "emotion",    ph: "revenge" },
  { id: "no_low_conf",  label: "Confiance max",         op: "<=", field: "confidence", ph: "9" },
];

const applyRule = (trade, rule) => {
  const val = trade[rule.field];
  if (val === "" || val === null || val === undefined) return false;
  const numVal = parseFloat(val);
  const numTarget = parseFloat(rule.value);

  switch (rule.op) {
    case ">=": return !isNaN(numVal) && !isNaN(numTarget) ? numVal >= numTarget : true;
    case "<=": return !isNaN(numVal) && !isNaN(numTarget) ? numVal <= numTarget : true;
    case "==": return String(val).toLowerCase().includes(String(rule.value).toLowerCase());
    case "!=": return !String(val).toLowerCase().includes(String(rule.value).toLowerCase());
    default: return true;
  }
};

const computeStats = (trades) => {
  const closed = trades.filter(t => t.result !== "");
  if (!closed.length) return null;
  const wins = closed.filter(t => Number(t.result) > 0);
  const losses = closed.filter(t => Number(t.result) < 0);
  const pnl = closed.reduce((a, t) => a + Number(t.result), 0);
  const winRate = ((wins.length / closed.length) * 100).toFixed(1);
  const totalWin = wins.reduce((a, t) => a + Number(t.result), 0);
  const totalLoss = Math.abs(losses.reduce((a, t) => a + Number(t.result), 0));
  const pf = totalLoss ? (totalWin / totalLoss).toFixed(2) : "0";
  const avgWin = wins.length ? (totalWin / wins.length).toFixed(2) : "0";
  const avgLoss = losses.length ? (totalLoss / losses.length).toFixed(2) : "0";
  return { count: closed.length, winRate, pnl: pnl.toFixed(2), pf, avgWin, avgLoss };
};

const StatRow = ({ label, before, after, unit = "", invert = false }) => {
  const diff = Number(after) - Number(before);
  const better = invert ? diff < 0 : diff > 0;
  const color = diff === 0 ? "#3a4060" : better ? "#00e5a0" : "#ff4d6d";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #0a0d18" }}>
      <span style={{ fontSize: 11, color: "#4a5070", fontFamily: mono }}>{label}</span>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#4a5070", fontFamily: mono }}>{before}{unit}</span>
        <span style={{ fontSize: 10, color: "#2d3352", fontFamily: mono }}>→</span>
        <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: mono }}>{after}{unit}</span>
        <span style={{ fontSize: 10, color, fontFamily: mono }}>({diff >= 0 ? "+" : ""}{diff.toFixed(2)}{unit})</span>
      </div>
    </div>
  );
};

export const BacktestPanel = ({ trades }) => {
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({ type: RULE_TYPES[0].id, value: "" });

  const addRule = () => {
    if (!newRule.value) return;
    const ruleType = RULE_TYPES.find(r => r.id === newRule.type);
    setRules(prev => [...prev, { ...ruleType, value: newRule.value, id: `${newRule.type}_${Date.now()}` }]);
    setNewRule({ type: RULE_TYPES[0].id, value: "" });
  };

  const removeRule = (id) => setRules(prev => prev.filter(r => r.id !== id));

  const filteredTrades = useMemo(() => {
    if (!rules.length) return trades;
    return trades.filter(t => rules.every(rule => applyRule(t, rule)));
  }, [trades, rules]);

  const beforeStats = useMemo(() => computeStats(trades), [trades]);
  const afterStats = useMemo(() => computeStats(filteredTrades), [filteredTrades]);

  const skipped = trades.filter(t => t.result !== "").length - filteredTrades.filter(t => t.result !== "").length;

  return (
    <div style={{ background: "linear-gradient(135deg, #0a0d18, #080a14)", border: "1px solid #13162a", borderRadius: 16, padding: "22px 18px", marginBottom: 14 }}>
      <div style={{ fontSize: 10, color: "#3a4060", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: mono, marginBottom: 16 }}>
        Backtesting de règles
      </div>

      {/* Add rule */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        <select value={newRule.type} onChange={e => setNewRule(r => ({ ...r, type: e.target.value }))} style={{
          background: "#080a14", border: "1px solid #181b2e", color: "#9099c0",
          padding: "8px 10px", borderRadius: 8, fontSize: 11, fontFamily: mono,
          outline: "none", flex: 2, minWidth: 160,
        }}>
          {RULE_TYPES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
        <input
          value={newRule.value}
          onChange={e => setNewRule(r => ({ ...r, value: e.target.value }))}
          placeholder={RULE_TYPES.find(r => r.id === newRule.type)?.ph || "valeur"}
          style={{ background: "#080a14", border: "1px solid #181b2e", color: "#dde1f5", padding: "8px 12px", borderRadius: 8, fontSize: 11, fontFamily: mono, outline: "none", flex: 1, minWidth: 80 }}
          onFocus={e => e.target.style.borderColor = "#00e5a0"}
          onBlur={e => e.target.style.borderColor = "#181b2e"}
          onKeyDown={e => e.key === "Enter" && addRule()}
        />
        <button onClick={addRule} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#00e5a0", color: "#000", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: mono, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
          + RÈGLE
        </button>
      </div>

      {/* Active rules */}
      {rules.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {rules.map(r => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 20, border: "1px solid rgba(0,229,160,0.2)", background: "rgba(0,229,160,0.05)", fontSize: 10, fontFamily: mono, color: "#00e5a0" }}>
              {r.label} {r.op} {r.value}
              <button onClick={() => removeRule(r.id)} style={{ background: "none", border: "none", color: "#3a4060", cursor: "pointer", fontSize: 12, padding: 0, lineHeight: 1 }}>×</button>
            </div>
          ))}
          <button onClick={() => setRules([])} style={{ padding: "4px 10px", borderRadius: 20, border: "1px solid #181b2e", background: "transparent", color: "#3a4060", cursor: "pointer", fontSize: 10, fontFamily: mono }}>
            RESET
          </button>
        </div>
      )}

      {/* Results */}
      {beforeStats && afterStats && rules.length > 0 ? (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: "#4a5070", fontFamily: mono }}>
              {filteredTrades.filter(t => t.result !== "").length} trades conservés · {skipped} ignorés
            </span>
            <div style={{ display: "flex", gap: 16 }}>
              <span style={{ fontSize: 10, color: "#3a4060", fontFamily: mono }}>AVANT</span>
              <span style={{ fontSize: 10, color: "#00e5a0", fontFamily: mono }}>APRÈS</span>
            </div>
          </div>
          <div style={{ background: "#080a14", borderRadius: 10, padding: "4px 12px" }}>
            <StatRow label="PnL Total" before={beforeStats.pnl} after={afterStats.pnl} unit="$" />
            <StatRow label="Win Rate" before={beforeStats.winRate} after={afterStats.winRate} unit="%" />
            <StatRow label="Profit Factor" before={beforeStats.pf} after={afterStats.pf} />
            <StatRow label="Avg Win" before={beforeStats.avgWin} after={afterStats.avgWin} unit="$" />
            <StatRow label="Avg Loss" before={beforeStats.avgLoss} after={afterStats.avgLoss} unit="$" invert />
          </div>

          {Number(afterStats.pnl) > Number(beforeStats.pnl) ? (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(0,229,160,0.07)", border: "1px solid rgba(0,229,160,0.18)", borderRadius: 10, fontSize: 12, color: "#00e5a0", fontFamily: mono }}>
              En appliquant ces règles, tu aurais gagné {(Number(afterStats.pnl) - Number(beforeStats.pnl)).toFixed(2)}$ de plus.
            </div>
          ) : Number(afterStats.pnl) < Number(beforeStats.pnl) ? (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(255,77,109,0.07)", border: "1px solid rgba(255,77,109,0.18)", borderRadius: 10, fontSize: 12, color: "#ff4d6d", fontFamily: mono }}>
              Ces règles auraient réduit ton PnL de {Math.abs(Number(afterStats.pnl) - Number(beforeStats.pnl)).toFixed(2)}$.
            </div>
          ) : null}
        </div>
      ) : rules.length === 0 ? (
        <div style={{ color: "#1e2235", fontSize: 12, fontFamily: mono }}>
          Ajoute des règles pour simuler l'impact sur tes stats historiques.
        </div>
      ) : !beforeStats ? (
        <div style={{ color: "#1e2235", fontSize: 12, fontFamily: mono }}>Pas assez de trades.</div>
      ) : null}
    </div>
  );
};
