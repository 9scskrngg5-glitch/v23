import { C, F } from "./design";
/**
 * Calcule un score de discipline de 0 à 100
 * basé sur le respect des règles de trading
 */

export const DISCIPLINE_RULES = [
  { id: "rr_respected",    label: "RR ≥ 1.5",           weight: 20 },
  { id: "no_revenge",      label: "Pas de revenge trade", weight: 25 },
  { id: "sl_always",       label: "SL toujours défini",   weight: 20 },
  { id: "confidence_ok",   label: "Confiance ≥ 5",        weight: 15 },
  { id: "no_overtrading",  label: "Max 3 trades/jour",     weight: 10 },
  { id: "setup_filled",    label: "Setup toujours rempli", weight: 10 },
];

const checkRule = (rule, trades) => {
  if (!trades.length) return { score: 100, violations: 0 };

  switch (rule.id) {
    case "rr_respected": {
      const withRR = trades.filter(t => t.rr !== "");
      if (!withRR.length) return { score: 100, violations: 0 };
      const good = withRR.filter(t => Number(t.rr) >= 1.5).length;
      return { score: Math.round((good / withRR.length) * 100), violations: withRR.length - good };
    }
    case "no_revenge": {
      const revenge = trades.filter(t => (t.emotion || "").toLowerCase().includes("revenge")).length;
      return { score: Math.max(0, 100 - revenge * 20), violations: revenge };
    }
    case "sl_always": {
      const noSL = trades.filter(t => !t.sl || t.sl === "" || t.sl === 0).length;
      return { score: Math.max(0, Math.round(((trades.length - noSL) / trades.length) * 100)), violations: noSL };
    }
    case "confidence_ok": {
      const withConf = trades.filter(t => t.confidence !== "" && t.confidence !== null);
      if (!withConf.length) return { score: 100, violations: 0 };
      const good = withConf.filter(t => Number(t.confidence) >= 5).length;
      return { score: Math.round((good / withConf.length) * 100), violations: withConf.length - good };
    }
    case "no_overtrading": {
      const byDay = {};
      trades.forEach(t => {
        const d = new Date(t.createdAt ?? 0).toDateString();
        byDay[d] = (byDay[d] || 0) + 1;
      });
      const overtradedDays = Object.values(byDay).filter(c => c > 3).length;
      const totalDays = Object.keys(byDay).length;
      return { score: totalDays ? Math.max(0, Math.round(((totalDays - overtradedDays) / totalDays) * 100)) : 100, violations: overtradedDays };
    }
    case "setup_filled": {
      const noSetup = trades.filter(t => !t.setup || t.setup.trim() === "").length;
      return { score: Math.max(0, Math.round(((trades.length - noSetup) / trades.length) * 100)), violations: noSetup };
    }
    default: return { score: 100, violations: 0 };
  }
};

export const computeDisciplineScore = (trades) => {
  const closed = trades.filter(t => t.result !== "");
  if (closed.length < 3) return null;

  const recent = closed.slice(-30); // last 30 trades
  let totalWeighted = 0;
  const breakdown = [];

  DISCIPLINE_RULES.forEach(rule => {
    const { score, violations } = checkRule(rule, recent);
    totalWeighted += (score / 100) * rule.weight;
    breakdown.push({ ...rule, score, violations });
  });

  const total = Math.round(totalWeighted);
  const grade = total >= 90 ? "A" : total >= 75 ? "B" : total >= 60 ? "C" : total >= 40 ? "D" : "F";
  const color = total >= 90 ? C.green : total >= 75 ? "#00c87a" : total >= 60 ? C.orange : total >= 40 ? "#ff8c42" : C.red;

  return { total, grade, color, breakdown };
};
