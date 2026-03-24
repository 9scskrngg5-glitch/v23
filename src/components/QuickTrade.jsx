import { useState } from "react";
import { C, F, inp } from "../lib/design";

export const QuickTrade = ({ onAdd, pairs }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ pair: "", result: "", session: "New York" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.pair || form.result === "") return;
    setSaving(true);
    await onAdd({ ...form, confidence: "", emotion: "", setup: "", flags: [], entry: "", sl: "", tp: "", rr: "", screenshotUrl: "" });
    setSaved(true);
    setTimeout(() => { setSaved(false); setOpen(false); setForm({ pair: "", result: "", session: "New York" }); }, 1000);
    setSaving(false);
  };

  return (
    <>
      {/* FAB Button */}
      <button onClick={() => setOpen(o => !o)} style={{
        position: "fixed", bottom: 28, right: 28, width: 52, height: 52,
        borderRadius: "50%", border: "none", background: C.green, color: "#000",
        cursor: "pointer", fontSize: 22, fontWeight: 700, zIndex: 100,
        boxShadow: "0 4px 24px rgba(0,229,160,0.35)", transition: "all 0.2s",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,229,160,0.5)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,229,160,0.35)"; }}
      >
        {open ? "×" : "+"}
      </button>

      {/* Quick form */}
      {open && (
        <div style={{ position: "fixed", bottom: 92, right: 28, width: 280, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18, zIndex: 100, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "fadeIn 0.15s ease" }}>
          <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>Trade rapide</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label style={{ fontSize: 9, color: C.textDim, display: "block", marginBottom: 4, fontFamily: F.mono, letterSpacing: "0.1em", textTransform: "uppercase" }}>Paire</label>
              <input list="quick-pairs" value={form.pair} onChange={e => set("pair", e.target.value)} placeholder="BTC/USD"
                style={{ ...inp(), fontSize: 12 }}
                onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border}
              />
              <datalist id="quick-pairs">
                {(pairs || []).map(p => <option key={p} value={p} />)}
              </datalist>
            </div>
            <div>
              <label style={{ fontSize: 9, color: C.textDim, display: "block", marginBottom: 4, fontFamily: F.mono, letterSpacing: "0.1em", textTransform: "uppercase" }}>Résultat ($)</label>
              <input type="number" value={form.result} onChange={e => set("result", e.target.value)} placeholder="+150 ou -75"
                style={{ ...inp({ fontSize: 12 }) }}
                onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["London", "New York", "Asia"].map(s => (
                <button key={s} onClick={() => set("session", s)} style={{
                  flex: 1, padding: "5px 0", borderRadius: 6, border: "1px solid",
                  borderColor: form.session === s ? C.greenBord : C.border,
                  background: form.session === s ? C.greenDim : "transparent",
                  color: form.session === s ? C.green : C.textDim,
                  cursor: "pointer", fontSize: 9, fontFamily: F.mono,
                }}>{s}</button>
              ))}
            </div>
            <button onClick={handleSave} disabled={!form.pair || form.result === "" || saving} style={{
              padding: "10px", borderRadius: 8, border: "none",
              background: saved ? C.greenDim : (form.pair && form.result !== "") ? C.green : C.bgInner,
              color: saved ? C.green : (form.pair && form.result !== "") ? "#000" : C.textDim,
              border: saved ? `1px solid ${C.greenBord}` : "none",
              cursor: (form.pair && form.result !== "") ? "pointer" : "not-allowed",
              fontSize: 11, fontWeight: 700, fontFamily: F.mono, transition: "all 0.2s",
            }}>
              {saved ? "ENREGISTRÉ ✓" : "ENREGISTRER →"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
