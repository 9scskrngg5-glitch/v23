import { useState, useEffect, useRef } from "react";
import { C, F } from "../lib/design";
import { supabase } from "../lib/supabase";

const G = {
  bg: "#051F20", card: "#0B2B26", inner: "#163832",
  border: "#235347", borderHov: "#2e6b5e",
  text: "#DAF1DE", mid: "#8EB69B", dim: "#4a7a68", ghost: "#235347",
  green: "#8EB69B", greenDim: "rgba(142,182,155,0.12)", greenBord: "rgba(142,182,155,0.25)",
  red: C.red,
};

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" style={{flexShrink:0}}>
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.09 17.64 11.78 17.64 9.2z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

// Deep futuristic pixel animation — rising pixel dust + light beam
const AnimatedBg = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; init(); };
    window.addEventListener("resize", resize);

    let pixels = [];

    const init = () => {
      const W = canvas.width, H = canvas.height;
      pixels = Array.from({ length: 200 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vy: -(Math.random() * 0.35 + 0.08),
        vx: (Math.random() - 0.5) * 0.12,
        size: Math.random() < 0.72 ? 1 : Math.random() < 0.92 ? 2 : 3,
        alpha: Math.random() * 0.6 + 0.08,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.035 + 0.008,
      }));
    };

    resize();

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // ── Grid (very subtle) ──
      ctx.strokeStyle = "rgba(35,83,71,0.15)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // ── Pixel dust ──
      pixels.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        if (p.y < -10) { p.y = H + 5; p.x = Math.random() * W; }
        if (p.x < -5 || p.x > W + 5) p.vx *= -1;

        p.twinkle += p.twinkleSpeed;
        const finalAlpha = p.alpha * (0.4 + 0.6 * Math.abs(Math.sin(p.twinkle)));

        ctx.fillStyle = `rgba(142,182,155,${finalAlpha})`;

        if (p.size === 1) {
          ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
        } else if (p.size === 2) {
          ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
          ctx.fillStyle = `rgba(142,182,155,${finalAlpha * 0.4})`;
          ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y), 4, 1);
          ctx.fillRect(Math.round(p.x), Math.round(p.y) - 1, 1, 4);
        } else {
          ctx.fillRect(Math.round(p.x), Math.round(p.y), 3, 3);
          ctx.fillStyle = `rgba(142,182,155,${finalAlpha * 0.3})`;
          ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y) + 1, 5, 1);
          ctx.fillRect(Math.round(p.x) + 1, Math.round(p.y) - 1, 1, 5);
        }
      });

      // ── Bottom fog ──
      const fogGrad = ctx.createLinearGradient(0, H * 0.75, 0, H);
      fogGrad.addColorStop(0, "rgba(5,31,32,0)");
      fogGrad.addColorStop(1, "rgba(5,31,32,0.6)");
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, H * 0.75, W, H * 0.25);

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
};

// Floating stat card
const StatFloat = ({ label, value, color = "#8EB69B", delay = "0s", top, left, right, bottom }) => (
  <div style={{
    position: "absolute", top, left, right, bottom,
    background: "rgba(11,43,38,0.85)", backdropFilter: "blur(12px)",
    border: "1px solid rgba(142,182,155,0.2)", borderRadius: 12,
    padding: "10px 14px", animation: `floatY 4s ease-in-out infinite`,
    animationDelay: delay, zIndex: 2,
  }}>
    <div style={{fontSize:8, color: G.dim, fontFamily:"'DM Mono',monospace", letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:2}}>{label}</div>
    <div style={{fontSize:16, fontWeight:800, fontFamily:"'Syne',sans-serif", color, letterSpacing:"-0.02em"}}>{value}</div>
  </div>
);

export const AuthScreen = ({ onSignIn, onSignUp, onSignInWithGoogle }) => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const reset = () => { setError(""); setSuccess(""); };

  const handleSubmit = async () => {
    reset();
    if (!email.trim()) { setError("Email requis."); return; }
    if (mode !== "forgot" && password.length < 6) { setError("Minimum 6 caractères."); return; }
    setLoading(true);
    if (mode === "forgot") {
      if (!supabase) { setError("Backend non configuré"); setLoading(false); return; }
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
      if (error) setError(error.message); else setSuccess("Email envoyé !");
    } else if (mode === "login") {
      const { error } = await onSignIn(email.trim(), password, rememberMe);
      if (error) setError(error);
    } else {
      const { error } = await onSignUp(email.trim(), password);
      if (error) setError(error); else setSuccess("Compte créé ! Vérifie ton email.");
    }
    setLoading(false);
  };

  const inp = { background: G.inner, border: `1px solid ${G.border}`, color: G.text, padding: "11px 14px", borderRadius: 9, width: "100%", fontSize: 13, fontFamily: "'DM Mono',monospace", outline: "none", transition: "all 0.15s" };

  return (
    <div style={{background: G.bg, minHeight:"100dvh", display:"flex", alignItems:"stretch", fontFamily:"'DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box}
        @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulseRing{0%{transform:scale(1);opacity:0.6}100%{transform:scale(2);opacity:0}}
        .af{animation:fadeIn 0.3s ease forwards}
        input:focus{border-color:#8EB69B !important;box-shadow:0 0 0 3px rgba(142,182,155,0.12) !important}
        @media(max-width:768px){.al{display:none!important}.ar{width:100%!important}}
      `}</style>

      {/* LEFT — animated illustration */}
      <div className="al" style={{width:"50%",position:"relative",overflow:"hidden",background:"#061e1f"}}>
        <AnimatedBg />

        {/* Overlay gradient */}
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 50%, rgba(142,182,155,0.04) 0%, transparent 70%)",zIndex:1}}/>

        {/* Logo */}
        <div style={{position:"absolute",top:28,left:32,zIndex:3,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:8,background:"rgba(142,182,155,0.12)",border:"1px solid rgba(142,182,155,0.25)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:11,color:"#8EB69B",fontFamily:"'DM Mono',monospace",fontWeight:700}}>LP</span>
          </div>
          <span style={{fontSize:12,color:"#DAF1DE",fontFamily:"'DM Mono',monospace",letterSpacing:"0.14em"}}>LOG-PIP</span>
        </div>

        {/* Floating stat cards */}
        <StatFloat label="Win Rate" value="68.4%" top="18%" left="8%" delay="0s" />
        <StatFloat label="PnL Total" value="+$2,840" color="#DAF1DE" top="18%" right="8%" delay="1.2s" />
        <StatFloat label="Expectancy" value="+$47.2" top="42%" left="12%" delay="0.6s" />
        <StatFloat label="Drawdown" value="-$340" color={C.red} top="42%" right="10%" delay="1.8s" />

        {/* Bottom — title + 3 steps */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:3,padding:"0 28px 32px"}}>
          <div style={{marginBottom:20}}>
            <h2 style={{fontSize:24,fontWeight:800,fontFamily:"'Syne',sans-serif",color:"#DAF1DE",margin:"0 0 6px",letterSpacing:"-0.02em",lineHeight:1.1}}>
              Commence à trader<br/>avec discipline.
            </h2>
            <p style={{fontSize:11,color:"#4a7a68",fontFamily:"'DM Mono',monospace",lineHeight:1.6,margin:0}}>
              3 étapes pour démarrer.
            </p>
          </div>

          {/* Steps */}
          <div style={{display:"flex",gap:8}}>
            {[
              {n:"1", title:"Crée ton compte", active:true},
              {n:"2", title:"Ajoute tes trades", active:false},
              {n:"3", title:"Analyse ton edge", active:false},
            ].map((s) => (
              <div key={s.n} style={{
                flex:1, padding:"12px 12px 14px",
                background: s.active ? "rgba(218,241,222,0.95)" : "rgba(22,56,50,0.7)",
                border: s.active ? "none" : "1px solid rgba(35,83,71,0.6)",
                borderRadius:12,
                backdropFilter:"blur(8px)",
                transition:"all 0.2s",
              }}>
                <div style={{
                  width:20,height:20,borderRadius:"50%",
                  background: s.active ? "#051F20" : "rgba(142,182,155,0.2)",
                  border: s.active ? "none" : "1px solid rgba(142,182,155,0.3)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:10,fontWeight:700,
                  color: s.active ? "#DAF1DE" : "#4a7a68",
                  fontFamily:"'DM Mono',monospace",
                  marginBottom:10,
                }}>{s.n}</div>
                <div style={{
                  fontSize:11,fontWeight:600,
                  color: s.active ? "#051F20" : "#8EB69B",
                  fontFamily:"'DM Sans',sans-serif",
                  lineHeight:1.3,
                }}>{s.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="ar af" style={{width:"50%",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 24px",background:G.bg}}>
        <div style={{width:"min(380px,100%)"}}>

          {/* Title */}
          <div style={{marginBottom:28}}>
            <h1 style={{fontSize:26,fontWeight:800,fontFamily:"'Syne',sans-serif",color:G.text,margin:"0 0 6px",letterSpacing:"-0.02em"}}>
              {mode === "login" ? "Bon retour." : mode === "signup" ? "Commence ici." : "Mot de passe oublié"}
            </h1>
            <p style={{fontSize:12,color:G.dim,fontFamily:"'DM Mono',monospace",margin:0}}>
              {mode === "login" ? "Content de te revoir sur Log-pip." : mode === "signup" ? "Analyse ton trading. Améliore ta discipline." : "On t'envoie un lien de réinitialisation."}
            </p>
          </div>

          {/* Card */}
          <div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:18,padding:26}}>

            {/* Google */}
            {mode !== "forgot" && (
              <>
                <button onClick={async()=>{reset();setOauthLoading(true);const{error}=await onSignInWithGoogle();if(error){setError(error);setOauthLoading(false);}}}
                  disabled={oauthLoading}
                  style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"11px 16px",borderRadius:10,border:`1px solid ${G.border}`,background:G.inner,color:G.text,cursor:oauthLoading?"not-allowed":"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif",fontWeight:500,transition:"all 0.15s",opacity:oauthLoading?0.5:1}}
                  onMouseEnter={e=>{if(!oauthLoading){e.currentTarget.style.borderColor=G.borderHov;e.currentTarget.style.background=G.bg;}}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.background=G.inner;}}>
                  <GoogleIcon/><span>Continuer avec Google</span>
                </button>
                <div style={{display:"flex",alignItems:"center",gap:12,margin:"18px 0"}}>
                  <div style={{flex:1,height:1,background:G.border}}/>
                  <span style={{fontSize:10,color:G.dim,fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>ou avec un email</span>
                  <div style={{flex:1,height:1,background:G.border}}/>
                </div>
              </>
            )}

            {/* Fields */}
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              <div>
                <label style={{fontSize:9,color:G.dim,display:"block",marginBottom:5,fontFamily:"'DM Mono',monospace",letterSpacing:"0.14em",textTransform:"uppercase"}}>Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="ton@email.com" autoComplete="email" style={inp} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
              </div>
              {mode !== "forgot" && (
                <div>
                  <label style={{fontSize:9,color:G.dim,display:"block",marginBottom:5,fontFamily:"'DM Mono',monospace",letterSpacing:"0.14em",textTransform:"uppercase"}}>Mot de passe</label>
                  <div style={{position:"relative"}}>
                    <input type={showPwd?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode==="login"?"current-password":"new-password"} style={{...inp,paddingRight:44}} onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/>
                    <button type="button" onClick={()=>setShowPwd(s=>!s)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:G.dim,cursor:"pointer",fontSize:13,padding:2}}>{showPwd?"○":"●"}</button>
                  </div>
                </div>
              )}
            </div>

            {/* Remember + forgot */}
            {mode === "login" && (
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}>
                <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer"}}>
                  <div onClick={()=>setRememberMe(r=>!r)} style={{width:16,height:16,borderRadius:4,border:`1.5px solid ${rememberMe?G.green:G.border}`,background:rememberMe?G.greenDim:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s"}}>
                    {rememberMe&&<span style={{fontSize:9,color:G.green}}>✓</span>}
                  </div>
                  <span style={{fontSize:11,color:G.dim,fontFamily:"'DM Mono',monospace"}}>Se souvenir</span>
                </label>
                <button onClick={()=>{setMode("forgot");reset();}} style={{background:"none",border:"none",color:G.dim,cursor:"pointer",fontSize:11,fontFamily:"'DM Mono',monospace",padding:0,transition:"color 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.color=G.mid} onMouseLeave={e=>e.currentTarget.style.color=G.dim}>
                  Oublié ?
                </button>
              </div>
            )}

            {error&&<div style={{marginTop:13,background:"rgba(240,71,112,0.08)",border:"1px solid rgba(240,71,112,0.22)",padding:"9px 13px",borderRadius:8,color:G.red,fontSize:12,fontFamily:"'DM Mono',monospace"}}>{error}</div>}
            {success&&<div style={{marginTop:13,background:G.greenDim,border:`1px solid ${G.greenBord}`,padding:"9px 13px",borderRadius:8,color:G.green,fontSize:12,fontFamily:"'DM Mono',monospace"}}>{success}</div>}

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading} style={{marginTop:17,width:"100%",padding:"12px",borderRadius:10,border:"none",background:loading?G.inner:G.green,color:loading?G.dim:"#051F20",cursor:loading?"not-allowed":"pointer",fontSize:12,fontWeight:700,fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em",transition:"all 0.15s",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}
              onMouseEnter={e=>{if(!loading){e.currentTarget.style.opacity="0.85";e.currentTarget.style.transform="translateY(-1px)";}}}
              onMouseLeave={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="none";}}>
              {loading&&<div style={{width:12,height:12,border:"2px solid rgba(5,31,32,0.2)",borderTop:"2px solid #051F20",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>}
              {loading?"...":`${mode==="login"?"SE CONNECTER":mode==="signup"?"CRÉER LE COMPTE":"ENVOYER LE LIEN"} →`}
            </button>

            {mode==="forgot"&&<button onClick={()=>{setMode("login");reset();}} style={{marginTop:10,width:"100%",padding:"9px",borderRadius:9,border:`1px solid ${G.border}`,background:"transparent",color:G.dim,cursor:"pointer",fontSize:11,fontFamily:"'DM Mono',monospace"}}>← RETOUR</button>}
          </div>

          {/* Switch */}
          {mode!=="forgot"&&(
            <div style={{marginTop:18,textAlign:"center",fontSize:12,color:G.dim,fontFamily:"'DM Mono',monospace"}}>
              {mode==="login"?<>Pas de compte ?{" "}<button onClick={()=>{setMode("signup");reset();}} style={{background:"none",border:"none",color:G.green,cursor:"pointer",fontSize:12,fontFamily:"'DM Mono',monospace",textDecoration:"underline",padding:0}}>Créer un compte</button></>:<>Déjà un compte ?{" "}<button onClick={()=>{setMode("login");reset();}} style={{background:"none",border:"none",color:G.green,cursor:"pointer",fontSize:12,fontFamily:"'DM Mono',monospace",textDecoration:"underline",padding:0}}>Se connecter</button></>}
            </div>
          )}
          <div style={{marginTop:18,textAlign:"center",fontSize:10,color:G.ghost,fontFamily:"'DM Mono',monospace"}}>En continuant, tu acceptes nos conditions d'utilisation.</div>
        </div>
      </div>
    </div>
  );
};
