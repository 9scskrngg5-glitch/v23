import { useState } from "react";
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
import { REGIME_META } from "../lib/trading";
import { fetchAIInsight } from "../lib/ai";
import { DailyBrief } from "./DailyBrief";
import { C, F, card, label } from "../lib/design";

const SectionTitle = ({ children }) => (
  <div style={{ ...label(), marginBottom: 16 }}>{children}</div>
);

const Card = ({ children, mb = 16 }) => (
  <div style={{ ...card(), marginBottom: mb }}>{children}</div>
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

  return (
    <div className="fade-in">
      <DailyBrief trades={orderedTrades} stats={stats} />
      <DrawdownAlert trades={orderedTrades} />

      {/* Stats grid */}
      {stats ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginBottom: 16 }}>
          <StatCard label="Win Rate" value={`${stats.winRate}%`} color={Number(stats.winRate) >= 50 ? C.green : C.red} sub={`${stats.total} trades fermés`} />
          <StatCard label="PnL Total" value={`${Number(stats.totalPnL) >= 0 ? "+" : ""}${stats.totalPnL}$`} color={Number(stats.totalPnL) >= 0 ? C.green : C.red} />
          <StatCard label="Expectancy" value={`${Number(stats.expectancy) >= 0 ? "+" : ""}${stats.expectancy}$`} color={Number(stats.expectancy) >= 0 ? C.green : C.red} sub="par trade" />
          <StatCard label="Profit Factor" value={stats.profitFactor} color={Number(stats.profitFactor) >= 1.5 ? C.green : Number(stats.profitFactor) >= 1 ? C.orange : C.red} sub="≥ 1.5 = bon" />
          <StatCard label="Max Drawdown" value={`-${stats.maxDD}$`} color={C.red} sub="pic → creux" />
          <StatCard label="Win Streak" value={`${stats.streak}W`} color={C.green} sub={`Avg win +${stats.avgWin}$`} />
          <StatCard label="Avg Loss" value={`-${stats.avgLoss}$`} color={C.red} sub={`Avg win +${stats.avgWin}$`} />
          <StatCard label="Régime" value={regime ? REGIME_META[regime]?.label : "—"} color={regime ? REGIME_META[regime]?.color : C.textDim} sub={regime ? REGIME_META[regime]?.hint : "10 trades min"} />
          <StatCard label="Monte Carlo" value={mc ? `Ruin ${mc.ruinPct}%` : "—"} color={mc ? Number(mc.ruinPct) <= 10 ? C.green : Number(mc.ruinPct) <= 25 ? C.orange : C.red : C.textDim} sub={mc ? `DD moy. ${mc.avgDD}$` : "400 simulations"} />
          <StatCard label="Best Trade" value={`+${stats.bestTrade}$`} color={C.green} sub={`Pire: ${stats.worstTrade}$`} />
        </div>
      ) : (
        <div style={{ ...card(), marginBottom: 16, textAlign: "center", color: C.textGhost, fontSize: 13, fontFamily: F.mono }}>
          Ajoute tes premiers trades pour voir tes statistiques
        </div>
      )}

      {/* Streak */}
      <div style={{ marginBottom: 14 }}><JournalingStreak trades={orderedTrades} /></div>

      {/* Goals + Comparison side by side on large screens */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 0 }}>
        <GoalsPanel stats={stats} trades={orderedTrades} />
        <ComparisonPanel trades={orderedTrades} />
      </div>

      {/* AI Prediction */}
      <AIPrediction trades={orderedTrades} isPro={isPro} onUpgrade={onUpgrade} />

      {/* Equity curve */}
      <Card>
        <SectionTitle>Courbe d'équité</SectionTitle>
        {equity.length > 1 ? (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={equity}>
              <defs>
                <linearGradient id="eqG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.green} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.bgInner} />
              <XAxis dataKey="i" tick={{ fontSize: 10, fill: C.textDim, fontFamily: F.mono }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.textDim }} axisLine={false} tickLine={false} width={50} />
              <Tooltip contentStyle={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: F.mono, fontSize: 11 }} />
              <Area type="monotone" dataKey="eq" stroke={C.green} strokeWidth={2} fill="url(#eqG)" dot={false} activeDot={{ r: 4, fill: C.green, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: C.textGhost, fontSize: 12, fontFamily: F.mono }}>
            Pas assez de données
          </div>
        )}
      </Card>

      {/* Session chart */}
      <Card>
        <SectionTitle>PnL par session</SectionTitle>
        <SessionChart trades={orderedTrades} />
      </Card>

      {/* Discipline + Badges */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 16 }}>
        <DisciplineScore trades={orderedTrades} />
        <BadgesPanel trades={orderedTrades} stats={stats} />
      </div>

      {/* Benchmark */}
      <BenchmarkChart trades={orderedTrades} />

      {/* Kelly */}
      <div style={{ marginBottom: 16 }}><KellyCalculator trades={orderedTrades} /></div>

      {/* AI Coach */}
      <Card mb={0}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <SectionTitle>AI Coach</SectionTitle>
            <div style={{ fontSize: 12, color: C.textDim, fontFamily: F.mono, marginTop: -10 }}>
              {isPro ? `Analyse sur ${closedCount} trades` : "Fonctionnalité Pro"}
            </div>
          </div>
          <button onClick={runAI} disabled={aiLoading || closedCount < 3} style={{
            padding: "8px 18px", borderRadius: 8, cursor: closedCount < 3 ? "not-allowed" : "pointer",
            border: `1px solid ${!isPro ? C.orangeBord : C.greenBord}`,
            background: !isPro ? C.orangeDim : aiLoading ? "transparent" : C.greenDim,
            color: !isPro ? C.orange : aiLoading ? C.textDim : C.green,
            fontSize: 11, fontFamily: F.mono, letterSpacing: "0.06em", transition: "all 0.2s",
          }}>
            {!isPro ? "UPGRADE" : aiLoading ? "ANALYSE..." : "ANALYSER →"}
          </button>
        </div>
        {aiError && <div style={{ background: C.redDim, border: `1px solid ${C.redBord}`, padding: "10px 14px", borderRadius: 9, color: C.red, fontSize: 13, fontFamily: F.mono }}>{aiError}</div>}
        {aiLoading && <div className="pulse" style={{ color: C.textDim, fontSize: 13, fontFamily: F.mono }}>Analyse en cours...</div>}
        {aiInsight && !aiLoading && (
          <div style={{ fontSize: 14, color: C.textMid, lineHeight: 1.8, borderLeft: `2px solid ${C.greenBord}`, paddingLeft: 16, whiteSpace: "pre-wrap" }}>
            {aiInsight}
          </div>
        )}
        {!aiInsight && !aiLoading && !aiError && (
          <div style={{ color: C.textGhost, fontSize: 12, fontFamily: F.mono }}>
            {!isPro ? "Upgrade vers Pro pour activer l'AI Coach." : closedCount < 3 ? "Ajoute au moins 3 trades fermés." : "Clique sur Analyser pour un coaching personnalisé."}
          </div>
        )}
      </Card>
    </div>
  );
};
