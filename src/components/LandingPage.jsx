import { useState } from "react";

const FEATURES = [
  { icon: "▦", title: "Dashboard temps réel", desc: "Win rate, PnL, drawdown, profit factor — tout en un coup d'oeil." },
  { icon: "∿", title: "Stats avancées", desc: "PnL par paire, par session, par jour de la semaine et par émotion." },
  { icon: "◈", title: "AI Coach", desc: "Analyse tes 20 derniers trades et identifie tes erreurs récurrentes." },
  { icon: "◻", title: "Monte Carlo", desc: "Simule 400 scénarios pour estimer ton risque de ruine réel." },
  { icon: "⬡", title: "Screenshots", desc: "Attache une image à chaque trade pour revoir tes setups." },
  { icon: "⊙", title: "Export PDF", desc: "Génère un rapport mensuel complet à partager ou garder." },
];

const PLANS = [
  {
    name: "Free",
    price: "0$",
    period: "",
    features: ["20 trades max", "Dashboard de base", "Courbe d'équité", "Import / Export JSON"],
    cta: "Commencer gratuitement",
    highlight: false,
  },
  {
    name: "Pro",
    price: "9$",
    period: "/mois",
    features: ["Trades illimités", "AI Coach", "Stats avancées", "Screenshots", "Export PDF", "Support prioritaire"],
    cta: "Démarrer en Pro",
    highlight: true,
  },
];

const FAQS = [
  { q: "Mes données sont-elles sécurisées ?", a: "Oui. Tes données sont stockées dans Supabase (infrastructure AWS), chiffrées au repos, et isolées par compte. Personne d'autre ne peut voir tes trades." },
  { q: "Puis-je annuler à tout moment ?", a: "Oui, sans engagement. Tu peux annuler depuis les paramètres de l'app. Tu gardes l'accès Pro jusqu'à la fin de ta période payée." },
  { q: "Quels brokers sont supportés ?", a: "L'app est broker-agnostique. Tu entres tes trades manuellement ou en important un JSON. Compatible avec tous les marchés : crypto, forex, actions, futures." },
  { q: "L'AI Coach utilise quoi comme modèle ?", a: "Claude Sonnet d'Anthropic — le même modèle utilisé par des milliers de professionnels." },
];

export const LandingPage = ({ onGetStarted }) => {
  const [openFaq, setOpenFaq] = useState(null);

  const mono = "'DM Mono', monospace";
  const syne = "'Syne', sans-serif";
  const sans = "'DM Sans', sans-serif";

  return (
    <div style={{ background: "#0b0e18", minHeight: "100dvh", color: "#e4e8f7", fontFamily: sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        @keyframes glow { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
      `}</style>

      {/* Nav */}
      <nav style={{
        borderBottom: "1px solid #0e1120", position: "sticky", top: 0,
        background: "rgba(6,8,15,0.95)", backdropFilter: "blur(12px)", zIndex: 50,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#22d49f", fontFamily: mono, letterSpacing: "0.15em" }}>
            TRADING JOURNAL
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={onGetStarted} style={{
              padding: "7px 16px", borderRadius: 6, border: "1px solid #13162a",
              background: "transparent", color: "#8b95be", cursor: "pointer",
              fontSize: 12, fontFamily: mono, letterSpacing: "0.06em",
            }}>
              CONNEXION
            </button>
            <button onClick={onGetStarted} style={{
              padding: "7px 16px", borderRadius: 6, border: "none",
              background: "#22d49f", color: "#000", cursor: "pointer",
              fontSize: 12, fontWeight: 700, fontFamily: mono, letterSpacing: "0.06em",
            }}>
              COMMENCER
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 60px", textAlign: "center" }}>
        <div className="fade-up" style={{
          display: "inline-block", padding: "7px 14px", borderRadius: 20,
          border: "1px solid rgba(0,229,160,0.2)", background: "rgba(0,229,160,0.05)",
          fontSize: 11, color: "#22d49f", fontFamily: mono, letterSpacing: "0.1em",
          marginBottom: 28,
        }}>
          JOURNAL DE TRADING — PROPULSÉ PAR L'IA
        </div>

        <h1 className="fade-up" style={{
          fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 800,
          fontFamily: syne, lineHeight: 1.05, letterSpacing: "-0.03em",
          marginBottom: 20, color: "#e4e8f7",
        }}>
          Arrête de trader<br />
          <span style={{ color: "#22d49f" }}>dans le flou.</span>
        </h1>

        <p className="fade-up" style={{
          fontSize: 17, color: "#4a5280", maxWidth: 520, margin: "0 auto 36px",
          lineHeight: 1.7, fontFamily: sans,
        }}>
          Journal de trading avec AI coaching, stats avancées et Monte Carlo.
          Identifie tes erreurs, améliore ta discipline, trade mieux.
        </p>

        <div className="fade-up" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onGetStarted} style={{
            padding: "13px 28px", borderRadius: 8, border: "none",
            background: "#22d49f", color: "#000", cursor: "pointer",
            fontSize: 13, fontWeight: 700, fontFamily: mono, letterSpacing: "0.06em",
          }}>
            COMMENCER GRATUITEMENT
          </button>
          <button onClick={onGetStarted} style={{
            padding: "13px 28px", borderRadius: 8,
            border: "1px solid #181b2e", background: "transparent",
            color: "#8b95be", cursor: "pointer",
            fontSize: 13, fontFamily: mono, letterSpacing: "0.06em",
          }}>
            VOIR LA DEMO
          </button>
        </div>

        <div style={{ marginTop: 18, fontSize: 11, color: "#252a45", fontFamily: mono }}>
          Gratuit pour toujours · Pas de carte de crédit requise
        </div>

        {/* Mock terminal */}
        <div style={{
          marginTop: 60, background: "#0f1222", border: "1px solid #13162a",
          borderRadius: 16, padding: "24px", textAlign: "left", maxWidth: 700, margin: "60px auto 0",
        }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <div style={{ fontFamily: mono, fontSize: 12, lineHeight: 2, color: "#4a5280" }}>
            <div><span style={{ color: "#22d49f" }}>$</span> trading-journal --stats</div>
            <div style={{ color: "#505878" }}>→ Win Rate: <span style={{ color: "#22d49f" }}>67.3%</span> · PnL: <span style={{ color: "#22d49f" }}>+2,847$</span> · Trades: 89</div>
            <div style={{ color: "#505878" }}>→ Profit Factor: <span style={{ color: "#22d49f" }}>2.14</span> · Max DD: <span style={{ color: "#f04770" }}>-340$</span></div>
            <div style={{ color: "#505878" }}>→ Best session: <span style={{ color: "#22d49f" }}>New York</span> · Worst day: <span style={{ color: "#f04770" }}>Monday</span></div>
            <div><span style={{ color: "#22d49f" }}>$</span> ai-coach --analyze<span style={{ animation: "glow 1s infinite" }}>_</span></div>
            <div style={{ color: "#505878", paddingLeft: 12, borderLeft: "2px solid rgba(0,229,160,0.2)" }}>
              "Tu revenge trade après 2 pertes consécutives. Ton win rate chute à 34% dans ce cas. Pause obligatoire après -2 trades."
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 10, color: "#4a5280", letterSpacing: "0.2em", fontFamily: mono, marginBottom: 12 }}>FONCTIONNALITÉS</div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, fontFamily: syne, letterSpacing: "-0.02em" }}>
            Tout ce dont tu as besoin.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{
              background: "#0f1222", border: "1px solid #0e1120",
              borderRadius: 14, padding: "22px",
              transition: "border-color 0.2s",
            }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#2a3058"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "#1c2040"}
            >
              <div style={{ fontSize: 22, color: "#22d49f", marginBottom: 12, fontFamily: mono }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#e4e8f7", marginBottom: 8, fontFamily: syne }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "#4a5280", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 10, color: "#4a5280", letterSpacing: "0.2em", fontFamily: mono, marginBottom: 12 }}>TARIFS</div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, fontFamily: syne, letterSpacing: "-0.02em" }}>
            Simple et transparent.
          </h2>
          <p style={{ fontSize: 14, color: "#4a5280", marginTop: 12, fontFamily: sans }}>
            Les concurrents facturent 30-80$/mois. Nous, 9$.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, maxWidth: 680, margin: "0 auto" }}>
          {PLANS.map((p) => (
            <div key={p.name} style={{
              background: p.highlight ? "linear-gradient(135deg, #080f18, #060a12)" : "#0f1222",
              border: p.highlight ? "1px solid rgba(0,229,160,0.25)" : "1px solid #0e1120",
              borderRadius: 16, padding: "28px 24px",
              position: "relative",
            }}>
              {p.highlight && (
                <div style={{
                  position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
                  background: "#22d49f", color: "#000", fontSize: 9, fontWeight: 700,
                  fontFamily: mono, letterSpacing: "0.1em", padding: "3px 12px", borderRadius: 20,
                }}>
                  POPULAIRE
                </div>
              )}
              <div style={{ fontSize: 11, color: p.highlight ? "#22d49f" : "#4a5280", fontFamily: mono, letterSpacing: "0.1em", marginBottom: 16 }}>
                {p.name.toUpperCase()}
              </div>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 40, fontWeight: 800, fontFamily: syne, color: "#e4e8f7" }}>{p.price}</span>
                <span style={{ fontSize: 13, color: "#4a5280", fontFamily: mono }}>{p.period}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {p.features.map((f) => (
                  <div key={f} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ color: "#22d49f", fontSize: 11, fontFamily: mono }}>+</span>
                    <span style={{ fontSize: 13, color: "#8b95be" }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={onGetStarted} style={{
                width: "100%", padding: "11px", borderRadius: 8,
                border: p.highlight ? "none" : "1px solid #181b2e",
                background: p.highlight ? "#22d49f" : "transparent",
                color: p.highlight ? "#000" : "#8b95be",
                cursor: "pointer", fontSize: 12, fontWeight: 700,
                fontFamily: mono, letterSpacing: "0.06em",
              }}>
                {p.cta.toUpperCase()}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 10, color: "#4a5280", letterSpacing: "0.2em", fontFamily: mono, marginBottom: 12 }}>FAQ</div>
          <h2 style={{ fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 800, fontFamily: syne, letterSpacing: "-0.02em" }}>
            Questions fréquentes
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{
              background: "#0f1222", border: "1px solid #0e1120",
              borderRadius: 12, overflow: "hidden",
            }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                width: "100%", padding: "16px 20px", background: "none", border: "none",
                cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                textAlign: "left",
              }}>
                <span style={{ fontSize: 14, color: "#e4e8f7", fontFamily: sans }}>{faq.q}</span>
                <span style={{ fontSize: 16, color: "#4a5280", fontFamily: mono, flexShrink: 0, marginLeft: 12 }}>
                  {openFaq === i ? "−" : "+"}
                </span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 20px 16px", fontSize: 13, color: "#4a5280", lineHeight: 1.7, fontFamily: sans }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA bottom */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px", textAlign: "center" }}>
        <div style={{
          background: "linear-gradient(135deg, #080f18, #060a12)",
          border: "1px solid rgba(0,229,160,0.15)", borderRadius: 20, padding: "48px 24px",
        }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 44px)", fontWeight: 800, fontFamily: syne, letterSpacing: "-0.02em", marginBottom: 16 }}>
            Prêt à trader mieux ?
          </h2>
          <p style={{ fontSize: 15, color: "#4a5280", marginBottom: 28 }}>
            Rejoins les traders qui utilisent la data pour progresser.
          </p>
          <button onClick={onGetStarted} style={{
            padding: "14px 32px", borderRadius: 8, border: "none",
            background: "#22d49f", color: "#000", cursor: "pointer",
            fontSize: 13, fontWeight: 700, fontFamily: mono, letterSpacing: "0.06em",
          }}>
            COMMENCER GRATUITEMENT
          </button>
          <div style={{ marginTop: 14, fontSize: 11, color: "#252a45", fontFamily: mono }}>
            Pas de carte de crédit · Annulation à tout moment
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #0e1120", padding: "20px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "#252a45", fontFamily: mono, letterSpacing: "0.08em" }}>
          TRADING JOURNAL — 2026 · Tous droits réservés
        </div>
      </div>
    </div>
  );
};
