import { C, applyThemeToC } from "./design";

export const THEMES = {
  forest: {
    name: "Forest", desc: "Vert profond — élégance naturelle et premium",
    bg: "#051F20", bgCard: "#0B2B26", bgInner: "#163832",
    border: "#235347", borderHov: "#2e6b5e",
    text: "#DAF1DE", textMid: "#8EB69B", textDim: "#4a7a68", textGhost: "#235347",
    green: "#8EB69B", greenDim: "rgba(142,182,155,0.12)", greenBord: "rgba(142,182,155,0.25)",
    red: "#f04770", redDim: "rgba(240,71,112,0.10)", redBord: "rgba(240,71,112,0.22)",
    orange: "#f0c070", orangeDim: "rgba(240,192,112,0.10)", orangeBord: "rgba(240,192,112,0.22)",
    purple: "#9bb8d4",
  },
  dark: {
    name: "Dark", desc: "Le thème original — élégant et professionnel",
    bg: "#0b0e18", bgCard: "#0f1222", bgInner: "#131729",
    border: "#1c2040", borderHov: "#2a3058",
    text: "#e4e8f7", textMid: "#8b95be", textDim: "#4a5280", textGhost: "#252a45",
    green: "#22d49f", greenDim: "rgba(34,212,159,0.10)", greenBord: "rgba(34,212,159,0.25)",
    red: "#f04770", redDim: "rgba(240,71,112,0.10)", redBord: "rgba(240,71,112,0.22)",
    orange: "#f0a030", orangeDim: "rgba(240,160,48,0.10)", orangeBord: "rgba(240,160,48,0.22)",
    purple: "#8b6cff",
  },
  bloomberg: {
    name: "Bloomberg", desc: "Terminal Bloomberg — données brutes, impact maximal",
    bg: "#0c0a00", bgCard: "#141000", bgInner: "#1a1500",
    border: "#2e2600", borderHov: "#443a00",
    text: "#ffd633", textMid: "#cca300", textDim: "#806600", textGhost: "#403300",
    green: "#33ff99", greenDim: "rgba(51,255,153,0.10)", greenBord: "rgba(51,255,153,0.20)",
    red: "#ff4444", redDim: "rgba(255,68,68,0.10)", redBord: "rgba(255,68,68,0.20)",
    orange: "#ff9933", orangeDim: "rgba(255,153,51,0.10)", orangeBord: "rgba(255,153,51,0.20)",
    purple: "#bb99ff",
  },
  neon: {
    name: "Neon", desc: "Cyberpunk — pour les sessions nocturnes",
    bg: "#08001a", bgCard: "#0e0028", bgInner: "#140035",
    border: "#280060", borderHov: "#380088",
    text: "#e8d4ff", textMid: "#a088dd", textDim: "#604890", textGhost: "#301e60",
    green: "#00ffd5", greenDim: "rgba(0,255,213,0.10)", greenBord: "rgba(0,255,213,0.22)",
    red: "#ff2277", redDim: "rgba(255,34,119,0.10)", redBord: "rgba(255,34,119,0.22)",
    orange: "#ffaa00", orangeDim: "rgba(255,170,0,0.10)", orangeBord: "rgba(255,170,0,0.22)",
    purple: "#dd44ff",
  },
  minimal: {
    name: "Minimal", desc: "Clair et épuré — focus total sur les données",
    bg: "#f5f6f8", bgCard: "#ffffff", bgInner: "#eceef2",
    border: "#d8dce5", borderHov: "#c0c5d0",
    text: "#1a1e2c", textMid: "#505878", textDim: "#8890aa", textGhost: "#bfc4d0",
    green: "#0aab6e", greenDim: "rgba(10,171,110,0.08)", greenBord: "rgba(10,171,110,0.22)",
    red: "#dc3050", redDim: "rgba(220,48,80,0.08)", redBord: "rgba(220,48,80,0.22)",
    orange: "#d07010", orangeDim: "rgba(208,112,16,0.08)", orangeBord: "rgba(208,112,16,0.22)",
    purple: "#5840c0",
  },
  matrix: {
    name: "Matrix", desc: "The Matrix — vert phosphore sur noir",
    bg: "#001200", bgCard: "#001e00", bgInner: "#002800",
    border: "#004400", borderHov: "#006600",
    text: "#33ff66", textMid: "#22cc44", textDim: "#118822", textGhost: "#005510",
    green: "#33ff66", greenDim: "rgba(51,255,102,0.10)", greenBord: "rgba(51,255,102,0.22)",
    red: "#ff3333", redDim: "rgba(255,51,51,0.10)", redBord: "rgba(255,51,51,0.20)",
    orange: "#ffdd00", orangeDim: "rgba(255,221,0,0.10)", orangeBord: "rgba(255,221,0,0.20)",
    purple: "#66ff99",
  },
};

export const getTheme = () => {
  try { return THEMES[localStorage.getItem("tj_theme") || "dark"] || THEMES.dark; }
  catch { return THEMES.dark; }
};

export const applyTheme = (themeIdOrObj) => {
  const theme = typeof themeIdOrObj === "string"
    ? (THEMES[themeIdOrObj] || THEMES.dark)
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
  applyTheme(localStorage.getItem("tj_theme") || "forest");
}
