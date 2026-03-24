import { useState } from "react";
import { C, F, card, inp, btn } from "../lib/design";
import { uid } from "../lib/trading";

const STORAGE_KEY = "tj_trade_templates";

const useTemplates = () => {
  const [templates, setTemplates] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  });
  const save = (next) => { setTemplates(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); };
  const add = (tpl) => save([...templates, { ...tpl, id: uid(), createdAt: Date.now() }]);
  const remove = (id) => save(templates.filter(t => t.id !== id));
  return { templates, add, remove };
};

const FIELDS = [
  { k: "name",       label: "Nom du template",     ph: "Break of Structure Long",  type: "text"   },
  { k: "pair",       label: "Paire",                ph: "BTC/USD",                  type: "text"   },
  { k: "session",    label: "Session",              ph: "New York",                 type: "text"   },
  { k: "setup",      label: "Setup",                ph: "BOS + OB retest",          type: "text"   },
  { k: "confidence", label: "Confiance (1-10)",     ph: "7",                        type: "number" },
];

export const TradeTemplates = ({ onUseTemplate }) => {
  const { templates, add, remove } = useTemplates();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", pair: "", session: "New York", setup: "", confidence: "" });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    add(form);
    setForm({ name: "", pair: "", session: "New York", setup: "", confidence: "" });
    setAdding(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Templates de trades
        </div>
        <button onClick={() => setAdding(a => !a)} style={{ ...btn("outline"), padding: "7px 14px", fontSize: 10 }}>
          {adding ? "ANNULER" : "+ TEMPLATE"}
        </button>
      </div>

      {adding && (
        <div style={{ ...card(), marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            {FIELDS.map(({ k, label, ph, type }) => (
              <div key={k}>
                <label style={{ fontSize: 9, color: C.textDim, display: "block", marginBottom: 5, fontFamily: F.mono, letterSpacing: "0.1em" }}>{label.toUpperCase()}</label>
                <input type={type} value={form[k] || ""} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                  placeholder={ph} style={inp()}
                  onFocus={e => e.target.style.borderColor = C.green}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>
            ))}
          </div>
          <button onClick={handleAdd} style={{ ...btn("primary"), fontSize: 11 }}>SAUVEGARDER</button>
        </div>
      )}

      {templates.length === 0 && !adding ? (
        <div style={{ ...card(), textAlign: "center", color: C.textGhost, fontSize: 12, fontFamily: F.mono, padding: "24px" }}>
          Crée des templates pour tes setups favoris — remplis un trade en 1 clic.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {templates.map(tpl => (
            <div key={tpl.id} style={{ ...card(), padding: "14px 16px", position: "relative" }}>
              <button onClick={() => remove(tpl.id)} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", color: C.textGhost, cursor: "pointer", fontSize: 13, padding: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = C.red}
                onMouseLeave={e => e.currentTarget.style.color = C.textGhost}
              >×</button>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: F.mono, marginBottom: 8, paddingRight: 20 }}>{tpl.name}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 12 }}>
                {tpl.pair && <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono }}>{tpl.pair}</div>}
                {tpl.session && <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono }}>{tpl.session}</div>}
                {tpl.setup && <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tpl.setup}</div>}
                {tpl.confidence && <div style={{ fontSize: 10, color: C.green, fontFamily: F.mono }}>Confiance: {tpl.confidence}/10</div>}
              </div>
              <button onClick={() => onUseTemplate?.(tpl)} style={{ ...btn("primary"), width: "100%", padding: "7px", fontSize: 10, textAlign: "center" }}>
                UTILISER →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
