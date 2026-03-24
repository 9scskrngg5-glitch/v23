import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";

const SESSIONS = ["Asian", "London", "New York", "Other"];

const SessionTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: "#0d1020", border: "1px solid #181b2e",
      borderRadius: 10, padding: "10px 14px",
      fontFamily: "'DM Mono', monospace", fontSize: 12,
    }}>
      <div style={{ color: "#a0a8c8", marginBottom: 6 }}>{d.session}</div>
      <div style={{ color: d.pnl >= 0 ? "#00e5a0" : "#ff4d6d", fontWeight: 700 }}>
        PnL : {d.pnl >= 0 ? "+" : ""}{d.pnl.toFixed(2)}$
      </div>
      <div style={{ color: "#4a5070", marginTop: 4 }}>
        {d.trades} trade{d.trades > 1 ? "s" : ""} · {d.winRate}% win
      </div>
    </div>
  );
};

/**
 * @param {{ trades: import('../types').Trade[] }} props
 */
export const SessionChart = ({ trades }) => {
  const closed = trades.filter((t) => t.result !== "");

  if (closed.length === 0) {
    return (
      <div style={{
        height: 180, display: "flex", alignItems: "center",
        justifyContent: "center", color: "#1e2235",
        fontSize: 12, fontFamily: "'DM Mono', monospace",
      }}>
        Pas assez de données
      </div>
    );
  }

  const data = SESSIONS.map((session) => {
    const sessionTrades = closed.filter((t) => {
      const s = (t.session || "").toLowerCase();
      if (session === "Asian") return s.includes("asia") || s.includes("tokyo");
      if (session === "London") return s.includes("london") || s.includes("europe");
      if (session === "New York") return s.includes("new york") || s.includes("ny") || s.includes("us");
      // Other = anything not matched
      return (
        !s.includes("asia") && !s.includes("tokyo") &&
        !s.includes("london") && !s.includes("europe") &&
        !s.includes("new york") && !s.includes("ny") && !s.includes("us")
      );
    });

    if (sessionTrades.length === 0) return null;

    const pnl = sessionTrades.reduce((acc, t) => acc + Number(t.result), 0);
    const wins = sessionTrades.filter((t) => Number(t.result) > 0).length;
    const winRate = ((wins / sessionTrades.length) * 100).toFixed(0);

    return { session, pnl, trades: sessionTrades.length, winRate: Number(winRate) };
  }).filter(Boolean);

  if (data.length === 0) {
    return (
      <div style={{
        height: 180, display: "flex", alignItems: "center",
        justifyContent: "center", color: "#1e2235",
        fontSize: 12, fontFamily: "'DM Mono', monospace",
      }}>
        Pas assez de données
      </div>
    );
  }

  return (
    <div>
      {/* Mini stat row */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {data.map((d) => (
          <div key={d.session} style={{
            background: "#080a14", border: "1px solid #13162a",
            borderRadius: 10, padding: "8px 14px", flex: 1, minWidth: 90,
          }}>
            <div style={{
              fontSize: 10, color: "#3a4060", letterSpacing: "0.1em",
              textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 4,
            }}>
              {d.session}
            </div>
            <div style={{
              fontSize: 16, fontWeight: 700,
              color: d.pnl >= 0 ? "#00e5a0" : "#ff4d6d",
              fontFamily: "'DM Mono', monospace",
            }}>
              {d.pnl >= 0 ? "+" : ""}{d.pnl.toFixed(0)}$
            </div>
            <div style={{ fontSize: 10, color: "#2d3352", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
              {d.winRate}% · {d.trades}T
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" stroke="#0e1120" vertical={false} />
          <XAxis
            dataKey="session"
            tick={{ fontSize: 10, fill: "#3a4060", fontFamily: "'DM Mono', monospace" }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#252840" }}
            axisLine={false} tickLine={false} width={44}
          />
          <ReferenceLine y={0} stroke="#181b2e" strokeWidth={1} />
          <Tooltip content={<SessionTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
          <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.pnl >= 0 ? "#00e5a0" : "#ff4d6d"} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
