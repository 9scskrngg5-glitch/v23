import { useState, useEffect, useRef } from "react";

const mono = "'DM Mono', monospace";

const generateNotifications = (stats, trades, goals) => {
  const notifs = [];
  if (!stats) return notifs;

  const closed = trades.filter(t => t.result !== "");

  // Win streak record
  if (stats.streak >= 5) {
    notifs.push({ id: "streak", type: "success", title: "Serie de victoires", message: `${stats.streak} trades gagnants de suite ! Continue comme ca.` });
  }

  // Profit factor great
  if (Number(stats.profitFactor) >= 2) {
    notifs.push({ id: "pf", type: "success", title: "Excellent Profit Factor", message: `Ton PF est a ${stats.profitFactor} — c'est dans le top des traders.` });
  }

  // Goal reached
  if (goals?.pnlTarget && Number(stats.totalPnL) >= Number(goals.pnlTarget)) {
    notifs.push({ id: "goal_pnl", type: "success", title: "Objectif PnL atteint !", message: `Tu as atteint ton objectif de ${goals.pnlTarget}$.` });
  }

  // Win rate goal
  if (goals?.winRateTarget && Number(stats.winRate) >= Number(goals.winRateTarget)) {
    notifs.push({ id: "goal_wr", type: "success", title: "Objectif Win Rate atteint !", message: `Ton win rate est a ${stats.winRate}% — objectif ${goals.winRateTarget}% atteint !` });
  }

  // Revenge trading warning
  const recentTrades = closed.slice(-5);
  const revengeCount = recentTrades.filter(t => (t.emotion || "").toLowerCase().includes("revenge")).length;
  if (revengeCount >= 2) {
    notifs.push({ id: "revenge", type: "warning", title: "Revenge trading detecte", message: `${revengeCount} trades en revenge mode recemment. Pause recommandee.` });
  }

  // Low win rate warning
  if (closed.length >= 10 && Number(stats.winRate) < 40) {
    notifs.push({ id: "winrate", type: "warning", title: "Win rate bas", message: `Ton win rate est a ${stats.winRate}%. Revois ta strategie.` });
  }

  return notifs;
};

export const NotificationBell = ({ stats, trades, goals }) => {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tj_dismissed_notifs") || "[]"); } catch { return []; }
  });
  const ref = useRef();

  const allNotifs = generateNotifications(stats, trades, goals);
  const notifs = allNotifs.filter(n => !dismissed.includes(n.id));

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem("tj_dismissed_notifs", JSON.stringify(next));
  };

  const dismissAll = () => {
    const next = [...dismissed, ...notifs.map(n => n.id)];
    setDismissed(next);
    localStorage.setItem("tj_dismissed_notifs", JSON.stringify(next));
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: "none", border: "1px solid #13162a", borderRadius: 6,
        padding: "4px 10px", cursor: "pointer", color: notifs.length > 0 ? "#f5a623" : "#2d3352",
        fontSize: 11, fontFamily: mono, letterSpacing: "0.06em", position: "relative",
        transition: "color 0.15s",
      }}>
        {notifs.length > 0 ? `! ${notifs.length}` : "·"}
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)",
          width: 300, background: "#0a0d18", border: "1px solid #181b2e",
          borderRadius: 12, zIndex: 100, overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #0e1120", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "#3a4060", fontFamily: mono, letterSpacing: "0.1em" }}>NOTIFICATIONS</span>
            {notifs.length > 0 && (
              <button onClick={dismissAll} style={{ background: "none", border: "none", color: "#2d3352", cursor: "pointer", fontSize: 10, fontFamily: mono }}>TOUT LIRE</button>
            )}
          </div>

          {notifs.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#1e2235", fontSize: 11, fontFamily: mono }}>
              Aucune notification
            </div>
          ) : (
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {notifs.map(n => (
                <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid #080a14", display: "flex", gap: 10 }}>
                  <div style={{ width: 4, borderRadius: 2, flexShrink: 0, background: n.type === "success" ? "#00e5a0" : n.type === "warning" ? "#f5a623" : "#ff4d6d" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#dde1f5", fontFamily: mono, marginBottom: 3 }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: "#4a5070", lineHeight: 1.5 }}>{n.message}</div>
                  </div>
                  <button onClick={() => dismiss(n.id)} style={{ background: "none", border: "none", color: "#2d3352", cursor: "pointer", fontSize: 14, flexShrink: 0, alignSelf: "flex-start" }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
