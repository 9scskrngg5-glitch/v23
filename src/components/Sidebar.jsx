import { useState } from "react";
import { C, F, glassBtn } from "../lib/design";

// ─── SVG Icons — all hand-drawn, no external deps ───
const I = {
  dashboard: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="9" width="3" height="5" rx=".5" fill="currentColor" opacity=".9"/><rect x="6.5" y="6" width="3" height="8" rx=".5" fill="currentColor" opacity=".9"/><rect x="11" y="3" width="3" height="11" rx=".5" fill="currentColor" opacity=".5"/><line x1="1" y1="15" x2="15" y2="15" stroke="currentColor" strokeWidth=".8" opacity=".25"/></svg>,
  trades: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><line x1="5" y1="2" x2="5" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".9"/><rect x="3" y="4" width="4" height="7" rx=".5" fill="currentColor" opacity=".9"/><line x1="5" y1="11" x2="5" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".9"/><line x1="11" y1="4" x2="11" y2="5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".45"/><rect x="9" y="5.5" width="4" height="3.5" rx=".5" fill="none" stroke="currentColor" strokeWidth="1.1" opacity=".45"/><line x1="11" y1="9" x2="11" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".45"/></svg>,
  stats: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><polyline points="1,13 4,8 7,10 10,5 13,7 15,3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity=".85" fill="none"/><circle cx="15" cy="3" r="1.2" fill="currentColor" opacity=".9"/></svg>,
  risk: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L14 13H2L8 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="11" r=".8" fill="currentColor"/></svg>,
  journal: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="2" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity=".7"/><line x1="5" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity=".5"/><line x1="5" y1="9" x2="11" y2="9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity=".35"/><line x1="5" y1="12" x2="8.5" y2="12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity=".2"/></svg>,
  review: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  prop: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L10 6H14L11 9L12 13L8 11L4 13L5 9L2 6H6L8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  tasks: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/></svg>,
  calendar: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.1" opacity=".8"/><line x1="5" y1="1.5" x2="5" y2="4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".7"/><line x1="11" y1="1.5" x2="11" y2="4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".7"/><line x1="2" y1="6.5" x2="14" y2="6.5" stroke="currentColor" strokeWidth=".8" opacity=".3"/><rect x="5" y="8.5" width="2" height="2" rx=".4" fill="currentColor" opacity=".6"/><rect x="9" y="8.5" width="2" height="2" rx=".4" fill="currentColor" opacity=".35"/></svg>,
  patterns: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 1V4M8 12V15M1 8H4M12 8H15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  community: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="1.4"/><circle cx="11" cy="5" r="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity=".6"/><path d="M1 13c0-2 2-3 5-3s5 1 5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 1.5V3M8 13V14.5M14.5 8H13M3 8H1.5M12.7 3.3L11.6 4.4M4.4 11.6L3.3 12.7M12.7 12.7L11.6 11.6M4.4 4.4L3.3 3.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  signout: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M10 5l3 3-3 3M13 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  admin: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L14 5V8C14 11.3 11.3 14 8 15C4.7 14 2 11.3 2 8V5L8 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M5.5 8L7 9.5L10.5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  playbook: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 13 L2 5 L6 8 L8 3 L10 7 L13 5 L13 13 Z" fill="currentColor" opacity=".18" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/><line x1="2" y1="13" x2="14" y2="13" stroke="currentColor" strokeWidth=".8" opacity=".4"/></svg>,
  alerts: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L14.5 12.5H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" opacity=".7"/><line x1="8" y1="6" x2="8" y2="9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="8" cy="10.8" r=".6" fill="currentColor"/></svg>,
};

const NAV_GROUPS = [
  { label: "MENU", items: [
    { id: "dashboard", icon: "dashboard", label: "Dashboard", key: "D" },
    { id: "trades",    icon: "trades",    label: "Trades",    key: "T" },
    { id: "stats",     icon: "stats",     label: "Statistiques", key: "S" },
    { id: "calendar",  icon: "calendar",  label: "Calendrier", key: null },
  ]},
  { label: "ANALYSE", items: [
    { id: "risk",      icon: "risk",      label: "Risk Manager", key: "R" },
    { id: "journal",   icon: "journal",   label: "Journal",   key: "J" },
    { id: "review",    icon: "review",    label: "Bilan hebdo", key: "W" },
    { id: "patterns",  icon: "patterns",  label: "Patterns AI", key: null },
  ]},
  { label: "AUTRES", items: [
    { id: "prop",      icon: "prop",      label: "Prop Firm",  key: "P" },
    { id: "tasks",     icon: "tasks",     label: "Tasks",      key: "K" },
    { id: "community", icon: "community", label: "Communauté", key: null },
  ]},
];

// Logo SVG — LOG-PIP mark
const LogoMark = () => (
  <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
    <line x1="7" y1="3" x2="7" y2="6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity=".9"/>
    <rect x="4.5" y="6" width="5" height="12" rx="1" fill="currentColor" opacity=".9"/>
    <line x1="7" y1="18" x2="7" y2="22" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity=".9"/>
    <line x1="14" y1="7" x2="14" y2="9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity=".45"/>
    <rect x="11.5" y="9" width="5" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.1" opacity=".45"/>
    <line x1="14" y1="15" x2="14" y2="19" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity=".45"/>
    <circle cx="22" cy="14" r="2.8" fill="currentColor" opacity=".9"/>
    <line x1="22" y1="9" x2="22" y2="11" stroke="currentColor" strokeWidth=".9" strokeLinecap="round" opacity=".35"/>
    <line x1="22" y1="17" x2="22" y2="19" stroke="currentColor" strokeWidth=".9" strokeLinecap="round" opacity=".35"/>
    <line x1="17" y1="14" x2="19" y2="14" stroke="currentColor" strokeWidth=".9" strokeLinecap="round" opacity=".35"/>
    <line x1="25" y1="14" x2="27" y2="14" stroke="currentColor" strokeWidth=".9" strokeLinecap="round" opacity=".35"/>
    <line x1="2" y1="26" x2="26" y2="26" stroke="currentColor" strokeWidth=".7" opacity=".12"/>
  </svg>
);

export const Sidebar = ({ tab, setTab, user, plan, stats, isPro, onUpgrade, onSignOut, onAdmin, isAdmin, accounts, activeAccount, onSwitchAccount, collapsed, setCollapsed }) => {
  const [accOpen, setAccOpen] = useState(false);
  const isMobile = window.innerWidth < 768;

  const navItem = (item) => {
    const active = tab === item.id;
    return (
      <button key={item.id} onClick={() => { setTab(item.id); if (isMobile) setCollapsed(true); }}
        title={collapsed ? item.label : ""}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          gap: collapsed ? 0 : 10,
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? "9px 0" : "0 8px",
          margin: "1px 0",
          height: 36, borderRadius: 7, border: "none", cursor: "pointer",
          background: active ? C.bgInner : "transparent",
          color: active ? C.text : C.textDim,
          fontFamily: F.sans, fontSize: 12.5, fontWeight: 300,
          transition: "all 0.12s", outline: "none", position: "relative",
        }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = C.bgInner; e.currentTarget.style.color = C.text; }}}
        onMouseLeave={e => { e.currentTarget.style.background = active ? C.bgInner : "transparent"; e.currentTarget.style.color = active ? C.text : C.textDim; }}
      >
        <span style={{ color: active ? C.text : C.textDim, flexShrink: 0, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", transition: "color 0.12s" }}>
          {I[item.icon]}
        </span>
        {!collapsed && <span style={{ overflow: "hidden", whiteSpace: "nowrap", transition: "opacity 0.2s" }}>{item.label}</span>}
        {!collapsed && item.key && (
          <kbd style={{ marginLeft: "auto", fontSize: 9, color: C.textDim, fontFamily: F.mono, background: C.bgInner, border: `1px solid ${C.border}`, borderRadius: 4, padding: "1px 5px" }}>{item.key}</kbd>
        )}
        {/* Collapsed tooltip */}
        {collapsed && (
          <div style={{
            position: "absolute", left: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)",
            background: C.bgInner, border: `1px solid ${C.borderHov}`, borderRadius: 7, padding: "5px 11px",
            fontFamily: F.mono, fontSize: 11.5, color: C.text, whiteSpace: "nowrap",
            pointerEvents: "none", opacity: 0, transition: "opacity 0.12s", zIndex: 100,
          }} className="sb-tip">{item.label}</div>
        )}
      </button>
    );
  };

  return (
    <div style={{
      width: collapsed ? (isMobile ? 0 : 60) : 220, minHeight: "100dvh",
      background: C.bg, borderRight: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column",
      transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)", flexShrink: 0,
      position: isMobile ? "fixed" : "sticky", top: 0,
      zIndex: isMobile ? 40 : "auto",
      overflowX: "hidden", overflowY: "auto",
      transform: (isMobile && collapsed) ? "translateX(-100%)" : "none",
    }}>
      <style>{`
        .sb-tip { pointer-events: none !important; }
        button:hover .sb-tip { opacity: 1 !important; }
      `}</style>

      {/* ─── Header ─── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", padding: collapsed ? "18px 0" : "18px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, minHeight: 62 }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 9, overflow: "hidden" }}>
            <span style={{ color: C.text, flexShrink: 0 }}><LogoMark /></span>
            <span style={{ fontFamily: F.mono, fontSize: 13.5, fontWeight: 500, letterSpacing: "0.06em", color: C.text, whiteSpace: "nowrap" }}>
              LOG<span style={{ opacity: 0.28 }}>-</span>PIP
            </span>
          </div>
        )}
        {collapsed && <span style={{ color: C.text }}><LogoMark /></span>}
        <button onClick={() => setCollapsed(c => !c)}
          style={{ ...glassBtn(), width: 28, height: 28, padding: 0, borderRadius: "50%", color: C.textDim, flexShrink: 0 }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1)" }}>
            <path d="M7 1.5L3.5 5.5L7 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* ─── PnL strip ─── */}
      {!collapsed && stats && (
        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", marginBottom: 3 }}>PNL TOTAL</div>
          <div style={{ fontSize: 20, fontWeight: 300, fontFamily: F.mono, color: Number(stats.totalPnL) >= 0 ? C.green : C.red, letterSpacing: "-0.03em" }}>
            {Number(stats.totalPnL) >= 0 ? "+" : ""}{stats.totalPnL}$
          </div>
        </div>
      )}

      {/* ─── Account switcher ─── */}
      {!collapsed && (
        <div style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}` }}>
          <button onClick={() => setAccOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, background: C.bgInner, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", cursor: "pointer", transition: "border-color 0.15s", color: C.textMid, fontFamily: F.sans, fontSize: 12 }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHov}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: activeAccount?.color || C.green, flexShrink: 0 }} />
            <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeAccount?.name || "Compte"}</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: C.textDim, transform: accOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          {accOpen && (
            <div style={{ marginTop: 4, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
              {accounts.map(acc => (
                <div key={acc.id} onClick={() => { onSwitchAccount(acc.id); setAccOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer", transition: "background 0.1s", color: C.textMid, fontSize: 12 }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bgInner}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: acc.color || C.green }} />
                  <span style={{ color: acc.id === activeAccount?.id ? C.green : C.textMid }}>{acc.name}</span>
                  {acc.id === activeAccount?.id && <svg style={{ marginLeft: "auto", color: C.green }} width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Nav ─── */}
      <div style={{ flex: 1, padding: collapsed ? "10px 6px" : "10px 6px", overflowY: "auto" }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} style={{ marginBottom: collapsed ? 0 : 4 }}>
            {!collapsed && (
              <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.2em", padding: "14px 14px 5px", textTransform: "uppercase" }}>
                {group.label}
              </div>
            )}
            {collapsed && gi > 0 && <div style={{ height: 1, background: C.border, margin: "6px 4px" }} />}
            {group.items.map(navItem)}
          </div>
        ))}
      </div>

      {/* ─── Footer ─── */}
      <div style={{ padding: collapsed ? "8px 6px" : "10px 6px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        {navItem({ id: "settings", icon: "settings", label: "Settings", key: null })}

        {!isPro && !collapsed && (
          <div style={{ margin: "8px 6px", padding: "14px 12px", background: C.bgInner, border: `1px solid ${C.border}`, borderRadius: 10, textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: "25%", right: "25%", height: 1, background: `linear-gradient(90deg, transparent, ${C.green}40, transparent)` }} />
            <div style={{ fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 4 }}>Passe en Pro</div>
            <div style={{ fontSize: 10, color: C.textDim, marginBottom: 10, lineHeight: 1.4 }}>Trades illimités, AI Coach</div>
            <button onClick={onUpgrade} style={{ width: "100%", padding: 8, borderRadius: 7, border: "none", background: C.green, color: C.bg, cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: F.mono, letterSpacing: "0.06em", transition: "opacity 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              UPGRADE →
            </button>
          </div>
        )}

        {isPro && !collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 7, border: `1px solid ${C.greenBord}`, background: C.greenDim, margin: "6px 6px" }}>
            <span style={{ fontSize: 10, color: C.green, fontFamily: F.mono, fontWeight: 500, letterSpacing: "0.1em" }}>● PRO</span>
            <span style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, marginLeft: "auto" }}>Actif</span>
          </div>
        )}

        {isAdmin && navItem({ id: "_admin", icon: "admin", label: "Admin", key: null })}

        {!collapsed && (
          <div style={{ padding: "8px 8px 2px", borderTop: `1px solid ${C.border}`, marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.bgInner, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: C.text, fontFamily: F.mono, flexShrink: 0 }}>
                {(user?.email?.[0] || "?").toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: C.textMid, fontFamily: F.sans, fontWeight: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                <div style={{ fontSize: 9.5, color: C.textDim, fontFamily: F.mono, marginTop: 1 }}>{isPro ? "Pro" : "Compte live"}</div>
              </div>
            </div>
            <button onClick={onSignOut} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.textDim, cursor: "pointer", fontSize: 12, fontFamily: F.sans, fontWeight: 300, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.redBord; e.currentTarget.style.color = C.red; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textDim; }}>
              <span style={{ color: "inherit", display: "flex" }}>{I.signout}</span>
              <span>Déconnexion</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
