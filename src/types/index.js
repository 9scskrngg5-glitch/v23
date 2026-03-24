/**
 * @typedef {Object} Trade
 * @property {string} id
 * @property {string} pair
 * @property {string} session
 * @property {number} entry
 * @property {number} sl
 * @property {number} tp
 * @property {string|number} result
 * @property {string} rr
 * @property {string} emotion
 * @property {string} setup
 * @property {string|number} confidence
 * @property {string[]} flags
 * @property {number} createdAt
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} text
 * @property {boolean} done
 */

/**
 * @typedef {Object} Stats
 * @property {number} total
 * @property {string} winRate
 * @property {string} totalPnL
 * @property {string} avgWin
 * @property {string} avgLoss
 * @property {string} expectancy
 * @property {string} profitFactor
 * @property {string} maxDD
 * @property {string} bestTrade
 * @property {string} worstTrade
 * @property {number} streak
 */

/**
 * @typedef {'TRENDING_UP'|'DISTRIBUTION'|'SIDEWAYS'|'CHAOTIC'} Regime
 */

/**
 * @typedef {Object} MonteCarloResult
 * @property {string} avgDD
 * @property {string} ruinPct
 */

export {};
