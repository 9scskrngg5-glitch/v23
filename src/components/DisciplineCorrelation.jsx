import { useMemo } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts";
import { computeDisciplineCorrelation } from "../lib/trading";
import { C, F, card, label } from "../lib/design";

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  const color = payload.result > 0 ? C.green : C.red;
  return <circle cx={cx} cy={cy} r={5} fill={color} fillOpacity={0.7} stroke="none" />;
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 11, fontFamily: F.mono }}>
      <div style={{ color: C.textMid, marginBottom: 2 }}>{d.pair} · Trade #{d.index}</div>
      <div style={{ color: d.result >= 0 ? C.green : C.red }}>
        {d.result >= 0 ? "+" : ""}{d.result.toFixed(2)}$
      </div>
      <div style={{ color: C.textDim }}>Discipline: {d.discipline}/100</div>
    </div>
  );
};

export const DisciplineCorrelation = ({ trades }) => {
  const data = useMemo(() => computeDisciplineCorrelation(trades), [trades]);

  const insight = useMemo(() => {
    if (data.length < 5) return null;
    const highDisc = data.filter(d => d.discipline >= 70);
    const lowDisc = data.filter(d => d.discipline < 70);
    if (!highDisc.length || !lowDisc.length) return null;
    const avgHigh = highDisc.reduce((a, d) => a + d.result, 0) / highDisc.length;
    const avgLow = lowDisc.reduce((a, d) => a + d.result, 0) / lowDisc.length;
    const diff = avgHigh - avgLow;
    if (diff > 0) {
      return {
        text: `Quand tu es discipliné (score ≥ 70), tu gagnes en moyenne ${avgHigh.toFixed(0)}$ de plus par trade.`,
        color: C.green,
      };
    }
    return {
      text: `Ton score de discipline n'impacte pas encore clairement tes résultats. Continue à journaliser.`,
      color: C.textMid,
    };
  }, [data]);

  if (data.length < 5) return (
    <div style={{ ...card(), marginBottom: 16 }}>
      <div style={{ ...label(), marginBottom: 12 }}>Discipline vs Résultats</div>
      <div style={{ fontSize: 12, color: C.textGhost, fontFamily: F.mono, textAlign: "center", padding: "20px 0" }}>
        5 trades minimum pour afficher la corrélation
      </div>
    </div>
  );

  return (
    <div style={{ ...card(), marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ ...label(), marginBottom: 4 }}>Discipline vs Résultats</div>
          <div style={{ fontSize: 12, color: C.textDim, fontFamily: F.mono }}>
            Chaque point = 1 trade
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, fontSize: 10, fontFamily: F.mono }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, display: "inline-block" }} />
            <span style={{ color: C.textDim }}>Gain</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.red, display: "inline-block" }} />
            <span style={{ color: C.textDim }}>Perte</span>
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <ScatterChart margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.bgInner} />
          <XAxis
            dataKey="discipline" type="number" domain={[0, 100]} name="Discipline"
            tick={{ fontSize: 10, fill: C.textDim, fontFamily: F.mono }}
            axisLine={false} tickLine={false}
            label={{ value: "Score discipline", position: "insideBottom", offset: -2, fontSize: 9, fill: C.textDim, fontFamily: F.mono }}
          />
          <YAxis
            dataKey="result" type="number" name="Résultat"
            tick={{ fontSize: 10, fill: C.textDim, fontFamily: F.mono }}
            axisLine={false} tickLine={false} width={48}
          />
          <ReferenceLine y={0} stroke={C.border} strokeDasharray="4 4" />
          <ReferenceLine x={70} stroke={C.borderHov} strokeDasharray="4 4" />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3", stroke: C.border }} />
          <Scatter data={data} shape={<CustomDot />} />
        </ScatterChart>
      </ResponsiveContainer>

      {insight && (
        <div style={{
          marginTop: 12, padding: "10px 14px", borderRadius: 9,
          background: insight.color === C.green ? C.greenDim : C.bgInner,
          border: `1px solid ${insight.color === C.green ? C.greenBord : C.border}`,
          fontSize: 12, color: insight.color, fontFamily: F.mono, lineHeight: 1.5,
        }}>
          {insight.text}
        </div>
      )}
    </div>
  );
};
