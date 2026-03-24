import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { authFetch } from "../lib/auth";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { C, F, card } from "../lib/design";

// ── Stat Box ──────────────────────────────────────────────────────────────
const StatBox = ({ label, value, color = C.text, sub }) => (
  <div style={{ ...card(), padding: "16px 18px" }}>
    <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.15em", fontFamily: F.mono, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "'Syne', sans-serif" }}>{value}</div>
    {sub && <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, marginTop: 4 }}>{sub}</div>}
  </div>
);

// ── Action Modal ──────────────────────────────────────────────────────────
const ActionModal = ({ user, type, onConfirm, onClose, acting, success }) => {
  const [msg, setMsg] = useState("");

  const CONFIGS = {
    grant_pro:      { title: "Activer Pro",            color: C.green,  confirmLabel: "ACTIVER",   desc: "L'utilisateur reçoit un email et passe en Pro immédiatement." },
    revoke_pro:     { title: "Révoquer Pro",           color: C.red,    confirmLabel: "RÉVOQUER",  desc: "L'accès Pro sera retiré immédiatement." },
    send_message:   { title: "Envoyer un message",     color: C.green,  confirmLabel: "ENVOYER →", desc: null },
    reset_password: { title: "Reset mot de passe",     color: C.orange, confirmLabel: "ENVOYER",   desc: "Un email de réinitialisation sera envoyé." },
    delete_user:    { title: "Supprimer le compte",    color: C.red,    confirmLabel: "SUPPRIMER", desc: "Action irréversible. Tous les trades seront perdus." },
  };

  const cfg = CONFIGS[type] || {};

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, backdropFilter: "blur(6px)", padding: 20 }}>
      <div style={{ width: "min(440px, 95vw)", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: F.mono, marginBottom: 4 }}>{cfg.title}</div>
        <div style={{ fontSize: 12, color: C.textDim, fontFamily: F.mono, marginBottom: 16 }}>{user.email}</div>

        {cfg.desc && (
          <div style={{ background: C.bgInner, borderRadius: 9, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: C.textDim, fontFamily: F.mono }}>{cfg.desc}</div>
        )}

        {type === "send_message" && (
          <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Message à envoyer..."
            style={{ width: "100%", minHeight: 100, background: C.bgInner, border: `1px solid ${C.border}`, color: C.text, borderRadius: 9, padding: "10px 13px", fontSize: 12, fontFamily: F.mono, outline: "none", resize: "vertical", marginBottom: 14 }}
            onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border}
          />
        )}

        {success && (
          <div style={{ background: C.greenDim, border: `1px solid ${C.greenBord}`, padding: "10px 13px", borderRadius: 8, color: C.green, fontSize: 12, fontFamily: F.mono, marginBottom: 12 }}>✓ Action effectuée</div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.textDim, cursor: "pointer", fontSize: 11, fontFamily: F.mono }}>
            ANNULER
          </button>
          <button
            onClick={() => onConfirm(type, user.id, type === "send_message" ? { message: msg } : {})}
            disabled={acting || (type === "send_message" && !msg.trim())}
            style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: cfg.color, color: "#000", cursor: acting ? "not-allowed" : "pointer", fontSize: 11, fontWeight: 700, fontFamily: F.mono, opacity: acting ? 0.6 : 1 }}
          >
            {acting ? "..." : cfg.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Users Tab ──────────────────────────────────────────────────────────────
const UsersTab = ({ users, onRefresh }) => {
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [actionModal, setActionModal] = useState(null);
  const [acting, setActing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);

  const filtered = users
    .filter(u => (!search || u.email.toLowerCase().includes(search.toLowerCase())) && (filterPlan === "all" || u.plan === filterPlan))
    .sort((a, b) => sortBy === "trades" ? b.tradeCount - a.tradeCount : new Date(b[sortBy]) - new Date(a[sortBy]));

  const handleAction = async (action, userId, data = {}) => {
    setActing(true);
    try {
      await authFetch("/api/admin-user-action", { method: "POST", body: { action, userId, data } });
      setActionSuccess(true);
      setTimeout(() => { setActionSuccess(false); setActionModal(null); onRefresh(); }, 1500);
    } catch (e) {
      console.error("Action error:", e);
    } finally {
      setActing(false);
    }
  };

  return (
    <div>
      {actionModal && (
        <ActionModal user={actionModal.user} type={actionModal.type} onConfirm={handleAction}
          onClose={() => setActionModal(null)} acting={acting} success={actionSuccess}
        />
      )}

      {/* Controls */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Recherche email..."
          style={{ background: C.bgCard, border: `1px solid ${C.border}`, color: C.text, padding: "7px 14px", borderRadius: 7, fontSize: 11, fontFamily: F.mono, outline: "none", flex: 1, minWidth: 180 }}
          onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border}
        />
        {["all", "free", "pro"].map(p => (
          <button key={p} onClick={() => setFilterPlan(p)} style={{
            padding: "7px 14px", borderRadius: 7, border: "1px solid",
            borderColor: filterPlan === p ? C.greenBord : C.border,
            background: filterPlan === p ? C.greenDim : "transparent",
            color: filterPlan === p ? C.green : C.textDim,
            cursor: "pointer", fontSize: 10, fontFamily: F.mono, letterSpacing: "0.08em",
          }}>{p.toUpperCase()}</button>
        ))}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ background: C.bgCard, border: `1px solid ${C.border}`, color: C.textMid, padding: "7px 10px", borderRadius: 7, fontSize: 10, fontFamily: F.mono, outline: "none", cursor: "pointer" }}>
          <option value="createdAt">Récents</option>
          <option value="lastSignIn">Dernière connexion</option>
          <option value="trades">Plus de trades</option>
        </select>
        <span style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono }}>{filtered.length} users</span>
      </div>

      {/* Table */}
      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Email", "Inscription", "Dernière connexion", "Plan", "Trades", "Statut", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: `1px solid ${C.bgInner}` }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.01)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "10px 14px", fontSize: 12, color: C.textMid, fontFamily: F.mono, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</td>
                  <td style={{ padding: "10px 14px", fontSize: 11, color: C.textDim, fontFamily: F.mono, whiteSpace: "nowrap" }}>{new Date(u.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td style={{ padding: "10px 14px", fontSize: 11, color: C.textDim, fontFamily: F.mono, whiteSpace: "nowrap" }}>{u.lastSignIn ? new Date(u.lastSignIn).toLocaleDateString("fr-FR") : "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ fontSize: 9, fontFamily: F.mono, letterSpacing: "0.08em", padding: "3px 8px", borderRadius: 4, background: u.plan === "pro" ? "rgba(0,229,160,0.1)" : "rgba(255,255,255,0.04)", color: u.plan === "pro" ? C.green : C.textDim, border: `1px solid ${u.plan === "pro" ? "rgba(0,229,160,0.2)" : C.border}` }}>{u.plan.toUpperCase()}</span>
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: 11, color: C.textDim, fontFamily: F.mono }}>{u.tradeCount}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ fontSize: 9, color: u.confirmed ? C.green : C.orange, fontFamily: F.mono }}>{u.confirmed ? "✓" : "PENDING"}</span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <ActionBtn color={u.plan === "pro" ? C.red : C.green} label={u.plan === "pro" ? "REVOKE" : "PRO"} onClick={() => setActionModal({ user: u, type: u.plan === "pro" ? "revoke_pro" : "grant_pro" })} />
                      <ActionBtn color={C.textDim} label="MSG" onClick={() => setActionModal({ user: u, type: "send_message" })} />
                      <ActionBtn color={C.orange} label="PWD" onClick={() => setActionModal({ user: u, type: "reset_password" })} />
                      <ActionBtn color={C.red} label="DEL" onClick={() => { if (window.confirm(`Supprimer ${u.email} ?`)) setActionModal({ user: u, type: "delete_user" }); }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div style={{ padding: 32, textAlign: "center", color: C.textGhost, fontSize: 12, fontFamily: F.mono }}>Aucun utilisateur trouvé</div>}
      </div>
    </div>
  );
};

const ActionBtn = ({ color, label, onClick }) => (
  <button onClick={onClick} style={{ padding: "3px 8px", borderRadius: 5, border: `1px solid ${color}40`, background: `${color}10`, color, cursor: "pointer", fontSize: 9, fontFamily: F.mono, transition: "opacity 0.15s" }}
    onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
  >{label}</button>
);

// ── Support Tab ────────────────────────────────────────────────────────────
const SupportTab = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await authFetch("/api/admin-support");
      setMessages(data.messages || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Small delay to let Supabase restore session from localStorage
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await authFetch("/api/admin-support", { method: "POST", body: { id: replyModal.id, reply: replyText } });
      setReplyModal(null); setReplyText("");
      load();
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const handleStatus = async (id, status) => {
    try {
      await authFetch("/api/admin-support", { method: "POST", body: { id, status } });
      load();
    } catch (e) { console.error(e); }
  };

  const STATUS = { open: { color: C.orange, label: "Ouvert" }, in_progress: { color: C.purple, label: "En cours" }, closed: { color: C.green, label: "Résolu" } };
  const filtered = filterStatus === "all" ? messages : messages.filter(m => m.status === filterStatus);
  const openCount = messages.filter(m => m.status === "open").length;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      {replyModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, backdropFilter: "blur(6px)", padding: 20 }}>
          <div style={{ width: "min(500px, 95vw)", background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: F.mono, marginBottom: 4 }}>{replyModal.subject}</div>
            <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono, marginBottom: 12 }}>{replyModal.user_email}</div>
            <div style={{ background: C.bgInner, borderRadius: 9, padding: "12px 14px", marginBottom: 14, fontSize: 12, color: C.textMid, lineHeight: 1.6 }}>{replyModal.message}</div>
            <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Ta réponse..."
              style={{ width: "100%", minHeight: 100, background: C.bgInner, border: `1px solid ${C.border}`, color: C.text, borderRadius: 9, padding: "10px 13px", fontSize: 12, fontFamily: F.mono, outline: "none", resize: "vertical", marginBottom: 14 }}
              onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setReplyModal(null); setReplyText(""); }} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.textDim, cursor: "pointer", fontSize: 11, fontFamily: F.mono }}>ANNULER</button>
              <button onClick={handleReply} disabled={sending || !replyText.trim()} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: C.green, color: "#000", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: F.mono, opacity: sending ? 0.6 : 1 }}>
                {sending ? "ENVOI..." : "RÉPONDRE & FERMER →"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {["all", "open", "in_progress", "closed"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{
            padding: "7px 14px", borderRadius: 7, border: "1px solid",
            borderColor: filterStatus === s ? C.greenBord : C.border,
            background: filterStatus === s ? C.greenDim : "transparent",
            color: filterStatus === s ? C.green : C.textDim,
            cursor: "pointer", fontSize: 10, fontFamily: F.mono, letterSpacing: "0.06em",
          }}>
            {s === "all" ? "TOUS" : s === "open" ? `OUVERTS${openCount > 0 ? ` (${openCount})` : ""}` : s === "in_progress" ? "EN COURS" : "RÉSOLUS"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ ...card(), textAlign: "center", color: C.textGhost, fontSize: 12, fontFamily: F.mono, padding: 32 }}>
          Aucun message {filterStatus !== "all" ? `"${filterStatus}"` : ""}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(msg => {
            const s = STATUS[msg.status] || STATUS.open;
            return (
              <div key={msg.id} style={{ ...card(), borderColor: `${s.color}25` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: F.mono, marginBottom: 2 }}>{msg.subject}</div>
                    <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono }}>{msg.user_email} · {new Date(msg.created_at).toLocaleDateString("fr-FR")}</div>
                  </div>
                  <span style={{ fontSize: 9, color: s.color, fontFamily: F.mono, background: `${s.color}15`, border: `1px solid ${s.color}30`, borderRadius: 20, padding: "3px 9px", flexShrink: 0, marginLeft: 10 }}>{s.label}</span>
                </div>
                <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.6, marginBottom: 10 }}>{msg.message}</div>
                {msg.admin_reply && (
                  <div style={{ background: C.greenDim, border: `1px solid ${C.greenBord}`, borderRadius: 9, padding: "10px 14px", marginBottom: 10 }}>
                    <div style={{ fontSize: 9, color: C.green, fontFamily: F.mono, letterSpacing: "0.1em", marginBottom: 4 }}>TA RÉPONSE</div>
                    <div style={{ fontSize: 12, color: C.textMid }}>{msg.admin_reply}</div>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {msg.status !== "closed" && <button onClick={() => setReplyModal(msg)} style={{ padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.greenBord}`, background: C.greenDim, color: C.green, cursor: "pointer", fontSize: 10, fontFamily: F.mono }}>RÉPONDRE</button>}
                  {msg.status === "open" && <button onClick={() => handleStatus(msg.id, "in_progress")} style={{ padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.textDim, cursor: "pointer", fontSize: 10, fontFamily: F.mono }}>EN COURS</button>}
                  {msg.status !== "closed" && <button onClick={() => handleStatus(msg.id, "closed")} style={{ padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.redBord}`, background: C.redDim, color: C.red, cursor: "pointer", fontSize: 10, fontFamily: F.mono }}>FERMER</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Shared state components ───────────────────────────────────────────────
const LoadingState = () => (
  <div style={{ textAlign: "center", padding: "60px 24px" }}>
    <div className="pulse" style={{ fontSize: 12, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.12em" }}>CHARGEMENT...</div>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div style={{ ...card(), textAlign: "center", padding: "40px 24px" }}>
    <div style={{ fontSize: 13, color: C.red, fontFamily: F.mono, marginBottom: 12 }}>{message}</div>
    {onRetry && <button onClick={onRetry} style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.textMid, cursor: "pointer", fontSize: 11, fontFamily: F.mono }}>RÉESSAYER</button>}
  </div>
);

// ── Main AdminPanel ────────────────────────────────────────────────────────
export const AdminPanel = ({ user, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const result = await authFetch("/api/admin");
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const TABS = [{ id: "overview", label: "Vue d'ensemble" }, { id: "users", label: "Utilisateurs" }, { id: "support", label: "Support" }];

  return (
    <div style={{ position: "fixed", inset: 0, background: C.bg, zIndex: 300, overflowY: "auto" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Topbar */}
      <div style={{ borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: C.bg, zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 12, color: C.green, fontFamily: F.mono, letterSpacing: "0.15em", fontWeight: 700 }}>TJ</div>
            <div style={{ width: 1, height: 16, background: C.border }} />
            <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.1em" }}>ADMIN</div>
            <div style={{ display: "flex", gap: 2, marginLeft: 8 }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "4px 14px", height: 52, border: "none", background: "none", cursor: "pointer", fontSize: 11, fontFamily: F.mono, letterSpacing: "0.06em", color: activeTab === t.id ? C.text : C.textDim, borderBottom: activeTab === t.id ? `2px solid ${C.green}` : "2px solid transparent", transition: "all 0.15s" }}>{t.label}</button>
              ))}
            </div>
          </div>
          <button onClick={onClose} style={{ padding: "7px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "transparent", color: C.textDim, cursor: "pointer", fontSize: 10, fontFamily: F.mono }}>FERMER</button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 60px" }}>
        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && activeTab === "overview" && data && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 24 }}>
              <StatBox label="MRR" value={`${data.stats.mrr}$`} color={C.green} sub={`${data.stats.proUsers} Pro actifs`} />
              <StatBox label="ARR" value={`${data.stats.mrr * 12}$`} color={C.green} sub="Revenus annuels" />
              <StatBox label="Utilisateurs" value={data.stats.totalUsers} sub={`${data.stats.freeUsers} Free · ${data.stats.proUsers} Pro`} />
              <StatBox label="Conversion" value={data.stats.totalUsers ? `${((data.stats.proUsers / data.stats.totalUsers) * 100).toFixed(1)}%` : "0%"} color={C.orange} />
              <StatBox label="Trades Total" value={data.stats.totalTrades?.toLocaleString()} />
            </div>
            <div style={{ ...card() }}>
              <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.12em", fontFamily: F.mono, textTransform: "uppercase", marginBottom: 14 }}>Inscriptions — 30 derniers jours</div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={data.signupsChart} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.bgInner} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: C.textDim, fontFamily: F.mono }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 9, fill: C.textDim }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: F.mono, fontSize: 11 }} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                  <Bar dataKey="count" fill={C.green} fillOpacity={0.7} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        {!loading && !error && activeTab === "users" && data && <UsersTab users={data.users || []} onRefresh={load} />}
        {activeTab === "support" && <SupportTab />}
      </div>
    </div>
  );
};
