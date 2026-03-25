import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { C, F, card } from "../lib/design";

const BENCHMARKS = [
  { id: "btc", label: "BTC/USD", color: "#f7931a" },
  { id: "sp500", label: "S&P 500", color: "#7b61ff" },
  { id: "eth", label: "ETH/USD", color: "#627eea" },
];

// Simulated benchmark data (in real app, would fetch from API)
const generateBenchmark = (id, days, startValue = 100) => {
  const volatility = id === "btc" ? 0.035 : id === "eth" ? 0.04 : 0.008;
  const drift = id === "btc" ? 0.002 : id === "eth" ? 0.0015 : 0.0005;
  const data = [startValue];
  for (let i = 1; i < days; i++) {
    const change = drift + volatility * (Math.random() - 0.5) * 2;
    data.push(parseFloat((data[i - 1] * (1 + change)).toFixed(2)));
  }
  return data;
};

export const BenchmarkChart = ({ trades }) => {
  const [selected, setSelected] = useState(["sp500"]);
  const closed = trades.filter(t => t.result !== "");

  const chartData = useMemo(() => {
    if (closed.length < 3) return [];

    // Build equity curve normalized to 100
    let eq = 0;
    const totalPnL = closed.reduce((a, t) => a + Number(t.result), 0);
    const startCapital = Math.abs(totalPnL) > 0 ? 10000 : 10000;

    const equityPoints = closed.map((t, i) => {
      eq += Number(t.result);
      return { i, equity: parseFloat(((1 + eq / startCapital) * 100).toFixed(2)) };
    });

    // Generate benchmark data for same number of points
    const btcData = generateBenchmark("btc", closed.length);
    const sp500Data = generateBenchmark("sp500", closed.length);
    const ethData = generateBenchmark("eth", closed.length);

    return equityPoints.map((p, i) => ({
      i: i + 1,
      "Toi": p.equity,
      "BTC/USD": btcData[i],
      "S&P 500": sp500Data[i],
      "ETH/USD": ethData[i],
    }));
  }, [closed]);

  if (closed.length < 5) return (
    <div style={{ ...card(), color: C.textGhost, fontSize: 12, fontFamily: F.mono, textAlign: "center" }}>
      Ajoute au moins 5 trades pour voir la comparaison.
    </div>
  );

  const lastPoint = chartData[chartData.length - 1];
  const myPerf = lastPoint ? (lastPoint["Toi"] - 100).toFixed(1) : 0;

  return (
    <div style={{ ...card() }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Benchmark — Toi vs Marché
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {BENCHMARKS.map(b => (
            <button key={b.id} onClick={() => setSelected(s => s.includes(b.id) ? s.filter(x => x !== b.id) : [...s, b.id])} style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 10, fontFamily: F.mono,
              cursor: "pointer", border: `1px solid ${selected.includes(b.id) ? b.color + "50" : ${C.borde}r}`,
              background: selected.includes(b.id) ? b.color + "15" : "transparent",
              color: selected.includes(b.id) ? b.color : C.textDim,
            }}>{b.label}</button>
          ))}
        </div>
      </div>

      {/* Performance summary */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ background: C.bgInner, borderRadius: 9, padding: "10px 14px", border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.1em", marginBottom: 3 }}>TOI</div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: Number(myPerf) >= 0 ? C.green : C.red }}>
            {Number(myPerf) >= 0 ? "+" : ""}{myPerf}%
          </div>
        </div>
        {BENCHMARKS.filter(b => selected.includes(b.id)).map(b => {
          const perf = lastPoint ? (lastPoint[b.label] - 100).toFixed(1) : 0;
          const beats = Number(myPerf) > Number(perf);
          return (
            <div key={b.id} style={{ background: C.bgInner, borderRadius: 9, padding: "10px 14px", border: `1px solid ${b.color}25` }}>
              <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.1em", marginBottom: 3 }}>{b.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Syne', sans-serif", color: b.color }}>
                {Number(perf) >= 0 ? "+" : ""}{perf}%
              </div>
              {beats && <div style={{ fontSize: 9, color: C.green, fontFamily: F.mono, marginTop: 2 }}>Tu surperformes ↑</div>}
            </div>
          );
        })}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.bgInner} />
          <XAxis dataKey="i" tick={{ fontSize: 9, fill: C.textDim }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: C.textDim }} axisLine={false} tickLine={false} width={42} domain={["auto", "auto"]} />
          <Tooltip contentStyle={{ background: C.bgCard, border: `1px solid C.border`, borderRadius: 8, fontFamily: F.mono, fontSize: 11 }} formatter={(v) => [`${v.toFixed(1)}`, ""]} />
          <Line type="monotone" dataKey="Toi" stroke={C.green} strokeWidth={2.5} dot={false} />
          {selected.includes("btc") && <Line type="monotone" dataKey="BTC/USD" stroke="#f7931a" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />}
          {selected.includes("sp500") && <Line type="monotone" dataKey="S&P 500" stroke="#7b61ff" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />}
          {selected.includes("eth") && <Line type="monotone" dataKey="ETH/USD" stroke="#627eea" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />}
        </LineChart>
      </ResponsiveContainer>
      <div style={{ fontSize: 10, color: C.textGhost, fontFamily: F.mono, marginTop: 8, textAlign: "right" }}>
        * Benchmarks simulés — intégration API en développement
      </div>
    </div>
  );
};
