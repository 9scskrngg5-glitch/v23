/** @returns {string} */
export const uid = () => Math.random().toString(36).slice(2, 9);

/**
 * Calculate Risk/Reward ratio
 * @param {number} entry
 * @param {number} sl
 * @param {number} tp
 * @returns {string}
 */
export const calcRR = (entry, sl, tp) => {
  const risk = Math.abs(entry - sl);
  const reward = Math.abs(tp - entry);
  return risk ? (reward / risk).toFixed(2) : "";
};

/**
 * Build equity curve data points
 * @param {import('../types').Trade[]} trades
 * @returns {{i: number, eq: number}[]}
 */
export const buildEquity = (trades) => {
  let eq = 0;
  return trades
    .filter((t) => t.result !== "")
    .map((t, i) => {
      eq += Number(t.result);
      return { i: i + 1, eq: parseFloat(eq.toFixed(2)) };
    });
};

/**
 * Compute full stats from a trade list
 * @param {import('../types').Trade[]} trades
 * @returns {import('../types').Stats|null}
 */
export const computeStats = (trades) => {
  const closed = trades.filter((t) => t.result !== "");
  if (!closed.length) return null;

  const wins = closed.filter((t) => Number(t.result) > 0);
  const losses = closed.filter((t) => Number(t.result) < 0);
  const totalPnL = closed.reduce((acc, t) => acc + Number(t.result), 0);
  const totalWin = wins.reduce((a, t) => a + Number(t.result), 0);
  const totalLoss = Math.abs(losses.reduce((a, t) => a + Number(t.result), 0));
  const avgWin = wins.length ? totalWin / wins.length : 0;
  const avgLoss = losses.length ? totalLoss / losses.length : 0;
  const winRate = wins.length / closed.length;
  const expectancy = winRate * avgWin - (1 - winRate) * avgLoss;
  const profitFactor = totalLoss ? totalWin / totalLoss : 0;

  const bestTrade = closed.reduce(
    (best, t) => (Number(t.result) > Number(best.result) ? t : best),
    closed[0]
  );
  const worstTrade = closed.reduce(
    (worst, t) => (Number(t.result) < Number(worst.result) ? t : worst),
    closed[0]
  );

  const streak = (() => {
    let cur = 0, max = 0;
    for (const t of [...closed].reverse()) {
      if (Number(t.result) > 0) { cur++; max = Math.max(max, cur); }
      else cur = 0;
    }
    return max;
  })();

  let peak = 0, eq = 0, maxDD = 0;
  for (const t of closed) {
    eq += Number(t.result);
    if (eq > peak) peak = eq;
    const dd = peak - eq;
    if (dd > maxDD) maxDD = dd;
  }

  return {
    total: closed.length,
    winRate: (winRate * 100).toFixed(1),
    totalPnL: totalPnL.toFixed(2),
    avgWin: avgWin.toFixed(2),
    avgLoss: avgLoss.toFixed(2),
    expectancy: expectancy.toFixed(2),
    profitFactor: profitFactor.toFixed(2),
    maxDD: maxDD.toFixed(2),
    bestTrade: Number(bestTrade.result).toFixed(2),
    worstTrade: Number(worstTrade.result).toFixed(2),
    streak,
  };
};

/**
 * Detect trade mistakes and return warning flags
 * @param {Partial<import('../types').Trade>} trade
 * @returns {string[]}
 */
export const detectMistakes = (trade) => {
  const flags = [];
  if (trade.rr && Number(trade.rr) < 1) flags.push("RR < 1");
  if (!trade.sl) flags.push("Pas de SL");
  if ((trade.emotion || "").toLowerCase() === "revenge") flags.push("Revenge trade");
  if (trade.confidence && Number(trade.confidence) < 4) flags.push("Confiance faible");
  return flags;
};

/**
 * Detect current market regime from recent trades
 * @param {import('../types').Trade[]} trades
 * @returns {import('../types').Regime|null}
 */
export const detectRegime = (trades) => {
  const closed = trades.filter((t) => t.result !== "");
  if (closed.length < 10) return null;

  const recent = closed.slice(-20).map((t) => Number(t.result));
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const variance =
    recent.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / recent.length;

  if (variance > 5000) return "CHAOTIC";
  if (avg > 0) return "TRENDING_UP";
  if (avg < 0) return "DISTRIBUTION";
  return "SIDEWAYS";
};

/** @type {Record<import('../types').Regime, {label: string, color: string, hint: string}>} */
export const REGIME_META = {
  TRENDING_UP:  { label: "Trending ↑",   color: "#00e5a0", hint: "Momentum actif — suis la tendance" },
  DISTRIBUTION: { label: "Distribution", color: "#f5a623", hint: "Marché en rotation — réduis le risque" },
  SIDEWAYS:     { label: "Sideways",      color: "#a0a8c8", hint: "Range — attends une cassure claire" },
  CHAOTIC:      { label: "Chaotic ⚠",    color: "#ff4d6d", hint: "Volatilité extrême — NE TRADE PAS" },
};

/**
 * Run Monte Carlo simulation on closed trades
 * @param {import('../types').Trade[]} trades
 * @param {number} [sims=400]
 * @param {number} [len=100]
 * @param {number} [start=1000]
 * @returns {import('../types').MonteCarloResult|null}
 */
export const monteCarlo = (trades, sims = 400, len = 100, start = 1000) => {
  const closed = trades.filter((t) => t.result !== "");
  if (closed.length < 10) return null;

  const results = closed.map((t) => Number(t.result));
  let ruin = 0;
  const ddList = [];

  for (let s = 0; s < sims; s++) {
    let eq = start, peak = start, maxDD = 0;
    for (let i = 0; i < len; i++) {
      eq += results[Math.floor(Math.random() * results.length)];
      if (eq <= 0) { ruin++; break; }
      peak = Math.max(peak, eq);
      maxDD = Math.max(maxDD, peak - eq);
    }
    ddList.push(maxDD);
  }

  return {
    avgDD: (ddList.reduce((a, b) => a + b, 0) / ddList.length).toFixed(0),
    ruinPct: ((ruin / sims) * 100).toFixed(1),
  };
};

/**
 * Format a timestamp to French locale string
 * @param {number} ts
 * @returns {string}
 */
export const formatTs = (ts) => {
  const n = typeof ts === "number" ? ts : Number(ts);
  if (!Number.isFinite(n)) return "";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(n));
  } catch {
    return "";
  }
};

/**
 * Color for a PnL value
 * @param {string|number} v
 * @returns {string}
 */
export const pnlColor = (v) =>
  Number(v) > 0 ? "#00e5a0" : Number(v) < 0 ? "#ff4d6d" : "#4a5070";
