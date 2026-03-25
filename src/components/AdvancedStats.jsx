import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell, ScatterChart, Scatter } from "recharts";
import { C, F, card } from "../lib/design";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const ChartTooltip = ({ active, payload, labelKey = "label" }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontFamily: F.mono, fontSize: 11 }}>
      <div style={{ color: C.textMid, marginBottom: 4 }}>{d[labelKey]}</div>
      {d.pnl !== undefined && <div style={{ color: d.pnl >= 0 ? C.green : C.red, fontWeight: 700 }}>{d.pnl >= 0 ? "+" : ""}{d.pnl?.toFixed(2)}$</div>}
      {d.winRate !== undefined && <div style={{ color: C.textDim, marginTop: 2 }}>Win: {d.winRate}% · {d.count} trades</div>}
    </div>
  );
};

const MiniBar = ({ data, labelKey = "label", height = 150 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} barSize={Math.max(8, Math.floor(400 / (data.length + 1)))}>
      <CartesianGrid strokeDasharray="3 3" stroke={C.bgInner} vertical={false} />
      <XAxis dataKey={labelKey} tick={{ fontSize: 9, fill: C.textDim, fontFamily: F.mono }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 9, fill: C.textDim }} axisLine={false} tickLine={false} width={42} />
      <Tooltip content={<ChartTooltip labelKey={labelKey} />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
      <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
        {data.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? C.green : C.red} fillOpacity={0.75} />)}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

export const AdvancedStats = ({ trades }) => {
  const closed = trades.filter(t => t.result !== "");

  // PnL by hour
  const byHour = useMemo(() => {
    const map = {};
    HOURS.forEach(h => { map[h] = { label: `${String(h).padStart(2, "0")}h`, pnl: 0, count: 0, wins: 0 }; });
    closed.forEach(t => {
      const h = new Date(t.createdAt ?? 0).getHours();
      map[h].pnl += Number(t.result);
      map[h].count++;
      if (Number(t.result) > 0) map[h].wins++;
    });
    return Object.values(map)
      .map(d => ({ ...d, winRate: d.count ? ((d.wins / d.count) * 100).toFixed(0) : 0 }))
      .filter(d => d.count > 0);
  }, [closed]);

  // PnL by setup
  const bySetup = useMemo(() => {
    const map = {};
    closed.filter(t => t.setup).forEach(t => {
      const s = t.setup.trim();
      if (!map[s]) map[s] = { label: s.length > 16 ? s.slice(0, 16) + "…" : s, fullLabel: s, pnl: 0, count: 0, wins: 0 };
      map[s].pnl += Number(t.result);
      map[s].count++;
      if (Number(t.result) > 0) map[s].wins++;
    });
    return Object.values(map)
      .map(d => ({ ...d, winRate: d.count ? ((d.wins / d.count) * 100).toFixed(0) : 0 }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 10);
  }, [closed]);

  // PnL by confidence level
  const byConfidence = useMemo(() => {
    const map = {};
    for (let i = 1; i <= 10; i++) map[i] = { label: String(i), pnl: 0, count: 0, wins: 0 };
    closed.filter(t => t.confidence !== "" && t.confidence !== null).forEach(t => {
      const c = Math.round(Number(t.confidence));
      if (c >= 1 && c <= 10) {
        map[c].pnl += Number(t.result);
        map[c].count++;
        if (Number(t.result) > 0) map[c].wins++;
      }
    });
    return Object.values(map)
      .map(d => ({ ...d, winRate: d.count ? ((d.wins / d.count) * 100).toFixed(0) : 0 }))
      .filter(d => d.count > 0);
  }, [closed]);

  // Best and worst setups summary
  const bestSetup = bySetup[0];
  const worstSetup = [...bySetup].sort((a, b) => a.pnl - b.pnl)[0];

  const SectionTitle = ({ children }) => (
    <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>{children}</div>
  );

  if (closed.length < 5) return (
    <div style={{ ...card(), textAlign: "center", color: C.textGhost, fontSize: 12, fontFamily: F.mono }}>
      Ajoute au moins 5 trades pour voir les analyses avancées.
    </div>
  );

  return (
    <div>
      {/* Best / worst setup callout */}
      {bestSetup && worstSetup && bestSetup.id !== worstSetup.id && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div style={{ ...card(), borderColor: "rgba(0,229,160,0.2)" }}>
            <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.12em", marginBottom: 6 }}>MEILLEUR SETUP</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: F.mono, marginBottom: 4 }}>{bestSetup.fullLabel || bestSetup.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.green, fontFamily: "'Syne', sans-serif" }}>+{Number(bestSetup.pnl).toFixed(0)}$</div>
            <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono, marginTop: 3 }}>{bestSetup.winRate}% WR · {bestSetup.count} trades</div>
          </div>
          <div style={{ ...card(), borderColor: "rgba(255,77,109,0.2)" }}>
            <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.12em", marginBottom: 6 }}>SETUP À ÉVITER</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: F.mono, marginBottom: 4 }}>{worstSetup.fullLabel || worstSetup.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.red, fontFamily: "'Syne', sans-serif" }}>{Number(worstSetup.pnl).toFixed(0)}$</div>
            <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono, marginTop: 3 }}>{worstSetup.winRate}% WR · {worstSetup.count} trades</div>
          </div>
        </div>
      )}

      {/* PnL by hour */}
      <div style={{ ...card(), marginBottom: 14 }}>
        <SectionTitle>PnL par heure de la journée</SectionTitle>
        {byHour.length > 0 ? (
          <>
            <MiniBar data={byHour} />
            <div style={{ marginTop: 10, fontSize: 11, color: C.textDim, fontFamily: F.mono }}>
              {(() => {
                const best = [...byHour].sort((a, b) => b.pnl - a.pnl)[0];
                const worst = [...byHour].sort((a, b) => a.pnl - b.pnl)[0];
                return `Meilleure heure: ${best?.label} · Pire heure: ${worst?.label}`;
              })()}
            </div>
          </>
        ) : <div style={{ color: C.textGhost, fontSize: 12, fontFamily: F.mono }}>Pas assez de données.</div>}
      </div>

      {/* PnL by setup */}
      {bySetup.length > 0 && (
        <div style={{ ...card(), marginBottom: 14 }}>
          <SectionTitle>PnL par setup</SectionTitle>
          <MiniBar data={bySetup} />
        </div>
      )}

      {/* PnL by confidence */}
      {byConfidence.length > 0 && (
        <div style={{ ...card(), marginBottom: 14 }}>
          <SectionTitle>PnL par niveau de confiance</SectionTitle>
          <MiniBar data={byConfidence} />
          <div style={{ marginTop: 10, fontSize: 11, color: C.textDim, fontFamily: F.mono }}>
            {(() => {
              const best = [...byConfidence].sort((a, b) => b.winRate - a.winRate)[0];
              return best ? `Meilleur win rate à confiance ${best.label}/10 (${best.winRate}%)` : "";
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
