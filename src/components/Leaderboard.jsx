import { useState, useEffect } from "react";
import { C, F } from "../lib/design";

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
        <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: mono }}>
          Leaderboard — Anonyme
        </div>
        <span style={{ fontSize: 10, color: C.textDim, fontFamily: mono }}>Min 10 trades · Classé par win rate</span>
      </div>

      {loading && <div style={{ color: C.textGhost, fontSize: 12, fontFamily: mono }}>Chargement...</div>}
      {error && <div style={{ color: C.red, fontSize: 12, fontFamily: mono }}>{error}</div>}

      {data && (
        <>
          {data.entries.length === 0 ? (
            <div style={{ color: C.textGhost, fontSize: 12, fontFamily: mono }}>
              Pas encore assez de traders. Sois le premier !
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #0e1120" }}>
                    {["#", "Trader", "Win Rate", "PnL", "Profit Factor", "Trades"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 9, color: C.textDim, fontFamily: mono, letterSpacing: "0.1em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.entries.map((entry, i) => {
                    const isTop3 = i < 3;
                    const medalColor = i === 0 ? C.orange : i === 1 ? "#a0a8c8" : i === 2 ? "#cd7f32" : C.textDim;

                    return (
                      <tr key={entry.id} style={{ borderBottom: "1px solid #080a14" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "10px 10px", fontSize: 13, color: medalColor, fontFamily: mono, fontWeight: 700 }}>
                          {isTop3 ? MEDALS[i] : i + 1}
                        </td>
                        <td style={{ padding: "10px 10px" }}>
                          <div style={{ fontSize: 12, color: C.textMid, fontFamily: mono }}>
                            TJ-{entry.id}
                          </div>
                        </td>
                        <td style={{ padding: "10px 10px" }}>
                          <span style={{
                            fontSize: 12, fontWeight: 700, fontFamily: mono,
                            color: Number(entry.winRate) >= 60 ? C.green : Number(entry.winRate) >= 50 ? C.orange : C.red,
                          }}>
                            {entry.winRate}%
                          </span>
                        </td>
                        <td style={{ padding: "10px 10px", fontSize: 12, color: Number(entry.pnl) >= 0 ? C.green : C.red, fontFamily: mono, fontWeight: 700 }}>
                          +{Number(entry.pnl).toLocaleString()}$
                        </td>
                        <td style={{ padding: "10px 10px", fontSize: 12, color: C.textDim, fontFamily: mono }}>
                          {entry.pf}
                        </td>
                        <td style={{ padding: "10px 10px", fontSize: 12, color: C.textDim, fontFamily: mono }}>
                          {entry.trades}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: 12, fontSize: 10, color: C.textGhost, fontFamily: mono }}>
            Données anonymisées — identifié uniquement par un code aléatoire
          </div>
        </>
      )}
    </div>
  );
};
