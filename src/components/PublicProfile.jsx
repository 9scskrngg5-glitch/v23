import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const mono = "'DM Mono', monospace";
const syne = "'Syne', sans-serif";

export const PublicProfile = ({ username }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/public-profile?username=${username}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return (
    <div style={{ background: "#06080f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#1e2235", fontFamily: mono, fontSize: 12 }}>
      CHARGEMENT...
    </div>
  );

  if (error) return (
    <div style={{ background: "#06080f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff4d6d", fontFamily: mono, fontSize: 12 }}>
      {error}
    </div>
  );

  const { profile, stats, equity } = data;

  return (
    <div style={{ background: "#06080f", minHeight: "100vh", color: "#dde1f5", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing: border-box; }`}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #0e1120", padding: "0 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ fontSize: 11, color: "#00e5a0", fontFamily: mono, letterSpacing: "0.15em" }}>TRADING JOURNAL</div>
          <a href="/" style={{ fontSize: 11, color: "#2d3352", fontFamily: mono, letterSpacing: "0.06em", textDecoration: "none" }}>CRÉER UN COMPTE →</a>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 60px" }}>
        {/* Profile header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontSize: 20, color: "#00e5a0", fontFamily: mono }}>
            {(profile.displayName || profile.username).charAt(0).toUpperCase()}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: syne, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
            {profile.displayName || profile.username}
          </h1>
          <div style={{ fontSize: 12, color: "#2d3352", fontFamily: mono, letterSpacing: "0.08em" }}>@{profile.username}</div>
        </div>

        {!stats ? (
          <div style={{ color: "#1e2235", fontFamily: mono, fontSize: 12 }}>Aucun trade public pour le moment.</div>
        ) : (<>
          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 24 }}>
            {[
              { label: "PnL Total", value: `${Number(stats.pnl) >= 0 ? "+" : ""}${stats.pnl}$`, color: Number(stats.pnl) >= 0 ? "#00e5a0" : "#ff4d6d" },
              { label: "Win Rate", value: `${stats.winRate}%`, color: Number(stats.winRate) >= 50 ? "#00e5a0" : "#ff4d6d" },
              { label: "Profit Factor", value: stats.pf, color: "#f5a623" },
              { label: "30 derniers jours", value: `${Number(stats.recentPnL) >= 0 ? "+" : ""}${stats.recentPnL}$`, color: Number(stats.recentPnL) >= 0 ? "#00e5a0" : "#ff4d6d" },
            ].map(s => (
              <div key={s.label} style={{ background: "#080a14", border: "1px solid #0e1120", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 9, color: "#3a4060", fontFamily: mono, letterSpacing: "0.12em", marginBottom: 6 }}>{s.label.toUpperCase()}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: mono }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Equity curve */}
          {equity?.length > 1 && (
            <div style={{ background: "#080a14", border: "1px solid #0e1120", borderRadius: 14, padding: "18px 14px", marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: "#3a4060", fontFamily: mono, letterSpacing: "0.12em", marginBottom: 14 }}>COURBE D'ÉQUITÉ (30 DERNIERS TRADES)</div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={equity}>
                  <defs>
                    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e5a0" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#00e5a0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0e1120" />
                  <XAxis dataKey="i" tick={{ fontSize: 10, fill: "#252840" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#252840" }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip contentStyle={{ background: "#0d1020", border: "1px solid #181b2e", borderRadius: 8, fontFamily: mono, fontSize: 11 }} />
                  <Area type="monotone" dataKey="eq" stroke="#00e5a0" strokeWidth={1.5} fill="url(#pg)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Share */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigator.clipboard.writeText(window.location.href)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #181b2e", background: "transparent", color: "#9099c0", cursor: "pointer", fontSize: 11, fontFamily: mono, letterSpacing: "0.06em" }}>
              COPIER LE LIEN
            </button>
            <span style={{ fontSize: 11, color: "#1e2235", fontFamily: mono }}>{stats.total} trades · Profil public</span>
          </div>
        </>)}
      </div>
    </div>
  );
};
