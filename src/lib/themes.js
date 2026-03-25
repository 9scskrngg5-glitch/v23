import { C, applyThemeToC } from "./design";

export const THEMES = {
  forest: {
    name: "Forest", desc: "Vert profond — signature Log-pip",
    bg: "#051F20", bgCard: "#0B2B26", bgInner: "#163832",
    border: "#235347", borderHov: "#2e6b5e",
    text: "#DAF1DE", textMid: "#8EB69B", textDim: "#4a7a68", textGhost: "#235347",
    green: "#8EB69B", greenDim: "rgba(142,182,155,0.12)", greenBord: "rgba(142,182,155,0.25)",
    red: "#f04770", redDim: "rgba(240,71,112,0.10)", redBord: "rgba(240,71,112,0.22)",
    orange: "#f0c070", orangeDim: "rgba(240,192,112,0.10)", orangeBord: "rgba(240,192,112,0.22)",
    purple: "#9bb8d4",
  },
  noir: {
    name: "Noir", desc: "Minimalisme absolu — noir profond",
    bg: "#080808", bgCard: "#111111", bgInner: "#1a1a1a",
    border: "#2a2a2a", borderHov: "#3a3a3a",
    text: "#f0f0f0", textMid: "#a0a0a0", textDim: "#555555", textGhost: "#2a2a2a",
    green: "#e8e8e8", greenDim: "rgba(232,232,232,0.08)", greenBord: "rgba(232,232,232,0.15)",
    red: "#ff4455", redDim: "rgba(255,68,85,0.10)", redBord: "rgba(255,68,85,0.22)",
    orange: "#f0a030", orangeDim: "rgba(240,160,48,0.10)", orangeBord: "rgba(240,160,48,0.22)",
    purple: "#a080ff",
  },
  blanc: {
    name: "Blanc", desc: "Épuré et lumineux — clarté maximale",
    bg: "#f8f8f6", bgCard: "#ffffff", bgInner: "#f0f0ee",
    border: "#e0e0dc", borderHov: "#c8c8c4",
    text: "#111111", textMid: "#555555", textDim: "#999999", textGhost: "#cccccc",
    green: "#1a7a4a", greenDim: "rgba(26,122,74,0.08)", greenBord: "rgba(26,122,74,0.2)",
    red: "#cc2233", redDim: "rgba(204,34,51,0.08)", redBord: "rgba(204,34,51,0.2)",
    orange: "#c06010", orangeDim: "rgba(192,96,16,0.08)", orangeBord: "rgba(192,96,16,0.2)",
    purple: "#5040a0",
  },
};

export const getTheme = () => {
  try { return THEMES[localStorage.getItem("tj_theme") || "forest"] || THEMES.forest; }
  catch { return THEMES.forest; }
};

export const applyTheme = (themeIdOrObj) => {
  const theme = typeof themeIdOrObj === "string"
    ? (THEMES[themeIdOrObj] || THEMES.forest)
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
