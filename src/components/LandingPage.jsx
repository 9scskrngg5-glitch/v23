import { useState, useEffect, useRef } from "react";

const G = {
  bg: "#051F20", card: "#0B2B26", inner: "#163832",
  border: "#235347", borderHov: "#2e6b5e",
  text: "#DAF1DE", mid: "#8EB69B", dim: "#4a7a68", ghost: "#163832",
  green: "#8EB69B",
};

const FAQS = [
  { q: "Mes données sont-elles sécurisées ?", a: "Oui. Tes données sont stockées dans Supabase (infrastructure AWS), chiffrées au repos, et isolées par compte. Personne d'autre ne peut voir tes trades." },
  { q: "Puis-je annuler à tout moment ?", a: "Oui, sans engagement. Tu peux annuler depuis les paramètres de l'app. Tu gardes l'accès Pro jusqu'à la fin de ta période payée." },
  { q: "Quels brokers sont supportés ?", a: "L'app est broker-agnostique. Compatible avec tous les marchés : crypto, forex, actions, futures." },
  { q: "L'AI Coach utilise quoi comme modèle ?", a: "Claude Sonnet d'Anthropic — le même modèle utilisé par des milliers de professionnels." },
];

const FEATURES = [
  { icon: "▦", title: "Dashboard temps réel", desc: "Win rate, PnL, drawdown, profit factor — tout en 2 secondes." },
  { icon: "◈", title: "AI Coach", desc: "Analyse tes 20 derniers trades. Identifie tes erreurs récurrentes." },
  { icon: "∿", title: "Stats avancées", desc: "PnL par setup, par session, par émotion. Ton vrai edge." },
  { icon: "⊘", title: "Discipline tracker", desc: "Score de discipline par trade. Corrélation comportement ↔ argent." },
  { icon: "⏸", title: "Cooldown anti-revenge", desc: "Bloque le trading après X pertes. Protège ton capital." },
  { icon: "◻", title: "Monte Carlo", desc: "400 simulations de ta courbe. Connais ton risque de ruine réel." },
];

// Animated canvas background for hero
const HeroCanvas = () => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const pts = Array.from({length: 70}, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random()-0.5)*0.25, vy: (Math.random()-0.5)*0.25,
      r: Math.random()*1.5+0.3, a: Math.random()*0.4+0.05,
    }));
    let prog = 0;
    const curve = [[0.05,0.8],[0.15,0.72],[0.25,0.65],[0.32,0.7],[0.42,0.55],[0.52,0.45],[0.62,0.38],[0.72,0.28],[0.82,0.2],[0.92,0.14]];
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const W = canvas.width, H = canvas.height;
      // Grid
      ctx.strokeStyle = "rgba(35,83,71,0.25)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
      // Particles
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x<0||p.x>W) p.vx*=-1;
        if (p.y<0||p.y>H) p.vy*=-1;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(142,182,155,${p.a})`; ctx.fill();
      });
      // Connections
      for (let i=0;i<pts.length;i++) for (let j=i+1;j<pts.length;j++) {
        const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
        if (d<120) { ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.strokeStyle=`rgba(142,182,155,${0.06*(1-d/120)})`; ctx.lineWidth=0.4; ctx.stroke(); }
      }
      // Equity line
      prog = Math.min(prog+0.003, 1);
      const total = curve.length;
      const drawn = prog*(total-1);
      const fi = Math.floor(drawn);
      if (fi>0) {
        const grad = ctx.createLinearGradient(0,0,0,H);
        grad.addColorStop(0,"rgba(142,182,155,0.15)"); grad.addColorStop(1,"rgba(142,182,155,0)");
        ctx.beginPath(); ctx.moveTo(curve[0][0]*W,curve[0][1]*H);
        for (let i=1;i<=fi;i++) ctx.lineTo(curve[i][0]*W,curve[i][1]*H);
        if (fi<total-1) { const f=drawn-fi; ctx.lineTo((curve[fi][0]+(curve[fi+1][0]-curve[fi][0])*f)*W,(curve[fi][1]+(curve[fi+1][1]-curve[fi][1])*f)*H); }
        ctx.lineTo(curve[Math.min(fi,total-1)][0]*W,H); ctx.lineTo(curve[0][0]*W,H); ctx.closePath();
        ctx.fillStyle=grad; ctx.fill();
        ctx.beginPath(); ctx.moveTo(curve[0][0]*W,curve[0][1]*H);
        for (let i=1;i<=fi;i++) ctx.lineTo(curve[i][0]*W,curve[i][1]*H);
        let endX,endY;
        if (fi<total-1) { const f=drawn-fi; endX=(curve[fi][0]+(curve[fi+1][0]-curve[fi][0])*f)*W; endY=(curve[fi][1]+(curve[fi+1][1]-curve[fi][1])*f)*H; ctx.lineTo(endX,endY); }
        else { endX=curve[fi][0]*W; endY=curve[fi][1]*H; }
        ctx.strokeStyle="#8EB69B"; ctx.lineWidth=2; ctx.lineJoin="round"; ctx.stroke();
        // Dot
        ctx.beginPath(); ctx.arc(endX,endY,4,0,Math.PI*2); ctx.fillStyle="#DAF1DE"; ctx.fill();
        ctx.beginPath(); ctx.arc(endX,endY,9,0,Math.PI*2); ctx.fillStyle="rgba(142,182,155,0.2)"; ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  }, []);
  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}/>;
};

// Scroll reveal hook
const useReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

const RevealSection = ({ children, delay = "0s" }) => {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{ opacity: visible?1:0, transform: visible?"none":"translateY(30px)", transition: `opacity 0.7s ease ${delay}, transform 0.7s ease ${delay}` }}>
      {children}
    </div>
  );
};

export const LandingPage = ({ onGetStarted }) => {
  const [openFaq, setOpenFaq] = useState(null);
  const mono = "'DM Mono', monospace";
  const syne = "'Syne', sans-serif";
  const sans = "'DM Sans', sans-serif";

  return (
    <div style={{ background: G.bg, minHeight: "100dvh", color: G.text, fontFamily: sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
        @keyframes shimmer{0%,100%{opacity:0.5}50%{opacity:1}}
        .fu{animation:fadeUp 0.7s ease forwards}
        .fu1{animation:fadeUp 0.7s ease 0.1s forwards;opacity:0}
        .fu2{animation:fadeUp 0.7s ease 0.2s forwards;opacity:0}
        .fu3{animation:fadeUp 0.7s ease 0.35s forwards;opacity:0}
        button{cursor:pointer}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#235347;border-radius:4px}
      `}</style>

      {/* NAV */}
      <nav style={{ borderBottom: `1px solid ${G.border}`, position: "sticky", top: 0, background: "rgba(5,31,32,0.92)", backdropFilter: "blur(16px)", zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: G.mid, fontFamily: mono, letterSpacing: "0.18em" }}>LOG-PIP</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onGetStarted} style={{ padding: "7px 16px", borderRadius: 7, border: `1px solid ${G.border}`, background: "transparent", color: G.dim, fontSize: 12, fontFamily: mono, letterSpacing: "0.06em", transition: "all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.color=G.mid;e.currentTarget.style.borderColor=G.borderHov;}}
              onMouseLeave={e=>{e.currentTarget.style.color=G.dim;e.currentTarget.style.borderColor=G.border;}}>CONNEXION</button>
            <button onClick={onGetStarted} style={{ padding: "7px 16px", borderRadius: 7, border: "none", background: G.green, color: G.bg, fontSize: 12, fontWeight: 700, fontFamily: mono, letterSpacing: "0.06em", transition: "opacity 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.opacity="0.85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>COMMENCER</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position: "relative", minHeight: "92vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <HeroCanvas />
        {/* radial vignette */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 40%, #051F20 90%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 24px", maxWidth: 800 }}>
          <div className="fu" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, border: `1px solid rgba(142,182,155,0.25)`, background: "rgba(142,182,155,0.06)", fontSize: 10, color: G.mid, fontFamily: mono, letterSpacing: "0.14em", marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: G.mid, display: "inline-block", animation: "shimmer 2s ease infinite" }} />
            JOURNAL DE TRADING — PROPULSÉ PAR L'IA
          </div>

          <h1 className="fu1" style={{ fontSize: "clamp(38px, 7vw, 78px)", fontWeight: 800, fontFamily: syne, lineHeight: 1.02, letterSpacing: "-0.03em", marginBottom: 22, color: G.text }}>
            Arrête de trader<br />
            <span style={{ color: G.mid }}>dans le flou.</span>
          </h1>

          <p className="fu2" style={{ fontSize: 16, color: G.dim, maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.75, fontFamily: sans }}>
            Journal de trading avec AI coaching, stats avancées et discipline tracker. Identifie tes erreurs. Trade mieux.
          </p>

          <div className="fu3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={onGetStarted} style={{ padding: "14px 30px", borderRadius: 10, border: "none", background: G.green, color: G.bg, fontSize: 13, fontWeight: 700, fontFamily: mono, letterSpacing: "0.06em", transition: "all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.opacity="0.88";e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="none";}}>
              COMMENCER GRATUITEMENT →
            </button>
            <button onClick={onGetStarted} style={{ padding: "14px 30px", borderRadius: 10, border: `1px solid ${G.border}`, background: "transparent", color: G.mid, fontSize: 13, fontFamily: mono, letterSpacing: "0.06em", transition: "all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=G.borderHov;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;}}>
              VOIR LES TARIFS
            </button>
          </div>

          {/* Social proof */}
          <div className="fu3" style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 52, flexWrap: "wrap" }}>
            {[["68%", "Win rate moyen"], ["+$47", "Expectancy/trade"], ["400×", "Simulations MC"]].map(([v,l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: syne, color: G.mid, letterSpacing: "-0.02em" }}>{v}</div>
                <div style={{ fontSize: 9, color: G.dim, fontFamily: mono, letterSpacing: "0.12em", marginTop: 3 }}>{l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }}>
        <RevealSection>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 10, color: G.dim, letterSpacing: "0.2em", fontFamily: mono, marginBottom: 12 }}>FONCTIONNALITÉS</div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 42px)", fontWeight: 800, fontFamily: syne, letterSpacing: "-0.02em", color: G.text }}>Tout ce dont tu as besoin.</h2>
          </div>
        </RevealSection>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {FEATURES.map((f, i) => (
            <RevealSection key={f.title} delay={`${i * 0.08}s`}>
              <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: "22px 24px", transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=G.borderHov;e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 12px 32px rgba(0,0,0,0.3)`;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
                <div style={{ fontSize: 18, color: G.mid, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: G.text, fontFamily: sans, marginBottom: 7 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: G.dim, fontFamily: mono, lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>

      {/* PRICING */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }}>
        <RevealSection>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 10, color: G.dim, letterSpacing: "0.2em", fontFamily: mono, marginBottom: 12 }}>TARIFS</div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 42px)", fontWeight: 800, fontFamily: syne, letterSpacing: "-0.02em", color: G.text }}>Simple et transparent.</h2>
            <p style={{ fontSize: 14, color: G.dim, marginTop: 12, fontFamily: sans }}>Les concurrents facturent 30–80$/mois. Nous, 9$.</p>
          </div>
        </RevealSection>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, maxWidth: 680, margin: "0 auto" }}>
          {/* Free */}
          <RevealSection delay="0.1s">
            <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 20, padding: "28px 24px", height: "100%" }}>
              <div style={{ fontSize: 10, color: G.dim, fontFamily: mono, letterSpacing: "0.14em", marginBottom: 16 }}>FREE</div>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 44, fontWeight: 800, fontFamily: syne, color: G.text, letterSpacing: "-0.03em" }}>0$</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {["20 trades max", "Dashboard de base", "Courbe d'équité", "Import / Export JSON"].map(f => (
                  <div key={f} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ color: G.dim, fontSize: 10 }}>+</span>
                    <span style={{ fontSize: 13, color: G.dim, fontFamily: sans }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={onGetStarted} style={{ width: "100%", padding: "11px", borderRadius: 10, border: `1px solid ${G.border}`, background: "transparent", color: G.mid, fontSize: 12, fontWeight: 700, fontFamily: mono, letterSpacing: "0.06em", transition: "all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(142,182,155,0.08)";}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
                COMMENCER
              </button>
            </div>
          </RevealSection>

          {/* Pro */}
          <RevealSection delay="0.2s">
            <div style={{ background: "linear-gradient(160deg, #163832, #0B2B26)", border: "1px solid rgba(142,182,155,0.35)", borderRadius: 20, padding: "28px 24px", position: "relative", height: "100%", boxShadow: "0 0 60px rgba(142,182,155,0.06)" }}>
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: G.green, color: G.bg, fontSize: 9, fontWeight: 700, fontFamily: mono, letterSpacing: "0.14em", padding: "4px 14px", borderRadius: 20, whiteSpace: "nowrap" }}>POPULAIRE</div>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(142,182,155,0.5), transparent)", borderRadius: "20px 20px 0 0" }} />
              <div style={{ fontSize: 10, color: G.mid, fontFamily: mono, letterSpacing: "0.14em", marginBottom: 16 }}>PRO</div>
              <div style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 44, fontWeight: 800, fontFamily: syne, color: G.text, letterSpacing: "-0.03em" }}>9$</span>
                <span style={{ fontSize: 13, color: G.dim, fontFamily: mono }}> /mois</span>
              </div>
              <div style={{ fontSize: 11, color: G.dim, fontFamily: mono, marginBottom: 24 }}>Sans engagement · Annulable à tout moment</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {["Trades illimités", "AI Coach personnalisé", "Stats avancées complètes", "Screenshots de trades", "Export PDF mensuel", "Cooldown anti-revenge", "Support prioritaire"].map(f => (
                  <div key={f} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ color: G.mid, fontSize: 11 }}>✓</span>
                    <span style={{ fontSize: 13, color: G.text, fontFamily: sans }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={onGetStarted} style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: G.green, color: G.bg, fontSize: 12, fontWeight: 800, fontFamily: mono, letterSpacing: "0.06em", transition: "all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.opacity="0.88";e.currentTarget.style.transform="translateY(-2px)";}} onMouseLeave={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="none";}}>
                DÉMARRER EN PRO →
              </button>
            </div>
          </RevealSection>
        </div>

        <RevealSection delay="0.3s">
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <span style={{ fontSize: 12, color: G.dim, fontFamily: mono }}>Bientôt : plan annuel à <span style={{ color: G.mid }}>79$/an</span> — 2 mois offerts.</span>
          </div>
        </RevealSection>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "80px 24px" }}>
        <RevealSection>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={{ fontSize: 10, color: G.dim, letterSpacing: "0.2em", fontFamily: mono, marginBottom: 12 }}>FAQ</div>
            <h2 style={{ fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 800, fontFamily: syne, letterSpacing: "-0.02em", color: G.text }}>Questions fréquentes</h2>
          </div>
        </RevealSection>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FAQS.map((faq, i) => (
            <RevealSection key={i} delay={`${i * 0.08}s`}>
              <div style={{ background: G.card, border: `1px solid ${openFaq===i?G.borderHov:G.border}`, borderRadius: 13, overflow: "hidden", transition: "border-color 0.2s" }}>
                <button onClick={() => setOpenFaq(openFaq===i?null:i)} style={{ width: "100%", padding: "17px 22px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: G.text, fontFamily: sans }}>{faq.q}</span>
                  <span style={{ fontSize: 16, color: G.mid, transform: openFaq===i?"rotate(45deg)":"none", transition: "transform 0.2s", flexShrink: 0, marginLeft: 12 }}>+</span>
                </button>
                {openFaq===i && (
                  <div style={{ padding: "0 22px 18px", fontSize: 13, color: G.dim, fontFamily: mono, lineHeight: 1.75, borderTop: `1px solid ${G.border}`, paddingTop: 14 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            </RevealSection>
          ))}
        </div>
      </div>

      {/* FOOTER CTA */}
      <RevealSection>
        <div style={{ borderTop: `1px solid ${G.border}`, padding: "80px 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 48px)", fontWeight: 800, fontFamily: syne, letterSpacing: "-0.03em", color: G.text, marginBottom: 16 }}>
            Prêt à trader mieux ?
          </h2>
          <p style={{ fontSize: 14, color: G.dim, marginBottom: 32, fontFamily: sans }}>Gratuit pour commencer. Pas de carte de crédit.</p>
          <button onClick={onGetStarted} style={{ padding: "15px 36px", borderRadius: 12, border: "none", background: G.green, color: G.bg, fontSize: 14, fontWeight: 800, fontFamily: mono, letterSpacing: "0.06em", transition: "all 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.opacity="0.88";e.currentTarget.style.transform="translateY(-2px)";}} onMouseLeave={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="none";}}>
            COMMENCER GRATUITEMENT →
          </button>
          <div style={{ marginTop: 48, fontSize: 11, color: G.ghost, fontFamily: mono, letterSpacing: "0.1em" }}>LOG-PIP © 2025</div>
        </div>
      </RevealSection>
    </div>
  );
};
