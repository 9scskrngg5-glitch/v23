import { useMemo } from "react";
import { C, F } from "../lib/design";
import { computeDisciplineScore, DISCIPLINE_RULES } from "../lib/discipline";

const mono = "'DM Mono', monospace";
const syne = "'Syne', sans-serif";

const CircleGauge = ({ score, color, grade }) => {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
      <svg width="110" height="110" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="55" cy="55" r={r} fill="none" stroke={C.border} strokeWidth="8" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: syne, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 11, color: C.textDim, fontFamily: mono, letterSpacing: "0.08em" }}>/ 100</div>
      </div>
    </div>
  );
};

export const DisciplineScore = ({ trades }) => {
  const result = useMemo(() => computeDisciplineScore(trades), [trades]);

  const section = (label) => (
    <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: mono, marginBottom: 14 }}>{label}</div>
  );

  if (!result) return (
    <div style={{ background: `linear-gradient(135deg, ${C.bgInner}, ${C.bg})`, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 18px", marginBottom: 14 }}>
      {section("Score de discipline")}
      <div style={{ color: C.textGhost, fontSize: 12, fontFamily: mono }}>Ajoute au moins 3 trades pour voir ton score.</div>
    </div>
  );

  return (
    <div style={{ background: `linear-gradient(135deg, ${C.bgInner}, ${C.bg})`, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 18px", marginBottom: 14 }}>
      {section("Score de discipline")}

      <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        <CircleGauge score={result.total} color={result.color} grade={result.grade} />
        <div>
          <div style={{ fontSize: 36, fontWeight: 800, fontFamily: syne, color: result.color, lineHeight: 1, marginBottom: 4 }}>
            {result.grade}
          </div>
          <div style={{ fontSize: 12, color: C.textDim, fontFamily: mono, marginBottom: 8 }}>
            {result.total >= 90 ? "Discipline excellente" :
             result.total >= 75 ? "Bonne discipline" :
             result.total >= 60 ? "Discipline à améliorer" :
             result.total >= 40 ? "Discipline insuffisante" : "Discipline critique"}
          </div>
          <div style={{ fontSize: 11, color: C.textDim, fontFamily: mono }}>Basé sur tes 30 derniers trades</div>
        </div>
      </div>

      {/* Breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {result.breakdown.map(rule => (
          <div key={rule.id}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: C.textDim, fontFamily: mono }}>{rule.label}</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {rule.violations > 0 && (
                  <span style={{ fontSize: 10, color: C.red, fontFamily: mono }}>{rule.violations} violation{rule.violations > 1 ? "s" : ""}</span>
                )}
                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: mono, color: rule.score >= 80 ? C.green : rule.score >= 60 ? C.orange : C.red }}>
                  {rule.score}%
                </span>
              </div>
            </div>
            <div style={{ height: 4, background: C.bgInner, borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 2, transition: "width 0.5s ease",
                width: `${rule.score}%`,
                background: rule.score >= 80 ? C.green : rule.score >= 60 ? C.orange : C.red,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
