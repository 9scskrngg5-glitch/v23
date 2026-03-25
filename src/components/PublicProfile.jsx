import { useState, useEffect } from "react";
import { C, F } from "../lib/design";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const mono = "'DM Mono', monospace";
const syne = "'Syne', sans-serif";

export const PublicProfile = ({ username }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/public-profile?username=${encodeURIComponent(username)}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.textGhost, fontFamily: mono, fontSize: 12 }}>
      CHARGEMENT...
    </div>
  );

  if (error) return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.red, fontFamily: mono, fontSize: 12 }}>
      {error}
    </div>
  );

  const { profile, stats, equity } = data;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing: border-box; }`}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #0e1120", padding: "0 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ fontSize: 11, color: C.green, fontFamily: mono, letterSpacing: "0.15em" }}>TRADING JOURNAL</div>
          <a href="/" style={{ fontSize: 11, color: C.textDim, fontFamily: mono, letterSpacing: "0.06em", textDecoration: "none" }}>CRÉER UN COMPTE →</a>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 60px" }}>
        {/* Profile header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontSize: 20, color: C.green, fontFamily: mono }}>
            {(profile.displayName || profile.username).charAt(0).toUpperCase()}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: syne, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
            {profile.displayName || profile.username}
          </h1>
          <div style={{ fontSize: 12, color: C.textDim, fontFamily: mono, letterSpacing: "0.08em" }}>@{profile.username}</div>
        </div>

        {!stats ? (
          <div style={{ color: C.textGhost, fontFamily: mono, fontSize: 12 }}>Aucun trade public pour le moment.</div>
        ) : (<>
          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 24 }}>
            {[
              { label: "PnL Total", value: `${Number(stats.pnl) >= 0 ? "+" : ""}${stats.pnl}$`, color: Number(stats.pnl) >= 0 ? C.green : C.red },
              { label: "Win Rate", value: `${stats.winRate}%`, color: Number(stats.winRate) >= 50 ? C.green : C.red },
              { label: "Profit Factor", value: stats.pf, color: C.orange },
              { label: "30 derniers jours", value: `${Number(stats.recentPnL) >= 0 ? "+" : ""}${stats.recentPnL}$`, color: Number(stats.recentPnL) >= 0 ? C.green : C.red },
            ].map(s => (
              <div key={s.label} style={{ background: C.bgCard, border: "1px solid #0e1120", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 9, color: C.textDim, fontFamily: mono, letterSpacing: "0.12em", marginBottom: 6 }}>{s.label.toUpperCase()}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: mono }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Equity curve */}
          {equity?.length > 1 && (
            <div style={{ background: C.bgCard, border: "1px solid #0e1120", borderRadius: 14, padding: "18px 14px", marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: C.textDim, fontFamily: mono, letterSpacing: "0.12em", marginBottom: 14 }}>COURBE D'ÉQUITÉ (30 DERNIERS TRADES)</div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={equity}>
                  <defs>
                    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor=C.green stopOpacity={0.12} />
                      <stop offset="95%" stopColor=C.green stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke=C.border />
                  <XAxis dataKey="i" tick={{ fontSize: 10, fill: "#252840" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#252840" }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip contentStyle={{ background: "#0d1020", border: "1px solid #181b2e", borderRadius: 8, fontFamily: mono, fontSize: 11 }} />
                  <Area type="monotone" dataKey="eq" stroke=C.green strokeWidth={1.5} fill="url(#pg)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Share */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigator.clipboard.writeText(window.location.href)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #181b2e", background: "transparent", color: C.textMid, cursor: "pointer", fontSize: 11, fontFamily: mono, letterSpacing: "0.06em" }}>
              COPIER LE LIEN
            </button>
            <span style={{ fontSize: 11, color: C.textGhost, fontFamily: mono }}>{stats.total} trades · Profil public</span>
          </div>
        </>)}
      </div>
    </div>
  );
};
