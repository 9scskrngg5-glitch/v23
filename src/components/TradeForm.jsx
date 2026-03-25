import { useEffect, useRef, useState } from "react";
import { C, F } from "../lib/design";
import { VoiceNote } from "./VoiceNote";
import { calcRR } from "../lib/trading";
import { uploadScreenshot } from "../lib/storage";

const FIELDS = [
  { k: "pair",       label: "Pair",            ph: "BTC/USD",           type: "text"   },
  { k: "session",    label: "Session",          ph: "New York",          type: "text"   },
  { k: "entry",      label: "Entrée",           ph: "104500",            type: "number" },
  { k: "sl",         label: "Stop Loss",        ph: "104000",            type: "number" },
  { k: "tp",         label: "Take Profit",      ph: "105500",            type: "number" },
  { k: "result",     label: "Résultat ($)",     ph: "+120 ou vide",      type: "number" },
  { k: "setup",      label: "Setup",            ph: "Break of structure",type: "text"   },
  { k: "emotion",    label: "Émotion",          ph: "calme / revenge…",  type: "text"   },
  { k: "confidence", label: "Confiance (1–10)", ph: "7",                 type: "number" },
];

const inputStyle = {
  background: C.bgInner, border: "1px solid #181b2e", color: C.text,
  padding: "9px 13px", borderRadius: 10, width: "100%",
  fontSize: 13, fontFamily: "'DM Mono', monospace",
  transition: "border-color 0.2s", outline: "none",
};

export const TradeForm = ({ initialValues, onSubmit, onCancel, submitLabel = "Valider →", isPro }) => {
  const [form, setForm] = useState(initialValues);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [voiceNote, setVoiceNote] = useState(initialValues.voiceNote || "");
  const [preview, setPreview] = useState(initialValues.screenshotUrl || null);
  const fileRef = useRef();

  useEffect(() => {
    if (form.entry && form.sl && form.tp) {
      const rr = calcRR(Number(form.entry), Number(form.sl), Number(form.tp));
      setForm((f) => ({ ...f, rr }));
    }
  }, [form.entry, form.sl, form.tp]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !form.id) return;
    setUploading(true);
    const url = await uploadScreenshot(form.id, file);
    if (url) { set("screenshotUrl", url); setPreview(url); }
    setUploading(false);
  };

  const handleSubmit = async () => {
    setError("");
    const { error } = await onSubmit(form);
    if (error) setError(error);
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {FIELDS.map(({ k, label, ph, type }) => (
          <div key={k}>
            <label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 4, fontFamily: "'DM Mono', monospace" }}>
              {label}
            </label>
            <input
              type={type} placeholder={ph} value={form[k] ?? ""}
              onChange={(e) => set(k, e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = C.green)}
              onBlur={(e) => (e.target.style.borderColor = C.border)}
            />
          </div>
        ))}
      </div>

      {/* Voice note */}
      <div style={{ marginTop: 14 }}>
        <VoiceNote
          onTranscribed={(text) => { setVoiceNote(text); set("voiceNote", text); }}
          existingNote={voiceNote}
        />
      </div>

      {/* Screenshot upload — Pro only */}
      <div style={{ marginTop: 14 }}>
        <label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>
          Screenshot du trade {!isPro && <span style={{ color: C.orange }}>· Pro</span>}
        </label>
        {isPro ? (
          <div>
            {preview ? (
              <div style={{ position: "relative", display: "inline-block" }}>
                <img src={preview} alt="screenshot" style={{ maxHeight: 160, borderRadius: 10, border: "1px solid #181b2e", display: "block" }} />
                <button onClick={() => { set("screenshotUrl", null); setPreview(null); }} style={{
                  position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.7)",
                  border: "none", borderRadius: 6, color: C.red, cursor: "pointer",
                  fontSize: 12, padding: "3px 7px",
                }}>✕</button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `1px dashed ${C.textGhost}`, borderRadius: 10,
                  padding: "18px", textAlign: "center", cursor: "pointer",
                  color: C.textDim, fontSize: 12, fontFamily: "'DM Mono', monospace",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = C.green}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = C.textDim}
              >
                {uploading ? "Upload en cours…" : "Clique pour ajouter une image"}
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
          </div>
        ) : (
          <div style={{
            border: "1px dashed #181b2e", borderRadius: 10, padding: "14px",
            textAlign: "center", color: C.textDim, fontSize: 12,
            fontFamily: "'DM Mono', monospace",
          }}>
            🔒 Disponible en Pro
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
        <span style={{ fontSize: 12, color: C.textDim, fontFamily: "'DM Mono', monospace" }}>
          R/R <span style={{ color: form.rr ? C.green : "#2a3050", fontWeight: 700 }}>{form.rr || "—"}</span>
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          {onCancel && (
            <button onClick={onCancel} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid #181b2e", background: "transparent", color: C.textDim, cursor: "pointer", fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
              Annuler
            </button>
          )}
          <button onClick={handleSubmit} style={{ padding: "9px 22px", borderRadius: 10, border: "none", background: C.green, color: "#000", cursor: "pointer", fontSize: 13, fontWeight: 800, fontFamily: "'DM Mono', monospace" }}>
            {submitLabel}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 12, background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.2)", padding: "10px 13px", borderRadius: 10, color: C.red, fontSize: 13, fontFamily: "'DM Mono', monospace" }}>
          {error}
        </div>
      )}
    </div>
  );
};
