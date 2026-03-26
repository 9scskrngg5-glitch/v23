import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
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
import { C, F, card, label as labelStyle, glassBtnChip } from "../lib/design";

const SectionTitle = ({ children }) => (
  <div style={{ ...labelStyle(), marginBottom: 16 }}>{children}</div>
);

const Card = ({ children, mb = 16 }) => (
  <div style={{ ...card(), marginBottom: mb }}>{children}</div>
);

const GlassCard = ({ title, right, children, style: extra = {} }) => (
  <div style={{
    background: C.bgCard, border: `1px solid ${C.border}`,
    borderRadius: 14, overflow: "hidden", position: "relative",
    transition: "border-color 0.35s", ...extra,
  }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "40%", background: `linear-gradient(180deg, ${C.cardShine || "rgba(255,255,255,0.04)"}, transparent)`, pointerEvents: "none", borderRadius: "14px 14px 0 0" }} />
    {(title || right) && (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 0", position: "relative" }}>
        {title && <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: "0.14em", color: C.textDim, textTransform: "uppercase" }}>{title}</div>}
        {right && <div>{right}</div>}
      </div>
    )}
    <div style={{ padding: "10px 20px 18px", position: "relative" }}>{children}</div>
  </div>
);

// ─── KPI Hero Cards ───
const HeroCard = ({ label: lbl, value, sub, color, accent }) => (
  <div style={{
    padding: "20px 0", borderTop: `1px solid ${C.border}`, paddingRight: 22,
    flex: 1, minWidth: 0, transition: "border-color 0.35s",
  }}>
    <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: "0.14em", color: C.textDim, textTransform: "uppercase", marginBottom: 9 }}>{lbl}</div>
    <div style={{ fontFamily: F.mono, fontSize: 24, fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1, color: color || C.text }}>{value}</div>
    {sub && <div style={{ fontFamily: F.mono, fontSize: 10, color: C.textDim, marginTop: 6 }}>{sub}</div>}
  </div>
);

// ─── Streak display ───
const StreakRow = ({ trades }) => {
  const recent = trades.filter(t => t.result !== "").slice(-15);
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {recent.map((t, i) => {
        const w = Number(t.result) >= 0;
        return (
          <div key={i} style={{
            width: 18, height: 18, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: F.mono, fontSize: 7, transition: "transform 0.1s", cursor: "default",
            background: w ? C.greenDim : C.redDim, color: w ? C.green : C.red,
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            title={`${w ? "+" : ""}${Number(t.result).toFixed(0)}$`}
          >{w ? "W" : "L"}</div>
        );
      })}
    </div>
  );
};

// ─── P&L Heatmap ───
const PnLHeatmap = ({ trades }) => {
  const days = ["L", "M", "M", "J", "V", "S", "D"];
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday start
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Compute PnL per day
  const pnlByDay = {};
  trades.filter(t => t.result !== "").forEach(t => {
    const d = new Date(t.createdAt || t.date);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const day = d.getDate();
      pnlByDay[day] = (pnlByDay[day] || 0) + Number(t.result);
    }
  });
  const absMax = Math.max(1, ...Object.values(pnlByDay).map(Math.abs));

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 2 }}>
        {days.map((d, i) => <div key={i} style={{ fontFamily: F.mono, fontSize: 8, color: C.textDim, textAlign: "center", paddingBottom: 4, letterSpacing: "0.08em" }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
        {cells.map((d, i) => {
          if (d === null) return <div key={i} style={{ aspectRatio: "1", borderRadius: 4, background: C.bgInner, opacity: 0.3 }} />;
          const v = pnlByDay[d];
          if (v === undefined) return <div key={i} style={{ aspectRatio: "1", borderRadius: 4, background: C.bgInner, opacity: 0.5, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontSize: 7, color: C.textDim }}>{d}</div>;
          const int = Math.abs(v) / absMax;
          const bg = v >= 0 ? `rgba(62,207,142,${0.08 + int * 0.35})` : `rgba(224,82,82,${0.08 + int * 0.35})`;
          const col = v >= 0 ? C.green : C.red;
          return (
            <div key={i} title={`${d}: ${v >= 0 ? "+" : ""}${v.toFixed(0)}$`}
              style={{ aspectRatio: "1", borderRadius: 4, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontSize: 7, color: col, cursor: "default", transition: "transform 0.12s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.12)"; e.currentTarget.style.zIndex = 2; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.zIndex = 0; }}
            >{Math.abs(v) >= 50 ? (v > 0 ? "+" : "") + v.toFixed(0) : d}</div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Risk Gauge ───
const RiskGauge = ({ trades }) => {
  const closed = trades.filter(t => t.result !== "");
  const losses = closed.filter(t => Number(t.result) < 0).length;
  const score = closed.length > 0 ? Math.round((losses / closed.length) * 100) : 0;
  const riskLevel = score <= 33 ? "FAIBLE" : score <= 66 ? "MOYEN" : "ÉLEVÉ";
  const riskColor = score <= 33 ? C.green : score <= 66 ? C.orange : C.red;
  const dashOffset = 204 - (score / 100) * 204;

  return (
    <div style={{ textAlign: "center" }}>
      <svg viewBox="0 0 160 90" style={{ width: 160, height: 90 }}>
        <path d="M15 80 A65 65 0 0 1 145 80" fill="none" stroke={C.bgInner} strokeWidth="10" strokeLinecap="round" />
        <path d="M15 80 A65 65 0 0 1 145 80" fill="none" stroke={riskColor} strokeWidth="10" strokeLinecap="round"
          strokeDasharray="204" strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1), stroke 0.5s" }} />
        <text x="80" y="72" textAnchor="middle" style={{ fontFamily: F.mono, fontSize: 18, fill: C.text }}>{score}</text>
        <text x="80" y="86" textAnchor="middle" style={{ fontFamily: F.mono, fontSize: 8, fill: C.textDim, letterSpacing: "0.1em" }}>{riskLevel}</text>
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 9, color: C.textDim, padding: "0 10px" }}>
        <span>Conservateur</span><span>Agressif</span>
      </div>
    </div>
  );
};

// ─── Distribution Chart ───
const DistChart = ({ trades }) => {
  const closed = trades.filter(t => t.result !== "");
  const buckets = {};
  for (let r = -3; r <= 4; r += 0.5) buckets[r] = 0;
  closed.forEach(t => {
    const v = Number(t.result);
    const avgLoss = closed.filter(t2 => Number(t2.result) < 0).reduce((a, t2) => a + Math.abs(Number(t2.result)), 0) / (closed.filter(t2 => Number(t2.result) < 0).length || 1);
    const rVal = avgLoss > 0 ? v / avgLoss : 0;
    const bucket = Math.round(rVal * 2) / 2;
    const clamped = Math.max(-3, Math.min(4, bucket));
    buckets[clamped] = (buckets[clamped] || 0) + 1;
  });
  const entries = Object.entries(buckets).map(([k, v]) => ({ r: Number(k), count: v }));
  const maxCount = Math.max(1, ...entries.map(e => e.count));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 90, paddingTop: 10 }}>
        {entries.map((e, i) => {
          const h = e.count ? Math.max(4, (e.count / maxCount) * 80) : 2;
          const bg = e.r < 0 ? C.red : e.r === 0 ? C.textDim : C.green;
          const op = e.count ? 0.4 + (e.count / maxCount) * 0.6 : 0.15;
          return (
            <div key={i} title={`${e.r > 0 ? "+" : ""}${e.r}R: ${e.count} trades`}
              style={{ flex: 1, height: `${h}%`, borderRadius: "2px 2px 0 0", background: bg, opacity: op, minHeight: 2, transition: "height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.3s", cursor: "default" }}
              onMouseEnter={e2 => e2.currentTarget.style.opacity = 0.8}
              onMouseLeave={e2 => e2.currentTarget.style.opacity = op}
            />
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, fontFamily: F.mono, fontSize: 8, color: C.textDim }}>
        <span>−3R</span><span>0</span><span>+4R</span>
      </div>
    </div>
  );
};

// ─── Session Breakdown ───
const SessionBreakdown = ({ trades }) => {
  const closed = trades.filter(t => t.result !== "");
  const sessions = {};
  closed.forEach(t => {
    const s = t.session || "Non définie";
    if (!sessions[s]) sessions[s] = { pnl: 0, count: 0, wins: 0 };
    sessions[s].pnl += Number(t.result);
    sessions[s].count++;
    if (Number(t.result) > 0) sessions[s].wins++;
  });
  const arr = Object.entries(sessions).sort((a, b) => b[1].pnl - a[1].pnl);
  const totalPnl = Math.max(1, arr.reduce((a, [, s]) => a + Math.abs(s.pnl), 0));
  const colors = [C.green, C.orange, C.textMid, C.purple];

  return (
    <div>
      {arr.slice(0, 4).map(([name, s], i) => {
        const wr = s.count > 0 ? Math.round((s.wins / s.count) * 100) : 0;
        const barW = Math.round((Math.abs(s.pnl) / totalPnl) * 100);
        return (
          <div key={name} style={{ marginBottom: i < arr.length - 1 ? 12 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, fontWeight: 300, color: C.textMid }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors[i % colors.length], flexShrink: 0 }} />
                {name}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 400, color: s.pnl >= 0 ? C.green : C.red }}>
                  {s.pnl >= 0 ? "+" : ""}{s.pnl.toFixed(0)}$
                </div>
                <div style={{ fontFamily: F.mono, fontSize: 9, color: C.textDim }}>{s.count} trades · {wr}% WR</div>
              </div>
            </div>
            <div style={{ width: "100%", height: 4, background: C.bgInner, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${barW}%`, borderRadius: 2, background: colors[i % colors.length], transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
            </div>
          </div>
        );
      })}
      {arr.length === 0 && <div style={{ color: C.textDim, fontFamily: F.mono, fontSize: 11, textAlign: "center", padding: 16 }}>Ajoute des sessions à tes trades</div>}
    </div>
  );
};

// ═══════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════
export const Dashboard = ({ stats, equity, regime, mc, orderedTrades, isPro, onUpgrade }) => {
  const [aiInsight, setAiInsight] = useState("");
  const [aiError, setAiError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [eqRange, setEqRange] = useState("all");

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

  // Filtered equity for range buttons
  const filteredEquity = useMemo(() => {
    if (eqRange === "all" || equity.length <= 10) return equity;
    if (eqRange === "1m") return equity.slice(-30);
    if (eqRange === "3m") return equity.slice(-90);
    return equity;
  }, [equity, eqRange]);

  const monthName = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <div className="fade-in">
      <DailyBrief trades={orderedTrades} stats={stats} />
      <DrawdownAlert trades={orderedTrades} />

      {/* ═══ KPI ROW ═══ */}
      {stats ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", marginBottom: 10, gap: 0 }}>
          <HeroCard label="P&L net" value={`${Number(stats.totalPnL) >= 0 ? "+" : ""}${stats.totalPnL}$`} color={Number(stats.totalPnL) >= 0 ? C.green : C.red} sub={hasTodayTrades ? `Aujourd'hui: ${todayPnL >= 0 ? "+" : ""}${todayPnL.toFixed(0)}$` : "Aucun trade aujourd'hui"} />
          <HeroCard label="Win rate" value={`${stats.winRate}%`} color={C.text} sub={`${stats.total} trades`} />
          <HeroCard label="Profit factor" value={stats.profitFactor} color={Number(stats.profitFactor) >= 1.5 ? C.text : C.textDim} sub={`R:R moy. ${stats.avgWin && stats.avgLoss ? (Number(stats.avgWin) / Math.max(1, Number(stats.avgLoss))).toFixed(1) : "—"}`} />
          <HeroCard label="Drawdown max" value={`−${stats.maxDD}$`} color={C.textDim} sub={`Actuel: −${currentDD.toFixed(0)}$`} />
        </div>
      ) : (
        <div style={{ ...card(), marginBottom: 16, textAlign: "center", color: C.textDim, fontSize: 12, fontFamily: F.mono, padding: "32px 20px" }}>
          Ajoute tes premiers trades pour voir tes statistiques
        </div>
      )}

      <div style={{ height: 1, background: C.border, marginBottom: 20 }} />

      {/* ═══ EQUITY + HEATMAP ROW ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
        <GlassCard title="Courbe d'équité"
          right={
            <div style={{ display: "flex", gap: 6 }}>
              {["1m", "3m", "all"].map(r => (
                <button key={r} onClick={() => setEqRange(r)} style={{ ...glassBtnChip(eqRange === r), textTransform: "uppercase" }}
                  onMouseEnter={e => { if (eqRange !== r) { e.currentTarget.style.background = C.glassHoverBg; e.currentTarget.style.borderColor = C.glassHoverBd; }}}
                  onMouseLeave={e => { if (eqRange !== r) { e.currentTarget.style.background = C.glassBg; e.currentTarget.style.borderColor = C.glassBorder; }}}
                >{r === "all" ? "YTD" : r}</button>
              ))}
            </div>
          }
        >
          {filteredEquity.length > 1 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={filteredEquity} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.green} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} strokeOpacity={0.4} vertical={false} />
                <XAxis dataKey="i" tick={{ fontSize: 8, fill: C.textDim, fontFamily: F.mono }} axisLine={false} tickLine={false} tickMargin={6} />
                <YAxis tick={{ fontSize: 8, fill: C.textDim, fontFamily: F.mono }} axisLine={false} tickLine={false} width={44} />
                <Tooltip contentStyle={{ background: C.bgInner, border: `1px solid ${C.borderHov}`, borderRadius: 8, fontFamily: F.mono, fontSize: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }} cursor={{ stroke: C.borderHov, strokeWidth: 1 }} />
                <Area type="monotone" dataKey="eq" stroke={C.text} strokeWidth={1.5} fill="url(#eqGrad)" dot={false} activeDot={{ r: 4, fill: C.text, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: C.textDim, fontSize: 11, fontFamily: F.mono }}>Pas assez de données</div>
          )}
        </GlassCard>

        <GlassCard title="P&L journalier" right={<span style={{ fontFamily: F.mono, fontSize: 10, color: C.textDim, textTransform: "capitalize" }}>{monthName}</span>}>
          <PnLHeatmap trades={orderedTrades} />
        </GlassCard>
      </div>

      {/* ═══ 3-COL ANALYTICS ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
        <GlassCard title="Distribution P&L">
          <DistChart trades={orderedTrades} />
        </GlassCard>
        <GlassCard title="Sessions de trading">
          <SessionBreakdown trades={orderedTrades} />
        </GlassCard>
        <GlassCard title="Score de risque">
          <RiskGauge trades={orderedTrades} />
          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: "0.14em", color: C.textDim, textTransform: "uppercase", marginBottom: 6 }}>Série récente</div>
            <StreakRow trades={orderedTrades} />
          </div>
        </GlassCard>
      </div>

      {/* ═══ STAT CARDS GRID ═══ */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 8, marginBottom: 16 }}>
          <StatCard label="Expectancy" value={`${Number(stats.expectancy) >= 0 ? "+" : ""}${stats.expectancy}$`} color={Number(stats.expectancy) >= 0 ? C.green : C.red} sub="par trade" />
          <StatCard label="Discipline" value={discipline ? `${discipline.total}/100` : "—"} color={discipline ? discipline.color : C.textDim} sub={discipline ? `Grade ${discipline.grade}` : "3 trades min."} />
          <StatCard label="Avg Win" value={`+${stats.avgWin}$`} color={C.green} sub={`Avg loss −${stats.avgLoss}$`} />
          <StatCard label="Win Streak" value={`${stats.streak}W`} color={C.green} sub="consécutifs" />
          <StatCard label="Régime" value={regime ? REGIME_META[regime]?.label : "—"} color={regime ? REGIME_META[regime]?.color : C.textDim} sub={regime ? REGIME_META[regime]?.hint : "10 trades min"} />
          <StatCard label="Monte Carlo" value={mc ? `Ruin ${mc.ruinPct}%` : "—"} color={mc ? Number(mc.ruinPct) <= 10 ? C.green : Number(mc.ruinPct) <= 25 ? C.orange : C.red : C.textDim} sub={mc ? `DD moy. ${mc.avgDD}$` : "400 sims"} />
          <StatCard label="Best Trade" value={`+${stats.bestTrade}$`} color={C.green} sub={`Pire: ${stats.worstTrade}$`} />
          <StatCard label="Aujourd'hui" value={`${todayPnL >= 0 ? "+" : ""}${todayPnL.toFixed(0)}$`} color={hasTodayTrades ? (todayPnL >= 0 ? C.green : C.red) : C.textDim} sub={hasTodayTrades ? undefined : "Aucun trade"} />
        </div>
      )}

      {/* ═══ REST OF DASHBOARD ═══ */}
      <div style={{ marginBottom: 14 }}><JournalingStreak trades={orderedTrades} /></div>
      <SetupStats trades={orderedTrades} />
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

      {/* ═══ AI COACH ═══ */}
      <Card mb={0}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <SectionTitle>AI Coach</SectionTitle>
            <div style={{ fontSize: 12, color: C.textDim, fontFamily: F.mono, marginTop: -10 }}>{isPro ? `Analyse sur ${closedCount} trades` : "Fonctionnalité Pro"}</div>
          </div>
          <button onClick={runAI} disabled={aiLoading || closedCount < 3} style={{ padding: "8px 18px", borderRadius: 8, cursor: closedCount < 3 ? "not-allowed" : "pointer", border: `1px solid ${!isPro ? C.orangeBord : C.greenBord}`, background: !isPro ? C.orangeDim : aiLoading ? "transparent" : C.greenDim, color: !isPro ? C.orange : aiLoading ? C.textDim : C.green, fontSize: 11, fontFamily: F.mono, letterSpacing: "0.06em", transition: "all 0.2s" }}>
            {!isPro ? "UPGRADE" : aiLoading ? "ANALYSE..." : "ANALYSER →"}
          </button>
        </div>
        {aiError && <div style={{ background: C.redDim, border: `1px solid ${C.redBord}`, padding: "10px 14px", borderRadius: 9, color: C.red, fontSize: 13, fontFamily: F.mono }}>{aiError}</div>}
        {aiLoading && <div className="pulse" style={{ color: C.textDim, fontSize: 13, fontFamily: F.mono }}>Analyse en cours...</div>}
        {aiInsight && !aiLoading && <div style={{ fontSize: 14, color: C.textMid, lineHeight: 1.8, borderLeft: `2px solid ${C.greenBord}`, paddingLeft: 16, whiteSpace: "pre-wrap" }}>{aiInsight}</div>}
        {!aiInsight && !aiLoading && !aiError && <div style={{ color: C.textDim, fontSize: 12, fontFamily: F.mono }}>{!isPro ? "Upgrade vers Pro pour activer l'AI Coach." : closedCount < 3 ? "Ajoute au moins 3 trades fermés." : "Clique sur Analyser pour un coaching personnalisé."}</div>}
      </Card>
    </div>
  );
};
