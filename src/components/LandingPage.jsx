import { useState, useEffect, useRef } from "react";

const G = {
  bg: "#08090b", card: "#111316", inner: "#181a1e",
  border: "rgba(255,255,255,0.07)", borderHov: "rgba(255,255,255,0.14)",
  text: "#eef0f2", mid: "#7a8088", dim: "#3a3d42",
  green: "#3ecf8e", greenDim: "rgba(62,207,142,0.12)", greenBord: "rgba(62,207,142,0.22)",
  glassBg: "rgba(255,255,255,0.05)", glassBorder: "rgba(255,255,255,0.14)",
  glassTop: "rgba(255,255,255,0.1)", glassShadow: "rgba(0,0,0,0.45)",
};
const mono = "'DM Mono', monospace";
const syne = "'Syne', sans-serif";
const sans = "'DM Sans', sans-serif";
const jakarta = "'Plus Jakarta Sans', sans-serif";

const FAQS = [
  { q: "Mes données sont-elles sécurisées ?", a: "Oui. Tes données sont stockées dans Supabase (infrastructure AWS), chiffrées au repos et isolées par compte." },
  { q: "Puis-je annuler à tout moment ?", a: "Oui, sans engagement. Tu gardes l'accès Pro jusqu'à la fin de ta période payée." },
  { q: "Quels brokers sont supportés ?", a: "L'app est broker-agnostique. Compatible avec tous les marchés : crypto, forex, actions, futures." },
  { q: "L'AI Coach utilise quoi comme modèle ?", a: "Claude d'Anthropic — le même modèle utilisé par des milliers de professionnels." },
];

const FEATURES = [
  { icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="11" width="4" height="7" rx="1" fill="currentColor" opacity=".8"/><rect x="8" y="7" width="4" height="11" rx="1" fill="currentColor" opacity=".6"/><rect x="14" y="3" width="4" height="15" rx="1" fill="currentColor" opacity=".4"/></svg>, title: "Dashboard temps réel", desc: "Win rate, PnL, drawdown, profit factor — tout d'un coup d'œil." },
  { icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4"/><circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.2" opacity=".5"/><circle cx="10" cy="10" r="1" fill="currentColor"/></svg>, title: "AI Coach", desc: "Analyse tes trades et identifie tes erreurs récurrentes." },
  { icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><polyline points="2,16 6,10 10,12 14,6 18,8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/><circle cx="18" cy="8" r="1.5" fill="currentColor" opacity=".7"/></svg>, title: "Stats avancées", desc: "PnL par setup, par session, par émotion. Trouve ton edge." },
  { icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L17 6V10C17 14 14 17.5 10 19C6 17.5 3 14 3 10V6L10 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>, title: "Discipline tracker", desc: "Score par trade. Corrélation comportement ↔ résultats." },
  { icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4"/><path d="M10 6V10L13 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>, title: "Cooldown anti-revenge", desc: "Bloque le trading après X pertes consécutives." },
  { icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 14 L3 6 L7 9 L10 4 L13 8 L17 6 L17 14 Z" fill="currentColor" opacity=".15" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth=".8" opacity=".4"/></svg>, title: "Monte Carlo", desc: "400 simulations. Connais ton risque de ruine réel." },
];

// ═══════════════════════════════════════
// OPTIMIZED SPHERE ↔ TEXT MORPH
// ═══════════════════════════════════════
const HeroCanvas = () => {
  const ref = useRef(null);
  useEffect(() => {
    const C = ref.current;
    if (!C) return;
    const X = C.getContext("2d");
    const T2 = Math.PI * 2;
    let W, H, raf;
    const M = { x: .5, y: .5, sx: .5, sy: .5 };
    const onMove = e => { M.sx = e.clientX / W; M.sy = e.clientY / H; };
    addEventListener("mousemove", onMove);

    function resize() {
      W = C.offsetWidth; H = C.offsetHeight;
      const d = Math.min(devicePixelRatio || 1, 2);
      C.width = W * d; C.height = H * d;
      X.setTransform(d, 0, 0, d, 0, 0);
    }
    resize();

    let TXT = [];
    function sampleText() {
      const c = document.createElement("canvas"); c.width = W; c.height = H;
      const g = c.getContext("2d");
      const fs = Math.min(W * .062, 70);
      g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
      g.font = `800 ${fs}px ${jakarta}`;
      g.fillText("Prends en main", W/2, H/2 - fs*.6);
      g.globalAlpha = .35;
      g.fillText("ton trading.", W/2, H/2 + fs*.6);
      const d = g.getImageData(0,0,W,H).data;
      TXT = [];
      // Sample every 3px — fast, still sharp enough for vector overlay
      for (let y=0; y<H; y+=3) for (let x=0; x<W; x+=3) {
        const i = (y*W+x)*4;
        if (d[i+3] > 40) TXT.push({ x, y });
      }
    }

    function getBounds() {
      const fs = Math.min(W*.062,70);
      const g = document.createElement("canvas").getContext("2d");
      g.font = `800 ${fs}px ${jakarta}`;
      const mw = Math.max(g.measureText("Prends en main").width, g.measureText("ton trading.").width);
      const p = 50;
      return { x: W/2-mw/2-p, y: H/2-fs*.6-fs*.55-p, w: mw+p*2, h: fs*1.2+fs*1.1+p*2 };
    }

    // ── Pools ──
    const MAX_MAIN = 2800;
    let MP=[], ORB=[], RNG=[];
    const sR = () => Math.min(W,H)*.28;

    function build() {
      const R = sR();
      // Cap main particles
      const N = Math.min(TXT.length, MAX_MAIN);
      const step = TXT.length > MAX_MAIN ? Math.floor(TXT.length / MAX_MAIN) : 1;

      MP = [];
      for (let idx = 0, i = 0; i < N && idx < TXT.length; i++, idx += step) {
        const th=Math.random()*T2, ph=Math.acos(2*Math.random()-1);
        const r = R*(.86+Math.random()*.28);
        const sa=Math.random()*T2, sd=R*2.5+Math.random()*R*3;
        const dc = Math.hypot(TXT[idx].x-W/2, TXT[idx].y-H/2) / Math.hypot(W/2, H/2);
        MP.push({
          sx:Math.sin(ph)*Math.cos(th)*r, sy:Math.sin(ph)*Math.sin(th)*r, sz:Math.cos(ph)*r,
          ox:W/2+Math.cos(sa)*sd, oy:H/2+(Math.random()-.5)*H,
          tx:TXT[idx].x, ty:TXT[idx].y,
          s: 1+Math.random()*1.5, ba:.3+Math.random()*.7,
          ph:Math.random()*T2, sp:.3+Math.random()*1.2,
          ex:(Math.random()-.5)*R*.8, ey:(Math.random()-.5)*R*.8,
          st: dc*.3, gr: Math.random()<.1,
        });
      }

      // Orbitals → corners (200)
      ORB = [];
      const b = getBounds(), cl = 28, CT = [];
      [[b.x,b.y,1,0,0,1],[b.x+b.w,b.y,-1,0,0,1],[b.x+b.w,b.y+b.h,-1,0,0,-1],[b.x,b.y+b.h,1,0,0,-1]]
      .forEach(([cx,cy,dx,dy,ex,ey])=>{for(let t=0;t<cl;t+=1.2){CT.push({x:cx+dx*t,y:cy+dy*t});CT.push({x:cx+ex*t,y:cy+ey*t});}});
      for (let i=0; i<200; i++) {
        const ft = CT[i%CT.length];
        ORB.push({ oR:R*(1.1+Math.random()*.9), oT:(Math.random()-.5)*Math.PI*.6, oP:Math.random()*T2, oS:(.12+Math.random()*.4)*(Math.random()>.5?1:-1), fx:ft.x, fy:ft.y, s:.6+Math.random()*1.6, ba:.08+Math.random()*.28, gr:Math.random()<.3, ph:Math.random()*T2, px:0, py:0 });
      }

      // Rings (120)
      RNG = [];
      for (let i=0; i<120; i++) {
        const band = Math.floor(Math.random()*3);
        RNG.push({ r:R*(1.2+band*.14+Math.random()*.04), a:Math.random()*T2, tilt:.3+band*.025, sp:(.1+Math.random()*.1)*(band%2?-1:1), s:.3+Math.random()*1.2, al:.03+Math.random()*.1, gr:Math.random()<.2 });
      }
    }

    // Dust (40)
    const dust = [];
    for (let i=0;i<40;i++) dust.push({ x:Math.random()*3e3, y:Math.random()*2e3, vx:(Math.random()-.5)*.08, vy:(Math.random()-.5)*.08, s:Math.random()*.7+.2, al:Math.random()*.03+.005 });

    const ASM=3, SPH=4, MRP=2.8, TXH=4.5, CYC=SPH+MRP+TXH+MRP;
    const ease = t => t<.5?8*t*t*t*t:1-(-2*t+2)**4/2;
    const eoQ = t => 1-(1-t)**4;
    let time = 0;

    function drawTxt(a) {
      if (a<.005) return;
      const fs = Math.min(W*.062,70);
      X.save(); X.textAlign="center"; X.textBaseline="middle";
      X.font = `800 ${fs}px ${jakarta}`;
      X.shadowColor = `rgba(62,207,142,${a*.12})`; X.shadowBlur = 30;
      X.globalAlpha = a; X.fillStyle = "#eff1f5";
      X.fillText("Prends en main", W/2, H/2-fs*.6);
      X.globalAlpha = a*.25; X.fillText("ton trading.", W/2, H/2+fs*.6);
      X.restore();
    }

    function frame() {
      X.fillStyle = "rgba(8,9,11,.9)";
      X.fillRect(0,0,W,H);
      time += .016;
      M.x += (M.sx-M.x)*.03; M.y += (M.sy-M.y)*.03;
      const px=(M.x-.5)*25, py=(M.y-.5)*18;
      const R=sR(), asm=eoQ(Math.min(1,time/ASM));
      const ct2=Math.max(0,time-ASM), ct=ct2%CYC;
      let m;
      if(ct2<.01) m=0;
      else if(ct<SPH) m=0;
      else if(ct<SPH+MRP) m=ease((ct-SPH)/MRP);
      else if(ct<SPH+MRP+TXH) m=1;
      else m=1-ease((ct-SPH-MRP-TXH)/MRP);

      const br=1+Math.sin(time*.7)*.01;
      const ry=time*.25, rx=Math.sin(time*.14)*.08;
      const cY=Math.cos(ry), sYv=Math.sin(ry), cX=Math.cos(rx), sXv=Math.sin(rx);
      const hW=W/2+px, hH=H/2+py;

      // Dust — fillRect only (fast)
      for(let i=0;i<dust.length;i++){const p=dust[i];p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;X.fillStyle=`rgba(255,255,255,${p.al})`;X.fillRect(p.x,p.y,p.s,p.s);}

      // Rings — fillRect (no arc)
      const rAl=(1-m)*asm;
      if(rAl>.005){for(let i=0;i<RNG.length;i++){const rp=RNG[i];rp.a+=rp.sp*.016;const cx2=Math.cos(rp.a)*rp.r*br,cy2=Math.sin(rp.a)*rp.r*Math.sin(rp.tilt)*br,cz2=Math.sin(rp.a)*rp.r*Math.cos(rp.tilt)*br;const x1=cx2*cY-cz2*sYv,z1=cx2*sYv+cz2*cY,y1=cy2*cX-z1*sXv;const dep=(z1+R*2)/(R*4);const a=rp.al*rAl*(.15+dep*.85);if(a>.003){X.fillStyle=rp.gr?`rgba(62,207,142,${a})`:`rgba(170,185,215,${a})`;X.fillRect(hW+x1,hH+y1,rp.s,rp.s);}}}

      // Orbital positions — fillRect
      const pF=m<.75?1:Math.max(0,1-(m-.75)/.25);
      const tF=m<.55?0:Math.min(1,(m-.55)/.35);

      for(let i=0;i<ORB.length;i++){const o=ORB[i];const a=time*o.oS+o.oP;const ox=Math.cos(a)*o.oR*br,oy=Math.sin(a)*o.oR*Math.cos(o.oT)*br,oz=Math.sin(a)*o.oR*Math.sin(o.oT)*br;const x1=ox*cY-oz*sYv,z1=ox*sYv+oz*cY,y1=oy*cX-z1*sXv;o.px=(hW+x1)+(o.fx+px-(hW+x1))*m;o.py=(hH+y1)+(o.fy+py-(hH+y1))*m;const oA=o.ba*.8*asm;const fA=m>.8?.3+.08*Math.sin(time*2+o.ph):o.ba*.4;const da=oA+(fA-oA)*m;if(da>.003){X.fillStyle=o.gr?`rgba(62,207,142,${Math.min(1,da)})`:`rgba(200,212,235,${Math.min(1,da)})`;X.fillRect(o.px,o.py,Math.max(.4,o.s*.5),Math.max(.4,o.s*.5));}}

      // Main sphere → text (staggered, fillRect only)
      for(let i=0;i<MP.length;i++){const p=MP[i];const x1=p.sx*cY*br-p.sz*sYv*br,z1=p.sx*sYv*br+p.sz*cY*br;const y1=p.sy*cX*br-z1*sXv,z2=p.sy*sXv+z1*cX;let sx2=hW+x1,sy2=hH+y1;if(asm<1){sx2=p.ox+(sx2-p.ox)*asm;sy2=p.oy+(sy2-p.oy)*asm;}const dep=Math.max(0,Math.min(1,(z2+R)/(R*2)));const pm=Math.max(0,Math.min(1,(m-p.st)/(1-p.st)));const pExp=Math.sin(pm*Math.PI)*Math.max(0,1-pm)*.6;const sA=(.08+dep*.7)*p.ba*asm;const tA=.5*p.ba*pF;const wx=Math.sin(time*p.sp+p.ph)*Math.sin(pm*Math.PI)*2+p.ex*pExp;const wy=Math.cos(time*p.sp+p.ph*1.3)*Math.sin(pm*Math.PI)*2+p.ey*pExp;const dx=sx2+(p.tx+px-sx2)*pm+wx;const dy=sy2+(p.ty+py-sy2)*pm+wy;const da=(sA+(tA-sA)*pm)*(pm>.75?Math.max(0,1-(pm-.75)/.25):1);const ds=p.s*(.55+dep*.8)+(1.4-p.s*(.55+dep*.8))*pm;if(da<.003)continue;X.fillStyle=p.gr?`rgba(62,207,142,${Math.min(1,da*1.3)})`:`rgba(232,236,245,${Math.min(1,da)})`;X.fillRect(dx,dy,Math.max(.4,ds),Math.max(.4,ds));}

      // Core glow (one gradient, cheap)
      if(m<.4&&asm>.4){const ca=.045*(1-m/.4)*asm;const cg=X.createRadialGradient(hW,hH,0,hW,hH,R*.4);cg.addColorStop(0,`rgba(255,255,255,${ca})`);cg.addColorStop(.5,`rgba(62,207,142,${ca*.3})`);cg.addColorStop(1,"transparent");X.fillStyle=cg;X.fillRect(hW-R*.5,hH-R*.5,R,R);}

      // Clean vector text
      drawTxt(tF);

      // Corner brackets (only when text visible)
      if(tF>.03){const b=getBounds(),cl=28;X.save();X.strokeStyle=`rgba(62,207,142,${tF*.4})`;X.lineWidth=1;X.shadowColor=`rgba(62,207,142,${tF*.18})`;X.shadowBlur=16;X.lineCap="round";[[b.x,b.y,cl,0,0,cl],[b.x+b.w,b.y,-cl,0,0,cl],[b.x+b.w,b.y+b.h,-cl,0,0,-cl],[b.x,b.y+b.h,cl,0,0,-cl]].forEach(([cx,cy,dx1,dy1,dx2,dy2])=>{X.beginPath();X.moveTo(cx+dx2+px,cy+dy2+py);X.lineTo(cx+px,cy+py);X.lineTo(cx+dx1+px,cy+dy1+py);X.stroke();});const dp=.5+.5*Math.sin(time*3);X.shadowBlur=10;X.fillStyle=`rgba(62,207,142,${tF*(.35+dp*.2)})`;[[b.x,b.y],[b.x+b.w,b.y],[b.x+b.w,b.y+b.h],[b.x,b.y+b.h]].forEach(([cx,cy])=>{X.beginPath();X.arc(cx+px,cy+py,1.6,0,T2);X.fill();});X.restore();}

      // Outer glow
      if(m<.4&&asm>.2){const ga=.025*(1-m/.4)*asm;const g=X.createRadialGradient(hW,hH,0,hW,hH,R*1.8);g.addColorStop(0,`rgba(255,255,255,${ga})`);g.addColorStop(.2,`rgba(62,207,142,${ga*.3})`);g.addColorStop(1,"transparent");X.fillStyle=g;X.fillRect(0,0,W,H);}

      raf = requestAnimationFrame(frame);
    }

    document.fonts.ready.then(()=>setTimeout(()=>{resize();sampleText();build();frame();},200));
    const onR = ()=>{resize();sampleText();build();};
    addEventListener("resize",onR);
    return ()=>{cancelAnimationFrame(raf);removeEventListener("resize",onR);removeEventListener("mousemove",onMove);};
  },[]);

  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%"}} />;
};

// ── Utils ──
const useReveal = () => { const ref=useRef(null); const [v,s]=useState(false); useEffect(()=>{const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){s(true);o.disconnect();}},{threshold:.12});if(ref.current)o.observe(ref.current);return()=>o.disconnect();},[]);return[ref,v];};
const Reveal = ({children,delay="0s"}) => { const [r,v]=useReveal(); return <div ref={r} style={{opacity:v?1:0,transform:v?"none":"translateY(28px)",transition:`opacity 0.7s ease ${delay}, transform 0.7s ease ${delay}`}}>{children}</div>;};
const GBtn = ({children,primary,onClick,style:extra={},...rest}) => <button onClick={onClick} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,borderRadius:100,padding:primary?"14px 32px":"12px 28px",background:primary?"rgba(255,255,255,0.1)":G.glassBg,border:`1px solid ${primary?"rgba(255,255,255,0.25)":G.glassBorder}`,boxShadow:primary?`inset 0 1.5px 0 rgba(255,255,255,0.18),inset 0 -1px 0 rgba(0,0,0,0.2),0 4px 20px rgba(0,0,0,0.5)`:`inset 0 1px 0 ${G.glassTop},0 4px 16px ${G.glassShadow}`,backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",color:primary?G.text:"rgba(255,255,255,0.75)",fontFamily:mono,fontSize:12,fontWeight:500,letterSpacing:"0.06em",cursor:"pointer",transition:"all 0.18s",outline:"none",whiteSpace:"nowrap",...extra}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.background=primary?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.09)";}} onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.background=primary?"rgba(255,255,255,0.1)":G.glassBg;}} {...rest}>{children}</button>;

// ═══════════════════
export const LandingPage = ({ onGetStarted }) => {
  const [openFaq, setOpenFaq] = useState(null);
  return (
    <div style={{ background: G.bg, minHeight: "100dvh", color: G.text, fontFamily: sans, overflowX: "hidden" }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}@keyframes shimmer{0%,100%{opacity:0.4}50%{opacity:1}}.fu{animation:fadeUp .8s ease forwards}.fu1{animation:fadeUp .8s ease .15s forwards;opacity:0}.fu2{animation:fadeUp .8s ease .3s forwards;opacity:0}.fu3{animation:fadeUp .8s ease .45s forwards;opacity:0}button{cursor:pointer}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}`}</style>

      <nav style={{ borderBottom:`1px solid ${G.border}`,position:"sticky",top:0,background:"rgba(8,9,11,0.88)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",zIndex:50 }}>
        <div style={{ maxWidth:1100,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none" style={{color:G.text}}><rect x="4.5" y="6" width="5" height="12" rx="1" fill="currentColor" opacity=".9"/><line x1="7" y1="3" x2="7" y2="6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity=".9"/><line x1="7" y1="18" x2="7" y2="22" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity=".9"/><rect x="11.5" y="9" width="5" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.1" opacity=".45"/><circle cx="22" cy="14" r="2.8" fill="currentColor" opacity=".9"/></svg>
            <span style={{ fontSize:13,fontWeight:500,fontFamily:mono,letterSpacing:"0.08em",color:G.text }}>LOG<span style={{opacity:.28}}>-</span>PIP</span>
          </div>
          <div style={{display:"flex",gap:10}}><GBtn onClick={onGetStarted}>CONNEXION</GBtn><GBtn primary onClick={onGetStarted}>COMMENCER</GBtn></div>
        </div>
      </nav>

      <div style={{ position:"relative",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden" }}>
        <HeroCanvas />
        <div style={{ position:"relative",zIndex:2,textAlign:"center",padding:"0 24px",maxWidth:800,pointerEvents:"none",display:"flex",flexDirection:"column",alignItems:"center" }}>
          {/* Badge */}
          <div className="fu" style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"6px 16px",borderRadius:100,background:G.glassBg,border:`1px solid ${G.glassBorder}`,backdropFilter:"blur(12px)",boxShadow:`inset 0 1px 0 ${G.glassTop},0 4px 16px ${G.glassShadow}`,fontSize:10,color:"rgba(255,255,255,0.6)",fontFamily:mono,letterSpacing:"0.14em",marginBottom:200,pointerEvents:"auto",whiteSpace:"nowrap" }}>
            <span style={{width:6,height:6,borderRadius:"50%",background:G.green,display:"inline-block",animation:"shimmer 2.5s ease infinite"}} />JOURNAL DE TRADING — PROPULSÉ PAR L'IA
          </div>
          {/* Spacer — canvas text renders here via morph */}
          {/* Sub text — positioned clearly below */}
          <p className="fu2" style={{ fontSize:14,color:"rgba(255,255,255,0.28)",maxWidth:440,margin:"0 auto 32px",lineHeight:1.8,fontWeight:300 }}>Journal intelligent avec AI coaching, stats avancées et discipline tracker.</p>
          <div className="fu3" style={{ display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",pointerEvents:"auto" }}><GBtn primary onClick={onGetStarted}>COMMENCER GRATUITEMENT →</GBtn><GBtn onClick={()=>document.getElementById("pricing")?.scrollIntoView({behavior:"smooth"})}>VOIR LES TARIFS</GBtn></div>
          <div className="fu3" style={{ display:"flex",gap:40,justifyContent:"center",marginTop:48,flexWrap:"wrap" }}>
            {[["68%","WIN RATE MOYEN"],["+$47","EXPECTANCY/TRADE"],["400×","SIMULATIONS MC"]].map(([v,l])=>(<div key={l} style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:300,fontFamily:mono,color:G.text,letterSpacing:"-0.03em"}}>{v}</div><div style={{fontSize:8,color:"rgba(255,255,255,0.15)",fontFamily:mono,letterSpacing:"0.16em",marginTop:4}}>{l}</div></div>))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"100px 24px 80px"}}><Reveal><div style={{textAlign:"center",marginBottom:60}}><div style={{fontSize:9,color:"rgba(255,255,255,0.2)",letterSpacing:"0.2em",fontFamily:mono,marginBottom:14}}>FONCTIONNALITÉS</div><h2 style={{fontSize:"clamp(26px,4vw,44px)",fontWeight:800,fontFamily:syne,letterSpacing:"-0.025em",color:G.text}}>Tout ce dont tu as besoin.</h2></div></Reveal><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>{FEATURES.map((f,i)=>(<Reveal key={f.title} delay={`${i*.07}s`}><div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:16,padding:24,position:"relative",overflow:"hidden",transition:"border-color 0.2s,transform 0.2s,box-shadow 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=G.borderHov;e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 12px 40px rgba(0,0,0,0.35)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}><div style={{position:"absolute",top:0,left:0,right:0,height:"40%",background:"linear-gradient(180deg,rgba(255,255,255,0.03),transparent)",pointerEvents:"none",borderRadius:"16px 16px 0 0"}} /><div style={{color:"rgba(255,255,255,0.35)",marginBottom:14}}>{f.icon}</div><div style={{fontSize:14,fontWeight:500,color:G.text,fontFamily:sans,marginBottom:8}}>{f.title}</div><div style={{fontSize:12,color:"rgba(255,255,255,0.3)",fontFamily:mono,lineHeight:1.7}}>{f.desc}</div></div></Reveal>))}</div></div>

      <div id="pricing" style={{maxWidth:1100,margin:"0 auto",padding:"80px 24px"}}><Reveal><div style={{textAlign:"center",marginBottom:64}}><div style={{fontSize:9,color:"rgba(255,255,255,0.2)",letterSpacing:"0.2em",fontFamily:mono,marginBottom:14}}>TARIFS</div><h2 style={{fontSize:"clamp(32px,5vw,56px)",fontWeight:800,fontFamily:syne,letterSpacing:"-0.03em",color:G.text,lineHeight:1}}>Pricing</h2><p style={{fontSize:14,color:"rgba(255,255,255,0.25)",marginTop:16,fontFamily:sans,fontWeight:300}}>Les concurrents facturent 30–80$/mois. Nous, 9$.</p></div></Reveal><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,maxWidth:860,margin:"0 auto"}}><Reveal delay="0s"><div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:20,padding:"32px 26px",height:"100%",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:0,left:0,right:0,height:"30%",background:"linear-gradient(180deg,rgba(255,255,255,0.02),transparent)",pointerEvents:"none"}} /><div style={{fontSize:10,color:"rgba(255,255,255,0.25)",fontFamily:mono,letterSpacing:"0.16em",marginBottom:20}}>FREE PLAN</div><div style={{fontSize:48,fontWeight:800,fontFamily:syne,color:G.text,letterSpacing:"-0.04em",lineHeight:1,marginBottom:24}}>Free</div><div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:32}}>{["20 trades max","Dashboard de base","Courbe d'équité","Import / Export","Stats de base"].map(f=>(<div key={f} style={{display:"flex",gap:10,alignItems:"center"}}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/><path d="M4.5 7L6.5 9L9.5 5.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{fontSize:13,color:"rgba(255,255,255,0.3)",fontFamily:sans,fontWeight:300}}>{f}</span></div>))}</div><GBtn onClick={onGetStarted} style={{width:"100%",borderRadius:12}}>Get Started</GBtn></div></Reveal><Reveal delay="0.1s"><div style={{background:"rgba(255,255,255,0.04)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:20,padding:"32px 26px",position:"relative",height:"100%",overflow:"hidden",boxShadow:"0 0 80px rgba(62,207,142,0.04),inset 0 1px 0 rgba(255,255,255,0.12)"}}><div style={{position:"absolute",top:0,left:"20%",right:"20%",height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)"}} /><div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",background:G.text,color:G.bg,fontSize:9,fontWeight:700,fontFamily:mono,letterSpacing:"0.14em",padding:"4px 16px",borderRadius:"0 0 10px 10px"}}>POPULAIRE</div><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",fontFamily:mono,letterSpacing:"0.16em",marginBottom:20,marginTop:8}}>STANDARD PLAN</div><div style={{marginBottom:6,display:"flex",alignItems:"baseline",gap:4}}><span style={{fontSize:48,fontWeight:800,fontFamily:syne,color:G.text,letterSpacing:"-0.04em",lineHeight:1}}>9$</span><span style={{fontSize:14,color:"rgba(255,255,255,0.25)",fontFamily:mono}}>/m</span></div><div style={{fontSize:11,color:"rgba(255,255,255,0.25)",fontFamily:mono,marginBottom:24}}>Sans engagement</div><div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:32}}>{["Trades illimités","AI Coach personnalisé","Stats avancées","Screenshots de trades","Export PDF mensuel","Cooldown anti-revenge","Support prioritaire"].map(f=>(<div key={f} style={{display:"flex",gap:10,alignItems:"center"}}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/><path d="M4.5 7L6.5 9L9.5 5.5" stroke={G.text} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{fontSize:13,color:G.text,fontFamily:sans,fontWeight:300}}>{f}</span></div>))}</div><GBtn primary onClick={onGetStarted} style={{width:"100%",borderRadius:12}}>Get Started</GBtn></div></Reveal><Reveal delay="0.2s"><div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:20,padding:"32px 26px",height:"100%",position:"relative",overflow:"hidden",opacity:.7}}><div style={{position:"absolute",top:14,right:16,fontSize:9,color:"rgba(255,255,255,0.25)",fontFamily:mono,background:G.inner,border:`1px solid ${G.border}`,borderRadius:20,padding:"3px 10px",letterSpacing:"0.1em"}}>BIENTÔT</div><div style={{fontSize:10,color:"rgba(255,255,255,0.25)",fontFamily:mono,letterSpacing:"0.16em",marginBottom:20}}>ANNUAL PLAN</div><div style={{marginBottom:6,display:"flex",alignItems:"baseline",gap:4}}><span style={{fontSize:48,fontWeight:800,fontFamily:syne,color:G.text,letterSpacing:"-0.04em",lineHeight:1}}>79$</span><span style={{fontSize:14,color:"rgba(255,255,255,0.25)",fontFamily:mono}}>/an</span></div><div style={{fontSize:11,color:"rgba(255,255,255,0.3)",fontFamily:mono,marginBottom:24}}>2 mois offerts</div><div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:32}}>{["Tout ce qu'inclut Pro","2 mois gratuits","Priorité features","Support VIP"].map(f=>(<div key={f} style={{display:"flex",gap:10,alignItems:"center"}}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/><path d="M4.5 7L6.5 9L9.5 5.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{fontSize:13,color:"rgba(255,255,255,0.3)",fontFamily:sans,fontWeight:300}}>{f}</span></div>))}</div><button disabled style={{width:"100%",padding:13,borderRadius:12,border:`1px solid ${G.border}`,background:"transparent",color:"rgba(255,255,255,0.2)",fontSize:12,fontFamily:mono,cursor:"not-allowed",letterSpacing:"0.06em"}}>Bientôt disponible</button></div></Reveal></div></div>

      <div style={{maxWidth:680,margin:"0 auto",padding:"80px 24px"}}><Reveal><div style={{textAlign:"center",marginBottom:48}}><div style={{fontSize:9,color:"rgba(255,255,255,0.2)",letterSpacing:"0.2em",fontFamily:mono,marginBottom:14}}>FAQ</div><h2 style={{fontSize:"clamp(24px,4vw,38px)",fontWeight:800,fontFamily:syne,letterSpacing:"-0.02em",color:G.text}}>Questions fréquentes</h2></div></Reveal><div style={{display:"flex",flexDirection:"column",gap:8}}>{FAQS.map((faq,i)=>(<Reveal key={i} delay={`${i*.06}s`}><div style={{background:G.card,border:`1px solid ${openFaq===i?G.borderHov:G.border}`,borderRadius:14,overflow:"hidden",transition:"border-color 0.2s"}}><button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{width:"100%",padding:"17px 22px",background:"none",border:"none",display:"flex",justifyContent:"space-between",alignItems:"center",textAlign:"left"}}><span style={{fontSize:14,fontWeight:400,color:G.text,fontFamily:sans}}>{faq.q}</span><span style={{fontSize:16,color:"rgba(255,255,255,0.3)",transform:openFaq===i?"rotate(45deg)":"none",transition:"transform 0.2s",flexShrink:0,marginLeft:12}}>+</span></button>{openFaq===i&&<div style={{padding:"0 22px 18px",fontSize:13,color:"rgba(255,255,255,0.3)",fontFamily:mono,lineHeight:1.75,borderTop:`1px solid ${G.border}`,paddingTop:14}}>{faq.a}</div>}</div></Reveal>))}</div></div>

      <Reveal><div style={{borderTop:`1px solid ${G.border}`,padding:"100px 24px",textAlign:"center"}}><h2 style={{fontSize:"clamp(26px,4.5vw,52px)",fontWeight:800,fontFamily:syne,letterSpacing:"-0.03em",color:G.text,marginBottom:16}}>Prêt à trader mieux ?</h2><p style={{fontSize:14,color:"rgba(255,255,255,0.25)",marginBottom:36,fontFamily:sans,fontWeight:300}}>Gratuit pour commencer. Pas de carte de crédit.</p><GBtn primary onClick={onGetStarted} style={{fontSize:13,padding:"16px 40px"}}>COMMENCER GRATUITEMENT →</GBtn><div style={{marginTop:56,fontSize:10,color:"rgba(255,255,255,0.1)",fontFamily:mono,letterSpacing:"0.12em"}}>LOG-PIP © 2026</div></div></Reveal>
    </div>
  );
};
