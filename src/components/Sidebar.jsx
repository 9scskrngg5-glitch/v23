import { useState } from "react";
import { C, F } from "../lib/design";

const NAV = [
  { id: "dashboard", icon: "▦", label: "Dashboard",  key: "D" },
  { id: "trades",    icon: "≡", label: "Trades",     key: "T" },
  { id: "stats",     icon: "∿", label: "Statistiques", key: "S" },
  { id: "risk",      icon: "⊘", label: "Risk",       key: "R" },
  { id: "journal",   icon: "◈", label: "Journal",    key: "J" },
  { id: "review",    icon: "⊙", label: "Review",     key: "W" },
  { id: "prop",      icon: "◆", label: "Prop Firm",  key: "P" },
  { id: "tasks",     icon: "◻", label: "Tasks",      key: "K" },
  { id: "community", icon: "⊛", label: "Communauté", key: null },
  { id: "patterns",  icon: "◎", label: "Patterns AI",  key: null },
  { id: "calendar",  icon: "▣", label: "Calendrier",   key: null },
];

export const Sidebar = ({ tab, setTab, user, plan, stats, isPro, onUpgrade, onSignOut, onAdmin, isAdmin, accounts, activeAccount, onSwitchAccount, collapsed, setCollapsed }) => {
  const [accOpen, setAccOpen] = useState(false);

  const navItem = (item) => {
    const active = tab === item.id;
    return (
      <button key={item.id} onClick={() => setTab(item.id)} title={collapsed ? `${item.label} (${item.key})` : ""}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          gap: collapsed ? 0 : 10,
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? "10px 0" : "9px 12px",
          borderRadius: 9, border: "none", cursor: "pointer",
          background: active ? C.greenDim : "transparent",
          color: active ? C.green : C.textDim,
          fontFamily: F.mono, fontSize: 12, letterSpacing: "0.04em",
          transition: "all 0.12s", marginBottom: 1,
          outline: "none",
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.bgInner; e.currentTarget.style.color = active ? C.green : C.textMid; }}
        onMouseLeave={e => { e.currentTarget.style.background = active ? C.greenDim : "transparent"; e.currentTarget.style.color = active ? C.green : C.textDim; }}
      >
        <span style={{ fontSize: 15, flexShrink: 0, width: 18, textAlign: "center" }}>{item.icon}</span>
        {!collapsed && <span>{item.label}</span>}
        {!collapsed && active && <div style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: C.green }} />}
      </button>
    );
  };

  return (
    <div style={{
      width: collapsed ? (window.innerWidth < 768 ? 0 : 52) : 240, minHeight: "100dvh",
      background: C.bgCard, borderRight: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column",
      transition: "width 0.2s ease, transform 0.2s ease", flexShrink: 0,
      position: window.innerWidth < 768 ? "fixed" : "sticky", top: 0,
      zIndex: window.innerWidth < 768 ? 40 : "auto",
      overflowX: "hidden", overflowY: "auto",
      transform: (window.innerWidth < 768 && collapsed) ? "translateX(-100%)" : "none",
    }}>
      {/* Top — logo + collapse */}
      <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", padding: collapsed ? 0 : "0 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        {!collapsed && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.green, fontFamily: F.mono, letterSpacing: "0.18em" }}>TJ</span>
            <span style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.12em" }}>TRADING JOURNAL</span>
          </div>
        )}
        <button onClick={() => setCollapsed(c => !c)} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 12, padding: 6, borderRadius: 6, transition: "color 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.color = C.textMid}
          onMouseLeave={e => e.currentTarget.style.color = C.textDim}
        >{collapsed ? "▶" : "◀"}</button>
      </div>

      {/* PnL */}
      {!collapsed && stats && (
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", marginBottom: 4 }}>PNL TOTAL</div>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: Number(stats.totalPnL) >= 0 ? C.green : C.red, letterSpacing: "-0.02em" }}>
            {Number(stats.totalPnL) >= 0 ? "+" : ""}{stats.totalPnL}$
          </div>
        </div>
      )}

      {/* Account switcher */}
      {!collapsed && (
        <div style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}` }}>
          <button onClick={() => setAccOpen(o => !o)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 8,
            background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "8px 10px", cursor: "pointer",
          }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: activeAccount?.color || C.green, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: C.textMid, fontFamily: F.mono, flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {activeAccount?.name || "Compte"}
            </span>
            <span style={{ fontSize: 8, color: C.textDim }}>▾</span>
          </button>
          {accOpen && (
            <div style={{ marginTop: 4, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
              {accounts.map(acc => (
                <div key={acc.id} onClick={() => { onSwitchAccount(acc.id); setAccOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bgInner}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: acc.color || C.green }} />
                  <span style={{ fontSize: 11, color: acc.id === activeAccount?.id ? C.green : C.textMid, fontFamily: F.mono }}>{acc.name}</span>
                  {acc.id === activeAccount?.id && <div style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: C.green }} />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <div style={{ padding: collapsed ? "10px 6px" : "10px 8px" }}>
        {NAV.map(navItem)}
      </div>

      {/* Bottom */}
      <div style={{ padding: collapsed ? "8px 6px" : "8px 8px", borderTop: `1px solid ${C.border}` }}>
        {/* Settings */}
        <button onClick={() => setTab("settings")} title={collapsed ? "Settings" : ""}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "10px 0" : "9px 12px", borderRadius: 9, border: "none", cursor: "pointer", background: tab === "settings" ? C.greenDim : "transparent", color: tab === "settings" ? C.green : C.textDim, fontFamily: F.mono, fontSize: 12, transition: "all 0.12s", marginBottom: 4, outline: "none" }}>
          <span style={{ fontSize: 15, width: 18, textAlign: "center" }}>⊕</span>
          {!collapsed && <span>Settings</span>}
        </button>

        {/* Plan */}
        <button onClick={isPro ? () => {} : onUpgrade} title={collapsed ? (isPro ? "PRO" : "UPGRADE") : ""}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "8px 0" : "8px 12px", borderRadius: 9, border: "none", cursor: isPro ? "default" : "pointer", background: "transparent", transition: "all 0.12s", marginBottom: 2, outline: "none" }}>
          <span style={{ fontSize: 10, color: isPro ? C.green : C.orange, fontFamily: F.mono, fontWeight: 700, width: 18, textAlign: "center" }}>{collapsed ? (isPro ? "P" : "↑") : (isPro ? "●" : "○")}</span>
          {!collapsed && <span style={{ fontSize: 10, color: isPro ? C.green : C.orange, fontFamily: F.mono, letterSpacing: "0.1em" }}>{isPro ? "PRO" : "UPGRADE"}</span>}
        </button>

        {/* Admin */}
        {isAdmin && (
          <button onClick={onAdmin} title={collapsed ? "Admin" : ""}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "8px 0" : "8px 12px", borderRadius: 9, border: "none", cursor: "pointer", background: "transparent", outline: "none" }}>
            <span style={{ fontSize: 13, color: C.orange, width: 18, textAlign: "center" }}>⊡</span>
            {!collapsed && <span style={{ fontSize: 10, color: C.orange, fontFamily: F.mono, letterSpacing: "0.08em" }}>ADMIN</span>}
          </button>
        )}

        {/* User info */}
        {!collapsed && (
          <div style={{ padding: "10px 6px 2px" }}>
            <div style={{ fontSize: 10, color: C.textGhost, fontFamily: F.mono, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
            <button onClick={onSignOut} style={{ width: "100%", padding: "7px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.textDim, cursor: "pointer", fontSize: 10, fontFamily: F.mono, letterSpacing: "0.08em", transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = C.red}
              onMouseLeave={e => e.currentTarget.style.color = C.textDim}
            >DÉCONNEXION</button>
          </div>
        )}
      </div>
    </div>
  );
};
