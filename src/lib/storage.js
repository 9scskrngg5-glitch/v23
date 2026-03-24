import { supabase } from "./supabase";

export const STORAGE_KEYS = {
  trades: "tj_trades_v2",
  tasks: "tj_tasks_v2",
};

const lsGet = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
const lsSet = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

const getUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
};

// Upload screenshot to Supabase Storage
export const uploadScreenshot = async (tradeId, file) => {
  const user = await getUser();
  if (!user) return null;
  const path = `${user.id}/${tradeId}.${file.name.split(".").pop()}`;
  const { error } = await supabase.storage.from("screenshots").upload(path, file, { upsert: true });
  if (error) return null;
  const { data } = supabase.storage.from("screenshots").getPublicUrl(path);
  return data.publicUrl;
};

export const deleteScreenshot = async (tradeId) => {
  const user = await getUser();
  if (!user) return;
  // Try common extensions
  for (const ext of ["jpg", "jpeg", "png", "webp", "gif"]) {
    await supabase.storage.from("screenshots").remove([`${user.id}/${tradeId}.${ext}`]);
  }
};

export const storageGet = async (key) => {
  const user = await getUser();
  if (!user) return lsGet(key);

  const table = key === STORAGE_KEYS.trades ? "trades" : "tasks";
  const { data, error } = await supabase
    .from(table).select("*").eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) return lsGet(key);

  if (table === "trades") {
    return data.map((row) => ({
      id: row.id, createdAt: new Date(row.created_at).getTime(),
      pair: row.pair, session: row.session, entry: row.entry,
      sl: row.sl, tp: row.tp, result: row.result ?? "",
      rr: row.rr, emotion: row.emotion ?? "", setup: row.setup ?? "",
      confidence: row.confidence ?? "", flags: row.flags ?? [],
      screenshotUrl: row.screenshot_url ?? null,
    }));
  } else {
    return data.map((row) => ({
      id: row.id, createdAt: new Date(row.created_at).getTime(),
      text: row.text, done: row.done,
    }));
  }
};

export const storageSet = async (key, val) => {
  const user = await getUser();
  if (!user) { lsSet(key, val); return; }
  const table = key === STORAGE_KEYS.trades ? "trades" : "tasks";
  await supabase.from(table).delete().eq("user_id", user.id);
  if (!Array.isArray(val) || val.length === 0) return;

  if (table === "trades") {
    const rows = val.map((t) => ({
      id: t.id, user_id: user.id,
      created_at: new Date(t.createdAt).toISOString(),
      pair: t.pair, session: t.session, entry: t.entry,
      sl: t.sl, tp: t.tp,
      result: t.result === "" ? null : t.result,
      rr: t.rr, emotion: t.emotion || null, setup: t.setup || null,
      confidence: t.confidence === "" ? null : t.confidence,
      flags: t.flags ?? [],
      screenshot_url: t.screenshotUrl ?? null,
    }));
    await supabase.from(table).upsert(rows);
  } else {
    const rows = val.map((t) => ({
      id: t.id, user_id: user.id,
      created_at: new Date(t.createdAt ?? Date.now()).toISOString(),
      text: t.text, done: t.done,
    }));
    await supabase.from(table).upsert(rows);
  }
};
