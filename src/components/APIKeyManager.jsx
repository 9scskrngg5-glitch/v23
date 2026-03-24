import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { C, F, card } from "../lib/design";

const API_DOCS = [
  { method: "GET",  endpoint: "/api/v1/trades",  desc: "Récupère tous tes trades" },
  { method: "POST", endpoint: "/api/v1/trades",  desc: "Ajoute un trade" },
  { method: "GET",  endpoint: "/api/v1/stats",   desc: "Récupère tes statistiques" },
  { method: "GET",  endpoint: "/api/v1/profile", desc: "Informations du compte" },
];

export const APIKeyManager = ({ isPro, onUpgrade }) => {
  const [keys, setKeys] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tj_api_keys") || "[]"); } catch { return []; }
  });
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [copied, setCopied] = useState(null);

  const generateKey = () => {
    if (!isPro) { onUpgrade(); return; }
    if (!newKeyName.trim()) return;
    const key = `tjk_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
    const newKey = { id: Date.now(), name: newKeyName, key, createdAt: new Date().toISOString(), active: true };
    const next = [...keys, newKey];
    setKeys(next);
    localStorage.setItem("tj_api_keys", JSON.stringify(next));
    setNewKeyName("");
    setCreating(false);
  };

  const revokeKey = (id) => {
    const next = keys.filter(k => k.id !== id);
    setKeys(next);
    localStorage.setItem("tj_api_keys", JSON.stringify(next));
  };

  const copy = (key, id) => {
    navigator.clipboard.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          API Publique
        </div>
        <button onClick={() => isPro ? setCreating(c => !c) : onUpgrade()} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: C.green, color: "#000", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: F.mono }}>
          + CLÉ API
        </button>
      </div>

      {/* Create key form */}
      {creating && (
        <div style={{ ...card(), marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.12em", marginBottom: 10 }}>NOUVELLE CLÉ</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={newKeyName} onChange={e => setNewKeyName(e.target.value)}
              placeholder="Nom de la clé (ex: Webhook Notion)"
              style={{ background: C.bgInner, border: `1px solid ${C.border}`, color: C.text, padding: "9px 14px", borderRadius: 8, fontSize: 13, fontFamily: F.mono, outline: "none", flex: 1 }}
              onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border}
              onKeyDown={e => e.key === "Enter" && generateKey()}
            />
            <button onClick={generateKey} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: C.green, color: "#000", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: F.mono }}>CRÉER</button>
          </div>
        </div>
      )}

      {/* Keys list */}
      {keys.length > 0 && (
        <div style={{ ...card(), marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.12em", marginBottom: 12 }}>MES CLÉS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {keys.map(k => (
              <div key={k.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: C.bgInner, borderRadius: 9, border: `1px solid ${C.border}` }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: C.text, fontFamily: F.mono, marginBottom: 2 }}>{k.name}</div>
                  <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {k.key.slice(0, 20)}...
                  </div>
                </div>
                <button onClick={() => copy(k.key, k.id)} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: copied === k.id ? C.green : C.textDim, cursor: "pointer", fontSize: 10, fontFamily: F.mono, flexShrink: 0 }}>
                  {copied === k.id ? "COPIÉ ✓" : "COPIER"}
                </button>
                <button onClick={() => revokeKey(k.id)} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.redBord}`, background: C.redDim, color: C.red, cursor: "pointer", fontSize: 10, fontFamily: F.mono, flexShrink: 0 }}>
                  RÉVOQUER
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Docs */}
      <div style={{ ...card() }}>
        <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.12em", marginBottom: 12 }}>ENDPOINTS DISPONIBLES</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {API_DOCS.map(doc => (
            <div key={doc.endpoint} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: C.bgInner, borderRadius: 8 }}>
              <span style={{ fontSize: 9, fontFamily: F.mono, letterSpacing: "0.08em", padding: "2px 7px", borderRadius: 4, flexShrink: 0, background: doc.method === "GET" ? "rgba(0,229,160,0.1)" : "rgba(123,97,255,0.1)", color: doc.method === "GET" ? C.green : C.purple, border: `1px solid ${doc.method === "GET" ? C.greenBord : "rgba(123,97,255,0.3)"}` }}>{doc.method}</span>
              <code style={{ fontSize: 11, color: C.textMid, fontFamily: F.mono, flex: 1 }}>{doc.endpoint}</code>
              <span style={{ fontSize: 11, color: C.textDim }}>{doc.desc}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: C.textDim, fontFamily: F.mono }}>
          Header requis: <code style={{ color: C.green }}>x-api-key: tjk_...</code>
        </div>
      </div>
    </div>
  );
};
