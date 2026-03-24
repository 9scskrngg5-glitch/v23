/**
 * Parse CSV from Binance, MetaTrader, or generic format
 * Returns array of trade objects
 */

const parseCSVRows = (text) => {
  const lines = text.trim().split("\n").filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, "").toLowerCase());
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim().replace(/"/g, ""));
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
    return obj;
  });
};

// Binance Futures trade history CSV
const parseBinance = (rows) => {
  // Binance headers: Time, Symbol, Side, Price, Qty, Realized Profit, ...
  const trades = [];
  const grouped = {};

  rows.forEach(r => {
    const symbol = r["symbol"] || r["coin"] || "";
    const profit = parseFloat(r["realized profit"] || r["realizedprofit"] || r["pnl"] || 0);
    const time = r["time"] || r["date"] || r["updatetime"] || "";
    if (!symbol) return;

    const key = `${symbol}_${time}`;
    if (!grouped[key]) {
      grouped[key] = { symbol, profit, time };
    } else {
      grouped[key].profit += profit;
    }
  });

  Object.values(grouped).forEach(g => {
    if (g.profit === 0) return;
    trades.push({
      pair: g.symbol.replace("USDT", "/USDT").replace("BUSD", "/BUSD"),
      result: g.profit.toFixed(2),
      session: "New York",
      entry: "", sl: "", tp: "",
      rr: "", emotion: "", setup: "Import Binance",
      confidence: "",
      createdAt: g.time ? new Date(g.time).getTime() : Date.now(),
    });
  });

  return trades;
};

// MetaTrader 4/5 HTML export (converted to CSV)
const parseMetaTrader = (rows) => {
  // MT4 headers: Ticket, OpenTime, Type, Size, Symbol, OpenPrice, SL, TP, CloseTime, ClosePrice, Profit
  return rows
    .filter(r => r["type"] === "buy" || r["type"] === "sell" || r["type"] === "buy limit" || r["type"] === "sell limit")
    .map(r => {
      const entry = parseFloat(r["openprice"] || r["open price"] || 0);
      const sl = parseFloat(r["sl"] || r["stop loss"] || 0);
      const tp = parseFloat(r["tp"] || r["take profit"] || 0);
      const profit = parseFloat(r["profit"] || 0);
      const symbol = r["symbol"] || "";
      const openTime = r["opentime"] || r["open time"] || "";

      let rr = "";
      if (entry && sl && tp) {
        const risk = Math.abs(entry - sl);
        const reward = Math.abs(tp - entry);
        rr = risk ? (reward / risk).toFixed(2) : "";
      }

      return {
        pair: symbol.includes("/") ? symbol : `${symbol.slice(0, 3)}/${symbol.slice(3)}`,
        result: profit.toFixed(2),
        session: "New York",
        entry: entry || "", sl: sl || "", tp: tp || "",
        rr, emotion: "", setup: "Import MetaTrader",
        confidence: "",
        createdAt: openTime ? new Date(openTime).getTime() : Date.now(),
      };
    })
    .filter(t => t.pair);
};

// Generic CSV (our own export format or simple format)
const parseGeneric = (rows) => {
  return rows.map(r => ({
    pair: r["pair"] || r["symbol"] || r["instrument"] || "",
    result: r["result"] || r["pnl"] || r["profit"] || "",
    session: r["session"] || "New York",
    entry: r["entry"] || r["entryprice"] || "",
    sl: r["sl"] || r["stoploss"] || r["stop"] || "",
    tp: r["tp"] || r["takeprofit"] || r["target"] || "",
    rr: r["rr"] || r["r/r"] || "",
    emotion: r["emotion"] || "",
    setup: r["setup"] || "",
    confidence: r["confidence"] || "",
    createdAt: r["createdat"] ? new Date(r["createdat"]).getTime() : Date.now(),
  })).filter(t => t.pair && t.result !== "");
};

export const detectAndParse = (csvText) => {
  const rows = parseCSVRows(csvText);
  if (!rows.length) return { trades: [], format: "unknown", error: "Fichier vide ou invalide" };

  const headers = Object.keys(rows[0]).join(" ");

  // Detect format
  if (headers.includes("realized profit") || headers.includes("symbol") && headers.includes("side")) {
    const trades = parseBinance(rows);
    return { trades, format: "binance", count: trades.length };
  }

  if (headers.includes("ticket") || headers.includes("openprice") || headers.includes("open price")) {
    const trades = parseMetaTrader(rows);
    return { trades, format: "metatrader", count: trades.length };
  }

  // Try generic
  const trades = parseGeneric(rows);
  if (trades.length > 0) return { trades, format: "generic", count: trades.length };

  return { trades: [], format: "unknown", error: "Format non reconnu. Essaie Binance, MetaTrader ou notre format CSV." };
};
