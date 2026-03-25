import { useState, useEffect, useMemo } from "react";
import { storageGet, storageSet, STORAGE_KEYS } from "../lib/storage";
import { calcRR, buildEquity, computeStats, detectMistakes, detectRegime, monteCarlo } from "../lib/trading";
import { uid } from "../lib/trading";

const EMPTY_FORM = {
  pair: "BTC/USD",
  session: "New York",
  entry: "", sl: "", tp: "", result: "", rr: "",
  emotion: "", setup: "", confidence: "",
};

export const useTrades = (user) => {
  const [trades, setTrades] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Reload when user changes — pass user directly to avoid internal getUser() call
  useEffect(() => {
    setLoaded(false);
    setTrades([]);
    (async () => {
      try {
        const stored = await storageGet(STORAGE_KEYS.trades, user ?? null);
        const now = Date.now();
        const normalized = Array.isArray(stored)
          ? stored.map((tr, idx) => ({
              ...tr,
              createdAt: typeof tr?.createdAt === "number" ? tr.createdAt : now - idx * 1000,
            }))
          : [];
        setTrades(normalized);
      } catch {
        setTrades([]);
      } finally {
        setLoaded(true);
      }
    })();
  }, [user?.id]);

  const persist = async (next) => {
    setTrades(next);
    await storageSet(STORAGE_KEYS.trades, next, user ?? null);
  };

  const orderedTrades = useMemo(
    () => [...trades].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)),
    [trades]
  );
  const orderedTradesDesc = useMemo(() => [...orderedTrades].reverse(), [orderedTrades]);
  const equity = useMemo(() => buildEquity(orderedTrades), [orderedTrades]);
  const stats = useMemo(() => computeStats(orderedTrades), [orderedTrades]);
  const regime = useMemo(() => detectRegime(orderedTrades), [orderedTrades]);
  const mc = useMemo(() => monteCarlo(orderedTrades), [orderedTrades]);
  const pairs = useMemo(
    () => ["ALL", ...new Set(orderedTrades.map((t) => t.pair))],
    [orderedTrades]
  );

  const addTrade = async (form) => {
    const entry = Number(form.entry);
    const sl = Number(form.sl);
    const tp = Number(form.tp);
    const rr = calcRR(entry, sl, tp);

    if (!Number.isFinite(entry) || !Number.isFinite(sl) || !Number.isFinite(tp))
      return { error: "Entrée / SL / TP doivent être des nombres valides." };

    const result = form.result !== "" ? Number(form.result) : "";
    if (form.result !== "" && !Number.isFinite(result))
      return { error: "Résultat ($) doit être un nombre valide." };

    const confidence = form.confidence !== "" ? Number(form.confidence) : "";
    if (
      form.confidence !== "" &&
      (!Number.isFinite(confidence) || confidence < 1 || confidence > 10)
    )
      return { error: "Confiance doit être entre 1 et 10." };

    const flags = detectMistakes({ ...form, entry, sl, tp, rr, confidence });
    const trade = {
      ...form,
      id: uid(),
      createdAt: Date.now(),
      entry, sl, tp, rr, confidence, result, flags,
    };

    await persist([trade, ...trades]);
    return { error: null };
  };

  /**
   * Save edits to an existing trade
   * @param {string} id
   * @param {typeof EMPTY_FORM} editForm
   * @returns {{ error: string|null }}
   */
  const saveTrade = async (id, editForm) => {
    const entry = Number(editForm.entry);
    const sl = Number(editForm.sl);
    const tp = Number(editForm.tp);

    if (!Number.isFinite(entry) || !Number.isFinite(sl) || !Number.isFinite(tp))
      return { error: "Entrée / SL / TP doivent être des nombres valides." };

    const result = editForm.result !== "" ? Number(editForm.result) : "";
    if (editForm.result !== "" && !Number.isFinite(result))
      return { error: "Résultat ($) doit être un nombre valide." };

    const confidence = editForm.confidence !== "" ? Number(editForm.confidence) : "";
    if (editForm.confidence !== "") {
      if (!Number.isFinite(confidence) || confidence < 1 || confidence > 10)
        return { error: "Confiance doit être entre 1 et 10." };
    }

    const rr = calcRR(entry, sl, tp);
    const flags = detectMistakes({ ...editForm, entry, sl, tp, rr, confidence });

    const updated = {
      ...editForm,
      id,
      createdAt: trades.find((t) => t.id === id)?.createdAt ?? Date.now(),
      entry, sl, tp, rr, confidence, result, flags,
    };

    await persist(trades.map((t) => (t.id === id ? updated : t)));
    return { error: null };
  };

  /** @param {string} id */
  const deleteTrade = async (id) => {
    await persist(trades.filter((t) => t.id !== id));
  };

  /**
   * Replace all trades from an import payload
   * @param {{ trades?: any[], tasks?: any[] }} payload
   * @returns {{ error: string|null }}
   */
  const importTrades = async (payload) => {
    const nextTrades = Array.isArray(payload?.trades) ? payload.trades : [];
    const now = Date.now();
    const normalized = nextTrades.map((tr, idx) => ({
      ...tr,
      createdAt:
        typeof tr?.createdAt === "number" ? tr.createdAt : now - idx * 1000,
    }));
    await persist(normalized);
    return { error: null, tasks: Array.isArray(payload?.tasks) ? payload.tasks : [] };
  };

  return {
    trades,
    loaded,
    orderedTrades,
    orderedTradesDesc,
    equity,
    stats,
    regime,
    mc,
    pairs,
    addTrade,
    saveTrade,
    deleteTrade,
    importTrades,
    EMPTY_FORM,
  };
};
