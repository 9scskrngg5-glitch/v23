import { useState } from "react";
import { C, F } from "../lib/design";

// SVG icons — clean geometric style
const Icons = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.9"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.5"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.9"/>
    </svg>
  ),
  trades: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 12L6 8L9 10L14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="14" cy="4" r="1.5" fill="currentColor"/>
    </svg>
  ),
  stats: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="9" width="3" height="5" rx="1" fill="currentColor" fillOpacity="0.5"/>
      <rect x="6.5" y="5" width="3" height="9" rx="1" fill="currentColor" fillOpacity="0.7"/>
      <rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor"/>
    </svg>
  ),
  risk: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L14 13H2L8 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M8 6V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="11" r="0.8" fill="currentColor"/>
    </svg>
  ),
  journal: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="2" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M6 6H10M6 9H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  review: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  prop: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L10 6H14L11 9L12 13L8 11L4 13L5 9L2 6H6L8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  ),
  tasks: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ),
  community: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="11" cy="5" r="2" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.6"/>
      <path d="M1 13c0-2 2-3 5-3s5 1 5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  patterns: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 1V4M8 12V15M1 8H4M12 8H15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  calendar: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M2 7H14" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5 1V4M11 1V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <rect x="5" y="9" width="2" height="2" rx="0.5" fill="currentColor" fillOpacity="0.7"/>
      <rect x="9" y="9" width="2" height="2" rx="0.5" fill="currentColor" fillOpacity="0.4"/>
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 1.5V3M8 13V14.5M14.5 8H13M3 8H1.5M12.7 3.3L11.6 4.4M4.4 11.6L3.3 12.7M12.7 12.7L11.6 11.6M4.4 4.4L3.3 3.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  signout: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 3H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M10 5l3 3-3 3M13 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  admin: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L14 5V8C14 11.3 11.3 14 8 15C4.7 14 2 11.3 2 8V5L8 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M5.5 8L7 9.5L10.5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const NAV_GROUPS = [
  {
    label: "GÉNÉRAL",
    items: [
      { id: "dashboard", icon: "dashboard", label: "Dashboard", key: "D" },
      { id: "trades",    icon: "trades",    label: "Trades",     key: "T" },
      { id: "stats",     icon: "stats",     label: "Statistiques", key: "S" },
    ],
  },
  {
    label: "ANALYSE",
    items: [
      { id: "risk",      icon: "risk",      label: "Risk Manager", key: "R" },
      { id: "journal",   icon: "journal",   label: "Journal",    key: "J" },
      { id: "review",    icon: "review",    label: "Review",     key: "W" },
      { id: "patterns",  icon: "patterns",  label: "Patterns AI", key: null },
      { id: "calendar",  icon: "calendar",  label: "Calendrier",  key: null },
    ],
  },
  {
    label: "AUTRES",
    items: [
      { id: "prop",      icon: "prop",      label: "Prop Firm",  key: "P" },
      { id: "tasks",     icon: "tasks",     label: "Tasks",      key: "K" },
      { id: "community", icon: "community", label: "Communauté", key: null },
    ],
  },
];

// Log-pip logo SVG
const LogoPip = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="7" fill={C.greenDim}/>
    <rect width="28" height="28" rx="7" stroke={C.greenBord} strokeWidth="1"/>
    <path d="M9 19V10L14 14.5L19 10V19" stroke={C.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="14" cy="14.5" r="1.5" fill={C.green}/>
  </svg>
);

export const Sidebar = ({ tab, setTab, user, plan, stats, isPro, onUpgrade, onSignOut, onAdmin, isAdmin, accounts, activeAccount, onSwitchAccount, collapsed, setCollapsed }) => {
  const [accOpen, setAccOpen] = useState(false);

  const navItem = (item) => {
    const active = tab === item.id;
    return (
      <button key={item.id} onClick={() => setTab(item.id)}
        title={collapsed ? item.label : ""}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          gap: collapsed ? 0 : 10,
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? "9px 0" : "8px 12px",
          borderRadius: 8, border: "none", cursor: "pointer",
          background: active ? C.greenDim : "transparent",
          color: active ? C.green : C.textDim,
          fontFamily: F.sans, fontSize: 13, fontWeight: active ? 500 : 400,
          transition: "all 0.15s", marginBottom: 1, outline: "none",
          position: "relative",
        }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = C.bgInner; e.currentTarget.style.color = C.text; }}}
        onMouseLeave={e => { e.currentTarget.style.background = active ? C.greenDim : "transparent"; e.currentTarget.style.color = active ? C.green : C.textDim; }}
      >
        {/* Active indicator */}
        {active && !collapsed && (
          <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 2.5, borderRadius: 2, background: C.green }} />
        )}
        <span style={{ color: active ? C.green : C.textDim, flexShrink: 0, width: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {Icons[item.icon]}
        </span>
        {!collapsed && <span>{item.label}</span>}
        {!collapsed && item.key && (
          <kbd style={{ marginLeft: "auto", fontSize: 9, color: C.textGhost, fontFamily: F.mono, background: C.bgInner, border: `1px solid ${C.border}`, borderRadius: 4, padding: "1px 5px" }}>{item.key}</kbd>
        )}
      </button>
    );
  };

  return (
    <div style={{
      width: collapsed ? (window.innerWidth < 768 ? 0 : 56) : 248, minHeight: "100dvh",
      background: C.bgCard, borderRight: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column",
      transition: "width 0.2s ease", flexShrink: 0,
      position: window.innerWidth < 768 ? "fixed" : "sticky", top: 0,
      zIndex: window.innerWidth < 768 ? 40 : "auto",
      overflowX: "hidden", overflowY: "auto",
      transform: (window.innerWidth < 768 && collapsed) ? "translateX(-100%)" : "none",
    }}>

      {/* ── Header — logo ── */}
      <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", padding: collapsed ? 0 : "0 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LogoPip />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.green, fontFamily: F.mono, letterSpacing: "0.12em", lineHeight: 1 }}>LOG-PIP</div>
              <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.1em", marginTop: 1 }}>TRADING JOURNAL</div>
            </div>
          </div>
        )}
        {collapsed && <LogoPip />}
        {!collapsed && (
          <button onClick={() => setCollapsed(c => !c)} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", padding: 6, borderRadius: 6, transition: "color 0.15s", display: "flex" }}
            onMouseEnter={e => e.currentTarget.style.color = C.textMid}
            onMouseLeave={e => e.currentTarget.style.color = C.textDim}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        )}
        {collapsed && (
          <button onClick={() => setCollapsed(c => !c)} style={{ position: "absolute", top: 18, right: -1, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: "0 6px 6px 0", color: C.textDim, cursor: "pointer", padding: "4px 3px", display: "flex" }}
            onMouseEnter={e => e.currentTarget.style.color = C.textMid}
            onMouseLeave={e => e.currentTarget.style.color = C.textDim}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        )}
      </div>

      {/* ── PnL strip ── */}
      {!collapsed && stats && (
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", marginBottom: 3 }}>PNL TOTAL</div>
          <div style={{ fontSize: 20, fontWeight: 800, fontFamily: F.display, color: Number(stats.totalPnL) >= 0 ? C.green : C.red, letterSpacing: "-0.02em" }}>
            {Number(stats.totalPnL) >= 0 ? "+" : ""}{stats.totalPnL}$
          </div>
        </div>
      )}

      {/* ── Account switcher ── */}
      {!collapsed && (
        <div style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}` }}>
          <button onClick={() => setAccOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, background: C.bgInner, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 10px", cursor: "pointer", transition: "border-color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHov}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: activeAccount?.color || C.green, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: C.textMid, fontFamily: F.sans, flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeAccount?.name || "Compte"}</span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: C.textDim, transform: accOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          {accOpen && (
            <div style={{ marginTop: 4, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
              {accounts.map(acc => (
                <div key={acc.id} onClick={() => { onSwitchAccount(acc.id); setAccOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bgInner}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: acc.color || C.green }} />
                  <span style={{ fontSize: 12, color: acc.id === activeAccount?.id ? C.green : C.textMid, fontFamily: F.sans }}>{acc.name}</span>
                  {acc.id === activeAccount?.id && <svg style={{ marginLeft: "auto", color: C.green }} width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Nav groups ── */}
      <div style={{ flex: 1, padding: collapsed ? "10px 6px" : "10px 10px", overflowY: "auto" }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} style={{ marginBottom: collapsed ? 0 : 6 }}>
            {!collapsed && (
              <div style={{ fontSize: 9, color: C.textGhost, fontFamily: F.mono, letterSpacing: "0.16em", padding: "6px 12px 4px", fontWeight: 600 }}>
                {group.label}
              </div>
            )}
            {collapsed && gi > 0 && <div style={{ height: 1, background: C.border, margin: "6px 4px" }} />}
            {group.items.map(navItem)}
          </div>
        ))}
      </div>

      {/* ── Bottom ── */}
      <div style={{ padding: collapsed ? "8px 6px" : "8px 10px", borderTop: `1px solid ${C.border}` }}>
        {/* Settings */}
        <button onClick={() => setTab("settings")} title={collapsed ? "Settings" : ""}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "9px 0" : "8px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: tab === "settings" ? C.greenDim : "transparent", color: tab === "settings" ? C.green : C.textDim, fontFamily: F.sans, fontSize: 13, transition: "all 0.15s", marginBottom: 2, outline: "none" }}
          onMouseEnter={e => { if (tab !== "settings") { e.currentTarget.style.background = C.bgInner; e.currentTarget.style.color = C.text; }}}
          onMouseLeave={e => { e.currentTarget.style.background = tab === "settings" ? C.greenDim : "transparent"; e.currentTarget.style.color = tab === "settings" ? C.green : C.textDim; }}>
          <span style={{ color: tab === "settings" ? C.green : C.textDim, width: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{Icons.settings}</span>
          {!collapsed && <span>Settings</span>}
        </button>

        {/* Upgrade card — only for free users, only when not collapsed */}
        {!isPro && !collapsed && (
          <div style={{
            margin: "0 0 10px", padding: "16px 14px",
            background: C.bgInner, border: `1px solid ${C.border}`,
            borderRadius: 12, position: "relative", overflow: "hidden",
          }}>
            {/* Subtle glow top */}
            <div style={{ position: "absolute", top: 0, left: "30%", right: "30%", height: 1, background: `linear-gradient(90deg, transparent, ${C.green}40, transparent)` }} />

            {/* 3D cube illustration — SVG */}
            <div style={{ textAlign: "center", marginBottom: 10 }}>
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                {/* Top face */}
                <path d="M26 8L44 17L26 26L8 17L26 8Z" fill={C.greenDim} stroke={C.greenBord} strokeWidth="1"/>
                {/* Left face */}
                <path d="M8 17V35L26 44V26L8 17Z" fill="rgba(11,43,38,0.8)" stroke={C.border} strokeWidth="1"/>
                {/* Right face */}
                <path d="M44 17V35L26 44V26L44 17Z" fill={C.bgCard} stroke={C.border} strokeWidth="1"/>
                {/* Top face highlight */}
                <path d="M26 10L42 18L26 24L10 18L26 10Z" fill={C.green} fillOpacity="0.08"/>
                {/* Edge lines */}
                <line x1="26" y1="8" x2="26" y2="26" stroke={C.greenBord} strokeWidth="0.8"/>
                {/* Glow dot */}
                <circle cx="26" cy="8" r="2" fill={C.green} fillOpacity="0.6"/>
              </svg>
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: F.sans, marginBottom: 5, textAlign: "center" }}>
              Passe en Pro !
            </div>
            <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.sans, lineHeight: 1.5, marginBottom: 12, textAlign: "center" }}>
              Trades illimités, AI Coach et stats avancées.
            </div>

            <button onClick={onUpgrade} style={{
              width: "100%", padding: "9px", borderRadius: 8,
              border: "none", background: C.green, color: C.bg,
              cursor: "pointer", fontSize: 12, fontWeight: 700,
              fontFamily: F.mono, letterSpacing: "0.06em",
              transition: "opacity 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              UPGRADE →
            </button>
          </div>
        )}

        {/* Pro badge — only when Pro */}
        {isPro && !collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 8, border: `1px solid ${C.greenBord}`, background: C.greenDim, marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: C.green, fontFamily: F.mono, fontWeight: 700, letterSpacing: "0.1em" }}>● PRO</span>
            <span style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, marginLeft: "auto" }}>Actif</span>
          </div>
        )}
        {collapsed && (
          <button onClick={isPro ? () => {} : onUpgrade} title={isPro ? "PRO" : "UPGRADE"}
            style={{ width: "100%", display: "flex", justifyContent: "center", padding: "8px 0", borderRadius: 8, border: "none", background: "transparent", cursor: isPro ? "default" : "pointer", marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: isPro ? C.green : C.orange, fontFamily: F.mono, fontWeight: 700 }}>{isPro ? "●" : "↑"}</span>
          </button>
        )}

        {/* Admin */}
        {isAdmin && (
          <button onClick={onAdmin} title={collapsed ? "Admin" : ""}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "8px 0" : "7px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: "transparent", outline: "none", marginBottom: 4 }}>
            <span style={{ color: C.orange, width: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{Icons.admin}</span>
            {!collapsed && <span style={{ fontSize: 12, color: C.orange, fontFamily: F.mono, letterSpacing: "0.08em" }}>Admin</span>}
          </button>
        )}

        {/* User */}
        {!collapsed && (
          <div style={{ padding: "8px 0 2px", borderTop: `1px solid ${C.border}`, marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.bgInner, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: C.green, fontFamily: F.mono, fontWeight: 700, flexShrink: 0 }}>
                {(user?.email?.[0] || "?").toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: C.textMid, fontFamily: F.sans, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                <div style={{ fontSize: 9, color: isPro ? C.green : C.textDim, fontFamily: F.mono, letterSpacing: "0.08em", marginTop: 1 }}>{isPro ? "Pro" : "Free"}</div>
              </div>
            </div>
            <button onClick={onSignOut} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.textDim, cursor: "pointer", fontSize: 12, fontFamily: F.sans, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.redBord; e.currentTarget.style.color = C.red; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textDim; }}>
              <span style={{ color: "inherit", display: "flex" }}>{Icons.signout}</span>
              <span>Déconnexion</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
