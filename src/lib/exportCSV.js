const sanitizeField = (val) => {
  if (typeof val !== "string") return val;
  return val.replace(/^[=+\-@|]/, "").trim();
};

const safeNum = (val) => {
  const n = parseFloat(val);
  return Number.isFinite(n) ? n : "";
};

export const exportTradesToCSV = (trades) => {
  const headers = ["Date", "Paire", "Session", "Entrée", "SL", "TP", "Résultat ($)", "RR", "Émotion", "Setup", "Confiance", "Flags"];

  const rows = trades.map(t => [
    new Date(t.createdAt ?? 0).toLocaleDateString("fr-FR"),
    sanitizeField(t.pair || ""),
    sanitizeField(t.session || ""),
    safeNum(t.entry),
    safeNum(t.sl),
    safeNum(t.tp),
    t.result !== "" ? safeNum(t.result) : "",
    safeNum(t.rr),
    sanitizeField(t.emotion || ""),
    sanitizeField(t.setup || ""),
    safeNum(t.confidence),
    sanitizeField((t.flags || []).join("; ")),
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trades-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
