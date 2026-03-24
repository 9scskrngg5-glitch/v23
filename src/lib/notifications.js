export const requestPushPermission = async () => {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const result = await Notification.requestPermission();
  return result === "granted";
};

export const sendNotification = (title, body, opts = {}) => {
  if (Notification.permission !== "granted") return;
  const n = new Notification(title, {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: opts.tag || "tj-notif",
    ...opts,
  });
  setTimeout(() => n.close(), 5000);
  return n;
};

export const checkAndNotify = (trades, stats) => {
  if (!stats) return;
  const closed = trades.filter(t => t.result !== "");

  // Daily loss alert
  const today = new Date().toDateString();
  const todayTrades = closed.filter(t => new Date(t.createdAt ?? 0).toDateString() === today);
  const todayPnL = todayTrades.reduce((a, t) => a + Number(t.result), 0);
  if (todayPnL < -200) {
    sendNotification("⚠ Drawdown journalier", `Tu as perdu ${Math.abs(todayPnL).toFixed(0)}$ aujourd'hui. Pause recommandée.`, { tag: "daily-loss" });
  }

  // Win streak notification
  if (stats.streak >= 5) {
    sendNotification("🔥 Série de victoires !", `${stats.streak} trades gagnants de suite. Continue comme ça !`, { tag: "win-streak" });
  }
};
