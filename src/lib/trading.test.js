/**
 * trading.test.js
 * Unit tests for pure logic functions in src/lib/trading.js
 *
 * Run with: npx vitest  (or jest if preferred)
 */

import { describe, it, expect } from "vitest";
import {
  calcRR,
  buildEquity,
  computeStats,
  detectMistakes,
  detectRegime,
  monteCarlo,
  formatTs,
  pnlColor,
} from "./trading";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const makeTrade = (result, overrides = {}) => ({
  id: "t1",
  pair: "BTC/USD",
  session: "NY",
  entry: 100,
  sl: 95,
  tp: 115,
  result,
  rr: "3.00",
  emotion: "calme",
  setup: "BOS",
  confidence: 7,
  flags: [],
  createdAt: Date.now(),
  ...overrides,
});

// ─── calcRR ───────────────────────────────────────────────────────────────────
describe("calcRR", () => {
  it("returns correct R/R ratio", () => {
    expect(calcRR(100, 95, 115)).toBe("3.00");
  });

  it("returns 1:1 when risk equals reward", () => {
    expect(calcRR(100, 90, 110)).toBe("1.00");
  });

  it("returns empty string when risk is zero", () => {
    expect(calcRR(100, 100, 110)).toBe("");
  });

  it("works with short trades (entry below tp)", () => {
    // Short: entry=100, sl=105, tp=85 → risk=5, reward=15
    expect(calcRR(100, 105, 85)).toBe("3.00");
  });
});

// ─── buildEquity ──────────────────────────────────────────────────────────────
describe("buildEquity", () => {
  it("filters out open trades", () => {
    const trades = [makeTrade(100), makeTrade(""), makeTrade(50)];
    const equity = buildEquity(trades);
    expect(equity).toHaveLength(2);
  });

  it("cumulates PnL correctly", () => {
    const trades = [makeTrade(100), makeTrade(-30), makeTrade(50)];
    const equity = buildEquity(trades);
    expect(equity[0].eq).toBe(100);
    expect(equity[1].eq).toBe(70);
    expect(equity[2].eq).toBe(120);
  });

  it("returns empty array for all open trades", () => {
    expect(buildEquity([makeTrade(""), makeTrade("")])).toHaveLength(0);
  });
});

// ─── computeStats ─────────────────────────────────────────────────────────────
describe("computeStats", () => {
  it("returns null when no closed trades", () => {
    expect(computeStats([makeTrade("")])).toBeNull();
  });

  it("calculates winRate correctly", () => {
    const trades = [makeTrade(100), makeTrade(50), makeTrade(-30)];
    const stats = computeStats(trades);
    expect(stats.winRate).toBe("66.7");
  });

  it("calculates totalPnL correctly", () => {
    const trades = [makeTrade(100), makeTrade(-30)];
    const stats = computeStats(trades);
    expect(stats.totalPnL).toBe("70.00");
  });

  it("calculates max drawdown correctly", () => {
    // 100 → 150 → 80 → maxDD should be 70
    const trades = [makeTrade(100), makeTrade(50), makeTrade(-70)];
    const stats = computeStats(trades);
    expect(stats.maxDD).toBe("70.00");
  });

  it("calculates win streak from most recent", () => {
    const trades = [makeTrade(-50), makeTrade(100), makeTrade(80), makeTrade(60)];
    const stats = computeStats(trades);
    expect(stats.streak).toBe(3);
  });

  it("calculates profit factor", () => {
    const trades = [makeTrade(200), makeTrade(-100)];
    const stats = computeStats(trades);
    expect(stats.profitFactor).toBe("2.00");
  });
});

// ─── detectMistakes ───────────────────────────────────────────────────────────
describe("detectMistakes", () => {
  it("flags RR < 1", () => {
    const flags = detectMistakes({ rr: "0.8", sl: 95, emotion: "calme", confidence: 7 });
    expect(flags).toContain("RR < 1");
  });

  it("flags missing SL", () => {
    const flags = detectMistakes({ rr: "2", sl: "", emotion: "calme", confidence: 7 });
    expect(flags).toContain("Pas de SL");
  });

  it("flags revenge trade", () => {
    const flags = detectMistakes({ rr: "2", sl: 95, emotion: "Revenge", confidence: 7 });
    expect(flags).toContain("Revenge trade");
  });

  it("flags low confidence", () => {
    const flags = detectMistakes({ rr: "2", sl: 95, emotion: "calme", confidence: 3 });
    expect(flags).toContain("Confiance faible");
  });

  it("returns no flags for a clean trade", () => {
    const flags = detectMistakes({ rr: "2.5", sl: 95, emotion: "calme", confidence: 8 });
    expect(flags).toHaveLength(0);
  });
});

// ─── detectRegime ─────────────────────────────────────────────────────────────
describe("detectRegime", () => {
  it("returns null with fewer than 10 closed trades", () => {
    const trades = Array.from({ length: 9 }, () => makeTrade(10));
    expect(detectRegime(trades)).toBeNull();
  });

  it("detects TRENDING_UP when avg is positive", () => {
    const trades = Array.from({ length: 20 }, () => makeTrade(50));
    expect(detectRegime(trades)).toBe("TRENDING_UP");
  });

  it("detects DISTRIBUTION when avg is negative", () => {
    const trades = Array.from({ length: 20 }, () => makeTrade(-20));
    expect(detectRegime(trades)).toBe("DISTRIBUTION");
  });

  it("detects CHAOTIC when variance is high", () => {
    const trades = [
      ...Array.from({ length: 10 }, () => makeTrade(500)),
      ...Array.from({ length: 10 }, () => makeTrade(-500)),
    ];
    expect(detectRegime(trades)).toBe("CHAOTIC");
  });
});

// ─── monteCarlo ───────────────────────────────────────────────────────────────
describe("monteCarlo", () => {
  it("returns null with fewer than 10 closed trades", () => {
    const trades = Array.from({ length: 9 }, () => makeTrade(10));
    expect(monteCarlo(trades)).toBeNull();
  });

  it("returns avgDD and ruinPct as strings", () => {
    const trades = Array.from({ length: 20 }, () => makeTrade(10));
    const result = monteCarlo(trades, 50, 20, 1000);
    expect(typeof result.avgDD).toBe("string");
    expect(typeof result.ruinPct).toBe("string");
  });

  it("ruin % is 0 for always-profitable trades", () => {
    const trades = Array.from({ length: 20 }, () => makeTrade(100));
    const result = monteCarlo(trades, 100, 50, 1000);
    expect(result.ruinPct).toBe("0.0");
  });
});

// ─── pnlColor ─────────────────────────────────────────────────────────────────
describe("pnlColor", () => {
  it("returns green for positive", () => expect(pnlColor(100)).toBe("#00e5a0"));
  it("returns red for negative", () => expect(pnlColor(-50)).toBe("#ff4d6d"));
  it("returns gray for zero", () => expect(pnlColor(0)).toBe("#4a5070"));
});

// ─── formatTs ─────────────────────────────────────────────────────────────────
describe("formatTs", () => {
  it("returns empty string for invalid timestamps", () => {
    expect(formatTs(NaN)).toBe("");
    expect(formatTs("abc")).toBe("");
  });

  it("returns a non-empty string for valid timestamps", () => {
    const result = formatTs(Date.now());
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
