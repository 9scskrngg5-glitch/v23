/**
 * Fetch AI trading insight via our secure Vercel API route
 * @param {import('../types').Trade[]} trades
 * @returns {Promise<string>}
 */
export const fetchAIInsight = async (trades) => {
  const closed = trades.filter((t) => t.result !== "").slice(-20);
  if (closed.length < 3)
    return "Ajoute au moins 3 trades pour obtenir une analyse IA.";

  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trades: closed }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err?.error || `HTTP ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json();
  return data.text || "Pas de réponse.";
};
