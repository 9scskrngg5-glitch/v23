import { useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { C, F, inp } from "../lib/design";

// ── SVG Icons ──────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.09 17.64 11.78 17.64 9.2z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 814 1000" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105.4-57.8-155.5-127.4C46 442.8 33.8 324.6 33.8 297.5c0-155.6 100.7-237.9 199.1-237.9 52.3 0 95.9 34.4 127.8 34.4 30.5 0 78.4-36.6 139.1-36.6 22.3 0 108.2 1.9 163.6 77.3zm-84.7-122.6c23.4-27.7 40.2-66.2 40.2-104.7 0-5.1-.4-10.3-1.3-14.5-38.3 1.5-83.4 25.5-110.4 57.2-21.1 23.9-41.2 62.4-41.2 101.5 0 5.7.9 11.4 1.3 13.3 2.5.4 6.5.6 10.5.6 34.1 0 76.8-22.9 100.9-53.4z"/>
  </svg>
);

const Divider = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
    <div style={{ flex: 1, height: 1, background: C.border }} />
    <span style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.1em" }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: C.border }} />
  </div>
);

// ── OAuth Button ───────────────────────────────────────────────────────────
const OAuthBtn = ({ icon, label, onClick, loading }) => (
  <button onClick={onClick} disabled={loading} style={{
    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
    padding: "12px 16px", borderRadius: 10, border: `1px solid ${C.border}`,
    background: C.bgInner, color: C.text, cursor: loading ? "not-allowed" : "pointer",
    fontSize: 13, fontFamily: F.sans, fontWeight: 500, transition: "all 0.15s",
    opacity: loading ? 0.5 : 1,
  }}
    onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = C.borderHov; e.currentTarget.style.background = C.bgCard; } }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bgInner; }}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// ── Main Component ─────────────────────────────────────────────────────────
export const AuthScreen = ({ onSignIn, onSignUp, onSignInWithGoogle, onSignInWithApple }) => {
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null); // "google" | "apple" | null

  const reset = () => { setError(""); setSuccess(""); };

  const handleSubmit = async () => {
    reset();
    if (!email.trim()) { setError("Email requis."); return; }
    if (mode !== "forgot" && password.length < 6) { setError("Mot de passe minimum 6 caractères."); return; }
    setLoading(true);

    if (mode === "forgot") {
      if (!supabase) { setError("Backend non configuré"); setLoading(false); return; }
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) setError(error.message);
      else setSuccess("Email de réinitialisation envoyé ! Vérifie ta boîte.");
    } else if (mode === "login") {
      const { error } = await onSignIn(email.trim(), password, rememberMe);
      if (error) setError(error);
    } else {
      const { error } = await onSignUp(email.trim(), password);
      if (error) setError(error);
      else setSuccess("Compte créé ! Tu peux te connecter directement.");
    }
    setLoading(false);
  };

  const handleOAuth = async (provider) => {
    reset();
    setOauthLoading(provider);
    const fn = provider === "google" ? onSignInWithGoogle : onSignInWithApple;
    const { error } = await fn();
    if (error) { setError(error); setOauthLoading(null); }
    // On success, Supabase redirects — no need to clear loading
  };

  const TITLES = {
    login: "Connexion",
    signup: "Créer un compte",
    forgot: "Mot de passe oublié",
  };
  const SUBTITLES = {
    login: "Content de te revoir.",
    signup: "Commence à trader mieux.",
    forgot: "On t'envoie un lien de réinitialisation.",
  };

  return (
    <div style={{ background: C.bg, minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .auth-fade { animation: fadeIn 0.2s ease; }
      `}</style>

      <div style={{ width: "min(420px, 100%)" }} className="auth-fade">

        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: C.greenDim, border: `1px solid ${C.greenBord}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 16, color: C.green, fontFamily: F.mono, fontWeight: 700, letterSpacing: "0.1em" }}>TJ</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: C.text, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            {TITLES[mode]}
          </h1>
          <p style={{ fontSize: 13, color: C.textDim, fontFamily: F.mono, margin: 0 }}>
            {SUBTITLES[mode]}
          </p>
        </div>

        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18, padding: 28, boxShadow: "0 8px 40px rgba(0,0,0,0.25)" }}>

          {/* OAuth buttons - only on login/signup */}
          {mode !== "forgot" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <OAuthBtn
                  icon={<GoogleIcon />}
                  label="Continuer avec Google"
                  onClick={() => handleOAuth("google")}
                  loading={oauthLoading === "google"}
                />
                <OAuthBtn
                  icon={<AppleIcon />}
                  label="Continuer avec Apple"
                  onClick={() => handleOAuth("apple")}
                  loading={oauthLoading === "apple"}
                />
              </div>
              <Divider label="ou avec un email" />
            </>
          )}

          {/* Email / Password form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 9, color: C.textDim, display: "block", marginBottom: 6, fontFamily: F.mono, letterSpacing: "0.14em", textTransform: "uppercase" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ton@email.com"
                autoComplete="email"
                style={inp()}
                onFocus={e => e.target.style.borderColor = C.green}
                onBlur={e => e.target.style.borderColor = C.border}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {mode !== "forgot" && (
              <div>
                <label style={{ fontSize: 9, color: C.textDim, display: "block", marginBottom: 6, fontFamily: F.mono, letterSpacing: "0.14em", textTransform: "uppercase" }}>Mot de passe</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    style={{ ...inp(), paddingRight: 44 }}
                    onFocus={e => e.target.style.borderColor = C.green}
                    onBlur={e => e.target.style.borderColor = C.border}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 13, padding: 2 }}
                    title={showPassword ? "Masquer" : "Afficher"}
                  >
                    {showPassword ? "○" : "●"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Remember me + forgot password */}
          {mode === "login" && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <div
                  onClick={() => setRememberMe(r => !r)}
                  style={{
                    width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${rememberMe ? C.green : C.border}`,
                    background: rememberMe ? C.greenDim : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
                  }}
                >
                  {rememberMe && <span style={{ fontSize: 11, color: C.green, lineHeight: 1 }}>✓</span>}
                </div>
                <span style={{ fontSize: 12, color: C.textDim, fontFamily: F.mono, userSelect: "none" }}>Se souvenir de moi</span>
              </label>
              <button
                onClick={() => { setMode("forgot"); reset(); }}
                style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 12, fontFamily: F.mono, padding: 0 }}
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}

          {/* Feedback messages */}
          {error && (
            <div style={{ marginTop: 14, background: C.redDim, border: `1px solid ${C.redBord}`, padding: "10px 14px", borderRadius: 9, color: C.red, fontSize: 12, fontFamily: F.mono, lineHeight: 1.5 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ marginTop: 14, background: C.greenDim, border: `1px solid ${C.greenBord}`, padding: "10px 14px", borderRadius: 9, color: C.green, fontSize: 12, fontFamily: F.mono, lineHeight: 1.5 }}>
              {success}
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              marginTop: 18, width: "100%", padding: "13px",
              borderRadius: 10, border: "none",
              background: loading ? C.bgInner : C.green,
              color: loading ? C.textDim : "#000",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 12, fontWeight: 700, fontFamily: F.mono, letterSpacing: "0.1em",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            {loading ? "..." : mode === "login" ? "SE CONNECTER" : mode === "signup" ? "CRÉER LE COMPTE" : "ENVOYER LE LIEN"}
          </button>

          {/* Back from forgot */}
          {mode === "forgot" && (
            <button
              onClick={() => { setMode("login"); reset(); }}
              style={{ marginTop: 12, width: "100%", padding: "10px", borderRadius: 9, border: `1px solid ${C.border}`, background: "transparent", color: C.textDim, cursor: "pointer", fontSize: 12, fontFamily: F.mono }}
            >
              ← RETOUR
            </button>
          )}
        </div>

        {/* Switch mode */}
        {mode !== "forgot" && (
          <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: C.textDim, fontFamily: F.mono }}>
            {mode === "login" ? (
              <>
                Pas encore de compte ?{" "}
                <button onClick={() => { setMode("signup"); reset(); }} style={{ background: "none", border: "none", color: C.green, cursor: "pointer", fontSize: 13, fontFamily: F.mono, textDecoration: "underline", padding: 0 }}>
                  Créer un compte
                </button>
              </>
            ) : (
              <>
                Déjà un compte ?{" "}
                <button onClick={() => { setMode("login"); reset(); }} style={{ background: "none", border: "none", color: C.green, cursor: "pointer", fontSize: 13, fontFamily: F.mono, textDecoration: "underline", padding: 0 }}>
                  Se connecter
                </button>
              </>
            )}
          </div>
        )}

        {/* Legal */}
        <div style={{ marginTop: 20, textAlign: "center", fontSize: 10, color: C.textGhost, fontFamily: F.mono, lineHeight: 1.6 }}>
          En continuant, tu acceptes nos conditions d'utilisation.
        </div>
      </div>
    </div>
  );
};
