// Design system — glass-morphic theme-aware
// C is a mutable object — when theme changes, values update and React re-renders

export const C = {
  bg:        "#0d0f11",
  bgCard:    "#151719",
  bgInner:   "#1c1e21",
  border:    "rgba(255,255,255,0.07)",
  borderHov: "rgba(255,255,255,0.14)",
  text:      "#eef0f2",
  textMid:   "#7a8088",
  textDim:   "#3a3d42",
  textGhost: "#2a2d30",
  green:     "#3ecf8e",
  greenDim:  "rgba(62,207,142,0.12)",
  greenBord: "rgba(62,207,142,0.22)",
  red:       "#e05252",
  redDim:    "rgba(224,82,82,0.12)",
  redBord:   "rgba(224,82,82,0.22)",
  orange:    "#e0a840",
  orangeDim: "rgba(224,168,64,0.10)",
  orangeBord:"rgba(224,168,64,0.22)",
  purple:    "#8b6cff",
  // Glass specific
  glassBg:     "rgba(255,255,255,0.05)",
  glassBorder: "rgba(255,255,255,0.14)",
  glassTop:    "rgba(255,255,255,0.1)",
  glassShadow: "rgba(0,0,0,0.45)",
  glassText:   "rgba(255,255,255,0.75)",
  glassHoverBg:"rgba(255,255,255,0.09)",
  glassHoverBd:"rgba(255,255,255,0.22)",
  cardShine:   "rgba(255,255,255,0.04)",
  amber:       "#e0a840",
  amberDim:    "rgba(224,168,64,0.10)",
};

export const F = {
  mono: "'DM Mono', monospace",
  sans: "'DM Sans', sans-serif",
  display: "'Syne', sans-serif",
};

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
  position: "relative",
  overflow: "hidden",
  ...extra,
});

export const glassCard = (extra = {}) => ({
  background: C.glassBg,
  border: `1px solid ${C.glassBorder}`,
  borderRadius: 14,
  padding: "20px 22px",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  boxShadow: `inset 0 1px 0 ${C.glassTop}, 0 4px 24px ${C.glassShadow}`,
  position: "relative",
  ...extra,
});

export const label = (extra = {}) => ({
  fontSize: 9,
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

export const glassBtn = (extra = {}) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  borderRadius: 100,
  background: C.glassBg,
  border: `1px solid ${C.glassBorder}`,
  boxShadow: `inset 0 1px 0 ${C.glassTop}, inset 0 -1px 0 rgba(0,0,0,0.15), 0 4px 16px ${C.glassShadow}, 0 1px 3px rgba(0,0,0,0.3)`,
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  color: C.glassText,
  fontFamily: F.mono,
  cursor: "pointer",
  userSelect: "none",
  transition: "background 0.18s, border-color 0.18s, box-shadow 0.18s, transform 0.12s",
  outline: "none",
  whiteSpace: "nowrap",
  ...extra,
});

export const glassBtnPrimary = (extra = {}) => ({
  ...glassBtn(),
  background: "rgba(255,255,255,0.1)",
  borderColor: "rgba(255,255,255,0.25)",
  color: C.text,
  boxShadow: `inset 0 1.5px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.2), 0 4px 20px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4)`,
  ...extra,
});

export const glassBtnChip = (active = false, extra = {}) => ({
  ...glassBtn(),
  borderRadius: 6,
  fontSize: 9.5,
  letterSpacing: "0.06em",
  padding: "5px 10px",
  ...(active ? {
    background: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.24)",
    color: C.text,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -1px 0 rgba(0,0,0,0.18), 0 3px 10px rgba(0,0,0,0.4)`,
  } : {}),
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
  transition: "border-color 0.15s, box-shadow 0.15s",
  ...extra,
});
