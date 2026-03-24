import { useState } from "react";

const STEPS = [
  {
    id: 1,
    title: "Bienvenue dans Trading Journal",
    desc: "En 3 étapes, tu vas configurer ton journal et ajouter ton premier trade.",
    action: "Commencer",
  },
  {
    id: 2,
    title: "Ajoute ton premier trade",
    desc: "Va dans l'onglet Trades et clique sur + Nouveau trade. Remplis au minimum : paire, entrée, SL, TP et résultat.",
    action: "J'ai compris",
  },
  {
    id: 3,
    title: "Consulte ton Dashboard",
    desc: "Après 3 trades fermés, l'AI Coach devient disponible. Il analyse tes patterns et t'identifie tes erreurs récurrentes.",
    action: "Commencer à trader",
  },
];

export const Onboarding = ({ onDone }) => {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const mono = "'DM Mono', monospace";
  const syne = "'Syne', sans-serif";

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, zIndex: 200, backdropFilter: "blur(8px)",
    }}>
      <div style={{
        width: "min(460px, 95vw)", background: "#0a0d18",
        border: "1px solid rgba(0,229,160,0.2)", borderRadius: 20, padding: 36,
        textAlign: "center",
      }}>
        {/* Step dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 20 : 6, height: 6, borderRadius: 3,
              background: i <= step ? "#00e5a0" : "#13162a",
              transition: "all 0.3s",
            }} />
          ))}
        </div>

        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", fontSize: 22, color: "#00e5a0", fontFamily: mono,
        }}>
          {step === 0 ? "▦" : step === 1 ? "≡" : "∿"}
        </div>

        <div style={{ fontSize: 10, color: "#3a4060", fontFamily: mono, letterSpacing: "0.15em", marginBottom: 10 }}>
          ÉTAPE {current.id} / {STEPS.length}
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: syne, color: "#dde1f5", marginBottom: 14, letterSpacing: "-0.02em" }}>
          {current.title}
        </h2>

        <p style={{ fontSize: 14, color: "#4a5070", lineHeight: 1.7, marginBottom: 28, fontFamily: "'DM Sans', sans-serif" }}>
          {current.desc}
        </p>

        <button
          onClick={() => step < STEPS.length - 1 ? setStep(step + 1) : onDone()}
          style={{
            width: "100%", padding: "13px", borderRadius: 9,
            border: "none", background: "#00e5a0", color: "#000",
            cursor: "pointer", fontSize: 12, fontWeight: 700,
            fontFamily: mono, letterSpacing: "0.08em",
          }}
        >
          {current.action.toUpperCase()}
        </button>

        {step > 0 && (
          <button onClick={onDone} style={{
            marginTop: 12, background: "none", border: "none",
            color: "#1e2235", cursor: "pointer", fontSize: 11,
            fontFamily: mono, letterSpacing: "0.06em",
          }}>
            Passer
          </button>
        )}
      </div>
    </div>
  );
};
