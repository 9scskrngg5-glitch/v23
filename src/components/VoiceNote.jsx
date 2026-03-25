import { useState, useRef } from "react";
import { C, F } from "../lib/design";
import { authFetch } from "../lib/auth";

const mono = "'DM Mono', monospace";

export const VoiceNote = ({ onTranscribed, existingNote }) => {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [note, setNote] = useState(existingNote || "");
  const [error, setError] = useState("");
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribe(blob);
      };
      recorder.start();
      mediaRef.current = recorder;
      setRecording(true);
    } catch (e) {
      setError("Microphone non disponible");
    }
  };

  const stopRecording = () => {
    if (mediaRef.current) { mediaRef.current.stop(); setRecording(false); }
  };

  const transcribe = async (blob) => {
    setTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("audio", blob, "audio.webm");
      const res = await authFetch("/api/voice-note", {
        method: "POST",
        body: formData,
      });

      const data = res;
      if (data.error) { setError(data.error); return; }

      const newNote = note ? `${note} ${data.text}` : data.text;
      setNote(newNote);
      onTranscribed?.(newNote);
    } catch (e) {
      setError("Erreur de transcription");
    } finally { setTranscribing(false); }
  };

  return (
    <div>
      <label style={{ fontSize: 10, color: C.textDim, display: "block", marginBottom: 6, fontFamily: mono, letterSpacing: "0.1em" }}>
        NOTE VOCALE
      </label>

      <div style={{ display: "flex", gap: 8, marginBottom: note ? 8 : 0 }}>
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={transcribing}
          style={{
            padding: "8px 14px", borderRadius: 8, border: "none",
            background: recording ? C.red : transcribing ? "#0d1020" : "rgba(0,229,160,0.1)",
            color: recording ? "#fff" : transcribing ? C.textDim : C.green,
            cursor: transcribing ? "not-allowed" : "pointer",
            fontSize: 11, fontFamily: mono, letterSpacing: "0.06em",
            display: "flex", alignItems: "center", gap: 6,
            border: recording ? "none" : "1px solid rgba(0,229,160,0.2)",
            transition: "all 0.2s",
          }}
        >
          <span style={{ fontSize: recording ? 10 : 14 }}>
            {recording ? "■" : transcribing ? "..." : "●"}
          </span>
          {recording ? "STOP" : transcribing ? "TRANSCRIPTION..." : "ENREGISTRER"}
        </button>

        {note && (
          <button onClick={() => { setNote(""); onTranscribed?.(""); }} style={{
            background: "none", border: "1px solid #181b2e", borderRadius: 8,
            color: C.textDim, cursor: "pointer", fontSize: 10, fontFamily: mono, padding: "8px 12px",
          }}>
            EFFACER
          </button>
        )}
      </div>

      {recording && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.red, animation: "pulse 1s infinite" }} />
          <span style={{ fontSize: 10, color: C.red, fontFamily: mono }}>Enregistrement en cours...</span>
        </div>
      )}

      {note && (
        <textarea
          value={note}
          onChange={e => { setNote(e.target.value); onTranscribed?.(e.target.value); }}
          style={{
            width: "100%", minHeight: 72, background: C.bgCard,
            border: "1px solid #181b2e", color: C.textMid,
            borderRadius: 8, padding: "10px 12px", fontSize: 12,
            fontFamily: mono, outline: "none", resize: "vertical", marginTop: 8,
          }}
          onFocus={e => e.target.style.borderColor = C.green}
          onBlur={e => e.target.style.borderColor = C.border}
        />
      )}

      {error && <div style={{ fontSize: 11, color: C.red, fontFamily: mono, marginTop: 6 }}>{error}</div>}
    </div>
  );
};
