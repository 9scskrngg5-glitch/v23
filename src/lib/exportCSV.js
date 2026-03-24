export const exportTradesToCSV = (trades) => {
  const headers = ["Date", "Paire", "Session", "Entrée", "SL", "TP", "Résultat ($)", "RR", "Émotion", "Setup", "Confiance", "Flags"];

  const rows = trades.map(t => [
    new Date(t.createdAt ?? 0).toLocaleDateString("fr-FR"),
    t.pair || "",
    t.session || "",
    t.entry || "",
    t.sl || "",
    t.tp || "",
    t.result !== "" ? Number(t.result).toFixed(2) : "",
    t.rr || "",
    t.emotion || "",
    t.setup || "",
    t.confidence || "",
    (t.flags || []).join("; "),
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
