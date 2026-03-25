import { useState, useRef, useEffect } from "react";
import { C, F } from "../lib/design";
import { ACCOUNT_TYPES } from "../hooks/useAccounts";

const mono = "'DM Mono', monospace";
const sans = "'DM Sans', sans-serif";

const inp = {
  background: C.bg, border: "1px solid #181b2e", color: C.text,
  padding: "8px 12px", borderRadius: 7, fontSize: 12,
  fontFamily: mono, outline: "none", transition: "border-color 0.2s", width: "100%",
};

const COLORS = [C.green, C.orange, C.red, "#a0a8c8", "#7b61ff", "#00d4ff"];

export const AccountSwitcher = ({ accounts, activeAccount, onSwitch, onAdd, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", type: "live", color: C.green });
  const ref = useRef();

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setAdding(false); } };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleAdd = () => {
    if (!draft.name.trim()) return;
    onAdd(draft);
    setDraft({ name: "", type: "live", color: C.green });
    setAdding(false);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "none", border: "1px solid #13162a", borderRadius: 6,
        padding: "4px 10px", cursor: "pointer", transition: "border-color 0.15s",
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#1a1e35"}
        onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
      >
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: activeAccount.color || C.green, flexShrink: 0 }} />
        <span style={{ fontSize: 10, color: C.textMid, fontFamily: mono, letterSpacing: "0.06em", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {activeAccount.name}
        </span>
        <span style={{ fontSize: 8, color: C.textDim, fontFamily: mono }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0,
          width: 240, background: C.bgInner, border: "1px solid #181b2e",
          borderRadius: 12, zIndex: 100, overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid #0e1120" }}>
            <div style={{ fontSize: 9, color: C.textDim, fontFamily: mono, letterSpacing: "0.12em" }}>COMPTES</div>
          </div>

          {accounts.map(acc => (
            <div key={acc.id}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", cursor: "pointer", background: acc.id === activeAccount.id ? "rgba(255,255,255,0.03)" : "transparent" }}
              onClick={() => { onSwitch(acc.id); setOpen(false); }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
              onMouseLeave={e => e.currentTarget.style.background = acc.id === activeAccount.id ? "rgba(255,255,255,0.03)" : "transparent"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: acc.color || C.green, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, color: C.text, fontFamily: mono }}>{acc.name}</div>
                  <div style={{ fontSize: 9, color: C.textDim, fontFamily: mono, letterSpacing: "0.06em" }}>
                    {ACCOUNT_TYPES.find(t => t.id === acc.type)?.label || acc.type}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {acc.id === activeAccount.id && <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.green }} />}
                {accounts.length > 1 && (
                  <button onClick={e => { e.stopPropagation(); onDelete(acc.id); }} style={{
                    background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 12, padding: 0,
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = C.red}
                    onMouseLeave={e => e.currentTarget.style.color = C.textDim}
                  >×</button>
                )}
              </div>
            </div>
          ))}

          <div style={{ borderTop: "1px solid #0e1120", padding: "10px 14px" }}>
            {!adding ? (
              <button onClick={() => setAdding(true)} style={{ background: "none", border: "none", color: C.green, cursor: "pointer", fontSize: 11, fontFamily: mono, letterSpacing: "0.06em", padding: 0 }}>
                + NOUVEAU COMPTE
              </button>
            ) : (
              <div>
                <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                  placeholder="Nom du compte" style={{ ...inp, marginBottom: 8 }}
                  onFocus={e => e.target.style.borderColor = C.green}
                  onBlur={e => e.target.style.borderColor = C.border}
                  onKeyDown={e => e.key === "Enter" && handleAdd()}
                  autoFocus
                />
                <select value={draft.type} onChange={e => setDraft(d => ({ ...d, type: e.target.value }))}
                  style={{ ...inp, marginBottom: 8, colorScheme: "dark" }}>
                  {ACCOUNT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  {COLORS.map(c => (
                    <div key={c} onClick={() => setDraft(d => ({ ...d, color: c }))} style={{
                      width: 16, height: 16, borderRadius: "50%", background: c,
                      cursor: "pointer", border: draft.color === c ? "2px solid #fff" : "2px solid transparent",
                      transition: "border-color 0.15s",
                    }} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={handleAdd} style={{ flex: 1, padding: "7px", borderRadius: 7, border: "none", background: C.green, color: "#000", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: mono }}>OK</button>
                  <button onClick={() => setAdding(false)} style={{ padding: "7px 10px", borderRadius: 7, border: "1px solid #181b2e", background: "transparent", color: C.textDim, cursor: "pointer", fontSize: 11, fontFamily: mono }}>✕</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
