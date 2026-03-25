import { supabase } from "./supabase";

export const STORAGE_KEYS = {
  trades: "tj_trades_v2",
  tasks: "tj_tasks_v2",
};

const lsGet = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
const lsSet = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

// Upload screenshot to Supabase Storage
export const uploadScreenshot = async (tradeId, file, user) => {
  if (!user) return null;
  const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];
  const ext = file.name.split(".").pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) return null;
  const path = `${user.id}/${tradeId}.${ext}`;
  const { error } = await supabase.storage.from("screenshots").upload(path, file, { upsert: true });
  if (error) return null;
  const { data } = supabase.storage.from("screenshots").getPublicUrl(path);
  return data.publicUrl;
};

export const deleteScreenshot = async (tradeId, user) => {
  if (!user) return;
  for (const ext of ["jpg", "jpeg", "png", "webp", "gif"]) {
    await supabase.storage.from("screenshots").remove([`${user.id}/${tradeId}.${ext}`]);
  }
};

// user is passed directly — no internal getUser() call that could hang
export const storageGet = async (key, user) => {
  if (!user) return lsGet(key);

  const table = key === STORAGE_KEYS.trades ? "trades" : "tasks";
  try {
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
  } catch {
    return lsGet(key);
  }
};

export const storageSet = async (key, val, user) => {
  if (!user) { lsSet(key, val); return; }
  const table = key === STORAGE_KEYS.trades ? "trades" : "tasks";
  try {
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
  } catch {
    lsSet(key, val);
  }
};
