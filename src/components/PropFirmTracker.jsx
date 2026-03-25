import { useState, useMemo } from "react";
import { C, F } from "../lib/design";

const mono = "'DM Mono', monospace";
const syne = "'Syne', sans-serif";
const sans = "'DM Sans', sans-serif";

const PROP_FIRMS = [
  { id: "ftmo", name: "FTMO", phases: ["Challenge", "Verification", "Funded"] },
  { id: "myforexfunds", name: "MyForexFunds", phases: ["Evaluation", "Funded"] },
  { id: "topstep", name: "TopStep", phases: ["Trading Combine", "Funded"] },
  { id: "e8", name: "E8 Funding", phases: ["E8 Challenge", "Funded"] },
  { id: "custom", name: "Custom", phases: ["Phase 1", "Phase 2", "Funded"] },
];

const DEFAULT_RULES = {
  ftmo: { maxDailyLoss: 5, maxTotalLoss: 10, profitTarget: 10, minTradingDays: 4, maxTradingDays: 30 },
  myforexfunds: { maxDailyLoss: 5, maxTotalLoss: 12, profitTarget: 8, minTradingDays: 5, maxTradingDays: 30 },
  topstep: { maxDailyLoss: 4, maxTotalLoss: 6, profitTarget: 6, minTradingDays: 10, maxTradingDays: 60 },
  e8: { maxDailyLoss: 5, maxTotalLoss: 8, profitTarget: 8, minTradingDays: 0, maxTradingDays: 30 },
  custom: { maxDailyLoss: 5, maxTotalLoss: 10, profitTarget: 10, minTradingDays: 5, maxTradingDays: 30 },
};

const inp = {
  background: C.bgCard, border: "1px solid #181b2e", color: C.text,
  padding: "8px 12px", borderRadius: 8, fontSize: 12,
  fontFamily: mono, outline: "none", transition: "border-color 0.2s", width: "100%",
};

const usePropFirms = () => {
  const [firms, setFirms] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tj_prop_firms") || "[]"); } catch { return []; }
  });
  const save = (next) => { setFirms(next); localStorage.setItem("tj_prop_firms", JSON.stringify(next)); };
  return { firms, save };
};

const GaugeBar = ({ label, current, max, color = C.green, invert = false, unit = "%" }) => {
  const pct = Math.min(100, Math.abs(max) > 0 ? (Math.abs(current) / Math.abs(max)) * 100 : 0);
  const danger = invert ? pct >= 80 : pct >= 90;
  const barColor = danger ? C.red : pct >= 60 ? C.orange : color;

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 10, color: C.textDim, fontFamily: mono, letterSpacing: "0.08em" }}>{label.toUpperCase()}</span>
        <span style={{ fontSize: 11, color: barColor, fontFamily: mono, fontWeight: 700 }}>
          {invert ? `-${Math.abs(current).toFixed(2)}` : `+${current.toFixed(2)}`}{unit} / {invert ? `-${max}` : `+${max}`}{unit}
        </span>
      </div>
      <div style={{ height: 6, background: C.bgInner, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 3, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
};

const FirmCard = ({ firm, trades, onEdit, onDelete }) => {
  const accountSize = firm.accountSize || 10000;
  const rules = firm.rules || DEFAULT_RULES[firm.firmId] || DEFAULT_RULES.custom;

  const firmTrades = trades.filter(t =>
    t.accountId === firm.id && t.result !== ""
  );

  // Daily loss
  const today = new Date().toDateString();
  const todayTrades = firmTrades.filter(t => new Date(t.createdAt).toDateString() === today);
  const dailyPnL = todayTrades.reduce((a, t) => a + Number(t.result), 0);
  const dailyLossPct = Math.abs(Math.min(0, dailyPnL) / accountSize * 100);

  // Total PnL
  const totalPnL = firmTrades.reduce((a, t) => a + Number(t.result), 0);
  const totalPnLPct = totalPnL / accountSize * 100;
  const totalLossPct = Math.abs(Math.min(0, totalPnL) / accountSize * 100);

  // Trading days
  const tradingDays = new Set(firmTrades.map(t => new Date(t.createdAt).toDateString())).size;

  // Status
  const dailyViolated = dailyLossPct >= rules.maxDailyLoss;
  const totalViolated = totalLossPct >= rules.maxTotalLoss;
  const targetReached = totalPnLPct >= rules.profitTarget;
  const violated = dailyViolated || totalViolated;

  const status = violated ? "FAILED" : targetReached ? "PASSED" : "ACTIVE";
  const statusColor = { FAILED: C.red, PASSED: C.green, ACTIVE: C.orange }[status];

  return (
    <div style={{
      background: C.bgCard,
      border: `1px solid ${violated ? "rgba(255,77,109,0.25)" : targetReached ? "rgba(0,229,160,0.2)" : C.border}`,
      borderRadius: 14, padding: "20px 18px", marginBottom: 12,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: syne, marginBottom: 3 }}>{firm.name}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: C.textDim, fontFamily: mono }}>{firm.firm} · {firm.phase} · ${accountSize.toLocaleString()}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 10, fontFamily: mono, letterSpacing: "0.08em", padding: "3px 10px", borderRadius: 20, border: `1px solid ${statusColor}30`, color: statusColor, background: `${statusColor}08` }}>
            {status}
          </span>
          <button onClick={() => onEdit(firm)} style={{ background: "none", border: "1px solid #13162a", borderRadius: 5, color: C.textDim, cursor: "pointer", fontSize: 9, fontFamily: mono, padding: "3px 8px" }}>EDIT</button>
          <button onClick={() => onDelete(firm.id)} style={{ background: "none", border: "1px solid rgba(255,77,109,0.2)", borderRadius: 5, color: C.red, cursor: "pointer", fontSize: 9, fontFamily: mono, padding: "3px 8px" }}>DEL</button>
        </div>
      </div>

      <GaugeBar label="Perte journalière" current={dailyLossPct} max={rules.maxDailyLoss} invert color={C.orange} />
      <GaugeBar label="Perte totale" current={totalLossPct} max={rules.maxTotalLoss} invert color={C.orange} />
      <GaugeBar label="Objectif profit" current={Math.max(0, totalPnLPct)} max={rules.profitTarget} color={C.green} unit="%" />

      <div style={{ display: "flex", gap: 16, marginTop: 12, paddingTop: 12, borderTop: "1px solid #0a0d18" }}>
        <div>
          <div style={{ fontSize: 9, color: C.textDim, fontFamily: mono, letterSpacing: "0.1em" }}>PNL</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: totalPnL >= 0 ? C.green : C.red, fontFamily: mono }}>
            {totalPnL >= 0 ? "+" : ""}{totalPnL.toFixed(2)}$
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: C.textDim, fontFamily: mono, letterSpacing: "0.1em" }}>JOURS</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: mono }}>
            {tradingDays}{rules.minTradingDays > 0 ? ` / ${rules.minTradingDays} min` : ""}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: C.textDim, fontFamily: mono, letterSpacing: "0.1em" }}>TRADES</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: mono }}>{firmTrades.length}</div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: C.textDim, fontFamily: mono, letterSpacing: "0.1em" }}>MARGE</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.orange, fontFamily: mono }}>
            {((rules.maxTotalLoss - totalLossPct)).toFixed(1)}%
          </div>
        </div>
      </div>

      {violated && (
        <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(255,77,109,0.07)", border: "1px solid rgba(255,77,109,0.2)", borderRadius: 8, fontSize: 11, color: C.red, fontFamily: mono }}>
          {dailyViolated ? "Limite de perte journalière atteinte. STOP TRADING." : "Limite de perte totale atteinte. Challenge échoué."}
        </div>
      )}
      {targetReached && !violated && (
        <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(0,229,160,0.07)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: 8, fontSize: 11, color: C.green, fontFamily: mono }}>
          Objectif de profit atteint ! Vérifie les autres conditions avant de soumettre.
        </div>
      )}
    </div>
  );
};

const FirmForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState(initial || {
    id: `firm_${Date.now()}`, name: "", firmId: "ftmo", firm: "FTMO",
    phase: "Challenge", accountSize: "10000",
    rules: { maxDailyLoss: 5, maxTotalLoss: 10, profitTarget: 10, minTradingDays: 4, maxTradingDays: 30 },
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setRule = (k, v) => setForm(f => ({ ...f, rules: { ...f.rules, [k]: Number(v) } }));

  const handleFirmChange = (firmId) => {
    const firm = PROP_FIRMS.find(f => f.id === firmId);
    set("firmId", firmId);
    set("firm", firm.name);
    set("phase", firm.phases[0]);
    setForm(f => ({ ...f, firmId, firm: firm.name, phase: firm.phases[0], rules: DEFAULT_RULES[firmId] || DEFAULT_RULES.custom }));
  };

  const selectedFirm = PROP_FIRMS.find(f => f.id === form.firmId) || PROP_FIRMS[0];

  return (
    <div style={{ background: C.bgCard, border: "1px solid #181b2e", borderRadius: 14, padding: 22, marginBottom: 14 }}>
      <div style={{ fontSize: 10, color: C.textDim, fontFamily: mono, letterSpacing: "0.12em", marginBottom: 16 }}>
        {initial ? "MODIFIER" : "NOUVEAU COMPTE PROP FIRM"}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div>
          <label style={{ fontSize: 9, color: C.textDim, display: "block", marginBottom: 4, fontFamily: mono, letterSpacing: "0.1em" }}>NOM DU COMPTE</label>
          <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Mon FTMO #1" style={inp}
            onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border} />
        </div>
        <div>
          <label style={{ fontSize: 9, color: C.textDim, display: "block", marginBottom: 4, fontFamily: mono, letterSpacing: "0.1em" }}>PROP FIRM</label>
          <select value={form.firmId} onChange={e => handleFirmChange(e.target.value)} style={{ ...inp, colorScheme: "dark" }}>
            {PROP_FIRMS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 9, color: C.textDim, display: "block", marginBottom: 4, fontFamily: mono, letterSpacing: "0.1em" }}>PHASE</label>
          <select value={form.phase} onChange={e => set("phase", e.target.value)} style={{ ...inp, colorScheme: "dark" }}>
            {selectedFirm.phases.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 9, color: C.textDim, display: "block", marginBottom: 4, fontFamily: mono, letterSpacing: "0.1em" }}>TAILLE DU COMPTE ($)</label>
          <input type="number" value={form.accountSize} onChange={e => set("accountSize", Number(e.target.value))} placeholder="10000" style={inp}
            onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border} />
        </div>
      </div>

      <div style={{ fontSize: 9, color: C.textDim, fontFamily: mono, letterSpacing: "0.12em", marginBottom: 10 }}>RÈGLES (%)</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { k: "maxDailyLoss", label: "Perte max/jour" },
          { k: "maxTotalLoss", label: "Perte max totale" },
          { k: "profitTarget", label: "Objectif profit" },
          { k: "minTradingDays", label: "Jours min" },
          { k: "maxTradingDays", label: "Jours max" },
        ].map(({ k, label }) => (
          <div key={k}>
            <label style={{ fontSize: 9, color: C.textDim, display: "block", marginBottom: 4, fontFamily: mono, letterSpacing: "0.08em" }}>{label.toUpperCase()}</label>
            <input type="number" value={form.rules[k] || ""} onChange={e => setRule(k, e.target.value)} style={inp}
              onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border} />
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => onSave(form)} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: C.green, color: "#000", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: mono, letterSpacing: "0.06em" }}>
          SAUVEGARDER
        </button>
        <button onClick={onCancel} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #181b2e", background: "transparent", color: C.textDim, cursor: "pointer", fontSize: 11, fontFamily: mono }}>
          ANNULER
        </button>
      </div>
    </div>
  );
};

export const PropFirmTracker = ({ trades }) => {
  const { firms, save } = usePropFirms();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleSave = (firm) => {
    if (editing) {
      save(firms.map(f => f.id === firm.id ? firm : f));
      setEditing(null);
    } else {
      save([...firms, firm]);
      setAdding(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Supprimer ce compte prop firm ?")) save(firms.filter(f => f.id !== id));
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: mono }}>
          Prop Firm Tracker
        </div>
        <button onClick={() => setAdding(true)} style={{
          padding: "7px 14px", borderRadius: 8, border: "none",
          background: C.green, color: "#000", cursor: "pointer",
          fontSize: 11, fontWeight: 700, fontFamily: mono, letterSpacing: "0.06em",
        }}>
          + COMPTE
        </button>
      </div>

      {adding && <FirmForm onSave={handleSave} onCancel={() => setAdding(false)} />}
      {editing && <FirmForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />}

      {firms.length === 0 && !adding ? (
        <div style={{ background: C.bgCard, border: "1px dashed #13162a", borderRadius: 14, padding: 32, textAlign: "center", color: C.textGhost, fontSize: 12, fontFamily: mono }}>
          Aucun compte prop firm. Clique sur + COMPTE pour commencer.
        </div>
      ) : (
        firms.map(firm => (
          <FirmCard key={firm.id} firm={firm} trades={trades} onEdit={setEditing} onDelete={handleDelete} />
        ))
      )}
    </div>
  );
};
