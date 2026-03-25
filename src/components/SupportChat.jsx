import { useState, useEffect, useCallback } from "react";
import { authFetch } from "../lib/auth";
import { C, F, card, inp } from "../lib/design";

const STATUS = { open: { color: C.orange, label: "En attente" }, in_progress: { color: "#7b61ff", label: "En cours" }, closed: { color: C.green, label: "Résolu" } };

export const SupportChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "" });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [tab, setTab] = useState("history");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await authFetch("/api/support");
      setMessages(data.messages || []);
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

  const handleSend = async () => {
    if (!form.subject.trim() || !form.message.trim()) { setFormError("Sujet et message requis."); return; }
    setSending(true); setFormError(""); setFormSuccess("");
    try {
      await authFetch("/api/support", { method: "POST", body: form });
      setFormSuccess("Message envoyé ! On te répond sous 24h.");
      setForm({ subject: "", message: "" });
      setTab("history");
      load();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSending(false); }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[["history", "Mes demandes"], ["new", "Nouveau message"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "7px 14px", borderRadius: 8, border: "1px solid",
            borderColor: tab === id ? C.greenBord : C.border,
            background: tab === id ? C.greenDim : "transparent",
            color: tab === id ? C.green : C.textDim,
            cursor: "pointer", fontSize: 11, fontFamily: F.mono, letterSpacing: "0.06em",
          }}>{label}</button>
        ))}
      </div>

      {tab === "new" ? (
        <div style={{ ...card() }}>
          <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>Nouveau message</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 9, color: C.textDim, display: "block", marginBottom: 5, fontFamily: F.mono, letterSpacing: "0.1em", textTransform: "uppercase" }}>Sujet</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                placeholder="Bug, question, demande de fonctionnalité..." style={inp()}
                onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>
            <div>
              <label style={{ fontSize: 9, color: C.textDim, display: "block", marginBottom: 5, fontFamily: F.mono, letterSpacing: "0.1em", textTransform: "uppercase" }}>Message</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Décris ton problème en détail..." style={{ ...inp(), minHeight: 120, resize: "vertical" }}
                onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>
          </div>
          {formError && <div style={{ marginTop: 10, background: C.redDim, border: `1px solid ${C.redBord}`, padding: "10px 13px", borderRadius: 8, color: C.red, fontSize: 12, fontFamily: F.mono }}>{formError}</div>}
          {formSuccess && <div style={{ marginTop: 10, background: C.greenDim, border: `1px solid ${C.greenBord}`, padding: "10px 13px", borderRadius: 8, color: C.green, fontSize: 12, fontFamily: F.mono }}>{formSuccess}</div>}
          <button onClick={handleSend} disabled={sending} style={{ marginTop: 14, width: "100%", padding: "12px", borderRadius: 9, border: "none", background: sending ? C.bgInner : C.green, color: sending ? C.textDim : "#000", cursor: sending ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, fontFamily: F.mono, letterSpacing: "0.06em" }}>
            {sending ? "ENVOI..." : "ENVOYER →"}
          </button>
        </div>
      ) : loading ? (
        <div style={{ ...card(), textAlign: "center", padding: 40 }}>
          <div className="pulse" style={{ color: C.textDim, fontSize: 12, fontFamily: F.mono }}>Chargement...</div>
        </div>
      ) : error ? (
        <div style={{ ...card(), textAlign: "center", padding: 32 }}>
          <div style={{ color: C.red, fontSize: 12, fontFamily: F.mono, marginBottom: 10 }}>{error}</div>
          <button onClick={load} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.textMid, cursor: "pointer", fontSize: 11, fontFamily: F.mono }}>RÉESSAYER</button>
        </div>
      ) : messages.length === 0 ? (
        <div style={{ ...card(), textAlign: "center", color: C.textGhost, fontSize: 12, fontFamily: F.mono, padding: 32 }}>
          Aucune demande.
          <div style={{ marginTop: 12 }}>
            <button onClick={() => setTab("new")} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.textMid, cursor: "pointer", fontSize: 11, fontFamily: F.mono }}>Envoyer un message</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.map(msg => {
            const s = STATUS[msg.status] || STATUS.open;
            return (
              <div key={msg.id} style={{ ...card(), borderColor: `${s.color}25` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: ${C.text}, fontFamily: F.mono }}>{msg.subject}</div>
                  <span style={{ fontSize: 9, color: s.color, fontFamily: F.mono, background: `${s.color}15`, border: `1px solid ${s.color}30`, borderRadius: 20, padding: "3px 9px", flexShrink: 0, marginLeft: 10 }}>{s.label}</span>
                </div>
                <div style={{ fontSize: 12, color: ${C.textMid}, lineHeight: 1.6, marginBottom: 8 }}>{msg.message}</div>
                {msg.admin_reply && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 9, color: ${C.green}, fontFamily: F.mono, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Réponse du support</div>
                    <div style={{ fontSize: 12, color: ${C.textMid}, lineHeight: 1.6, borderLeft: `2px solid ${C.greenBord}`, paddingLeft: 12 }}>{msg.admin_reply}</div>
                  </div>
                )}
                <div style={{ fontSize: 10, color: C.textGhost, fontFamily: F.mono, marginTop: 8 }}>
                  {new Date(msg.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
