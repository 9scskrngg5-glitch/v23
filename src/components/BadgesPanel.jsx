import { useMemo } from "react";
import { C, F } from "../lib/design";
import { computeEarnedBadges, BADGES } from "../lib/badges";
import { computeDisciplineScore } from "../lib/discipline";

const mono = "'DM Mono', monospace";
const syne = "'Syne', sans-serif";

export const BadgesPanel = ({ trades, stats }) => {
  const disciplineScore = useMemo(() => computeDisciplineScore(trades), [trades]);
  const earned = useMemo(() => computeEarnedBadges(trades, stats, disciplineScore), [trades, stats, disciplineScore]);
  const earnedIds = new Set(earned.map(b => b.id));

  return (
    <div style={{ background: `linear-gradient(135deg, ${C.bgInner}, ${C.bg})`, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 18px", marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: mono }}>
          Badges & Achievements
        </div>
        <span style={{ fontSize: 11, color: C.green, fontFamily: mono }}>
          {earned.length} / {BADGES.length}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 10 }}>
        {BADGES.map(badge => {
          const isEarned = earnedIds.has(badge.id);
          return (
            <div key={badge.id} title={`${badge.label} — ${badge.desc}`} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              padding: "12px 8px", borderRadius: 10,
              background: isEarned ? "rgba(255,255,255,0.03)" : C.bgInner,
              border: `1px solid ${isEarned ? badge.color + "30" : C.border}`,
              opacity: isEarned ? 1 : 0.35,
              transition: "all 0.2s", cursor: "default",
            }}
              onMouseEnter={e => isEarned && (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => isEarned && (e.currentTarget.style.opacity = "1")}
            >
              <div style={{
                fontSize: 20, color: isEarned ? badge.color : ${C.textDim},
                fontFamily: mono, lineHeight: 1,
              }}>
                {badge.icon}
              </div>
              <div style={{
                fontSize: 9, color: isEarned ? ${C.textMid} : ${C.textDim},
                fontFamily: mono, textAlign: "center", lineHeight: 1.3,
                letterSpacing: "0.04em",
              }}>
                {badge.label}
              </div>
            </div>
          );
        })}
      </div>

      {earned.length === 0 && (
        <div style={{ marginTop: 12, fontSize: 11, color: ${C.textGhost}, fontFamily: mono }}>
          Ajoute des trades pour débloquer tes premiers badges.
        </div>
      )}
    </div>
  );
};
