import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { StatCard } from "./StatCard";
import { SessionChart } from "./SessionChart";
import { DrawdownAlert } from "./DrawdownAlert";
import { GoalsPanel } from "./GoalsPanel";
import { ComparisonPanel } from "./ComparisonPanel";
import { DisciplineScore } from "./DisciplineScore";
import { BadgesPanel } from "./BadgesPanel";
import { AIPrediction } from "./AIPrediction";
import { BenchmarkChart } from "./BenchmarkChart";
import { JournalingStreak } from "./JournalingStreak";
import { KellyCalculator } from "./KellyCalculator";
import { SetupStats } from "./SetupStats";
import { DisciplineCorrelation } from "./DisciplineCorrelation";
import { REGIME_META } from "../lib/trading";
import { computeDisciplineScore } from "../lib/discipline";
import { fetchAIInsight } from "../lib/ai";
import { DailyBrief } from "./DailyBrief";
import { C, F, card, label } from "../lib/design";

const SectionTitle = ({ children }) => (
  <div style={{ ...label(), marginBottom: 16 }}>{children}</div>
);

const Card = ({ children, mb = 16 }) => (
  <div style={{ ...card(), marginBottom: mb }}>{children}</div>
);

const HeroCard = ({ label: lbl, value, sub, color, accent }) => (
  <div style={{
    background: C.bgCard, border: `1px solid ${accent ? color + "30" : ${C.borde}r}`,
    borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 6,
    transition: "transform 0.15s, box-shadow 0.15s", cursor: "default", flex: 1, minWidth: 0,
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.25)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
  >
    <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.16em", textTransform: "uppercase" }}>{lbl}</div>
    <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "\'Syne\', sans-serif", color: color || C.text, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono }}>{sub}</div>}
  </div>
);

export const Dashboard = ({ stats, equity, regime, mc, orderedTrades, isPro, onUpgrade, trades }) => {
  const [aiInsight, setAiInsight] = useState("");
  const [aiError, setAiError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const runAI = async () => {
    if (!isPro) { onUpgrade(); return; }
    setAiLoading(true); setAiError(""); setAiInsight("");
    try { setAiInsight(await fetchAIInsight(orderedTrades)); }
    catch (e) { setAiError(e?.message || "Erreur"); }
    finally { setAiLoading(false); }
  };

  const closedCount = orderedTrades.filter(t => t.result !== "").length;

  const todayPnL = useMemo(() => {
    const today = new Date().toDateString();
    return orderedTrades
      .filter(t => t.result !== "" && new Date(t.createdAt ?? 0).toDateString() === today)
      .reduce((a, t) => a + Number(t.result), 0);
  }, [orderedTrades]);

  const hasTodayTrades = useMemo(() => {
    const today = new Date().toDateString();
    return orderedTrades.some(t => new Date(t.createdAt ?? 0).toDateString() === today);
  }, [orderedTrades]);

  const discipline = useMemo(() => computeDisciplineScore(orderedTrades), [orderedTrades]);

  const currentDD = useMemo(() => {
    const closed = orderedTrades.filter(t => t.result !== "");
    let eq = 0, peak = 0, dd = 0;
    closed.forEach(t => { eq += Number(t.result); if (eq > peak) peak = eq; dd = peak - eq; });
    return dd;
  }, [orderedTrades]);

  return (
    <div className="fade-in">
      <DailyBrief trades={orderedTrades} stats={stats} />
      <DrawdownAlert trades={orderedTrades} />

      {stats ? (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            <HeroCard label="PnL aujourd'hui" value={`${todayPnL >= 0 ? "+" : ""}${todayPnL.toFixed(0)}$`} color={hasTodayTrades ? (todayPnL >= 0 ? ${C.green} : ${C.red}) : ${C.textDi}m} sub={hasTodayTrades ? undefined : "Aucun trade aujourd'hui"} accent={hasTodayTrades && todayPnL > 0} />
            <HeroCard label="Expectancy" value={`${Number(stats.expectancy) >= 0 ? "+" : ""}${stats.expectancy}$`} color={Number(stats.expectancy) >= 0 ? ${C.green} : ${C.re}d} sub="par trade en moy." accent={Number(stats.expectancy) > 0} />
            <HeroCard label="Discipline" value={discipline ? `${discipline.total}/100` : "—"} color={discipline ? discipline.color : ${C.textDi}m} sub={discipline ? `Grade ${discipline.grade}` : "3 trades min."} accent={discipline && discipline.total >= 75} />
            <HeroCard label="Drawdown actuel" value={`-${currentDD.toFixed(0)}$`} color={currentDD > 0 ? (currentDD > 500 ? ${C.red} : ${C.orange}) : ${C.gree}n} sub={`Max: -${stats.maxDD}$`} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 8, marginBottom: 16 }}>
            <StatCard label="Win Rate" value={`${stats.winRate}%`} color={Number(stats.winRate) >= 50 ? ${C.green} : ${C.re}d} sub={`${stats.total} trades`} />
            <StatCard label="PnL Total" value={`${Number(stats.totalPnL) >= 0 ? "+" : ""}${stats.totalPnL}$`} color={Number(stats.totalPnL) >= 0 ? ${C.green} : ${C.re}d} />
            <StatCard label="Profit Factor" value={stats.profitFactor} color={Number(stats.profitFactor) >= 1.5 ? C.green : Number(stats.profitFactor) >= 1 ? C.orange : C.red} sub="≥ 1.5 = bon" />
            <StatCard label="Avg Win" value={`+${stats.avgWin}$`} color={${C.gree}n} sub={`Avg loss -${stats.avgLoss}$`} />
            <StatCard label="Win Streak" value={`${stats.streak}W`} color={${C.gree}n} sub="consécutifs" />
            <StatCard label="Régime" value={regime ? REGIME_META[regime]?.label : "—"} color={regime ? REGIME_META[regime]?.color : C.textDim} sub={regime ? REGIME_META[regime]?.hint : "10 trades min"} />
            <StatCard label="Monte Carlo" value={mc ? `Ruin ${mc.ruinPct}%` : "—"} color={mc ? Number(mc.ruinPct) <= 10 ? ${C.green} : Number(mc.ruinPct) <= 25 ? ${C.orange} : ${C.red} : ${C.textDi}m} sub={mc ? `DD moy. ${mc.avgDD}$` : "400 sims"} />
            <StatCard label="Best Trade" value={`+${stats.bestTrade}$`} color={${C.gree}n} sub={`Pire: ${stats.worstTrade}$`} />
          </div>
        </>
      ) : (
        <div style={{ ...card(), marginBottom: 16, textAlign: "center", color: C.textGhost, fontSize: 13, fontFamily: F.mono, padding: "32px 20px" }}>
          Ajoute tes premiers trades pour voir tes statistiques
        </div>
      )}

      <div style={{ marginBottom: 14 }}><JournalingStreak trades={orderedTrades} /></div>

      <SetupStats trades={orderedTrades} />

      {/* Equity curve — full width, edge to edge */}
      <div style={{ marginBottom: 16, background: C.bgCard, border: `1px solid C.border`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "16px 22px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ ...label() }}>Courbe d'équité</div>
          {stats && equity.length > 1 && (
            <div style={{ fontSize: 12, fontFamily: F.mono, color: Number(stats.totalPnL) >= 0 ? C.green : C.red, fontWeight: 600 }}>
              {Number(stats.totalPnL) >= 0 ? "+" : ""}{stats.totalPnL}$
            </div>
          )}
        </div>
        {equity.length > 1 ? (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={equity} margin={{ top: 16, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="eqG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.green} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} strokeOpacity={0.4} vertical={false} />
              <XAxis dataKey="i" tick={{ fontSize: 10, fill: C.textDim, fontFamily: F.mono }} axisLine={false} tickLine={false} tickMargin={8} />
              <YAxis tick={{ fontSize: 10, fill: C.textDim }} axisLine={false} tickLine={false} width={52} />
              <Tooltip contentStyle={{ background: C.bgCard, border: `1px solid C.border`, borderRadius: 8, fontFamily: F.mono, fontSize: 11 }} cursor={{ stroke: C.borderHov, strokeWidth: 1 }} />
              <Area type="monotone" dataKey="eq" stroke={C.green} strokeWidth={2.5} fill="url(#eqG)" dot={false} activeDot={{ r: 5, fill: C.green, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", color: C.textGhost, fontSize: 12, fontFamily: F.mono }}>Pas assez de données</div>
        )}
      </div>

      <DisciplineCorrelation trades={orderedTrades} />

      <Card>
        <SectionTitle>PnL par session</SectionTitle>
        <SessionChart trades={orderedTrades} />
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 16 }}>
        <GoalsPanel stats={stats} trades={orderedTrades} />
        <ComparisonPanel trades={orderedTrades} />
      </div>

      <AIPrediction trades={orderedTrades} isPro={isPro} onUpgrade={onUpgrade} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 16 }}>
        <DisciplineScore trades={orderedTrades} />
        <BadgesPanel trades={orderedTrades} stats={stats} />
      </div>

      <BenchmarkChart trades={orderedTrades} />
      <div style={{ marginBottom: 16 }}><KellyCalculator trades={orderedTrades} /></div>

      <Card mb={0}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <SectionTitle>AI Coach</SectionTitle>
            <div style={{ fontSize: 12, color: C.textDim, fontFamily: F.mono, marginTop: -10 }}>{isPro ? `Analyse sur ${closedCount} trades` : "Fonctionnalité Pro"}</div>
          </div>
          <button onClick={runAI} disabled={aiLoading || closedCount < 3} style={{ padding: "8px 18px", borderRadius: 8, cursor: closedCount < 3 ? "not-allowed" : "pointer", border: `1px solid ${!isPro ? ${C.orangeBord} : ${C.greenBor}d}`, background: !isPro ? C.orangeDim : aiLoading ? "transparent" : C.greenDim, color: !isPro ? C.orange : aiLoading ? C.textDim : C.green, fontSize: 11, fontFamily: F.mono, letterSpacing: "0.06em", transition: "all 0.2s" }}>
            {!isPro ? "UPGRADE" : aiLoading ? "ANALYSE..." : "ANALYSER →"}
          </button>
        </div>
        {aiError && <div style={{ background: C.redDim, border: `1px solid ${C.redBord}`, padding: "10px 14px", borderRadius: 9, color: C.red, fontSize: 13, fontFamily: F.mono }}>{aiError}</div>}
        {aiLoading && <div className="pulse" style={{ color: C.textDim, fontSize: 13, fontFamily: F.mono }}>Analyse en cours...</div>}
        {aiInsight && !aiLoading && <div style={{ fontSize: 14, color: C.textMid, lineHeight: 1.8, borderLeft: `2px solid ${C.greenBord}`, paddingLeft: 16, whiteSpace: "pre-wrap" }}>{aiInsight}</div>}
        {!aiInsight && !aiLoading && !aiError && <div style={{ color: C.textGhost, fontSize: 12, fontFamily: F.mono }}>{!isPro ? "Upgrade vers Pro pour activer l'AI Coach." : closedCount < 3 ? "Ajoute au moins 3 trades fermés." : "Clique sur Analyser pour un coaching personnalisé."}</div>}
      </Card>
    </div>
  );
};
