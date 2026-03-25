import { redirectToCheckout } from "../lib/stripe";
import { useState } from "react";
import { C, F } from "../lib/design";

const FEATURES = [
  { icon: "∞", label: "Trades illimités", sub: "Sans aucune restriction" },
  { icon: "◈", label: "AI Coach personnalisé", sub: "Analyse tes 20 derniers trades" },
  { icon: "⊙", label: "Export PDF mensuel", sub: "Rapports professionnels" },
  { icon: "⬡", label: "Screenshots de trades", sub: "Revois tes setups" },
  { icon: "∿", label: "Stats avancées", sub: "Patterns, corrélations, Monte Carlo" },
  { icon: "⏸", label: "Cooldown anti-revenge", sub: "Protège ton capital" },
];

export const UpgradeModal = ({ onClose, reason }) => {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    await redirectToCheckout();
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, zIndex: 100, backdropFilter: "blur(8px)",
      animation: "fadeIn 0.15s ease forwards",
    }} onClick={onClose}>
      <div style={{
        width: "min(480px, 95vw)", background: C.bgCard,
        border: `1px solid ${C.greenBord}`,
        borderRadius: 22, overflow: "hidden",
        animation: "scaleIn 0.2s ease forwards",
        boxShadow: `0 0 80px ${C.greenDim}`,
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${C.bgInner}, ${C.bgCard})`,
          borderBottom: `1px solid ${C.border}`,
          padding: "28px 28px 24px",
          textAlign: "center", position: "relative",
        }}>
          <button onClick={onClose} style={{
            position: "absolute", top: 16, right: 16,
            background: "none", border: "none", color: C.textDim,
            cursor: "pointer", fontSize: 18, padding: "2px 6px", borderRadius: 6,
            transition: "color 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.color = C.textMid}
            onMouseLeave={e => e.currentTarget.style.color = C.textDim}>×</button>

          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.greenDim, border: `1px solid ${C.greenBord}`, borderRadius: 20, padding: "4px 12px", marginBottom: 14 }}>
            <span style={{ fontSize: 8, color: C.green, fontFamily: F.mono, letterSpacing: "0.18em" }}>PRO</span>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: C.text, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            Passe en Pro
          </h2>
          <p style={{ fontSize: 13, color: C.textDim, fontFamily: F.mono, margin: 0, lineHeight: 1.6 }}>
            {reason || "Débloque toutes les fonctionnalités de Log-pip"}
          </p>
        </div>

        {/* Features grid */}
        <div style={{ padding: "20px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {FEATURES.map(f => (
            <div key={f.label} style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              padding: "10px 12px", background: C.bgInner,
              borderRadius: 10, border: `1px solid ${C.border}`,
              transition: "border-color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHov}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              <span style={{ fontSize: 14, color: C.green, flexShrink: 0, marginTop: 1 }}>{f.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: C.text, fontFamily: F.sans, lineHeight: 1.3 }}>{f.label}</div>
                <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, marginTop: 2 }}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing + CTA */}
        <div style={{ padding: "0 28px 28px" }}>
          <div style={{
            background: C.greenDim, border: `1px solid ${C.greenBord}`,
            borderRadius: 14, padding: "16px 20px", marginBottom: 14,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: 11, color: C.green, fontFamily: F.mono, letterSpacing: "0.1em", marginBottom: 2 }}>PLAN PRO</div>
              <div style={{ fontSize: 12, color: C.textDim, fontFamily: F.mono }}>Sans engagement · Annulable à tout moment</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: C.green, fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}>9$</span>
              <span style={{ fontSize: 12, color: C.textDim, fontFamily: F.mono }}> /mois</span>
            </div>
          </div>

          <button onClick={handleUpgrade} disabled={loading} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: loading ? C.bgInner : C.green,
            color: loading ? C.textDim : "#000",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 13, fontWeight: 800, fontFamily: F.mono, letterSpacing: "0.08em",
            transition: "all 0.15s", marginBottom: 10,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}>
            {loading && <div style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #000", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />}
            {loading ? "Redirection…" : "COMMENCER EN PRO →"}
          </button>

          <button onClick={onClose} style={{
            width: "100%", padding: "10px", borderRadius: 10,
            border: `1px solid ${C.border}`, background: "transparent",
            color: C.textDim, cursor: "pointer", fontSize: 12, fontFamily: F.mono,
            transition: "color 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.color = C.textMid}
            onMouseLeave={e => e.currentTarget.style.color = C.textDim}>
            Pas maintenant
          </button>
        </div>
      </div>
    </div>
  );
};
