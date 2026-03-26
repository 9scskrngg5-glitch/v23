import { useState } from "react";
import { THEMES, setTheme } from "../lib/themes";
import { C, F } from "../lib/design";

const PREVIEWS = {
  midnight: { bars: ["#eef0f2", "#7a8088", "#3a3d42"], line: "#3ecf8e" },
  forest: { bars: ["#8EB69B", "#4a7a68", "#235347"], line: "#8EB69B" },
  noir:   { bars: ["#e8e8e8", "#a0a0a0", "#555555"], line: "#e8e8e8" },
  blanc:  { bars: ["#1a7a4a", "#555555", "#cccccc"], line: "#1a7a4a" },
};

const MiniChart = ({ colors, bg }) => (
  <svg viewBox="0 0 60 32" fill="none" style={{ width: "100%", height: 32 }}>
    <rect width="60" height="32" rx="4" fill={bg}/>
    {[
      { x: 6,  h: 22, y: 10 },
      { x: 14, h: 14, y: 18 },
      { x: 22, h: 28, y: 4  },
      { x: 30, h: 18, y: 14 },
      { x: 38, h: 24, y: 8  },
      { x: 46, h: 10, y: 22 },
    ].map((b, i) => (
      <rect key={i} x={b.x} y={b.y} width="6" height={b.h} rx="1.5"
        fill={colors.bars[i % 3]} fillOpacity={0.7 + (i % 3) * 0.1}/>
    ))}
    <path d="M6 20 C14 15 22 8 30 12 C38 16 46 6 54 4"
      stroke={colors.line} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
  </svg>
);

export const ThemePicker = ({ currentThemeId, onThemeChange }) => {
  const [active, setActive] = useState(currentThemeId || "midnight");

  const handleSelect = (id) => {
    setTheme(id);
    setActive(id);
    onThemeChange?.(id);
  };

  return (
    <div>
      <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>
        Thème visuel
      </div>
      <div style={{ fontSize: 12, color: C.textDim, fontFamily: F.sans, marginBottom: 20, lineHeight: 1.5 }}>
        Les couleurs s'appliquent immédiatement sur toute l'app.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        {Object.entries(THEMES).map(([id, theme]) => {
          const isActive = active === id;
          const preview = PREVIEWS[id];
          return (
            <button key={id} onClick={() => handleSelect(id)} style={{
              background: theme.bgCard,
              border: `1.5px solid ${isActive ? theme.green : theme.border}`,
              borderRadius: 14, padding: "14px 12px",
              cursor: "pointer", textAlign: "left",
              transition: "all 0.18s", outline: "none",
              boxShadow: isActive ? `0 0 20px ${theme.greenDim}` : "none",
              transform: isActive ? "translateY(-2px)" : "none",
            }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = theme.borderHov; e.currentTarget.style.transform = "translateY(-1px)"; }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.transform = "none"; }}}
            >
              {/* Mini chart preview */}
              <div style={{ marginBottom: 10, borderRadius: 6, overflow: "hidden" }}>
                <MiniChart colors={preview} bg={theme.bgInner} />
              </div>

              {/* Theme name */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, fontFamily: F.sans, marginBottom: 2 }}>{theme.name}</div>
                  <div style={{ fontSize: 10, color: theme.textDim, fontFamily: F.mono }}>{theme.desc}</div>
                </div>
                {isActive && (
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: theme.greenDim, border: `1.5px solid ${theme.greenBord}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7.5L8 3" stroke={theme.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Color dots */}
              <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
                {[theme.bg, theme.bgCard, theme.bgInner, theme.border, theme.green, theme.red].map((c, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, border: `1px solid ${theme.border}`, flexShrink: 0 }} />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
