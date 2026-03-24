import { useState, useEffect } from "react";

const mono = "'DM Mono', monospace";
const syne = "'Syne', sans-serif";

export const Leaderboard = ({ currentUserId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/leaderboard")
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const MEDALS = ["◈", "◆", "◇"];

  return (
    <div style={{ background: "linear-gradient(135deg, #0a0d18, #080a14)", border: "1px solid #13162a", borderRadius: 16, padding: "20px 18px", marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "#3a4060", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: mono }}>
          Leaderboard — Anonyme
        </div>
        <span style={{ fontSize: 10, color: "#2d3352", fontFamily: mono }}>Min 10 trades · Classé par win rate</span>
      </div>

      {loading && <div style={{ color: "#1e2235", fontSize: 12, fontFamily: mono }}>Chargement...</div>}
      {error && <div style={{ color: "#ff4d6d", fontSize: 12, fontFamily: mono }}>{error}</div>}

      {data && (
        <>
          {data.entries.length === 0 ? (
            <div style={{ color: "#1e2235", fontSize: 12, fontFamily: mono }}>
              Pas encore assez de traders. Sois le premier !
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #0e1120" }}>
                    {["#", "Trader", "Win Rate", "PnL", "Profit Factor", "Trades"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 9, color: "#3a4060", fontFamily: mono, letterSpacing: "0.1em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.entries.map((entry, i) => {
                    const isTop3 = i < 3;
                    const medalColor = i === 0 ? "#f5a623" : i === 1 ? "#a0a8c8" : i === 2 ? "#cd7f32" : "#2d3352";

                    return (
                      <tr key={entry.id} style={{ borderBottom: "1px solid #080a14" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "10px 10px", fontSize: 13, color: medalColor, fontFamily: mono, fontWeight: 700 }}>
                          {isTop3 ? MEDALS[i] : i + 1}
                        </td>
                        <td style={{ padding: "10px 10px" }}>
                          <div style={{ fontSize: 12, color: "#9099c0", fontFamily: mono }}>
                            TJ-{entry.id}
                          </div>
                        </td>
                        <td style={{ padding: "10px 10px" }}>
                          <span style={{
                            fontSize: 12, fontWeight: 700, fontFamily: mono,
                            color: Number(entry.winRate) >= 60 ? "#00e5a0" : Number(entry.winRate) >= 50 ? "#f5a623" : "#ff4d6d",
                          }}>
                            {entry.winRate}%
                          </span>
                        </td>
                        <td style={{ padding: "10px 10px", fontSize: 12, color: Number(entry.pnl) >= 0 ? "#00e5a0" : "#ff4d6d", fontFamily: mono, fontWeight: 700 }}>
                          +{Number(entry.pnl).toLocaleString()}$
                        </td>
                        <td style={{ padding: "10px 10px", fontSize: 12, color: "#4a5070", fontFamily: mono }}>
                          {entry.pf}
                        </td>
                        <td style={{ padding: "10px 10px", fontSize: 12, color: "#2d3352", fontFamily: mono }}>
                          {entry.trades}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: 12, fontSize: 10, color: "#1e2235", fontFamily: mono }}>
            Données anonymisées — identifié uniquement par un code aléatoire
          </div>
        </>
      )}
    </div>
  );
};
