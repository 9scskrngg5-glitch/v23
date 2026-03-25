import { useState } from "react";
import { supabase } from "../lib/supabase";
import { ReferralPanel } from "./ReferralPanel";
import { SupportChat } from "./SupportChat";
import { ThemePicker } from "./ThemePicker";
import { APIKeyManager } from "./APIKeyManager";
import { Changelog } from "./Changelog";
import { exportTradesToCSV } from "../lib/exportCSV";
import { requestPushPermission } from "../lib/notifications";
import { C, F, card, inp } from "../lib/design";

const TABS = [
  { id: "account",  label: "Compte"         },
  { id: "data",     label: "Données"        },
  { id: "theme",    label: "Thème"          },
  { id: "notifs",   label: "Notifications"  },
  { id: "api",      label: "API"            },
  { id: "referral", label: "Parrainage"     },
  { id: "support",  label: "Support"        },
  { id: "about",    label: "À propos"       },
];

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: F.mono, marginBottom: 14 }}>
    {children}
  </div>
);

export const SettingsTab = ({ trades, tasks, onImport, onReset, isPro, onUpgrade, onManagePlan }) => {
  const [activeTab, setActiveTab] = useState("account");
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMonth, setExportMonth] = useState(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}`; });
  const [pushEnabled, setPushEnabled] = useState(Notification?.permission === "granted");
  const [pwdForm, setPwdForm] = useState({ new: "", confirm: "" });
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [themeId, setThemeId] = useState(() => localStorage.getItem("tj_theme") || "dark");
  const [showChangelog, setShowChangelog] = useState(false);

  const handleExportPDF = async () => {
    if (!isPro) { onUpgrade(); return; }
    setExporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/export-pdf", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` }, body: JSON.stringify({ month: exportMonth }) });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `rapport-${exportMonth}.html`; a.click(); URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
    finally { setExporting(false); }
  };

  const handleImport = async () => {
    setImportError(""); setImportSuccess(false);
    try {
      const parsed = JSON.parse(importText || "{}");
      const result = await onImport(parsed);
      if (result.error) setImportError(result.error);
      else { setImportText(""); setImportSuccess(true); setTimeout(() => setImportSuccess(false), 3000); }
    } catch { setImportError("JSON invalide."); }
  };

  const handleChangePassword = async () => {
    setPwdError(""); setPwdMsg("");
    if (pwdForm.new !== pwdForm.confirm) { setPwdError("Les mots de passe ne correspondent pas."); return; }
    if (pwdForm.new.length < 6) { setPwdError("Minimum 6 caractères."); return; }
    const { error } = await supabase.auth.updateUser({ password: pwdForm.new });
    if (error) setPwdError(error.message);
    else { setPwdMsg("Mot de passe mis à jour !"); setPwdForm({ new: "", confirm: "" }); }
  };

  const btnStyle = (variant = "default") => ({
    padding: "10px 16px", borderRadius: 8, cursor: "pointer",
    fontSize: 11, fontWeight: 700, fontFamily: F.mono, letterSpacing: "0.06em", transition: "all 0.2s",
    ...(variant === "danger" ? { border: `1px solid ${C.redBord}`, background: C.redDim, color: C.red } :
        variant === "primary" ? { border: "none", background: C.green, color: "#000" } :
        { border: `1px solid ${C.border}`, background: C.bgCard, color: C.textMid }),
  });

  return (
    <div className="fade-in">
      {showChangelog && <Changelog onClose={() => setShowChangelog(false)} />}

      {/* Tabs — uniform padding, flex-wrap */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "7px 14px", borderRadius: 8, border: "1px solid",
            borderColor: activeTab === t.id ? C.greenBord : C.border,
            background: activeTab === t.id ? C.greenDim : "transparent",
            color: activeTab === t.id ? C.green : C.textDim,
            cursor: "pointer", fontSize: 11, fontFamily: F.mono,
            letterSpacing: "0.06em", whiteSpace: "nowrap", transition: "all 0.15s",
            outline: "none",
          }}>{t.label}</button>
        ))}
      </div>

      {/* COMPTE */}
      {activeTab === "account" && (
        <div>
          <div style={{ ...card(), marginBottom: 14 }}>
            <SectionTitle>Abonnement</SectionTitle>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: isPro ? C.green : C.orange, fontFamily: F.mono, marginBottom: 4 }}>{isPro ? "Pro" : "Free"}</div>
                <div style={{ fontSize: 12, color: C.textDim, fontFamily: F.mono }}>{isPro ? "Accès illimité à toutes les fonctionnalités" : `${trades.length} / 20 trades utilisés`}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {!isPro && <button style={btnStyle("primary")} onClick={onUpgrade}>UPGRADE →</button>}
                {isPro && <button style={btnStyle()} onClick={onManagePlan}>GÉRER L'ABONNEMENT</button>}
              </div>
            </div>
          </div>

          <div style={{ ...card(), marginBottom: 14 }}>
            <SectionTitle>Changer le mot de passe</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 360 }}>
              {[["new", "Nouveau mot de passe"], ["confirm", "Confirmer"]].map(([k, label]) => (
                <div key={k}>
                  <label style={{ fontSize: 9, color: ${C.textDim}, display: "block", marginBottom: 5, fontFamily: F.mono, letterSpacing: "0.1em" }}>{label.toUpperCase()}</label>
                  <input type="password" value={pwdForm[k]} onChange={e => setPwdForm(f => ({ ...f, [k]: e.target.value }))}
                    placeholder="••••••••" style={inp()}
                    onFocus={e => e.target.style.borderColor = ${C.gree}n} onBlur={e => e.target.style.borderColor = ${C.borde}r}
                  />
                </div>
              ))}
              {pwdError && <div style={{ background: ${C.redDim}, border: `1px solid ${C.redBord}`, padding: "8px 12px", borderRadius: 7, color: ${C.red}, fontSize: 11, fontFamily: F.mono }}>{pwdError}</div>}
              {pwdMsg && <div style={{ background: ${C.greenDim}, border: `1px solid ${C.greenBord}`, padding: "8px 12px", borderRadius: 7, color: ${C.green}, fontSize: 11, fontFamily: F.mono }}>{pwdMsg}</div>}
              <button style={btnStyle("primary")} onClick={handleChangePassword}>METTRE À JOUR</button>
            </div>
          </div>

          <div style={{ ...card(), borderColor: `${C.redBord}50` }}>
            <SectionTitle>Zone dangereuse</SectionTitle>
            <button style={btnStyle("danger")} onClick={() => { if (window.confirm("Supprimer tous les trades et tâches ?")) onReset(); }}>RESET DONNÉES</button>
          </div>
        </div>
      )}

      {/* DONNÉES */}
      {activeTab === "data" && (
        <div>
          {/* Stats overview */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Trades", value: trades.length, color: ${C.green} },
              { label: "Tâches", value: tasks.length, color: ${C.textMid} },
              { label: "Avec résultat", value: trades.filter(t => t.result !== "").length, color: ${C.green} },
              { label: "Avec setup", value: trades.filter(t => t.setup?.trim()).length, color: ${C.orange} },
            ].map(s => (
              <div key={s.label} style={{ background: ${C.bgInner}, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 9, color: ${C.textDim}, fontFamily: F.mono, letterSpacing: "0.12em", marginBottom: 4 }}>{s.label.toUpperCase()}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: F.display }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Export */}
          <div style={{ ...card(), marginBottom: 14 }}>
            <SectionTitle>Export</SectionTitle>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              <button style={btnStyle()} onClick={() => {
                const data = { trades, tasks, version: 2, exportedAt: Date.now(), tradeCount: trades.length };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `log-pip-backup-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}>
                ↓ BACKUP JSON
              </button>
              <button style={btnStyle()} onClick={() => exportTradesToCSV(trades)}>
                ↓ EXPORT CSV
              </button>
            </div>
            <div style={{ fontSize: 11, color: ${C.textDim}, fontFamily: F.mono, lineHeight: 1.6 }}>
              Le backup JSON contient tous tes trades et tâches. Garde-le précieusement.
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap", marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
              <div>
                <label style={{ fontSize: 9, color: ${C.textDim}, display: "block", marginBottom: 5, fontFamily: F.mono, letterSpacing: "0.1em" }}>RAPPORT MENSUEL (PRO)</label>
                <input type="month" value={exportMonth} onChange={e => setExportMonth(e.target.value)}
                  style={{ ...inp({ width: "auto" }), colorScheme: "dark" }}
                  onFocus={e => e.target.style.borderColor = ${C.gree}n} onBlur={e => e.target.style.borderColor = ${C.borde}r}
                />
              </div>
              <button style={btnStyle(isPro ? "primary" : "default")} onClick={handleExportPDF} disabled={exporting}>
                {exporting ? "EXPORT..." : isPro ? "EXPORTER PDF" : "PRO UNIQUEMENT"}
              </button>
            </div>
          </div>

          {/* Import */}
          <div style={{ ...card(), marginBottom: 14 }}>
            <SectionTitle>Import</SectionTitle>

            {/* File drop zone */}
            <div
              style={{ border: `2px dashed ${C.border}`, borderRadius: 10, padding: "20px", textAlign: "center", marginBottom: 14, cursor: "pointer", transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = ${C.borderHo}v}
              onMouseLeave={e => e.currentTarget.style.borderColor = ${C.borde}r}
              onDrop={e => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => setImportText(ev.target.result);
                reader.readAsText(file);
                e.currentTarget.style.borderColor = ${C.border};
              }}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = ${C.green}; }}
              onDragLeave={e => { e.currentTarget.style.borderColor = ${C.border}; }}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file"; input.accept = ".json";
                input.onchange = e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => setImportText(ev.target.result);
                  reader.readAsText(file);
                };
                input.click();
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 8 }}>↑</div>
              <div style={{ fontSize: 12, color: ${C.textMid}, fontFamily: F.mono }}>Glisse ton fichier JSON ici</div>
              <div style={{ fontSize: 10, color: ${C.textDim}, fontFamily: F.mono, marginTop: 4 }}>ou clique pour choisir</div>
            </div>

            <textarea value={importText} onChange={e => setImportText(e.target.value)}
              placeholder='{"trades":[...],"tasks":[]}'
              style={{ width: "100%", minHeight: 80, background: ${C.bgInner}, border: `1px solid ${C.border}`, color: ${C.text}, borderRadius: 9, padding: "10px 13px", fontSize: 11, fontFamily: F.mono, outline: "none", resize: "vertical" }}
              onFocus={e => e.target.style.borderColor = ${C.gree}n} onBlur={e => e.target.style.borderColor = ${C.borde}r}
            />

            {/* Preview if valid JSON */}
            {importText && (() => {
              try {
                const parsed = JSON.parse(importText);
                const tc = parsed.trades?.length ?? 0;
                const tk = parsed.tasks?.length ?? 0;
                return (
                  <div style={{ marginTop: 8, padding: "8px 12px", background: ${C.greenDim}, border: `1px solid ${C.greenBord}`, borderRadius: 8, fontSize: 11, color: ${C.green}, fontFamily: F.mono }}>
                    ✓ JSON valide — {tc} trade{tc > 1 ? "s" : ""}{tk > 0 ? ` · ${tk} tâche${tk > 1 ? "s" : ""}` : ""}
                  </div>
                );
              } catch {
                return importText.length > 5 ? (
                  <div style={{ marginTop: 8, padding: "8px 12px", background: ${C.redDim}, border: `1px solid ${C.redBord}`, borderRadius: 8, fontSize: 11, color: ${C.red}, fontFamily: F.mono }}>
                    ✗ JSON invalide
                  </div>
                ) : null;
              }
            })()}

            {importError && <div style={{ marginTop: 10, background: ${C.redDim}, border: `1px solid ${C.redBord}`, padding: "10px 13px", borderRadius: 8, color: ${C.red}, fontSize: 12, fontFamily: F.mono }}>{importError}</div>}
            {importSuccess && <div style={{ marginTop: 10, background: ${C.greenDim}, border: `1px solid ${C.greenBord}`, padding: "10px 13px", borderRadius: 8, color: ${C.green}, fontSize: 12, fontFamily: F.mono }}>Import réussi — {trades.length} trades chargés ✓</div>}

            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
              <button onClick={() => { setImportText(""); setImportError(""); }} style={btnStyle()}>ANNULER</button>
              <button onClick={handleImport} disabled={!importText.trim()} style={btnStyle("primary")}>IMPORTER →</button>
            </div>
          </div>
        </div>
      )}

      {/* THÈME */}
      {activeTab === "theme" && (
        <div style={{ ...card() }}>
          <ThemePicker currentThemeId={themeId} onThemeChange={setThemeId} />
        </div>
      )}

      {/* NOTIFICATIONS */}
      {activeTab === "notifs" && (
        <div style={{ ...card() }}>
          <SectionTitle>Notifications push</SectionTitle>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, color: ${C.text}, fontFamily: F.mono, marginBottom: 4 }}>Notifications navigateur</div>
              <div style={{ fontSize: 12, color: ${C.textDim} }}>Alertes de drawdown, séries de victoires, rappels</div>
            </div>
            <button onClick={async () => { const ok = await requestPushPermission(); setPushEnabled(ok); }} style={{
              padding: "8px 16px", borderRadius: 8, border: "1px solid",
              borderColor: pushEnabled ? ${C.greenBord} : ${C.border},
              background: pushEnabled ? ${C.greenDim} : "transparent",
              color: pushEnabled ? ${C.green} : ${C.textDim},
              cursor: "pointer", fontSize: 11, fontFamily: F.mono, letterSpacing: "0.06em",
            }}>{pushEnabled ? "ACTIVÉES ✓" : "ACTIVER"}</button>
          </div>
          {[
            ["Alerte drawdown journalier", "Si tu perds plus de 3% en un jour"],
            ["Série de victoires", "Quand tu enchaînes 5+ trades gagnants"],
            ["Rappel journalisation", "Si tu n'as pas tradé depuis 3 jours"],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: 12, color: ${C.textMid}, fontFamily: F.mono }}>{title}</div>
                <div style={{ fontSize: 11, color: ${C.textDim} }}>{desc}</div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: pushEnabled ? ${C.green} : ${C.textGhost} }} />
            </div>
          ))}
        </div>
      )}

      {/* API */}
      {activeTab === "api" && <APIKeyManager isPro={isPro} onUpgrade={onUpgrade} />}

      {/* PARRAINAGE */}
      {activeTab === "referral" && <ReferralPanel />}

      {/* SUPPORT */}
      {activeTab === "support" && <SupportChat />}

      {/* À PROPOS */}
      {activeTab === "about" && (
        <div style={{ ...card() }}>
          <SectionTitle>À propos</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              ["Version", "v15.0.0"],
              ["Dernière mise à jour", "Mars 2026"],
              ["Stack", "React + Vite + Supabase + Vercel"],
              ["AI Coach", "Claude Sonnet (Anthropic)"],
              ["Pattern AI", "Claude Vision (Anthropic)"],
              ["Transcription", "Whisper (OpenAI)"],
              ["Paiements", "Stripe"],
              ["Emails", "Resend"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 12, color: ${C.textDim}, fontFamily: F.mono }}>{k}</span>
                <span style={{ fontSize: 12, color: ${C.textMid}, fontFamily: F.mono }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={() => setShowChangelog(true)} style={{ padding: "8px 18px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.textMid, cursor: "pointer", fontSize: 11, fontFamily: F.mono, letterSpacing: "0.06em" }}>
              VOIR LE CHANGELOG
            </button>
          </div>
          <div style={{ marginTop: 16, fontSize: 11, color: C.textGhost, fontFamily: F.mono, textAlign: "center" }}>
            Trading Journal © 2026 — Tous droits réservés
          </div>
        </div>
      )}
    </div>
  );
};
