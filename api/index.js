import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import formidable from "formidable";
import fs from "fs";

// ── Supabase client ───────────────────────────────────────────────────────
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);

// ── Security helpers ──────────────────────────────────────────────────────

/** Escape HTML to prevent XSS in generated HTML (emails, PDF) */
const escapeHtml = (str) =>
  String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

/** Trim + clamp a string input */
const sanitizeStr = (val, maxLen = 500) =>
  typeof val === "string" ? val.trim().slice(0, maxLen) : "";

/**
 * In-memory rate limiter keyed by string.
 * Returns true if the caller is over the limit.
 */
const _rlMap = new Map();
const rateLimit = (key, max = 20, windowMs = 60_000) => {
  const now = Date.now();
  const e = _rlMap.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > e.resetAt) { e.count = 0; e.resetAt = now + windowMs; }
  e.count++;
  _rlMap.set(key, e);
  return e.count > max;
};

const getIp = (req) =>
  (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";

// ── Auth helpers ──────────────────────────────────────────────────────────
const getUser = async (req) => {
  const token = req.headers.authorization?.replace("Bearer ", "").trim();
  if (!token) return null;
  if (!/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) return null; // basic JWT sanity check
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return error ? null : user;
};

const requireAuth = async (req, res) => {
  const user = await getUser(req);
  if (!user) { res.status(401).json({ error: "Non autorisé" }); return null; }
  return user;
};

const requireAdmin = async (req, res) => {
  const user = await requireAuth(req, res);
  if (!user) return null;
  if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    res.status(403).json({ error: "Accès refusé" });
    return null;
  }
  return user;
};

// ── Stripe ────────────────────────────────────────────────────────────────
const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);

const getRawBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", c => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

// ── Handlers ──────────────────────────────────────────────────────────────

async function handleAI(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // FIXED: AI endpoint now requires auth (was fully public before)
  const user = await requireAuth(req, res);
  if (!user) return;

  // FIXED: Rate limit per user — 10 AI calls/minute
  if (rateLimit(`ai:${user.id}`, 10, 60_000))
    return res.status(429).json({ error: "Trop de requêtes, attends une minute." });

  const { trades, prompt, imageBase64, imageType } = req.body || {};

  // FIXED: Whitelist image MIME types
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const safeImageType = ALLOWED_IMAGE_TYPES.includes(imageType) ? imageType : "image/jpeg";

  // FIXED: Cap imageBase64 size (~5MB)
  if (imageBase64 && imageBase64.length > 7_000_000)
    return res.status(400).json({ error: "Image trop lourde (max 5MB)" });

  const callAnthropic = async (content, b64, imgType) => {
    const messages_content = b64 ? [
      { type: "image", source: { type: "base64", media_type: imgType, data: b64 } },
      { type: "text", text: content }
    ] : content;
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: messages_content }] }),
    });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e?.error?.message || `HTTP ${r.status}`); }
    const d = await r.json();
    return d.content?.map(b => b.text || "").join("") || "Pas de réponse.";
  };

  try {
    if (prompt) {
      // FIXED: Limit prompt length to prevent prompt injection / cost abuse
      const safePrompt = sanitizeStr(prompt, 2000);
      return res.status(200).json({ text: await callAnthropic(safePrompt, imageBase64 || null, safeImageType) });
    }
    const closed = (Array.isArray(trades) ? trades : []).filter(t => t.result !== "").slice(-20);
    if (closed.length < 3) return res.status(400).json({ error: "Ajoute au moins 3 trades fermés." });
    // FIXED: Sanitize trade fields before injecting into prompt
    const summary = closed.map(t =>
      `Pair: ${sanitizeStr(t.pair, 20)}, Result: ${Number(t.result).toFixed(2)}$, RR: ${Number(t.rr).toFixed(2)}, Emotion: ${sanitizeStr(t.emotion, 50) || "N/A"}, Setup: ${sanitizeStr(t.setup, 100) || "N/A"}`
    ).join("\n");
    const text = await callAnthropic(
      `Tu es un coach de trading professionnel. Analyse ces ${closed.length} derniers trades et donne un feedback concis (3-5 points clés). Sois direct et actionnable.\n\nTrades:\n${summary}`,
      null, safeImageType
    );
    return res.status(200).json({ text });
  } catch (e) { return res.status(500).json({ error: e.message }); }
}

async function handleAdmin(req, res) {
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).end();
  const user = await requireAdmin(req, res);
  if (!user) return;

  if (req.method === "POST" && req.body?.action === "delete_user") {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId requis" });
    // FIXED: Prevent self-deletion
    if (userId === user.id) return res.status(400).json({ error: "Tu ne peux pas supprimer ton propre compte" });
    await supabase.from("trades").delete().eq("user_id", userId);
    await supabase.from("tasks").delete().eq("user_id", userId);
    await supabase.from("subscriptions").delete().eq("user_id", userId);
    // FIXED: Also clean referrals and support messages on delete
    await supabase.from("referral_uses").delete().eq("referee_id", userId);
    await supabase.from("referrals").delete().eq("referrer_id", userId);
    await supabase.from("support_messages").delete().eq("user_id", userId);
    await supabase.auth.admin.deleteUser(userId);
    return res.status(200).json({ deleted: true });
  }

  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (usersError) return res.status(500).json({ error: usersError.message });
  const { data: subs } = await supabase.from("subscriptions").select("*");
  const subMap = {}; (subs || []).forEach(s => { subMap[s.user_id] = s; });
  const { data: tradeCounts } = await supabase.from("trades").select("user_id");
  const tradeMap = {}; (tradeCounts || []).forEach(t => { tradeMap[t.user_id] = (tradeMap[t.user_id] || 0) + 1; });
  const userList = users.map(u => ({
    id: u.id, email: u.email, createdAt: u.created_at, lastSignIn: u.last_sign_in_at,
    plan: subMap[u.id]?.plan || "free", subStatus: subMap[u.id]?.status || null,
    tradeCount: tradeMap[u.id] || 0, confirmed: !!u.email_confirmed_at,
  }));
  const proUsers = userList.filter(u => u.plan === "pro").length;
  const now = Date.now();
  const signupsByDay = {};
  for (let i = 29; i >= 0; i--) { const d = new Date(now - i * 86400000); signupsByDay[`${d.getMonth()+1}/${d.getDate()}`] = 0; }
  userList.forEach(u => { const d = new Date(u.createdAt); const age = (now - d.getTime()) / 86400000; if (age <= 30) { const k = `${d.getMonth()+1}/${d.getDate()}`; if (signupsByDay[k] !== undefined) signupsByDay[k]++; } });
  return res.status(200).json({
    stats: { totalUsers: userList.length, proUsers, freeUsers: userList.length - proUsers, mrr: proUsers * 9, totalTrades: Object.values(tradeMap).reduce((a, b) => a + b, 0) },
    users: userList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    signupsChart: Object.entries(signupsByDay).map(([label, count]) => ({ label, count })),
  });
}

async function handleStripeCheckout(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const user = await requireAuth(req, res); if (!user) return;
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription", payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.APP_URL}?upgrade=success`,
    cancel_url: `${process.env.APP_URL}?upgrade=cancel`,
    client_reference_id: user.id, customer_email: user.email,
  });
  return res.json({ url: session.url });
}

async function handleStripePortal(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const user = await requireAuth(req, res); if (!user) return;
  const stripe = getStripe();
  const { data: sub } = await supabase.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).single();
  if (!sub?.stripe_customer_id) return res.status(400).json({ error: "Pas d\'abonnement" });
  const portalSession = await stripe.billingPortal.sessions.create({ customer: sub.stripe_customer_id, return_url: process.env.APP_URL });
  return res.json({ url: portalSession.url });
}

async function handleStripeWebhook(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const stripe = getStripe();
  const sig = req.headers["stripe-signature"];
  const rawBody = await getRawBody(req);
  let event;
  try { event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET); }
  catch { return res.status(400).json({ error: "Webhook invalide" }); }
  const session = event.data.object;
  if (event.type === "checkout.session.completed") {
    // FIXED: Validate UUID format before writing to DB
    const userId = session.client_reference_id;
    if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) return res.status(400).json({ error: "client_reference_id invalide" });
    await supabase.from("subscriptions").upsert({ user_id: userId, stripe_customer_id: session.customer, stripe_subscription_id: session.subscription, plan: "pro", status: "active" });
  }
  if (event.type === "customer.subscription.deleted")
    await supabase.from("subscriptions").update({ status: "canceled", plan: "free" }).eq("stripe_subscription_id", session.id);
  return res.json({ received: true });
}

async function handleExportPDF(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const user = await requireAuth(req, res); if (!user) return;
  const { data: sub } = await supabase.from("subscriptions").select("plan,status").eq("user_id", user.id).single();
  const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
  if (!isAdmin && (!sub || sub.plan !== "pro" || sub.status !== "active")) return res.status(403).json({ error: "Fonctionnalité Pro" });

  const { month } = req.body || {};
  // FIXED: Validate month format
  if (month && !/^\d{4}-\d{2}$/.test(month)) return res.status(400).json({ error: "Format mois invalide (YYYY-MM)" });
  const now = new Date();
  const targetMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [year, m] = targetMonth.split("-").map(Number);
  if (m < 1 || m > 12 || year < 2020 || year > 2100) return res.status(400).json({ error: "Mois invalide" });

  const { data: trades } = await supabase.from("trades").select("*").eq("user_id", user.id)
    .gte("created_at", new Date(year, m - 1, 1).toISOString())
    .lte("created_at", new Date(year, m, 0, 23, 59, 59).toISOString())
    .order("created_at");
  const closed = (trades || []).filter(t => t.result !== null);
  const wins = closed.filter(t => Number(t.result) > 0);
  const losses = closed.filter(t => Number(t.result) < 0);
  const totalPnL = closed.reduce((a, t) => a + Number(t.result), 0);
  const winRate = closed.length ? ((wins.length / closed.length) * 100).toFixed(1) : 0;
  const totalWin = wins.reduce((a, t) => a + Number(t.result), 0);
  const totalLoss = Math.abs(losses.reduce((a, t) => a + Number(t.result), 0));
  const pf = totalLoss ? (totalWin / totalLoss).toFixed(2) : "—";
  const monthNames = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  // FIXED: Escape all user data injected into HTML report
  const tradeRows = closed.map(t =>
    `<tr><td>${escapeHtml(new Date(t.created_at).toLocaleDateString("fr-FR"))}</td><td>${escapeHtml(t.pair||"—")}</td><td style="color:${Number(t.result)>=0?"#00e5a0":"#ff4d6d"}">${Number(t.result)>=0?"+":""}${Number(t.result).toFixed(2)}$</td><td>${escapeHtml(String(t.rr||"—"))}</td><td>${escapeHtml(t.emotion||"—")}</td></tr>`
  ).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{background:#06080f;color:#dde1f5;font-family:monospace;padding:40px}table{width:100%;border-collapse:collapse}th{text-align:left;padding:10px;font-size:10px;color:#3a4060;border-bottom:1px solid #13162a}td{padding:8px 10px;font-size:11px;color:#9099c0;border-bottom:1px solid #0e1120}</style></head><body><div style="color:#00e5a0;font-size:11px;letter-spacing:0.2em;margin-bottom:12px">TRADING JOURNAL</div><h1 style="font-size:28px;font-weight:800;margin-bottom:4px">Rapport ${escapeHtml(monthNames[m-1])} ${year}</h1><div style="color:#3a4060;margin-bottom:28px">${escapeHtml(user.email)}</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px"><div style="background:#080a14;border:1px solid #0e1120;border-radius:10px;padding:16px"><div style="font-size:10px;color:#3a4060;margin-bottom:4px">PNL</div><div style="font-size:22px;font-weight:700;color:${totalPnL>=0?"#00e5a0":"#ff4d6d"}">${totalPnL>=0?"+":""}${totalPnL.toFixed(2)}$</div></div><div style="background:#080a14;border:1px solid #0e1120;border-radius:10px;padding:16px"><div style="font-size:10px;color:#3a4060;margin-bottom:4px">WIN RATE</div><div style="font-size:22px;font-weight:700;color:${Number(winRate)>=50?"#00e5a0":"#ff4d6d"}">${winRate}%</div></div><div style="background:#080a14;border:1px solid #0e1120;border-radius:10px;padding:16px"><div style="font-size:10px;color:#3a4060;margin-bottom:4px">TRADES</div><div style="font-size:22px;font-weight:700">${closed.length}</div></div><div style="background:#080a14;border:1px solid #0e1120;border-radius:10px;padding:16px"><div style="font-size:10px;color:#3a4060;margin-bottom:4px">PROFIT FACTOR</div><div style="font-size:22px;font-weight:700;color:#f5a623">${pf}</div></div></div><table><thead><tr><th>Date</th><th>Paire</th><th>Résultat</th><th>R/R</th><th>Émotion</th></tr></thead><tbody>${tradeRows}</tbody></table><div style="margin-top:28px;font-size:10px;color:#1e2235">Généré par Trading Journal · ${new Date().toLocaleDateString("fr-FR")}</div></body></html>`;
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Content-Disposition", `attachment; filename="rapport-${targetMonth}.html"`);
  return res.status(200).send(html);
}

async function handleLeaderboard(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  // FIXED: Rate limit public endpoint
  if (rateLimit(`leaderboard:${getIp(req)}`, 30, 60_000))
    return res.status(429).json({ error: "Trop de requêtes" });
  const { data: trades } = await supabase.from("trades").select("user_id, result, rr").not("result", "is", null);
  if (!trades?.length) return res.status(200).json({ entries: [] });
  const userMap = {};
  trades.forEach(t => { if (!userMap[t.user_id]) userMap[t.user_id] = []; userMap[t.user_id].push(t); });
  const entries = [];
  for (const [userId, ut] of Object.entries(userMap)) {
    if (ut.length < 10) continue;
    const wins = ut.filter(t => Number(t.result) > 0);
    const pnl = ut.reduce((a, t) => a + Number(t.result), 0);
    if (pnl <= 0) continue;
    const totalWin = wins.reduce((a, t) => a + Number(t.result), 0);
    const totalLoss = Math.abs(ut.filter(t => Number(t.result) < 0).reduce((a, t) => a + Number(t.result), 0));
    entries.push({ id: userId.slice(-6).toUpperCase(), trades: ut.length, winRate: ((wins.length / ut.length) * 100).toFixed(1), pnl: pnl.toFixed(0), pf: totalLoss ? (totalWin / totalLoss).toFixed(2) : "0" });
  }
  entries.sort((a, b) => Number(b.winRate) - Number(a.winRate));
  return res.status(200).json({ entries: entries.slice(0, 50) });
}

async function handlePublicProfile(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const username = req.query?.username || req.url?.split("username=")[1]?.split("&")[0];
  if (!username) return res.status(400).json({ error: "username requis" });
  // FIXED: Validate username format to prevent injection
  if (!/^[\w-]{1,30}$/.test(username)) return res.status(400).json({ error: "username invalide" });
  const { data: profile } = await supabase.from("profiles").select("user_id, username, public, display_name").eq("username", username).single();
  if (!profile?.public) return res.status(404).json({ error: "Profil non trouvé ou privé" });
  const { data: trades } = await supabase.from("trades").select("result, pair, rr, created_at").eq("user_id", profile.user_id).order("created_at");
  const closed = (trades || []).filter(t => t.result !== null);
  if (!closed.length) return res.status(200).json({ profile: { username: profile.username, displayName: profile.display_name }, stats: null, equity: [] });
  const wins = closed.filter(t => Number(t.result) > 0);
  const pnl = closed.reduce((a, t) => a + Number(t.result), 0);
  const totalWin = wins.reduce((a, t) => a + Number(t.result), 0);
  const totalLoss = Math.abs(closed.filter(t => Number(t.result) < 0).reduce((a, t) => a + Number(t.result), 0));
  const recent = closed.filter(t => t.created_at >= new Date(Date.now() - 30 * 86400000).toISOString());
  let eq = 0;
  const equity = closed.slice(-30).map((t, i) => { eq += Number(t.result); return { i: i + 1, eq: parseFloat(eq.toFixed(2)) }; });
  return res.status(200).json({ profile: { username: profile.username, displayName: profile.display_name }, stats: { total: closed.length, winRate: ((wins.length / closed.length) * 100).toFixed(1), pnl: pnl.toFixed(2), pf: totalLoss ? (totalWin / totalLoss).toFixed(2) : "0", recentPnL: recent.reduce((a, t) => a + Number(t.result), 0).toFixed(2), recentTrades: recent.length }, equity });
}

async function handleReferral(req, res) {
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).end();
  const user = await requireAuth(req, res); if (!user) return;
  if (req.method === "GET") {
    let { data: referral } = await supabase.from("referrals").select("*").eq("referrer_id", user.id).single();
    if (!referral) {
      const code = `TJ-${user.id.slice(-6).toUpperCase()}`;
      const { data } = await supabase.from("referrals").insert({ referrer_id: user.id, code, uses: 0, free_months_earned: 0 }).select().single();
      referral = data;
    }
    const { count } = await supabase.from("referral_uses").select("*", { count: "exact" }).eq("referrer_id", user.id);
    return res.status(200).json({ code: referral?.code, uses: count || 0, freeMonthsEarned: referral?.free_months_earned || 0, link: `${process.env.APP_URL}?ref=${referral?.code}` });
  }
  // FIXED: Rate limit referral attempts per IP
  if (rateLimit(`referral:${getIp(req)}`, 3, 3600_000))
    return res.status(429).json({ error: "Trop de tentatives, réessaie dans une heure." });
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: "Code requis" });
  // FIXED: Validate code format
  if (!/^TJ-[\w]{6}$/i.test(code.trim())) return res.status(400).json({ error: "Format de code invalide" });
  const { data: referral } = await supabase.from("referrals").select("*").eq("code", code.toUpperCase()).single();
  if (!referral) return res.status(404).json({ error: "Code invalide" });
  if (referral.referrer_id === user.id) return res.status(400).json({ error: "Tu ne peux pas utiliser ton propre code" });
  const { data: existing } = await supabase.from("referral_uses").select("id").eq("referee_id", user.id).single();
  if (existing) return res.status(400).json({ error: "Code déjà utilisé" });
  await supabase.from("referral_uses").insert({ referrer_id: referral.referrer_id, referee_id: user.id, code: code.toUpperCase() });
  // FIXED: Use DB-level increment to avoid race condition
  await supabase.rpc("increment_referral", { referral_id: referral.id });
  const end = new Date(); end.setMonth(end.getMonth() + 1);
  await supabase.from("subscriptions").upsert({ user_id: user.id, plan: "pro", status: "active", referral_end: end.toISOString() });
  return res.status(200).json({ success: true, message: "1 mois Pro offert !" });
}

async function handleVoiceNote(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const user = await requireAuth(req, res); if (!user) return;
  // FIXED: Rate limit voice transcriptions (expensive API)
  if (rateLimit(`voice:${user.id}`, 20, 3600_000))
    return res.status(429).json({ error: "Limite de transcriptions atteinte (20/heure)" });
  const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: "Erreur upload" });
    const file = files.audio?.[0] || files.audio;
    if (!file) return res.status(400).json({ error: "Fichier manquant" });
    try {
      const audioData = fs.readFileSync(file.filepath || file.path);
      const fd = new FormData();
      fd.append("file", new Blob([audioData], { type: "audio/webm" }), "audio.webm");
      fd.append("model", "whisper-1");
      fd.append("language", "fr");
      const r = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` }, body: fd });
      if (!r.ok) { const e = await r.json(); return res.status(500).json({ error: e?.error?.message || "Erreur Whisper" }); }
      const d = await r.json();
      return res.status(200).json({ text: d.text });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  });
}

async function handleWeeklyDigest(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  if (req.headers["x-cron-secret"] !== process.env.CRON_SECRET) return res.status(401).json({ error: "Non autorisé" });
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString();
  let sent = 0;
  for (const u of users) {
    try {
      const { data: trades } = await supabase.from("trades").select("result").eq("user_id", u.id).gte("created_at", cutoff).not("result", "is", null);
      if (!trades?.length) continue;
      const wins = trades.filter(t => Number(t.result) > 0);
      const pnl = trades.reduce((a, t) => a + Number(t.result), 0);
      await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.RESEND_API_KEY}` }, body: JSON.stringify({ from: `Trading Journal <noreply@${process.env.EMAIL_DOMAIN}>`, to: u.email, subject: pnl >= 0 ? `Semaine positive +${pnl.toFixed(0)}$` : `Semaine difficile ${pnl.toFixed(0)}$`, html: `<div style="background:#06080f;color:#dde1f5;font-family:monospace;padding:32px;border-radius:16px"><h2>Ta semaine: ${pnl>=0?"+":""}${pnl.toFixed(2)}$ · ${((wins.length/trades.length)*100).toFixed(0)}% WR · ${trades.length} trades</h2><a href="${process.env.APP_URL}" style="background:#00e5a0;color:#000;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700">VOIR MON DASHBOARD</a></div>` }) });
      sent++;
    } catch {}
  }
  return res.status(200).json({ sent, total: users.length });
}

async function handleWelcomeEmail(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  // FIXED: Endpoint was fully public — now requires auth
  const user = await requireAuth(req, res); if (!user) return;
  // FIXED: Use verified email from token, not from request body
  const email = user.email;
  if (!email) return res.status(400).json({ error: "Email introuvable" });
  // FIXED: Rate limit to prevent spam
  if (rateLimit(`welcome:${user.id}`, 2, 3600_000))
    return res.status(429).json({ error: "Email déjà envoyé récemment" });
  try {
    await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.RESEND_API_KEY}` }, body: JSON.stringify({ from: `Trading Journal <noreply@${process.env.EMAIL_DOMAIN}>`, to: email, subject: "Bienvenue sur Trading Journal", html: `<div style="background:#06080f;color:#dde1f5;font-family:monospace;padding:40px;border-radius:16px"><div style="color:#00e5a0;margin-bottom:16px">TRADING JOURNAL</div><h1>Bienvenue !</h1><p style="color:#4a5070">Ton compte est créé. Commence par ajouter tes premiers trades.</p><a href="${process.env.APP_URL}" style="background:#00e5a0;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">ACCÉDER À L\'APP</a></div>` }) });
    return res.status(200).json({ sent: true });
  } catch (e) { return res.status(500).json({ error: e.message }); }
}

async function handleSupport(req, res) {
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).end();
  const user = await requireAuth(req, res); if (!user) return;
  if (req.method === "POST") {
    // FIXED: Rate limit support messages
    if (rateLimit(`support:${user.id}`, 5, 3600_000))
      return res.status(429).json({ error: "Trop de messages, attends un peu." });
    const subject = sanitizeStr(req.body?.subject, 200);
    const message = sanitizeStr(req.body?.message, 5000);
    if (!subject || !message) return res.status(400).json({ error: "Subject et message requis" });
    const { data, error } = await supabase.from("support_messages").insert({
      user_id: user.id,
      user_email: user.email, // FIXED: Always use auth email, not body email
      subject, message, status: "open",
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    for (const adminEmail of ADMIN_EMAILS) {
      // FIXED: Escape user content in admin notification
      await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.RESEND_API_KEY}` }, body: JSON.stringify({ from: `Trading Journal <noreply@${process.env.EMAIL_DOMAIN || "tondomaine.com"}>`, to: adminEmail, subject: `[Support] ${escapeHtml(subject)} — ${escapeHtml(user.email)}`, html: `<div style="font-family:monospace;padding:24px;background:#06080f;color:#dde1f5;border-radius:12px"><h2 style="color:#00e5a0">Nouveau message support</h2><p><strong>De:</strong> ${escapeHtml(user.email)}</p><p><strong>Sujet:</strong> ${escapeHtml(subject)}</p><p><strong>Message:</strong></p><p style="background:#080a14;padding:16px;border-radius:8px;color:#9099c0">${escapeHtml(message)}</p><a href="${process.env.APP_URL}" style="background:#00e5a0;color:#000;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700">RÉPONDRE DANS L\'ADMIN</a></div>` }) }).catch(() => {});
    }
    return res.status(200).json({ success: true, id: data.id });
  }
  const { data } = await supabase.from("support_messages").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  return res.status(200).json({ messages: data || [] });
}

async function handleAdminSupport(req, res) {
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).end();
  const user = await requireAdmin(req, res); if (!user) return;
  if (req.method === "GET") {
    const { data } = await supabase.from("support_messages").select("*").order("created_at", { ascending: false });
    return res.status(200).json({ messages: data || [] });
  }
  const { id, reply, status } = req.body || {};
  if (!id) return res.status(400).json({ error: "id requis" });
  // FIXED: Whitelist allowed status values
  const ALLOWED_STATUSES = ["open", "in_progress", "closed"];
  const safeStatus = ALLOWED_STATUSES.includes(status) ? status : "in_progress";
  const safeReply = reply ? sanitizeStr(reply, 5000) : null;
  const updates = { status: safeStatus };
  if (safeReply) { updates.admin_reply = safeReply; updates.replied_at = new Date().toISOString(); updates.status = "closed"; }
  const { data: msg } = await supabase.from("support_messages").update(updates).eq("id", id).select().single();
  if (safeReply && msg?.user_email) {
    await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.RESEND_API_KEY}` }, body: JSON.stringify({ from: `Trading Journal Support <noreply@${process.env.EMAIL_DOMAIN || "tondomaine.com"}>`, to: msg.user_email, subject: `Réponse à votre demande: ${escapeHtml(msg.subject)}`, html: `<div style="font-family:monospace;padding:24px;background:#06080f;color:#dde1f5;border-radius:12px"><h2 style="color:#00e5a0">Réponse du support Trading Journal</h2><p style="color:#4a5070">Concernant: <strong style="color:#dde1f5">${escapeHtml(msg.subject)}</strong></p><p style="background:#080a14;padding:16px;border-radius:8px;color:#9099c0">${escapeHtml(safeReply)}</p><a href="${process.env.APP_URL}" style="background:#00e5a0;color:#000;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700">ACCÉDER À L\'APP</a></div>` }) }).catch(() => {});
  }
  return res.status(200).json({ success: true });
}

async function handleAdminUserAction(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const user = await requireAdmin(req, res); if (!user) return;
  const { action, userId, data: actionData } = req.body || {};
  if (!action || !userId) return res.status(400).json({ error: "action et userId requis" });
  // FIXED: Validate userId is a UUID
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return res.status(400).json({ error: "userId invalide" });
  // FIXED: Prevent admin from acting on their own account
  if (userId === user.id) return res.status(400).json({ error: "Tu ne peux pas agir sur ton propre compte" });
  switch (action) {
    case "grant_pro": {
      await supabase.from("subscriptions").upsert({ user_id: userId, plan: "pro", status: "active", stripe_customer_id: null, stripe_subscription_id: null });
      const { data: { user: targetUser } } = await supabase.auth.admin.getUserById(userId);
      if (targetUser?.email) await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.RESEND_API_KEY}` }, body: JSON.stringify({ from: `Trading Journal <noreply@${process.env.EMAIL_DOMAIN}>`, to: targetUser.email, subject: "Ton compte a été upgradé en Pro !", html: `<div style="font-family:monospace;padding:24px;background:#06080f;color:#dde1f5;border-radius:12px"><h2 style="color:#00e5a0">Compte Pro activé !</h2><p style="color:#4a5070">Ton compte Trading Journal a été upgradé en Pro. Profite de toutes les fonctionnalités !</p><a href="${process.env.APP_URL}" style="background:#00e5a0;color:#000;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700">ACCÉDER À L\'APP</a></div>` }) }).catch(() => {});
      return res.status(200).json({ success: true });
    }
    case "revoke_pro": {
      await supabase.from("subscriptions").update({ plan: "free", status: "canceled" }).eq("user_id", userId);
      return res.status(200).json({ success: true });
    }
    case "send_message": {
      const message = sanitizeStr(actionData?.message, 2000);
      if (!message) return res.status(400).json({ error: "message requis" });
      const { data: { user: targetUser } } = await supabase.auth.admin.getUserById(userId);
      if (targetUser?.email) await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.RESEND_API_KEY}` }, body: JSON.stringify({ from: `Trading Journal <noreply@${process.env.EMAIL_DOMAIN}>`, to: targetUser.email, subject: "Message de Trading Journal", html: `<div style="font-family:monospace;padding:24px;background:#06080f;color:#dde1f5;border-radius:12px"><h2 style="color:#00e5a0">Message de l\'équipe</h2><p style="background:#080a14;padding:16px;border-radius:8px;color:#9099c0">${escapeHtml(message)}</p><a href="${process.env.APP_URL}" style="background:#00e5a0;color:#000;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700">ACCÉDER À L\'APP</a></div>` }) }).catch(() => {});
      return res.status(200).json({ success: true });
    }
    case "reset_password": {
      const { data: { user: targetUser } } = await supabase.auth.admin.getUserById(userId);
      if (targetUser?.email) await supabase.auth.resetPasswordForEmail(targetUser.email);
      return res.status(200).json({ success: true });
    }
    default:
      return res.status(400).json({ error: `Action inconnue: ${action}` });
  }
}

async function handlePublicAPI(req, res) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) return res.status(401).json({ error: "API key required. Get yours in Settings." });
  // FIXED: Rate limit public API per key
  if (rateLimit(`pubapi:${apiKey}`, 60, 60_000))
    return res.status(429).json({ error: "Rate limit exceeded (60 req/min)" });
  const { data: keyData } = await supabase.from("api_keys").select("user_id, name, active").eq("key", apiKey).single();
  if (!keyData?.active) return res.status(401).json({ error: "Invalid or inactive API key" });
  const userId = keyData.user_id;
  const endpoint = req.url?.split("?")[0].replace("/api/v1", "");
  if (endpoint === "/trades" && req.method === "GET") {
    const { data } = await supabase.from("trades").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    return res.status(200).json({ trades: data || [], count: (data || []).length });
  }
  if (endpoint === "/trades" && req.method === "POST") {
    const trade = req.body;
    if (!trade?.pair) return res.status(400).json({ error: "pair is required" });
    // FIXED: Sanitize fields from public API
    const safeTrade = {
      pair: sanitizeStr(trade.pair, 20),
      result: trade.result !== undefined ? Number(trade.result) : null,
      rr: trade.rr !== undefined ? Number(trade.rr) : null,
      emotion: sanitizeStr(trade.emotion, 100),
      setup: sanitizeStr(trade.setup, 200),
      note: sanitizeStr(trade.note, 2000),
    };
    if (isNaN(safeTrade.result) && trade.result !== undefined) return res.status(400).json({ error: "result must be a number" });
    const { data, error } = await supabase.from("trades").insert({ ...safeTrade, user_id: userId, created_at: new Date().toISOString() }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ trade: data });
  }
  if (endpoint === "/stats" && req.method === "GET") {
    const { data: trades } = await supabase.from("trades").select("result, rr").eq("user_id", userId).not("result", "is", null);
    const closed = trades || [];
    const wins = closed.filter(t => Number(t.result) > 0);
    const pnl = closed.reduce((a, t) => a + Number(t.result), 0);
    const totalWin = wins.reduce((a, t) => a + Number(t.result), 0);
    const totalLoss = Math.abs(closed.filter(t => Number(t.result) < 0).reduce((a, t) => a + Number(t.result), 0));
    return res.status(200).json({ totalTrades: closed.length, winRate: closed.length ? ((wins.length / closed.length) * 100).toFixed(1) : "0", totalPnL: pnl.toFixed(2), profitFactor: totalLoss ? (totalWin / totalLoss).toFixed(2) : "0" });
  }
  if (endpoint === "/profile" && req.method === "GET") {
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const { data: sub } = await supabase.from("subscriptions").select("plan").eq("user_id", userId).single();
    return res.status(200).json({ email: user?.email, plan: sub?.plan || "free", userId });
  }
  return res.status(404).json({ error: `Endpoint ${endpoint} not found. Available: /trades, /stats, /profile` });
}

// ── Main router ───────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // FIXED: Restrict CORS to your own domain instead of wildcard *
  const allowedOrigin = process.env.APP_URL || "";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, stripe-signature, x-cron-secret, x-api-key");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  if (req.method === "OPTIONS") return res.status(200).end();

  // FIXED: Global IP-level rate limit
  if (rateLimit(`global:${getIp(req)}`, 200, 60_000))
    return res.status(429).json({ error: "Trop de requêtes" });

  const url = req.url?.split("?")[0] || "";
  if (url === "/api/ai" || url === "/api")                    return handleAI(req, res);
  if (url === "/api/admin")                                   return handleAdmin(req, res);
  if (url === "/api/stripe-checkout")                         return handleStripeCheckout(req, res);
  if (url === "/api/stripe-portal")                           return handleStripePortal(req, res);
  if (url === "/api/stripe-webhook")                          return handleStripeWebhook(req, res);
  if (url === "/api/export-pdf")                              return handleExportPDF(req, res);
  if (url === "/api/leaderboard")                             return handleLeaderboard(req, res);
  if (url === "/api/public-profile")                          return handlePublicProfile(req, res);
  if (url === "/api/referral")                                return handleReferral(req, res);
  if (url === "/api/voice-note" || url === "/api/transcribe") return handleVoiceNote(req, res);
  if (url === "/api/weekly-digest")                           return handleWeeklyDigest(req, res);
  if (url === "/api/welcome-email")                           return handleWelcomeEmail(req, res);
  if (url.startsWith("/api/v1"))                              return handlePublicAPI(req, res);
  if (url === "/api/support")                                 return handleSupport(req, res);
  if (url === "/api/admin-support")                           return handleAdminSupport(req, res);
  if (url === "/api/admin-user-action")                       return handleAdminUserAction(req, res);
  return res.status(404).json({ error: "Route introuvable" });
}
