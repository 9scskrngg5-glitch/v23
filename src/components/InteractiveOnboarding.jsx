import { useState } from "react";
import { C, F } from "../lib/design";

const STEPS = [
  {
    id: "welcome",
    title: "Bienvenue dans Trading Journal",
    desc: "L'outil ultime pour améliorer tes performances. On te guide en 4 étapes.",
    icon: "▦",
    action: "Commencer →",
  },
  {
    id: "first_trade",
    title: "Ajoute ton premier trade",
    desc: "Va dans Trades → clique sur + Nouveau Trade. Remplis au minimum la paire, l'entrée, SL, TP et le résultat.",
    icon: "≡",
    action: "J'ai compris →",
    tip: "💡 Astuce : utilise des templates pour tes setups favoris !",
  },
  {
    id: "dashboard",
    title: "Découvre le Dashboard",
    desc: "Après 3 trades, tes stats apparaissent. Score de discipline, win rate, courbe d'équité, et bien plus.",
    icon: "∿",
    action: "Super →",
    tip: "💡 Astuce : appuie sur D pour revenir au Dashboard depuis n'importe où.",
  },
  {
    id: "ai",
    title: "Active le AI Coach",
    desc: "Après 3 trades fermés, l'AI Coach analyse tes patterns et t'identifie tes erreurs récurrentes.",
    icon: "◈",
    action: "Commencer à trader →",
    tip: "💡 Astuce : utilise ⌘K pour chercher n'importe quel trade ou page.",
  },
];

export const InteractiveOnboarding = ({ onDone }) => {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(2,3,8,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 500, backdropFilter: "blur(10px)" }}>
      <div style={{ width: "min(480px, 95vw)", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 20, padding: 36, textAlign: "center" }}>

        {/* Progress */}
        <div style={{ display: "flex", justifyContent: "center", gap: 7, marginBottom: 32 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ height: 4, borderRadius: 2, background: i <= step ? C.green : C.bgInner, width: i === step ? 28 : 10, transition: "all 0.3s" }} />
          ))}
        </div>

        {/* Icon */}
        <div style={{ width: 64, height: 64, borderRadius: 16, background: C.greenDim, border: `1px solid ${C.greenBord}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 26, color: C.green, fontFamily: F.mono }}>
          {current.icon}
        </div>

        {/* Step indicator */}
        <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.15em", marginBottom: 10 }}>
          ÉTAPE {step + 1} / {STEPS.length}
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: C.text, marginBottom: 14, letterSpacing: "-0.02em" }}>
          {current.title}
        </h2>

        <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.7, marginBottom: current.tip ? 14 : 28, fontFamily: F.sans }}>
          {current.desc}
        </p>

        {current.tip && (
          <div style={{ background: C.bgInner, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", marginBottom: 24, fontSize: 12, color: C.textDim, fontFamily: F.mono, textAlign: "left" }}>
            {current.tip}
          </div>
        )}

        <button onClick={() => isLast ? onDone() : setStep(s => s + 1)} style={{
          width: "100%", padding: "13px", borderRadius: 10, border: "none",
          background: C.green, color: "#000", cursor: "pointer",
          fontSize: 13, fontWeight: 700, fontFamily: F.mono, letterSpacing: "0.08em",
          transition: "opacity 0.2s", marginBottom: 12,
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          {current.action.toUpperCase()}
        </button>

        {step > 0 && (
          <button onClick={onDone} style={{ background: "none", border: "none", color: C.textGhost, cursor: "pointer", fontSize: 11, fontFamily: F.mono }}>
            Passer l'intro
          </button>
        )}
      </div>
    </div>
  );
};
