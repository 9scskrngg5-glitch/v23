import { redirectToCheckout } from "../lib/stripe";
import { useState } from "react";

export const UpgradeModal = ({ onClose, reason }) => {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    await redirectToCheckout();
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, zIndex: 100, backdropFilter: "blur(6px)",
    }} onClick={onClose}>
      <div style={{
        width: "min(420px, 95vw)", background: "#0a0d18",
        border: "1px solid rgba(0,229,160,0.2)", borderRadius: 20,
        padding: 32,
      }} onClick={(e) => e.stopPropagation()}>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}></div>
          <h2 style={{
            fontSize: 22, fontWeight: 800, fontFamily: "'Syne', sans-serif",
            color: "#dde1f5", margin: "0 0 8px",
          }}>
            Passe en Pro
          </h2>
          <p style={{ fontSize: 13, color: "#4a5070", fontFamily: "'DM Mono', monospace", margin: 0 }}>
            {reason || "Débloque toutes les fonctionnalités"}
          </p>
        </div>

        {/* Features */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {[
            ["—", "Trades illimités", "#00e5a0"],
            ["—", "AI Coach personnalisé", "#00e5a0"],
            ["—", "Export PDF mensuel", "#00e5a0"],
            ["—", "Screenshots de trades", "#00e5a0"],
            ["—", "Stats avancées complètes", "#00e5a0"],
          ].map(([icon, label, color]) => (
            <div key={label} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ color, fontSize: 13, fontFamily: "'DM Mono', monospace" }}>{icon}</span>
              <span style={{ fontSize: 13, color: "#9099c0", fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Price */}
        <div style={{
          background: "rgba(0,229,160,0.05)", border: "1px solid rgba(0,229,160,0.15)",
          borderRadius: 12, padding: "14px 18px", marginBottom: 20, textAlign: "center",
        }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: "#00e5a0", fontFamily: "'Syne', sans-serif" }}>9$</span>
          <span style={{ fontSize: 13, color: "#4a5070", fontFamily: "'DM Mono', monospace" }}> / mois</span>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          style={{
            width: "100%", padding: "13px",
            borderRadius: 11, border: "none",
            background: loading ? "#0d1020" : "#00e5a0",
            color: loading ? "#3a4060" : "#000",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 14, fontWeight: 800,
            fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em",
            transition: "all 0.2s", marginBottom: 12,
          }}
        >
          {loading ? "Redirection…" : "Commencer →"}
        </button>

        <button onClick={onClose} style={{
          width: "100%", padding: "10px", borderRadius: 10,
          border: "1px solid #181b2e", background: "transparent",
          color: "#3a4060", cursor: "pointer", fontSize: 12,
          fontFamily: "'DM Mono', monospace",
        }}>
          Pas maintenant
        </button>
      </div>
    </div>
  );
};
