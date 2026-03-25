import { useState, useEffect, useRef, useMemo } from "react";
import { C, F } from "../lib/design";

const highlight = (text, query) => {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: "rgba(0,229,160,0.25)", color: C.green, borderRadius: 2 }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
};

export const CommandPalette = ({ trades, onClose, onNavigate, onSelectTrade }) => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef();
  const listRef = useRef();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const NAV_CMDS = [
    { id: "nav_dashboard", label: "Dashboard", icon: "▦", action: () => { onNavigate("dashboard"); onClose(); } },
    { id: "nav_trades",    label: "Trades",    icon: "≡", action: () => { onNavigate("trades"); onClose(); } },
    { id: "nav_stats",     label: "Stats",     icon: "∿", action: () => { onNavigate("stats"); onClose(); } },
    { id: "nav_risk",      label: "Risk Manager", icon: "⊘", action: () => { onNavigate("risk"); onClose(); } },
    { id: "nav_journal",   label: "Journal",   icon: "◈", action: () => { onNavigate("journal"); onClose(); } },
    { id: "nav_review",    label: "Review",    icon: "⊙", action: () => { onNavigate("review"); onClose(); } },
    { id: "nav_prop",      label: "Prop Firm", icon: "◆", action: () => { onNavigate("prop"); onClose(); } },
    { id: "nav_tasks",     label: "Tasks",     icon: "◻", action: () => { onNavigate("tasks"); onClose(); } },
    { id: "nav_settings",  label: "Settings",  icon: "⊕", action: () => { onNavigate("settings"); onClose(); } },
  ];

  const tradeResults = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return trades
      .filter(t =>
        t.pair?.toLowerCase().includes(q) ||
        t.setup?.toLowerCase().includes(q) ||
        t.emotion?.toLowerCase().includes(q) ||
        String(t.result).includes(q)
      )
      .slice(0, 6)
      .map(t => ({
        id: `trade_${t.id}`,
        label: `${t.pair} — ${t.result !== "" ? (Number(t.result) >= 0 ? "+" : "") + Number(t.result).toFixed(2) + "$" : "En cours"}`,
        sub: t.setup || t.emotion || "",
        icon: t.result !== "" ? (Number(t.result) >= 0 ? "▲" : "▼") : "◆",
        color: t.result !== "" ? (Number(t.result) >= 0 ? ${C.green} : ${C.red}) : ${C.textDim},
        action: () => { onSelectTrade?.(t); onClose(); },
      }));
  }, [query, trades]);

  const navResults = useMemo(() => {
    if (!query) return NAV_CMDS;
    return NAV_CMDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  const allResults = [...(query.length >= 2 ? tradeResults : []), ...navResults];

  useEffect(() => { setSelected(0); }, [query]);

  const handleKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, allResults.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && allResults[selected]) { allResults[selected].action(); }
    if (e.key === "Escape") onClose();
  };

  useEffect(() => {
    const el = listRef.current?.children[selected];
    el?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 500, padding: "80px 16px", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div style={{ width: "min(560px, 100%)", background: ${C.bgCard}, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
        {/* Input */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 16, color: C.textDim, fontFamily: F.mono }}>⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Recherche un trade, une page..."
            style={{ flex: 1, background: "none", border: "none", color: C.text, fontSize: 15, fontFamily: F.sans, outline: "none" }}
          />
          <kbd style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, background: C.bgInner, border: `1px solid ${C.border}`, borderRadius: 5, padding: "3px 7px" }}>ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ maxHeight: 380, overflowY: "auto", padding: "6px" }}>
          {/* Section: Trades */}
          {tradeResults.length > 0 && (
            <>
              <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", padding: "8px 12px 4px" }}>TRADES</div>
              {tradeResults.map((r, i) => (
                <ResultItem key={r.id} item={r} active={selected === i} query={query} onClick={r.action} />
              ))}
            </>
          )}

          {/* Section: Navigation */}
          {navResults.length > 0 && (
            <>
              <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", padding: "8px 12px 4px" }}>NAVIGATION</div>
              {navResults.map((r, i) => (
                <ResultItem key={r.id} item={r} active={selected === i + tradeResults.length} query={query} onClick={r.action} />
              ))}
            </>
          )}

          {allResults.length === 0 && (
            <div style={{ padding: "24px", textAlign: "center", color: C.textDim, fontSize: 13, fontFamily: F.mono }}>
              Aucun résultat pour "{query}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "8px 16px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 16 }}>
          {[["↑↓", "Naviguer"], ["↵", "Sélectionner"], ["ESC", "Fermer"]].map(([k, l]) => (
            <div key={k} style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <kbd style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, background: C.bgInner, border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 6px" }}>{k}</kbd>
              <span style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ResultItem = ({ item, active, query, onClick }) => (
  <div onClick={onClick} style={{
    display: "flex", alignItems: "center", gap: 10,
    padding: "9px 12px", borderRadius: 9, cursor: "pointer",
    background: active ? C.greenDim : "transparent",
    transition: "background 0.1s",
  }}
    onMouseEnter={e => e.currentTarget.style.background = active ? C.greenDim : C.bgInner}
    onMouseLeave={e => e.currentTarget.style.background = active ? C.greenDim : "transparent"}
  >
    <span style={{ fontSize: 13, color: item.color || C.textDim, width: 18, textAlign: "center", flexShrink: 0, fontFamily: F.mono }}>{item.icon}</span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, color: active ? C.green : C.text, fontFamily: F.sans }}>{highlight(item.label, query)}</div>
      {item.sub && <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.sub}</div>}
    </div>
    {active && <span style={{ fontSize: 10, color: C.green, fontFamily: F.mono }}>↵</span>}
  </div>
);
