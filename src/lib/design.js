// Design system — live theme-aware
// C is a mutable object — when theme changes, values update and React re-renders

export const C = {
  bg:        "#0b0e18",
  bgCard:    "#0f1222",
  bgInner:   "#131729",
  border:    "#1c2040",
  borderHov: "#2a3058",
  text:      "#e4e8f7",
  textMid:   "#8b95be",
  textDim:   "#4a5280",
  textGhost: "#2a3058",
  green:     "#22d49f",
  greenDim:  "rgba(34,212,159,0.12)",
  greenBord: "rgba(34,212,159,0.22)",
  red:       "#f04770",
  redDim:    "rgba(240,71,112,0.1)",
  redBord:   "rgba(240,71,112,0.22)",
  orange:    "#f0a030",
  orangeDim: "rgba(240,160,48,0.1)",
  orangeBord:"rgba(240,160,48,0.22)",
  purple:    "#8b6cff",
};

export const F = {
  mono: "'DM Mono', monospace",
  sans: "'DM Sans', sans-serif",
  display: "'Syne', sans-serif",
};

/**
 * Apply a theme object by mutating C directly.
 * Components that use C in inline styles will pick up new values on next render.
 * Call forceUpdate() after this to trigger a re-render.
 */
// Version counter — increment on each theme change so React can track updates
let _themeVersion = 0;
export const getThemeVersion = () => _themeVersion;

export const applyThemeToC = (theme) => {
  _themeVersion++;
  if (!theme) return;
  Object.keys(theme).forEach(k => {
    if (k in C) C[k] = theme[k];
  });
};

export const card = (extra = {}) => ({
  background: C.bgCard,
  border: `1px solid ${C.border}`,
  borderRadius: 14,
  padding: "20px 22px",
  ...extra,
});

export const label = (extra = {}) => ({
  fontSize: 10,
  color: C.textDim,
  fontFamily: F.mono,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  ...extra,
});

export const bigNumber = (color = C.text, extra = {}) => ({
  fontSize: 28,
  fontWeight: 800,
  fontFamily: F.display,
  color,
  letterSpacing: "-0.02em",
  lineHeight: 1,
  ...extra,
});

export const tag = (color = C.green, extra = {}) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "3px 10px",
  borderRadius: 20,
  fontSize: 10,
  fontFamily: F.mono,
  letterSpacing: "0.08em",
  border: `1px solid ${color}30`,
  background: `${color}10`,
  color,
  ...extra,
});

export const btn = (variant = "ghost", extra = {}) => ({
  cursor: "pointer",
  fontFamily: F.mono,
  letterSpacing: "0.08em",
  fontSize: 11,
  fontWeight: 600,
  borderRadius: 8,
  transition: "all 0.15s",
  padding: "8px 16px",
  ...(variant === "primary" ? { background: C.green, color: "#000", border: "none" } :
      variant === "danger"  ? { background: "transparent", color: C.red, border: `1px solid ${C.redBord}` } :
      variant === "outline" ? { background: "transparent", color: C.textMid, border: `1px solid ${C.border}` } :
                              { background: "transparent", color: C.textDim, border: `1px solid ${C.border}` }),
  ...extra,
});

export const inp = (extra = {}) => ({
  background: C.bgInner,
  border: `1px solid ${C.border}`,
  color: C.text,
  padding: "10px 14px",
  borderRadius: 9,
  width: "100%",
  fontSize: 13,
  fontFamily: F.mono,
  outline: "none",
  transition: "border-color 0.15s",
  ...extra,
});
