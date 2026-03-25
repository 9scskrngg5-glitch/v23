import { useMemo } from "react";
import { computeSetupStats } from "../lib/trading";
import { C, F, card, label } from "../lib/design";

export const SetupStats = ({ trades }) => {
  const setups = useMemo(() => computeSetupStats(trades), [trades]);

  if (!setups.length) return (
    <div style={{ ...card(), marginBottom: 16 }}>
      <div style={{ ...label(), marginBottom: 12 }}>Ton edge par setup</div>
      <div style={{ fontSize: 12, color: C.textGhost, fontFamily: F.mono, textAlign: "center", padding: "20px 0" }}>
        Remplis le champ "Setup" sur tes trades pour voir ton edge réel
      </div>
    </div>
  );

  const max = Math.max(...setups.map(s => Math.abs(Number(s.expectancy))), 1);

  return (
    <div style={{ ...card(), marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ ...label(), marginBottom: 4 }}>Ton edge par setup</div>
          <div style={{ fontSize: 12, color: C.textDim, fontFamily: F.mono }}>
            Classé par expectancy décroissante
          </div>
        </div>
        <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, textAlign: "right" }}>
          {setups.length} setup{setups.length > 1 ? "s" : ""}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {setups.map((s, i) => {
          const exp = Number(s.expectancy);
          const pnl = Number(s.totalPnL);
          const color = exp >= 0 ? C.green : C.red;
          const barW = Math.abs(exp) / max * 100;

          return (
            <div key={s.setup} style={{
              padding: "12px 14px",
              background: C.bgInner,
              borderRadius: 10,
              border: `1px solid ${i === 0 ? C.greenBord : C.border}`,
              position: "relative", overflow: "hidden",
            }}>
              {/* subtle bar background */}
              <div style={{
                position: "absolute", left: 0, top: 0, height: "100%",
                width: `${barW}%`, background: exp >= 0 ? "rgba(34,212,159,0.04)" : "rgba(240,71,112,0.04)",
                transition: "width 0.5s ease",
              }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, position: "relative" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: F.mono, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {i === 0 && <span style={{ color: C.green, marginRight: 6 }}>★</span>}
                    {s.setup}
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono }}>{s.total} trades</span>
                    <span style={{ fontSize: 10, color: Number(s.winRate) >= 50 ? C.green : C.red, fontFamily: F.mono }}>{s.winRate}% WR</span>
                    <span style={{ fontSize: 10, color: pnl >= 0 ? C.green : C.red, fontFamily: F.mono }}>{pnl >= 0 ? "+" : ""}{pnl}$ total</span>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Syne', sans-serif", color, letterSpacing: "-0.02em" }}>
                    {exp >= 0 ? "+" : ""}{exp}$
                  </div>
                  <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.1em" }}>EXPECTANCY</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {setups.length > 0 && (
        <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 9, background: C.bgInner, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.1em", marginBottom: 4 }}>LECTURE RAPIDE</div>
          <div style={{ fontSize: 12, color: C.textMid, fontFamily: F.mono, lineHeight: 1.6 }}>
            {setups.filter(s => Number(s.expectancy) > 0).length > 0
              ? `Ton meilleur edge : "${setups[0].setup}" avec +${setups[0].expectancy}$ par trade en moyenne.`
              : "Aucun setup n'a d'expectancy positive pour l'instant. Analyse tes règles d'entrée."}
            {setups.filter(s => Number(s.expectancy) < 0).length > 0 && (
              <span style={{ color: C.red }}>
                {" "}Arrête "{setups[setups.length - 1].setup}" ({setups[setups.length - 1].expectancy}$/trade).
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
