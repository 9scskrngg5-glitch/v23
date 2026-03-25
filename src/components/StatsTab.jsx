import { BacktestPanel } from "./BacktestPanel";
import { C, F } from "../lib/design";
import { AdvancedStats } from "./AdvancedStats";
import { Leaderboard } from "./Leaderboard";
import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Cell, ReferenceLine, LineChart, Line,
} from "recharts";
import { Heatmap } from "./Heatmap";
import { PositionCalculator } from "./PositionCalculator";
import { UpgradeModal } from "./UpgradeModal";

const DAYS = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
const PERIODS = [
  { label: "7j", days: 7 },
  { label: "1m", days: 30 },
  { label: "3m", days: 90 },
  { label: "Tout", days: Infinity },
];

const ChartTooltip = ({ active, payload, labelKey = "label" }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "#0d1020", border: "1px solid #181b2e", borderRadius: 10, padding: "10px 14px", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
      <div style={{ color: C.textMid, marginBottom: 5 }}>{d[labelKey]}</div>
      <div style={{ color: (d.pnl ?? d.value ?? 0) >= 0 ? C.green : C.red, fontWeight: 700 }}>
        {((d.pnl ?? d.value) >= 0 ? "+" : "")}{(d.pnl ?? d.value)?.toFixed(2)}$
      </div>
      {d.trades != null && <div style={{ color: C.textDim, marginTop: 3 }}>{d.trades} trade{d.trades > 1 ? "s" : ""}</div>}
    </div>
  );
};

const MiniBar = ({ data, dataKey = "pnl", labelKey = "label", height = 140 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} barSize={28}>
      <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
      <XAxis dataKey={labelKey} tick={{ fontSize: 10, fill: C.textDim, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 10, fill: "#252840" }} axisLine={false} tickLine={false} width={44} />
      <ReferenceLine y={0} stroke={C.border} />
      <Tooltip content={<ChartTooltip labelKey={labelKey} />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
      <Bar dataKey={dataKey} radius={[5, 5, 0, 0]}>
        {data.map((d, i) => <Cell key={i} fill={(d[dataKey] ?? 0) >= 0 ? C.green : C.red} fillOpacity={0.8} />)}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

const card = (children, mb = 14) => (
  <div style={{ background: "linear-gradient(135deg, #0a0d18 0%, #080a14 100%)", border: "1px solid #13162a", borderRadius: 16, padding: "20px 16px 14px", marginBottom: mb }}>
    {children}
  </div>
);

const sectionTitle = (label) => (
  <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 14 }}>
    {label}
  </div>
);

export const StatsTab = ({ trades, plan, onUpgrade }) => {
  const [period, setPeriod] = useState("Tout");
  const [search, setSearch] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const isPro = plan === "pro";

  const filtered = useMemo(() => {
    const closed = trades.filter(t => t.result !== "");
    const p = PERIODS.find(p => p.label === period);
    const cutoff = p?.days === Infinity ? 0 : Date.now() - (p?.days ?? 30) * 86400000;
    return closed.filter(t => {
      const inPeriod = (t.createdAt ?? 0) >= cutoff;
      const inSearch = !search || [t.pair, t.setup, t.emotion, ...(t.tags || [])].some(v => v?.toLowerCase().includes(search.toLowerCase()));
      return inPeriod && inSearch;
    });
  }, [trades, period, search]);

  // PnL by pair
  const byPair = useMemo(() => {
    const map = {};
    filtered.forEach(t => {
      if (!map[t.pair]) map[t.pair] = { label: t.pair, pnl: 0, trades: 0 };
      map[t.pair].pnl += Number(t.result);
      map[t.pair].trades++;
    });
    return Object.values(map).sort((a, b) => b.pnl - a.pnl);
  }, [filtered]);

  // PnL by day
  const byDay = useMemo(() => {
    const map = {};
    DAYS.forEach((d, i) => { map[i] = { label: d, pnl: 0, trades: 0 }; });
    filtered.forEach(t => {
      const day = new Date(t.createdAt ?? Date.now()).getDay();
      map[day].pnl += Number(t.result);
      map[day].trades++;
    });
    return Object.values(map);
  }, [filtered]);

  // PnL by week
  const byWeek = useMemo(() => {
    const map = {};
    filtered.forEach(t => {
      const d = new Date(t.createdAt ?? Date.now());
      const week = `S${Math.ceil(d.getDate() / 7)} ${d.toLocaleDateString("fr-FR", { month: "short" })}`;
      if (!map[week]) map[week] = { label: week, pnl: 0, trades: 0 };
      map[week].pnl += Number(t.result);
      map[week].trades++;
    });
    return Object.values(map).slice(-12);
  }, [filtered]);

  // PnL by emotion
  const byEmotion = useMemo(() => {
    const map = {};
    filtered.filter(t => t.emotion).forEach(t => {
      const e = t.emotion.toLowerCase();
      if (!map[e]) map[e] = { label: t.emotion, pnl: 0, trades: 0 };
      map[e].pnl += Number(t.result);
      map[e].trades++;
    });
    return Object.values(map).sort((a, b) => b.pnl - a.pnl);
  }, [filtered]);

  // PnL by setup/tag
  const bySetup = useMemo(() => {
    const map = {};
    filtered.filter(t => t.setup).forEach(t => {
      const s = t.setup;
      if (!map[s]) map[s] = { label: s, pnl: 0, trades: 0 };
      map[s].pnl += Number(t.result);
      map[s].trades++;
    });
    return Object.values(map).sort((a, b) => b.pnl - a.pnl).slice(0, 8);
  }, [filtered]);

  return (
    <div className="fade-in">
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} reason="Les stats avancées sont réservées aux membres Pro" />}

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 5 }}>
          {PERIODS.map(p => (
            <button key={p.label} onClick={() => setPeriod(p.label)} style={{
              padding: "7px 14px", borderRadius: 7, border: "1px solid",
              borderColor: period === p.label ? "rgba(0,229,160,0.4)" : C.border,
              background: period === p.label ? "rgba(0,229,160,0.07)" : "transparent",
              color: period === p.label ? C.green : C.textDim,
              cursor: "pointer", fontSize: 11, fontFamily: "'DM Mono', monospace",
            }}>{p.label}</button>
          ))}
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Recherche paire, setup, émotion…"
          style={{
            background: C.bgCard, border: "1px solid #181b2e", color: C.text,
            padding: "7px 14px", borderRadius: 7, fontSize: 11,
            fontFamily: "'DM Mono', monospace", outline: "none", flex: 1, minWidth: 180,
          }}
          onFocus={e => e.target.style.borderColor = C.green}
          onBlur={e => e.target.style.borderColor = C.border}
        />
        <span style={{ fontSize: 11, color: C.textDim, fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>
          {filtered.length} trades
        </span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: C.textGhost, textAlign: "center", padding: 60, fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
          Aucun trade sur cette période
        </div>
      ) : (
        <>
          {/* Heatmap */}
          {card(<>
            {sectionTitle("Heatmap — PnL par jour")}
            <Heatmap trades={trades} />
          </>)}

          {/* PnL par semaine */}
          {card(<>
            {sectionTitle("PnL par semaine")}
            <MiniBar data={byWeek} height={130} />
          </>)}

          {/* PnL par paire */}
          {card(<>
            {sectionTitle("PnL par paire")}
            {byPair.length > 0 ? <MiniBar data={byPair} /> : <div style={{ color: C.textGhost, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>Pas de données</div>}
          </>)}

          {/* PnL par jour */}
          {card(<>
            {sectionTitle("PnL par jour de la semaine")}
            <MiniBar data={byDay} />
          </>)}

          {/* PnL par setup */}
          {card(<>
            {sectionTitle("PnL par setup")}
            {bySetup.length > 0
              ? <MiniBar data={bySetup} />
              : <div style={{ color: C.textGhost, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>Remplis le champ Setup dans tes trades</div>
            }
          </>)}

          {/* Émotion vs résultat — Pro only */}
          <div style={{ position: "relative" }} onClick={!isPro ? () => setShowUpgrade(true) : undefined}>
            {!isPro && (
              <div style={{
                position: "absolute", inset: 0, zIndex: 10,
                background: "rgba(6,8,15,0.88)", borderRadius: 16,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 8,
                backdropFilter: "blur(2px)", cursor: "pointer",
              }}>
                <div style={{ fontSize: 11, color: C.orange, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>FONCTIONNALITE PRO</div>
                <div style={{ fontSize: 10, color: C.textDim, fontFamily: "'DM Mono', monospace" }}>Clique pour upgrader</div>
              </div>
            )}
            {card(<>
              {sectionTitle("Émotion vs résultat")}
              {byEmotion.length > 0
                ? <MiniBar data={byEmotion} />
                : <div style={{ color: C.textGhost, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>Remplis le champ émotion dans tes trades</div>
              }
            </>)}
          </div>

          {/* Position calculator */}
          <PositionCalculator />

          {/* Advanced Stats */}
          <AdvancedStats trades={filtered} />

          {/* Backtest */}
          <BacktestPanel trades={filtered} />

          {/* Leaderboard */}
          <Leaderboard />
        </>
      )}
    </div>
  );
};
