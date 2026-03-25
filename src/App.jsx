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
import { C, F } from "./lib/design";

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());

const PAGE_TITLES = {
  dashboard: "Dashboard", trades: "Mes Trades", stats: "Statistiques",
  risk: "Risk Manager", journal: "Journal de Marché",
  review: "Review Hebdomadaire", prop: "Prop Firm Tracker",
  tasks: "Tasks", community: "Communauté", patterns: "Patterns AI", calendar: "Calendrier", settings: "Paramètres",
};

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
  const [themeId, setThemeId] = useState(() => localStorage.getItem("tj_theme") || "forest");
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
      setThemeId(localStorage.getItem("tj_theme") || "forest");
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
    <div key={themeVersion} style={{ background: ${C.bg}, minHeight: "100dvh", color: ${C.text}, fontFamily: F.sans, display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        input, textarea, select { outline: none; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.borderHov}; }
        button { font-family: inherit; }

        @keyframes fadeIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse   { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }
        @keyframes spin    { to { transform: rotate(360deg); } }

        .fade-in  { animation: fadeIn  0.2s ease forwards; }
        .fade-up  { animation: fadeUp  0.25s ease forwards; }
        .slide-in { animation: slideIn 0.2s ease forwards; }
        .scale-in { animation: scaleIn 0.18s ease forwards; }
        .pulse    { animation: pulse  1.6s ease infinite; }

        .tab-content { animation: fadeIn 0.18s ease forwards; }

        /* Smooth interactive transitions */
        button, a, input, textarea, select { transition: border-color 0.15s, background 0.15s, color 0.15s, opacity 0.15s, box-shadow 0.15s; }

        /* Input focus glow */
        input:focus, textarea:focus, select:focus {
          border-color: ${C.green} !important;
          box-shadow: 0 0 0 3px ${C.greenDim};
        }

        /* Better modal backdrop */
        .modal-backdrop {
          animation: fadeIn 0.15s ease forwards;
        }
        .modal-content {
          animation: scaleIn 0.18s ease forwards;
        }
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
        {/* Topbar */}
        <div style={{
          height: 56, borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: isMobile ? "0 12px" : "0 28px", flexShrink: 0, background: C.bg,
          position: "sticky", top: 0, zIndex: 30,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: "'Syne', sans-serif", margin: 0, letterSpacing: "-0.01em" }}>
              {PAGE_TITLES[tab]}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <NotificationBell stats={stats} trades={orderedTrades} goals={{}} />
            <button onClick={() => setShowCommand(true)} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 7, color: C.textDim, cursor: "pointer", fontSize: 11, fontFamily: F.mono, padding: "5px 12px", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHov; e.currentTarget.style.color = C.textMid; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textDim; }}
            >
              <span>⌕</span>
              <span>Recherche</span>
              <kbd style={{ fontSize: 9, background: C.bgInner, border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 5px" }}>⌘K</kbd>
            </button>
            <button onClick={() => setShowSplit(true)} title="Split Screen (V)" style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textDim, cursor: "pointer", fontSize: 10, fontFamily: F.mono, padding: "4px 9px", letterSpacing: "0.08em", transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = C.purple}
              onMouseLeave={e => e.currentTarget.style.color = C.textDim}
            >SPLIT</button>
            <button onClick={() => setShowFocus(true)} title="Mode Focus (F)" style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textDim, cursor: "pointer", fontSize: 10, fontFamily: F.mono, padding: "4px 9px", letterSpacing: "0.08em", transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = C.green}
              onMouseLeave={e => e.currentTarget.style.color = C.textDim}
            >FOCUS</button>
            <button onClick={() => setShowKeyHelp(true)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textDim, cursor: "pointer", fontSize: 11, fontFamily: F.mono, padding: "4px 9px", transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = C.textMid}
              onMouseLeave={e => e.currentTarget.style.color = C.textDim}
            >?</button>
            {!isPro && (
              <button onClick={() => setShowUpgrade(true)} style={{ padding: "6px 14px", borderRadius: 7, border: `1px solid ${C.orangeBord}`, background: C.orangeDim, color: C.orange, cursor: "pointer", fontSize: 11, fontFamily: F.mono, letterSpacing: "0.08em", fontWeight: 600 }}>
                UPGRADE
              </button>
            )}
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
      @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400&display=swap');
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeLoader { from { opacity: 0; } to { opacity: 1; } }
    `}</style>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, animation: "fadeLoader 0.3s ease forwards" }}>
      <div style={{ width: 36, height: 36, border: `2px solid ${C.border}`, borderTop: `2px solid ${C.green}`, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <div style={{ fontSize: 10, color: C.textDim, fontFamily: "'DM Mono', monospace", letterSpacing: "0.18em" }}>CHARGEMENT</div>
    </div>
  </div>
);
