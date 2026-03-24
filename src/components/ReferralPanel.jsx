import { useState, useEffect, useCallback } from "react";
import { authFetch } from "../lib/auth";
import { C, F, card, inp } from "../lib/design";

export const ReferralPanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemMsg, setRedeemMsg] = useState("");
  const [redeemError, setRedeemError] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const result = await authFetch("/api/referral");
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
  }, [load]);

  const copyLink = () => {
    if (!data?.link) return;
    navigator.clipboard.writeText(data.link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRedeem = async () => {
    if (!redeemCode.trim()) return;
    setRedeeming(true); setRedeemMsg(""); setRedeemError("");
    try {
      const result = await authFetch("/api/referral", { method: "POST", body: { code: redeemCode.trim().toUpperCase() } });
      setRedeemMsg(result.message || "Code appliqué !");
      setRedeemCode("");
    } catch (e) {
      setRedeemError(e.message);
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) return (
    <div style={{ ...card(), textAlign: "center", padding: 40 }}>
      <div className="pulse" style={{ color: C.textDim, fontSize: 12, fontFamily: F.mono }}>Chargement...</div>
    </div>
  );

  if (error) return (
    <div style={{ ...card(), textAlign: "center", padding: 32 }}>
      <div style={{ color: C.red, fontSize: 12, fontFamily: F.mono, marginBottom: 10 }}>{error}</div>
      <div style={{ color: C.textDim, fontSize: 11, fontFamily: F.mono, marginBottom: 14 }}>Vérifie que la table "referrals" existe dans Supabase.</div>
      <button onClick={load} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.textMid, cursor: "pointer", fontSize: 11, fontFamily: F.mono }}>RÉESSAYER</button>
    </div>
  );

  return (
    <div>
      {/* How it works */}
      <div style={{ ...card(), borderColor: C.greenBord, marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: C.green, fontFamily: F.mono, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>Programme de parrainage</div>
        <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.7, marginBottom: 16 }}>
          Partage ton code → ton ami s'inscrit → vous gagnez tous les deux <strong style={{ color: C.text }}>1 mois Pro gratuit</strong>.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[["1", "Partage ton code"], ["2", "Ton ami s'inscrit"], ["3", "1 mois Pro chacun"]].map(([n, l]) => (
            <div key={n} style={{ background: C.bgInner, borderRadius: 10, padding: "12px 14px", textAlign: "center", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.green, fontFamily: "'Syne', sans-serif", marginBottom: 4 }}>{n}</div>
              <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Code & stats */}
      <div style={{ ...card(), marginBottom: 14 }}>
        <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>Ton code</div>
        {data?.code ? (
          <>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
              <div style={{ background: C.bgInner, border: `1px solid ${C.greenBord}`, borderRadius: 10, padding: "12px 20px", fontSize: 22, fontWeight: 700, fontFamily: F.mono, color: C.green, letterSpacing: "0.14em" }}>{data.code}</div>
              <button onClick={copyLink} style={{ padding: "11px 20px", borderRadius: 9, border: copied ? `1px solid ${C.greenBord}` : "none", background: copied ? C.greenDim : C.green, color: copied ? C.green : "#000", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: F.mono, transition: "all 0.2s" }}>
                {copied ? "COPIÉ ✓" : "COPIER LE LIEN"}
              </button>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {[["Parrainages", data.uses || 0, C.text], ["Mois Pro gagnés", data.freeMonthsEarned || 0, C.green]].map(([label, val, color]) => (
                <div key={label} style={{ background: C.bgInner, borderRadius: 10, padding: "12px 16px", flex: 1, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "'Syne', sans-serif" }}>{val}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ color: C.textGhost, fontSize: 12, fontFamily: F.mono }}>Ton code sera généré à la prochaine visite.</div>
        )}
      </div>

      {/* Redeem */}
      <div style={{ ...card() }}>
        <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>Utiliser un code</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={redeemCode} onChange={e => setRedeemCode(e.target.value.toUpperCase())} placeholder="TJ-XXXXXX"
            style={{ ...inp({ flex: 1, letterSpacing: "0.1em" }) }}
            onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border}
            onKeyDown={e => e.key === "Enter" && handleRedeem()}
          />
          <button onClick={handleRedeem} disabled={redeeming || !redeemCode.trim()} style={{ padding: "10px 20px", borderRadius: 9, border: "none", background: redeemCode.trim() ? C.green : C.bgInner, color: redeemCode.trim() ? "#000" : C.textDim, cursor: redeemCode.trim() ? "pointer" : "not-allowed", fontSize: 12, fontWeight: 700, fontFamily: F.mono }}>
            {redeeming ? "..." : "APPLIQUER"}
          </button>
        </div>
        {redeemMsg && <div style={{ marginTop: 10, background: C.greenDim, border: `1px solid ${C.greenBord}`, padding: "10px 13px", borderRadius: 8, color: C.green, fontSize: 12, fontFamily: F.mono }}>{redeemMsg}</div>}
        {redeemError && <div style={{ marginTop: 10, background: C.redDim, border: `1px solid ${C.redBord}`, padding: "10px 13px", borderRadius: 8, color: C.red, fontSize: 12, fontFamily: F.mono }}>{redeemError}</div>}
      </div>
    </div>
  );
};
