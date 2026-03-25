import { useState } from "react";
import { THEMES, setTheme } from "../lib/themes";
import { C, F } from "../lib/design";

export const ThemePicker = ({ currentThemeId, onThemeChange }) => {
  const [active, setActive] = useState(currentThemeId || "dark");

  const handleSelect = (id) => {
    setTheme(id);      // mutates C + fires event → App re-renders everything
    setActive(id);
    onThemeChange?.(id);
  };

  return (
    <div>
      <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6 }}>
        Thème visuel
      </div>
      <div style={{ fontSize: 12, color: C.textDim, marginBottom: 16 }}>
        Sélectionne un thème — les couleurs s'appliquent immédiatement sur toute l'app.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
        {Object.entries(THEMES).map(([id, theme]) => {
          const isActive = active === id;
          return (
            <button key={id} onClick={() => handleSelect(id)} style={{
              background: theme.bgCard,
              border: `2px solid ${isActive ? theme.green : theme.border}`,
              borderRadius: 12, padding: "14px",
              cursor: "pointer", textAlign: "left",
              transition: "border-color 0.15s", outline: "none",
            }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = theme.borderHov; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = theme.border; }}
            >
              {/* Color swatches */}
              <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
                {[theme.green, theme.red, theme.orange, theme.text].map((c, i) => (
                  <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: c, border: `1px solid ${theme.border}` }} />
                ))}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, fontFamily: F.mono, marginBottom: 3 }}>{theme.name}</div>
              <div style={{ fontSize: 10, color: theme.textDim, fontFamily: F.mono, lineHeight: 1.4 }}>{theme.desc}</div>
              {isActive && <div style={{ marginTop: 8, fontSize: 9, color: theme.green, fontFamily: F.mono, letterSpacing: "0.1em" }}>ACTIF ✓</div>}
              {!isActive && id === "forest" && <div style={{ marginTop: 8, fontSize: 9, color: theme.textDim, fontFamily: F.mono, letterSpacing: "0.1em" }}>DÉFAUT</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
