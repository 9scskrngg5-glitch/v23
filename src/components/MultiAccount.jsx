import { useState } from "react";
import { C, F } from "../lib/design";

const mono = "'DM Mono', monospace";
const syne = "'Syne', sans-serif";

export const useMultiAccount = () => {
  const [accounts, setAccounts] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("tj_accounts") || "null");
      return saved || [{ id: "default", name: "Compte principal", color: C.green, active: true }];
    } catch { return [{ id: "default", name: "Compte principal", color: C.green, active: true }]; }
  });

  const [activeId, setActiveId] = useState(() => localStorage.getItem("tj_active_account") || "default");

  const save = (next) => {
    setAccounts(next);
    localStorage.setItem("tj_accounts", JSON.stringify(next));
  };

  const addAccount = (name, color) => {
    const id = `acc_${Date.now()}`;
    save([...accounts, { id, name, color, active: true }]);
    switchAccount(id);
    return id;
  };

  const removeAccount = (id) => {
    if (id === "default") return;
    save(accounts.filter(a => a.id !== id));
    if (activeId === id) switchAccount("default");
  };

  const renameAccount = (id, name) => save(accounts.map(a => a.id === id ? { ...a, name } : a));

  const switchAccount = (id) => {
    setActiveId(id);
    localStorage.setItem("tj_active_account", id);
  };

  const activeAccount = accounts.find(a => a.id === activeId) || accounts[0];

  return { accounts, activeId, activeAccount, addAccount, removeAccount, renameAccount, switchAccount };
};

const COLORS = [C.green, C.orange, "#a78bfa", "#60a5fa", "#f87171", "#34d399"];

export const AccountSwitcher = ({ accounts, activeId, onSwitch, onAdd, onRemove }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd(newName.trim(), newColor);
    setNewName(""); setShowAdd(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        {accounts.map(a => (
          <button key={a.id} onClick={() => onSwitch(a.id)} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 8, border: "1px solid",
            borderColor: activeId === a.id ? `${a.color}50` : ${C.border},
            background: activeId === a.id ? `${a.color}0d` : "transparent",
            cursor: "pointer", fontSize: 11, fontFamily: mono,
            color: activeId === a.id ? a.color : C.textDim,
            transition: "all 0.15s",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.color }} />
            {a.name}
            {a.id !== "default" && activeId === a.id && (
              <span onClick={e => { e.stopPropagation(); onRemove(a.id); }} style={{ color: C.red, fontSize: 12, marginLeft: 2, cursor: "pointer" }}>×</span>
            )}
          </button>
        ))}
        <button onClick={() => setShowAdd(s => !s)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #13162a", background: "transparent", color: C.textDim, cursor: "pointer", fontSize: 10, fontFamily: mono }}>
          {showAdd ? "×" : "+"}
        </button>
      </div>

      {showAdd && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, background: C.bgInner, border: "1px solid #181b2e", borderRadius: 12, padding: 16, zIndex: 50, minWidth: 240, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nom du compte"
            style={{ background: C.bgCard, border: "1px solid #181b2e", color: C.text, padding: "8px 12px", borderRadius: 8, width: "100%", fontSize: 12, fontFamily: mono, outline: "none", marginBottom: 10 }}
            onFocus={e => e.target.style.borderColor = C.green}
            onBlur={e => e.target.style.borderColor = C.border}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
          />
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => setNewColor(c)} style={{ width: 18, height: 18, borderRadius: "50%", background: c, cursor: "pointer", border: newColor === c ? "2px solid #fff" : "2px solid transparent", transition: "border 0.15s" }} />
            ))}
          </div>
          <button onClick={handleAdd} style={{ width: "100%", padding: "8px", borderRadius: 8, border: "none", background: C.green, color: "#000", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: mono, letterSpacing: "0.06em" }}>
            CRÉER
          </button>
        </div>
      )}
    </div>
  );
};
