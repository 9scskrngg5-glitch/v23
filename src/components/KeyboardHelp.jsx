import { C, F } from "../lib/design";
const mono = "'DM Mono', monospace";

const SHORTCUTS = [
  { key: "D", desc: "Dashboard" },
  { key: "T", desc: "Trades" },
  { key: "S", desc: "Stats" },
  { key: "R", desc: "Risk Manager" },
  { key: "J", desc: "Journal de marché" },
  { key: "W", desc: "Review hebdomadaire" },
  { key: "P", desc: "Prop Firm" },
  { key: "K", desc: "Tasks" },
  { key: "⌘K", desc: "Recherche globale" },
  { key: "F", desc: "Mode Focus" },
  { key: "V", desc: "Split Screen (TradingView)" },
  { key: "?", desc: "Cette aide" },
  { key: "ESC", desc: "Fermer" },
];

export const KeyboardHelp = ({ onClose }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(6px)" }} onClick={onClose}>
    <div style={{ width: "min(380px, 95vw)", background: C.bgInner, border: "1px solid #181b2e", borderRadius: 16, padding: 28 }} onClick={e => e.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: C.textDim, fontFamily: mono, letterSpacing: "0.15em" }}>RACCOURCIS CLAVIER</div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 14, fontFamily: mono }}>✕</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SHORTCUTS.map(s => (
          <div key={s.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: C.textDim, fontFamily: mono }}>{s.desc}</span>
            <kbd style={{ background: C.bgCard, border: "1px solid #181b2e", borderRadius: 5, padding: "3px 8px", fontSize: 11, color: C.green, fontFamily: mono, letterSpacing: "0.06em" }}>{s.key}</kbd>
          </div>
        ))}
      </div>
    </div>
  </div>
);
