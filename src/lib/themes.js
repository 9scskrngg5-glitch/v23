import { C, applyThemeToC } from "./design";

export const THEMES = {
  midnight: {
    name: "Midnight", desc: "Noir profond — glass morphism",
    bg: "#0d0f11", bgCard: "#151719", bgInner: "#1c1e21",
    border: "rgba(255,255,255,0.07)", borderHov: "rgba(255,255,255,0.14)",
    text: "#eef0f2", textMid: "#7a8088", textDim: "#3a3d42", textGhost: "#2a2d30",
    green: "#3ecf8e", greenDim: "rgba(62,207,142,0.12)", greenBord: "rgba(62,207,142,0.22)",
    red: "#e05252", redDim: "rgba(224,82,82,0.12)", redBord: "rgba(224,82,82,0.22)",
    orange: "#e0a840", orangeDim: "rgba(224,168,64,0.10)", orangeBord: "rgba(224,168,64,0.22)",
    purple: "#8b6cff",
    glassBg: "rgba(255,255,255,0.05)", glassBorder: "rgba(255,255,255,0.14)",
    glassTop: "rgba(255,255,255,0.1)", glassShadow: "rgba(0,0,0,0.45)",
    glassText: "rgba(255,255,255,0.75)", glassHoverBg: "rgba(255,255,255,0.09)",
    glassHoverBd: "rgba(255,255,255,0.22)", cardShine: "rgba(255,255,255,0.04)",
  },
  forest: {
    name: "Forest", desc: "Vert profond — signature Log-pip",
    bg: "#051F20", bgCard: "#0B2B26", bgInner: "#163832",
    border: "rgba(142,182,155,0.12)", borderHov: "rgba(142,182,155,0.22)",
    text: "#DAF1DE", textMid: "#8EB69B", textDim: "#4a7a68", textGhost: "#235347",
    green: "#8EB69B", greenDim: "rgba(142,182,155,0.12)", greenBord: "rgba(142,182,155,0.25)",
    red: "#f04770", redDim: "rgba(240,71,112,0.10)", redBord: "rgba(240,71,112,0.22)",
    orange: "#f0c070", orangeDim: "rgba(240,192,112,0.10)", orangeBord: "rgba(240,192,112,0.22)",
    purple: "#9bb8d4",
    glassBg: "rgba(142,182,155,0.05)", glassBorder: "rgba(142,182,155,0.14)",
    glassTop: "rgba(142,182,155,0.08)", glassShadow: "rgba(0,0,0,0.45)",
    glassText: "rgba(218,241,222,0.75)", glassHoverBg: "rgba(142,182,155,0.09)",
    glassHoverBd: "rgba(142,182,155,0.22)", cardShine: "rgba(142,182,155,0.04)",
  },
  noir: {
    name: "Noir", desc: "Minimalisme absolu — noir profond",
    bg: "#080808", bgCard: "#111111", bgInner: "#1a1a1a",
    border: "rgba(255,255,255,0.07)", borderHov: "rgba(255,255,255,0.14)",
    text: "#f0f0f0", textMid: "#a0a0a0", textDim: "#555555", textGhost: "#2a2a2a",
    green: "#e8e8e8", greenDim: "rgba(232,232,232,0.08)", greenBord: "rgba(232,232,232,0.15)",
    red: "#ff4455", redDim: "rgba(255,68,85,0.10)", redBord: "rgba(255,68,85,0.22)",
    orange: "#f0a030", orangeDim: "rgba(240,160,48,0.10)", orangeBord: "rgba(240,160,48,0.22)",
    purple: "#a080ff",
    glassBg: "rgba(255,255,255,0.04)", glassBorder: "rgba(255,255,255,0.10)",
    glassTop: "rgba(255,255,255,0.07)", glassShadow: "rgba(0,0,0,0.6)",
    glassText: "rgba(255,255,255,0.7)", glassHoverBg: "rgba(255,255,255,0.08)",
    glassHoverBd: "rgba(255,255,255,0.18)", cardShine: "rgba(255,255,255,0.03)",
  },
  blanc: {
    name: "Blanc", desc: "Épuré et lumineux — clarté maximale",
    bg: "#e8eaec", bgCard: "#e0e2e4", bgInner: "#d8dadc",
    border: "rgba(0,0,0,0.07)", borderHov: "rgba(0,0,0,0.14)",
    text: "#1a1c1e", textMid: "#6a7078", textDim: "#b0b4b8", textGhost: "#cccccc",
    green: "#1a9960", greenDim: "rgba(26,153,96,0.1)", greenBord: "rgba(26,153,96,0.2)",
    red: "#c03030", redDim: "rgba(192,48,48,0.1)", redBord: "rgba(192,48,48,0.2)",
    orange: "#b08020", orangeDim: "rgba(176,128,32,0.08)", orangeBord: "rgba(176,128,32,0.2)",
    purple: "#5040a0",
    glassBg: "rgba(255,255,255,0.45)", glassBorder: "rgba(255,255,255,0.7)",
    glassTop: "rgba(255,255,255,0.9)", glassShadow: "rgba(0,0,0,0.15)",
    glassText: "rgba(30,30,30,0.85)", glassHoverBg: "rgba(255,255,255,0.65)",
    glassHoverBd: "rgba(255,255,255,0.9)", cardShine: "rgba(255,255,255,0.7)",
  },
};

export const getTheme = () => {
  try { return THEMES[localStorage.getItem("tj_theme") || "midnight"] || THEMES.midnight; }
  catch { return THEMES.midnight; }
};

export const applyTheme = (themeIdOrObj) => {
  const theme = typeof themeIdOrObj === "string"
    ? (THEMES[themeIdOrObj] || THEMES.midnight)
    : themeIdOrObj;
  applyThemeToC(theme);
  const body = document.body;
  Object.entries(theme).forEach(([k, v]) => {
    if (typeof v === "string") body.style.setProperty("--tj-" + k, v);
  });
  body.style.background = theme.bg;
  body.style.color = theme.text;
  window.dispatchEvent(new CustomEvent("tj-theme-change", { detail: theme }));
};

export const setTheme = (id) => {
  localStorage.setItem("tj_theme", id);
  applyTheme(id);
};

if (typeof window !== "undefined") {
  applyTheme(localStorage.getItem("tj_theme") || "midnight");
}
