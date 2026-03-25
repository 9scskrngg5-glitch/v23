import { useState } from "react";
import { supabase } from "../lib/supabase";
import { C, F, card } from "../lib/design";

const PATTERNS = [
  "Break of Structure", "Order Block", "Fair Value Gap", "Liquidity Sweep",
  "Double Top", "Double Bottom", "Head & Shoulders", "Bull Flag", "Bear Flag",
  "Ascending Triangle", "Descending Triangle", "Wedge", "Inside Bar",
  "Pin Bar", "Engulfing", "Doji", "Hammer",
];

export const PatternAnalysis = ({ onPatternDetected, isPro, onUpgrade }) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!isPro) { onUpgrade(); return; }
    if (!image) return;
    setAnalyzing(true); setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(",")[1];

        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
          body: JSON.stringify({
            prompt: `Analyse ce screenshot de trading. Identifie:\n1. Les patterns de prix visibles (${PATTERNS.join(", ")})\n2. Les niveaux clés (support, résistance, zones importantes)\n3. Le biais directionnel (haussier/baissier/neutre)\n4. Un setup de trade potentiel avec entrée, SL et TP estimés\n\nSois précis et actionnable. Format: JSON avec les champs: patterns (array), levels (array of {type, description}), bias (string), setup ({entry, sl, tp, rationale}).`,
            imageBase64: base64,
            imageType: image.type,
          }),
        });

        const data = await res.json();
        try {
          const clean = data.text?.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(clean);
          setResult(parsed);
          onPatternDetected?.(parsed);
        } catch {
          setResult({ raw: data.text });
        }
        setAnalyzing(false);
      };
      reader.readAsDataURL(image);
    } catch (e) {
      setError(e.message);
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ ...card() }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Analyse de Pattern AI
        </div>
        {!isPro && (
          <span style={{ fontSize: 9, color: C.orange, fontFamily: F.mono, background: C.orangeDim, border: `1px solid ${C.orangeBord}`, borderRadius: 20, padding: "3px 9px" }}>
            ULTRA-PREMIUM
          </span>
        )}
      </div>

      <div onClick={() => !isPro && onUpgrade()}>
        {/* Upload zone */}
        <label style={{ display: "block", cursor: isPro ? "pointer" : "not-allowed" }}>
          <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} disabled={!isPro} />
          <div style={{
            border: `2px dashed ${preview ? C.greenBord : C.border}`,
            borderRadius: 12, padding: preview ? 0 : "28px 20px",
            textAlign: "center", transition: "all 0.2s",
            overflow: "hidden", position: "relative",
            opacity: !isPro ? 0.5 : 1,
          }}>
            {preview ? (
              <>
                <img src={preview} alt="Chart" style={{ width: "100%", maxHeight: 280, objectFit: "contain", display: "block" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "0"}
                >
                  <span style={{ color: "#fff", fontFamily: F.mono, fontSize: 12 }}>Changer l'image</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 28, color: ${C.textDim}, marginBottom: 10, fontFamily: F.mono }}>⊕</div>
                <div style={{ fontSize: 13, color: ${C.textMid} }}>
                  {isPro ? "Glisse ton screenshot de chart ici" : "Fonctionnalité Ultra-Premium"}
                </div>
                <div style={{ fontSize: 11, color: ${C.textDim}, fontFamily: F.mono, marginTop: 5 }}>PNG, JPG, WEBP</div>
              </>
            )}
          </div>
        </label>

        {preview && isPro && (
          <button onClick={analyze} disabled={analyzing} style={{
            width: "100%", marginTop: 12, padding: "11px", borderRadius: 9,
            border: "none", background: analyzing ? ${C.bgInner} : ${C.green},
            color: analyzing ? ${C.textDim} : "#000",
            cursor: analyzing ? "not-allowed" : "pointer",
            fontSize: 12, fontWeight: 700, fontFamily: F.mono, letterSpacing: "0.08em",
            transition: "all 0.2s",
          }}>
            {analyzing ? "ANALYSE EN COURS..." : "ANALYSER LE PATTERN →"}
          </button>
        )}
      </div>

      {error && <div style={{ marginTop: 12, background: ${C.redDim}, border: `1px solid ${C.redBord}`, padding: "10px 14px", borderRadius: 9, color: ${C.red}, fontSize: 12, fontFamily: F.mono }}>{error}</div>}

      {/* Results */}
      {result && (
        <div style={{ marginTop: 16, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
          {result.raw ? (
            <div style={{ fontSize: 13, color: ${C.textMid}, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{result.raw}</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Patterns */}
              {result.patterns?.length > 0 && (
                <div>
                  <div style={{ fontSize: 9, color: ${C.textDim}, fontFamily: F.mono, letterSpacing: "0.12em", marginBottom: 8 }}>PATTERNS DÉTECTÉS</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {result.patterns.map((p, i) => (
                      <span key={i} style={{ fontSize: 11, color: ${C.green}, fontFamily: F.mono, background: ${C.greenDim}, border: `1px solid ${C.greenBord}`, borderRadius: 20, padding: "4px 12px" }}>{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bias */}
              {result.bias && (
                <div>
                  <div style={{ fontSize: 9, color: ${C.textDim}, fontFamily: F.mono, letterSpacing: "0.12em", marginBottom: 4 }}>BIAIS</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: result.bias.toLowerCase().includes("haussier") ? ${C.green} : result.bias.toLowerCase().includes("baissier") ? ${C.red} : ${C.orange}, fontFamily: F.mono }}>
                    {result.bias}
                  </div>
                </div>
              )}

              {/* Setup */}
              {result.setup && (
                <div style={{ background: ${C.bgInner}, borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 9, color: ${C.textDim}, fontFamily: F.mono, letterSpacing: "0.12em", marginBottom: 8 }}>SETUP POTENTIEL</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 8 }}>
                    {[["ENTRÉE", result.setup.entry, ${C.text}], ["SL", result.setup.sl, ${C.red}], ["TP", result.setup.tp, ${C.green}]].map(([l, v, c]) => (
                      <div key={l}>
                        <div style={{ fontSize: 9, color: ${C.textDim}, fontFamily: F.mono, letterSpacing: "0.1em", marginBottom: 3 }}>{l}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: c, fontFamily: F.mono }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {result.setup.rationale && <div style={{ fontSize: 12, color: ${C.textMid}, lineHeight: 1.6 }}>{result.setup.rationale}</div>}
                </div>
              )}

              {/* Levels */}
              {result.levels?.length > 0 && (
                <div>
                  <div style={{ fontSize: 9, color: ${C.textDim}, fontFamily: F.mono, letterSpacing: "0.12em", marginBottom: 8 }}>NIVEAUX CLÉS</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {result.levels.map((l, i) => (
                      <div key={i} style={{ fontSize: 12, color: ${C.textMid}, fontFamily: F.mono }}>
                        <span style={{ color: ${C.orange} }}>{l.type}</span> — {l.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
