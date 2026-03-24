/**
 * Système de badges/achievements
 */

export const BADGES = [
  // Premiers pas
  { id: "first_trade",     icon: "◈", label: "Premier trade",        desc: "Tu as ajouté ton premier trade",             color: "#a0a8c8" },
  { id: "first_win",       icon: "▲", label: "Première victoire",    desc: "Ton premier trade gagnant",                  color: "#00e5a0" },
  { id: "ten_trades",      icon: "≡", label: "10 trades",            desc: "10 trades enregistrés",                      color: "#a0a8c8" },
  { id: "fifty_trades",    icon: "◼", label: "50 trades",            desc: "50 trades enregistrés",                      color: "#f5a623" },
  { id: "hundred_trades",  icon: "●", label: "100 trades",           desc: "100 trades enregistrés",                     color: "#00e5a0" },

  // Performance
  { id: "first_profit",    icon: "↑", label: "Premier profit",       desc: "PnL total positif pour la première fois",    color: "#00e5a0" },
  { id: "streak_3",        icon: "∥", label: "Série de 3",           desc: "3 trades gagnants de suite",                 color: "#a0a8c8" },
  { id: "streak_5",        icon: "≡", label: "Série de 5",           desc: "5 trades gagnants de suite",                 color: "#f5a623" },
  { id: "streak_10",       icon: "≋", label: "Série de 10",          desc: "10 trades gagnants de suite — légendaire",   color: "#00e5a0" },
  { id: "pf_above_2",      icon: "◆", label: "Profit Factor > 2",    desc: "Profit Factor supérieur à 2",                color: "#00e5a0" },
  { id: "winrate_60",      icon: "▦", label: "Win Rate 60%+",        desc: "Win rate supérieur à 60%",                   color: "#f5a623" },
  { id: "winrate_70",      icon: "▩", label: "Win Rate 70%+",        desc: "Win rate supérieur à 70%",                   color: "#00e5a0" },

  // Discipline
  { id: "no_revenge_10",   icon: "⊡", label: "Tête froide",          desc: "10 trades sans revenge trading",             color: "#a0a8c8" },
  { id: "discipline_a",    icon: "⊙", label: "Score A",              desc: "Score de discipline ≥ 90",                   color: "#00e5a0" },
  { id: "rr_master",       icon: "◇", label: "RR Master",            desc: "20 trades consécutifs avec RR ≥ 1.5",        color: "#f5a623" },

  // Régularité
  { id: "week_streak",     icon: "⊕", label: "7 jours actif",        desc: "Trades journalisés 7 jours de suite",        color: "#a0a8c8" },
  { id: "month_streak",    icon: "⊗", label: "30 jours actif",       desc: "Trades journalisés 30 jours de suite",       color: "#f5a623" },
];

export const computeEarnedBadges = (trades, stats, disciplineScore) => {
  if (!trades.length) return [];

  const closed = trades.filter(t => t.result !== "");
  const earned = [];

  const check = (id) => {
    const badge = BADGES.find(b => b.id === id);
    if (badge) earned.push({ ...badge, earnedAt: Date.now() });
  };

  // Premiers pas
  if (trades.length >= 1) check("first_trade");
  if (closed.some(t => Number(t.result) > 0)) check("first_win");
  if (trades.length >= 10) check("ten_trades");
  if (trades.length >= 50) check("fifty_trades");
  if (trades.length >= 100) check("hundred_trades");

  // Performance
  if (stats && Number(stats.totalPnL) > 0) check("first_profit");
  if (stats && stats.streak >= 3) check("streak_3");
  if (stats && stats.streak >= 5) check("streak_5");
  if (stats && stats.streak >= 10) check("streak_10");
  if (stats && Number(stats.profitFactor) >= 2) check("pf_above_2");
  if (stats && Number(stats.winRate) >= 60) check("winrate_60");
  if (stats && Number(stats.winRate) >= 70) check("winrate_70");

  // Discipline
  const revengeCount = closed.slice(-10).filter(t => (t.emotion || "").toLowerCase().includes("revenge")).length;
  if (closed.length >= 10 && revengeCount === 0) check("no_revenge_10");
  if (disciplineScore && disciplineScore.total >= 90) check("discipline_a");

  const last20 = closed.slice(-20);
  if (last20.length === 20 && last20.every(t => Number(t.rr) >= 1.5)) check("rr_master");

  // Régularité
  const days = new Set(trades.map(t => new Date(t.createdAt ?? 0).toDateString()));
  if (days.size >= 7) check("week_streak");
  if (days.size >= 30) check("month_streak");

  return earned;
};
