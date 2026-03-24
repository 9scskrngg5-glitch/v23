import { useState } from "react";
import { C, F, card } from "../lib/design";

const CHANGELOG = [
  {
    version: "v13.0", date: "2026-03", badge: "NOUVEAU",
    changes: [
      { type: "feat", text: "2FA — Authentification à deux facteurs" },
      { type: "feat", text: "Prédiction AI — Analyse prédictive basée sur tes patterns" },
      { type: "feat", text: "Benchmark — Compare tes performances vs BTC, S&P500, ETH" },
      { type: "feat", text: "Streak de journalisation — Garde ta série active chaque jour" },
      { type: "feat", text: "Mode Focus — Vue plein écran minimaliste pour trader" },
      { type: "feat", text: "Changelog in-app — Tu lis ça maintenant !" },
      { type: "feat", text: "Onboarding interactif — Guide pas à pas pour les nouveaux" },
      { type: "feat", text: "Calculateur de Kelly — Taille de position optimale" },
      { type: "feat", text: "Mode sombre/clair amélioré" },
    ],
  },
  {
    version: "v12.0", date: "2026-02", badge: null,
    changes: [
      { type: "feat", text: "Recherche globale ⌘K" },
      { type: "feat", text: "Analyse par heure et par setup" },
      { type: "feat", text: "Templates de trades" },
      { type: "feat", text: "Export CSV" },
      { type: "feat", text: "Notifications push (PWA)" },
    ],
  },
  {
    version: "v11.0", date: "2026-01", badge: null,
    changes: [
      { type: "feat", text: "Nouveau système de design" },
      { type: "fix", text: "Bug loading au rechargement — corrigé définitivement" },
      { type: "feat", text: "Sidebar redesignée" },
      { type: "feat", text: "Dashboard restructuré" },
    ],
  },
  {
    version: "v10.0", date: "2025-12", badge: null,
    changes: [
      { type: "feat", text: "Sidebar fixe à gauche — refonte UI complète" },
      { type: "feat", text: "Risk Manager avancé" },
      { type: "feat", text: "Journal de marché quotidien" },
      { type: "feat", text: "Review hebdomadaire guidée avec AI" },
    ],
  },
];

const TYPE_COLORS = { feat: C.green, fix: C.orange, break: C.red };
const TYPE_LABELS = { feat: "NEW", fix: "FIX", break: "BREAK" };

export const Changelog = ({ onClose }) => {
  const [open, setOpen] = useState(0);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20, backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div style={{ width: "min(560px, 100%)", maxHeight: "80vh", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", marginBottom: 4 }}>CHANGELOG</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: C.text, margin: 0, letterSpacing: "-0.02em" }}>
              Nouveautés
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 7, color: C.textDim, cursor: "pointer", fontSize: 13, padding: "7px 14px" }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ overflowY: "auto", padding: "16px 24px 24px" }}>
          {CHANGELOG.map((release, i) => (
            <div key={release.version} style={{ marginBottom: 16 }}>
              <button onClick={() => setOpen(open === i ? -1 : i)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                background: "none", border: "none", cursor: "pointer",
                padding: "10px 0", textAlign: "left",
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: F.mono }}>{release.version}</span>
                {release.badge && (
                  <span style={{ fontSize: 9, color: C.green, fontFamily: F.mono, letterSpacing: "0.1em", background: C.greenDim, border: `1px solid ${C.greenBord}`, borderRadius: 20, padding: "2px 8px" }}>
                    {release.badge}
                  </span>
                )}
                <span style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono, marginLeft: 4 }}>{release.date}</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: C.textDim, fontFamily: F.mono }}>{open === i ? "−" : "+"}</span>
              </button>

              {open === i && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingBottom: 8 }}>
                  {release.changes.map((c, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{
                        fontSize: 8, fontFamily: F.mono, letterSpacing: "0.1em",
                        padding: "2px 6px", borderRadius: 4, flexShrink: 0, marginTop: 2,
                        color: TYPE_COLORS[c.type],
                        background: `${TYPE_COLORS[c.type]}15`,
                        border: `1px solid ${TYPE_COLORS[c.type]}30`,
                      }}>{TYPE_LABELS[c.type]}</span>
                      <span style={{ fontSize: 13, color: C.textMid, lineHeight: 1.5 }}>{c.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {i < CHANGELOG.length - 1 && <div style={{ height: 1, background: C.border }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
