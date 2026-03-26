import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { CooldownModal, useCooldown } from "./components/CooldownModal";
import { useTrades } from "./hooks/useTrades";
import { useTasks } from "./hooks/useTasks";
import { useAuth } from "./hooks/useAuth";
import { useAccounts } from "./hooks/useAccounts";
import { useKeyboard } from "./hooks/useKeyboard";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { TradesTab } from "./components/TradesTab";
import { TasksTab } from "./components/TasksTab";
import { SettingsTab } from "./components/SettingsTab";
import { StatsTab } from "./components/StatsTab";
import { PropFirmTracker } from "./components/PropFirmTracker";
import { RiskManager } from "./components/RiskManager";
import { MarketJournal } from "./components/MarketJournal";
import { WeeklyReview } from "./components/WeeklyReview";
import { AuthScreen } from "./components/AuthScreen";
import { LandingPage } from "./components/LandingPage";
// Onboarding replaced by InteractiveOnboarding
import { UpgradeModal } from "./components/UpgradeModal";
import { AdminPanel } from "./components/AdminPanel";
import { KeyboardHelp } from "./components/KeyboardHelp";
import { PublicProfile } from "./components/PublicProfile";
import { NotificationBell } from "./components/Notifications";
import { CommandPalette } from "./components/CommandPalette";
import { SplitScreen } from "./components/SplitScreen";
import { TradingGroups } from "./components/TradingGroups";
import { PatternAnalysis } from "./components/PatternAnalysis";
import { TradingCalendar } from "./components/TradingCalendar";
import { QuickTrade } from "./components/QuickTrade";
import { DailyBrief } from "./components/DailyBrief";
import { getTheme } from "./lib/themes";
import { FocusMode } from "./components/FocusMode";
import { Changelog } from "./components/Changelog";
import { InteractiveOnboarding } from "./components/InteractiveOnboarding";
import { requestPushPermission, checkAndNotify } from "./lib/notifications";
import { PLANS, redirectToPortal } from "./lib/stripe";
import { C, F, glassBtn, glassBtnPrimary } from "./lib/design";

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());

const PAGE_TITLES = {
  dashboard: "Dashboard", trades: "Mes Trades", stats: "Statistiques",
  risk: "Risk Manager", journal: "Journal de Marché",
  review: "Review Hebdomadaire", prop: "Prop Firm Tracker",
  tasks: "Tasks", community: "Communauté", patterns: "Patterns AI", calendar: "Calendrier", settings: "Paramètres",
};

// ─── Dropdown menu item (like image reference) ───
const DDItem = ({ icon, label, onClick, kbd, chevron, danger, color }) => (
  <button onClick={onClick} style={{
    width: "100%", display: "flex", alignItems: "center", gap: 11,
    padding: "10px 16px", border: "none", cursor: "pointer",
    background: "transparent", transition: "background 0.1s, color 0.1s",
    outline: "none",
  }}
    onMouseEnter={e => { e.currentTarget.style.background = C.bgCard; if (!danger) e.currentTarget.querySelector(".dd-lbl").style.color = C.text; if (danger) { e.currentTarget.querySelector(".dd-lbl").style.color = C.red; e.currentTarget.querySelector(".dd-ico").style.color = C.red; }}}
    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.querySelector(".dd-lbl").style.color = color || (danger ? C.textMid : C.textMid); e.currentTarget.querySelector(".dd-ico").style.color = color || (danger ? C.textDim : C.textDim); }}
  >
    <span className="dd-ico" style={{ color: color || C.textDim, display: "flex", alignItems: "center", flexShrink: 0, transition: "color 0.1s" }}>{icon}</span>
    <span className="dd-lbl" style={{ fontSize: 13, fontWeight: 300, fontFamily: F.sans, color: color || C.textMid, flex: 1, textAlign: "left", transition: "color 0.1s" }}>{label}</span>
    {kbd && <kbd style={{ fontSize: 9, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 4, padding: "1px 6px", fontFamily: F.mono, color: C.textDim }}>{kbd}</kbd>}
    {chevron && <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ color: C.textDim }}><path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
  </button>
);

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [showUpgrade, setShowUpgrade] = useState(false);
  // Skip landing if user has already visited the app before
  const [showLanding, setShowLanding] = useState(() => !localStorage.getItem("tj_returning"));
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showKeyHelp, setShowKeyHelp] = useState(false);
  const [showCommand, setShowCommand] = useState(false);
  const [showFocus, setShowFocus] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [showAccountDD, setShowAccountDD] = useState(false);
  const [themeId, setThemeId] = useState(() => localStorage.getItem("tj_theme") || "midnight");
  const [themeVersion, setThemeVersion] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { user, plan, authLoading, signIn, signUp, signOut, signInWithGoogle, signInWithApple } = useAuth();
  const { accounts, activeAccount, addAccount, deleteAccount, switchAccount } = useAccounts();
  const { trades, loaded, orderedTrades, orderedTradesDesc, equity, stats, regime, mc, pairs, addTrade, saveTrade, deleteTrade, importTrades, EMPTY_FORM } = useTrades(user);
  const { tasks, addTask, toggleTask, deleteTask, clearDone, replaceTasks } = useTasks(user);

  useEffect(() => {
    const fn = () => { const m = window.innerWidth < 768; setIsMobile(m); if (m) setSidebarCollapsed(true); };
    fn();
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => { if (user) setShowLanding(false); }, [user]);

  useEffect(() => {
    const fn = () => {
      // Force full component tree re-render by updating key
      setThemeId(localStorage.getItem("tj_theme") || "midnight");
      setThemeVersion(v => v + 1);
    };
    window.addEventListener("tj-theme-change", fn);
    return () => window.removeEventListener("tj-theme-change", fn);
  }, []);

  useEffect(() => {
    if (user && loaded && trades.length === 0 && !localStorage.getItem("tj_onboarding_done")) {
      setShowOnboarding(true);
    }
  }, [user, loaded, trades.length]);

  useKeyboard({
    d: () => setTab("dashboard"), t: () => setTab("trades"),
    s: () => setTab("stats"), r: () => setTab("risk"),
    j: () => setTab("journal"), w: () => setTab("review"),
    p: () => setTab("prop"), k: () => setTab("tasks"),
    "?": () => setShowKeyHelp(true),
    "cmd+k": () => setShowCommand(true),
    "f": () => setShowFocus(true),
    "v": () => setShowSplit(true),
    escape: () => { setShowKeyHelp(false); setShowUpgrade(false); setShowAdmin(false); },
  });

  const handleSignUp = async (email, password) => {
    const result = await signUp(email, password);
    if (!result.error) {
      // Token may not exist yet right after signup (email not confirmed) — fire & forget
      supabase?.auth.getSession().then(({ data: { session } }) => {
        if (session?.access_token) {
          fetch("/api/welcome-email", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
          }).catch(() => {});
        }
      });
    }
    return result;
  };

  const handleImport = async (payload) => {
    const result = await importTrades(payload);
    if (!result.error && result.tasks) await replaceTasks(result.tasks);
    return result;
  };

  const handleAddTrade = async (form) => {
    if (cooldownActive) { setShowCooldown(true); return { error: null }; }
    if (trades.length >= PLANS[plan].maxTrades) { setShowUpgrade(true); return { error: null }; }
    return addTrade({ ...form, accountId: activeAccount.id });
  };

  const accountTrades = orderedTrades.filter(t => !t.accountId || t.accountId === activeAccount.id);
  const isPro = plan === "pro";
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
  const { active: cooldownActive, until: cooldownUntil, clear: clearCooldown } = useCooldown(orderedTrades);
  const [showCooldown, setShowCooldown] = useState(false);

  // Show cooldown modal when triggered
  useEffect(() => {
    if (cooldownActive) setShowCooldown(true);
  }, [cooldownActive]);

  const profileMatch = window.location.pathname.match(/^\/p\/([\w-]+)$/);
  if (profileMatch) return <PublicProfile username={profileMatch[1]} />;

  if (authLoading) return <Loader />;
  if (!user && showLanding) return <LandingPage onGetStarted={() => { localStorage.setItem("tj_returning", "1"); setShowLanding(false); }} />;
  if (!user) return <AuthScreen onSignIn={signIn} onSignUp={handleSignUp} onSignInWithGoogle={signInWithGoogle} onSignInWithApple={signInWithApple} />;
  if (!loaded) return <Loader />;
  if (showAdmin) return <AdminPanel user={user} onClose={() => setShowAdmin(false)} />;

  return (
    <div key={themeVersion} style={{ background: C.bg, minHeight: "100dvh", color: C.text, fontFamily: F.sans, display: "flex" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea, select { outline: none; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.borderHov}; }
        button { font-family: inherit; }
        html, body { transition: background 0.35s, color 0.35s; }

        @keyframes fadeIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse   { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes draw    { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }

        .fade-in  { animation: fadeIn  0.2s ease forwards; }
        .fade-up  { animation: fadeUp  0.25s ease forwards; }
        .slide-in { animation: slideIn 0.2s ease forwards; }
        .scale-in { animation: scaleIn 0.18s ease forwards; }
        .pulse    { animation: pulse  1.6s ease infinite; }

        .tab-content { animation: fadeIn 0.18s ease forwards; }

        button, a, input, textarea, select { transition: border-color 0.15s, background 0.15s, color 0.15s, opacity 0.15s, box-shadow 0.15s, transform 0.12s; }

        input:focus, textarea:focus, select:focus {
          border-color: ${C.green} !important;
          box-shadow: 0 0 0 3px ${C.greenDim};
        }

        .modal-backdrop { animation: fadeIn 0.15s ease forwards; }
        .modal-content { animation: scaleIn 0.18s ease forwards; }
      `}</style>

      {showOnboarding && <InteractiveOnboarding onDone={() => { localStorage.setItem("tj_onboarding_done", "1"); setShowOnboarding(false); }} />}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} reason={`Limite de ${PLANS.free.maxTrades} trades atteinte`} />}
      {showKeyHelp && <KeyboardHelp onClose={() => setShowKeyHelp(false)} />}
      {showCooldown && cooldownActive && <CooldownModal until={cooldownUntil} onClose={() => { setShowCooldown(false); }} />}
      <QuickTrade onAdd={handleAddTrade} pairs={pairs} />
      {showSplit && <SplitScreen onClose={() => setShowSplit(false)} />}
      {showFocus && <FocusMode trades={orderedTrades} stats={stats} onExit={() => setShowFocus(false)} />}
      {showCommand && <CommandPalette trades={orderedTrades} onClose={() => setShowCommand(false)} onNavigate={setTab} />}

      {/* Mobile overlay */}
      {isMobile && !sidebarCollapsed && (
        <div onClick={() => setSidebarCollapsed(true)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 39, backdropFilter: "blur(4px)" }} />
      )}

      {/* Sidebar */}
      <Sidebar
        tab={tab} setTab={setTab} user={user} plan={plan} stats={stats}
        isPro={isPro} onUpgrade={() => setShowUpgrade(true)}
        onSignOut={signOut} onAdmin={() => setShowAdmin(true)} isAdmin={isAdmin}
        accounts={accounts} activeAccount={activeAccount} onSwitchAccount={switchAccount}
        collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed}
      />

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowX: "hidden" }}>
        {/* Topbar — glass design */}
        <div style={{
          height: 56, borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: isMobile ? "0 12px" : "0 32px", flexShrink: 0, background: C.bg,
          position: "sticky", top: 0, zIndex: 30,
          transition: "background 0.35s, border-color 0.35s",
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 300, letterSpacing: "-0.01em", color: C.text }}>
              {PAGE_TITLES[tab]}
            </div>
            <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, marginTop: 1 }}>
              {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })} — semaine {Math.ceil(new Date().getDate() / 7 + (new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() === 0 ? 0 : 0))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <NotificationBell stats={stats} trades={orderedTrades} goals={{}} />

            {/* ─── Avatar + Account Dropdown ─── */}
            <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowAccountDD(o => !o)} style={{
                ...glassBtn(), width: 36, height: 36, padding: 0, borderRadius: "50%",
                fontSize: 13, fontWeight: 500, fontFamily: F.mono, color: C.text,
                background: showAccountDD ? C.glassHoverBg : C.glassBg,
                borderColor: showAccountDD ? C.glassHoverBd : C.glassBorder,
              }}
                onMouseEnter={e => { e.currentTarget.style.background = C.glassHoverBg; e.currentTarget.style.borderColor = C.glassHoverBd; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { if (!showAccountDD) { e.currentTarget.style.background = C.glassBg; e.currentTarget.style.borderColor = C.glassBorder; } e.currentTarget.style.transform = "none"; }}
              >
                {(user?.email?.[0] || "?").toUpperCase()}
              </button>

              {/* Dropdown panel */}
              {showAccountDD && (
                <>
                  {/* Backdrop */}
                  <div onClick={() => setShowAccountDD(false)} style={{ position: "fixed", inset: 0, zIndex: 299 }} />

                  <div style={{
                    position: "absolute", top: "calc(100% + 10px)", right: 0, width: 252,
                    background: C.bgInner, border: `1px solid ${C.borderHov}`,
                    borderRadius: 16, overflow: "hidden", zIndex: 300,
                    boxShadow: `0 20px 60px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 ${C.glassTop}`,
                    animation: "scaleIn 0.14s ease forwards",
                    transformOrigin: "top right",
                  }}>
                    {/* User header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 16px 14px", borderBottom: `1px solid ${C.border}` }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                        background: C.bgCard, border: `1px solid ${C.borderHov}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: F.mono, fontSize: 14, fontWeight: 500, color: C.text,
                      }}>
                        {(user?.email?.[0] || "?").toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 400, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {user?.email?.split("@")[0] || "User"}
                        </div>
                        <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, marginTop: 2 }}>
                          {user?.email}
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div style={{ padding: "6px 0" }}>
                      {/* Profile */}
                      <DDItem icon={<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.2"/><path d="M2.5 14c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>}
                        label="Profil" onClick={() => { setShowAccountDD(false); }} />

                      {/* Settings */}
                      <DDItem icon={<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M8 1.5V3.5M8 12.5V14.5M14.5 8H12.5M3.5 8H1.5M12.5 3.5L11 5M5 11L3.5 12.5M12.5 12.5L11 11M5 5L3.5 3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>}
                        label="Paramètres" onClick={() => { setShowAccountDD(false); setTab("settings"); }} />

                      {/* Theme — with chevron */}
                      <DDItem icon={<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M12 8.5A4.5 4.5 0 0 1 6.5 3a5 5 0 1 0 5.5 5.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>}
                        label="Thème" chevron onClick={() => { setShowAccountDD(false); setTab("settings"); }} />
                    </div>

                    <div style={{ height: 1, background: C.border, margin: "0" }} />

                    <div style={{ padding: "6px 0" }}>
                      {/* Upgrade */}
                      <DDItem icon={<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 7l3-5 3 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 12h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>}
                        label={isPro ? "Pro actif" : "Upgrade"} color={isPro ? C.green : C.orange}
                        onClick={() => { setShowAccountDD(false); if (!isPro) setShowUpgrade(true); }} />

                      {/* Split Screen */}
                      <DDItem icon={<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/><line x1="8" y1="2" x2="8" y2="14" stroke="currentColor" strokeWidth="1"/></svg>}
                        label="Split Screen" kbd="V"
                        onClick={() => { setShowAccountDD(false); setShowSplit(true); }} />

                      {/* Focus Mode */}
                      <DDItem icon={<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="8" r="2" fill="currentColor" opacity=".6"/></svg>}
                        label="Mode Focus" kbd="F"
                        onClick={() => { setShowAccountDD(false); setShowFocus(true); }} />
                    </div>

                    <div style={{ height: 1, background: C.border, margin: "0" }} />

                    <div style={{ padding: "6px 0" }}>
                      {/* Search */}
                      <DDItem icon={<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2"/><line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>}
                        label="Recherche" kbd="⌘K"
                        onClick={() => { setShowAccountDD(false); setShowCommand(true); }} />

                      {/* Keyboard shortcuts */}
                      <DDItem icon={<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="4" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.1"/><line x1="4" y1="7" x2="6" y2="7" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><line x1="8" y1="7" x2="10" y2="7" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/><line x1="5" y1="10" x2="11" y2="10" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>}
                        label="Raccourcis clavier" kbd="?"
                        onClick={() => { setShowAccountDD(false); setShowKeyHelp(true); }} />

                      {/* Help center */}
                      <DDItem icon={<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" opacity=".7"/><path d="M6 6.5a2 2 0 0 1 3.5 1.3c0 1.2-1.5 1.4-1.5 2.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/><circle cx="8" cy="12" r=".6" fill="currentColor"/></svg>}
                        label="Centre d'aide"
                        onClick={() => { setShowAccountDD(false); }} />
                    </div>

                    {/* Admin — only if admin */}
                    {isAdmin && (<>
                      <div style={{ height: 1, background: C.border, margin: "0" }} />
                      <div style={{ padding: "6px 0" }}>
                        <DDItem icon={<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 2L14 5V8C14 11.3 11.3 14 8 15C4.7 14 2 11.3 2 8V5L8 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M5.5 8L7 9.5L10.5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          label="Admin Panel" color={C.orange}
                          onClick={() => { setShowAccountDD(false); setShowAdmin(true); }} />
                      </div>
                    </>)}

                    <div style={{ height: 1, background: C.border, margin: "0" }} />

                    <div style={{ padding: "6px 0 8px" }}>
                      {/* Log out */}
                      <DDItem icon={<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M6 3H3.5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M10 5l3 3-3 3M13 8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        label="Déconnexion" danger
                        onClick={() => { setShowAccountDD(false); signOut(); }} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 16px 40px" : "20px 28px 48px" }}>
          <div key={tab} className="tab-content">
          {tab === "dashboard" && <Dashboard stats={stats} equity={equity} regime={regime} mc={mc} orderedTrades={accountTrades} isPro={isPro} onUpgrade={() => setShowUpgrade(true)} />}
          {tab === "trades" && <TradesTab trades={[...accountTrades].reverse()} pairs={pairs} onAdd={handleAddTrade} onSave={saveTrade} onDelete={deleteTrade} emptyForm={EMPTY_FORM} isPro={isPro} />}
          {tab === "stats" && <StatsTab trades={accountTrades} plan={plan} onUpgrade={() => setShowUpgrade(true)} />}
          {tab === "risk" && <RiskManager trades={accountTrades} />}
          {tab === "journal" && <MarketJournal />}
          {tab === "review" && <WeeklyReview trades={accountTrades} isPro={isPro} onUpgrade={() => setShowUpgrade(true)} />}
          {tab === "prop" && <PropFirmTracker trades={orderedTrades} />}
          {tab === "tasks" && <TasksTab tasks={tasks} onAdd={addTask} onToggle={toggleTask} onDelete={deleteTask} onClearDone={clearDone} />}
          {tab === "calendar" && <TradingCalendar trades={accountTrades} />}
          {tab === "patterns" && <PatternAnalysis isPro={isPro} onUpgrade={() => setShowUpgrade(true)} />}
          {tab === "community" && <TradingGroups userId={user.id} trades={accountTrades} stats={stats} equity={equity} />}
          {tab === "settings" && <SettingsTab trades={trades} tasks={tasks} onImport={handleImport} onReset={async () => { await importTrades({ trades: [], tasks: [] }); await replaceTasks([]); }} isPro={isPro} onUpgrade={() => setShowUpgrade(true)} onManagePlan={redirectToPortal} />}
          </div>
        </div>
      </div>
    </div>
  );
}

const Loader = () => (
  <div style={{ background: C.bg, minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeLoader { from { opacity: 0; } to { opacity: 1; } }
    `}</style>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, animation: "fadeLoader 0.3s ease forwards" }}>
      <div style={{ width: 36, height: 36, border: `2px solid ${C.border}`, borderTop: `2px solid ${C.text}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.18em" }}>LOG-PIP</div>
    </div>
  </div>
);
