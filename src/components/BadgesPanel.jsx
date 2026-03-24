import { useMemo } from "react";
import { computeEarnedBadges, BADGES } from "../lib/badges";
import { computeDisciplineScore } from "../lib/discipline";

const mono = "'DM Mono', monospace";
const syne = "'Syne', sans-serif";

export const BadgesPanel = ({ trades, stats }) => {
  const disciplineScore = useMemo(() => computeDisciplineScore(trades), [trades]);
  const earned = useMemo(() => computeEarnedBadges(trades, stats, disciplineScore), [trades, stats, disciplineScore]);
  const earnedIds = new Set(earned.map(b => b.id));

  return (
    <div style={{ background: "linear-gradient(135deg, #0a0d18, #080a14)", border: "1px solid #13162a", borderRadius: 16, padding: "20px 18px", marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "#3a4060", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: mono }}>
          Badges & Achievements
        </div>
        <span style={{ fontSize: 11, color: "#00e5a0", fontFamily: mono }}>
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
              background: isEarned ? "rgba(255,255,255,0.03)" : "#080a14",
              border: `1px solid ${isEarned ? badge.color + "30" : "#0e1120"}`,
              opacity: isEarned ? 1 : 0.35,
              transition: "all 0.2s", cursor: "default",
            }}
              onMouseEnter={e => isEarned && (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => isEarned && (e.currentTarget.style.opacity = "1")}
            >
              <div style={{
                fontSize: 20, color: isEarned ? badge.color : "#2d3352",
                fontFamily: mono, lineHeight: 1,
              }}>
                {badge.icon}
              </div>
              <div style={{
                fontSize: 9, color: isEarned ? "#9099c0" : "#2d3352",
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
        <div style={{ marginTop: 12, fontSize: 11, color: "#1e2235", fontFamily: mono }}>
          Ajoute des trades pour débloquer tes premiers badges.
        </div>
      )}
    </div>
  );
};
