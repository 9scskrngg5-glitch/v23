import { useState, useEffect } from "react";

const mono = "'DM Mono', monospace";
const syne = "'Syne', sans-serif";

const inp = {
  background: "#080a14", border: "1px solid #181b2e", color: "#dde1f5",
  padding: "9px 13px", borderRadius: 8, width: "100%",
  fontSize: 12, fontFamily: mono, outline: "none", transition: "border-color 0.2s",
};

const Progress = ({ label, current, target, color = "#00e5a0", unit = "" }) => {
  const pct = Math.min(100, target > 0 ? (current / target) * 100 : 0);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: "#4a5070", fontFamily: mono }}>{label}</span>
        <span style={{ fontSize: 11, fontFamily: mono, color: pct >= 100 ? "#00e5a0" : "#9099c0" }}>
          {current}{unit} / {target}{unit}
        </span>
      </div>
      <div style={{ height: 4, background: "#0e1120", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? "#00e5a0" : color, borderRadius: 2, transition: "width 0.5s ease" }} />
      </div>
      {pct >= 100 && (
        <div style={{ fontSize: 10, color: "#00e5a0", fontFamily: mono, marginTop: 4, letterSpacing: "0.08em" }}>OBJECTIF ATTEINT</div>
      )}
    </div>
  );
};

export const GoalsPanel = ({ stats, trades }) => {
  const [goals, setGoals] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tj_goals") || "{}"); } catch { return {}; }
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(goals);

  const save = () => {
    setGoals(draft);
    localStorage.setItem("tj_goals", JSON.stringify(draft));
    setEditing(false);
  };

  const closed = trades.filter(t => t.result !== "");

  // Current month stats
  const now = new Date();
  const monthTrades = closed.filter(t => {
    const d = new Date(t.createdAt ?? 0);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthPnL = monthTrades.reduce((a, t) => a + Number(t.result), 0);
  const monthWins = monthTrades.filter(t => Number(t.result) > 0).length;
  const monthWR = monthTrades.length ? ((monthWins / monthTrades.length) * 100).toFixed(1) : 0;

  const hasGoals = goals.pnlTarget || goals.winRateTarget || goals.tradesTarget || goals.maxLossTarget;

  return (
    <div style={{ background: "linear-gradient(135deg, #0a0d18, #080a14)", border: "1px solid #13162a", borderRadius: 16, padding: "20px 18px", marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "#3a4060", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: mono }}>
          Objectifs du mois — {now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </div>
        <button onClick={() => { setDraft(goals); setEditing(e => !e); }} style={{
          background: "none", border: "1px solid #181b2e", borderRadius: 6,
          color: "#3a4060", cursor: "pointer", fontSize: 10,
          fontFamily: mono, padding: "4px 10px", letterSpacing: "0.06em",
        }}>
          {editing ? "ANNULER" : "MODIFIER"}
        </button>
      </div>

      {editing ? (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            {[
              { key: "pnlTarget", label: "PnL cible ($)" },
              { key: "winRateTarget", label: "Win Rate cible (%)" },
              { key: "tradesTarget", label: "Nb trades max" },
              { key: "maxLossTarget", label: "Perte max journalière ($)" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label style={{ fontSize: 9, color: "#2d3352", display: "block", marginBottom: 5, fontFamily: mono, letterSpacing: "0.1em" }}>{label.toUpperCase()}</label>
                <input type="number" value={draft[key] || ""} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                  style={inp}
                  onFocus={e => e.target.style.borderColor = "#00e5a0"}
                  onBlur={e => e.target.style.borderColor = "#181b2e"}
                />
              </div>
            ))}
          </div>
          <button onClick={save} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#00e5a0", color: "#000", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: mono, letterSpacing: "0.06em" }}>
            SAUVEGARDER
          </button>
        </div>
      ) : !hasGoals ? (
        <div style={{ color: "#1e2235", fontSize: 12, fontFamily: mono, padding: "12px 0" }}>
          Clique sur Modifier pour definir tes objectifs du mois.
        </div>
      ) : (
        <div>
          {goals.pnlTarget && <Progress label="PnL mensuel" current={monthPnL.toFixed(0)} target={Number(goals.pnlTarget)} unit="$" />}
          {goals.winRateTarget && <Progress label="Win Rate" current={monthWR} target={Number(goals.winRateTarget)} unit="%" color="#f5a623" />}
          {goals.tradesTarget && <Progress label="Trades ce mois" current={monthTrades.length} target={Number(goals.tradesTarget)} color="#a0a8c8" />}
          {goals.maxLossTarget && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "#4a5070", fontFamily: mono }}>Perte max journalière</span>
                <span style={{ fontSize: 11, fontFamily: mono, color: "#9099c0" }}>Limite : {goals.maxLossTarget}$</span>
              </div>
              <div style={{ fontSize: 11, color: "#3a4060", fontFamily: mono }}>Surveille via l'alerte drawdown sur le Dashboard.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { GoalsPanel as default };
export const useGoals = () => {
  try { return JSON.parse(localStorage.getItem("tj_goals") || "{}"); } catch { return {}; }
};
