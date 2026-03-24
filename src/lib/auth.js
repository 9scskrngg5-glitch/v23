import { supabase, isSupabaseConfigured } from "./supabase";

// Internal cache to avoid calling getSession repeatedly
let _cachedToken = null;
let _cacheTime = 0;
const CACHE_TTL = 30_000; // 30s

/**
 * Get auth token — never hangs, uses cache, multiple fallbacks
 */
export const getToken = async () => {
  if (!isSupabaseConfigured() || !supabase) return null;

  // Use cache if fresh
  if (_cachedToken && Date.now() - _cacheTime < CACHE_TTL) {
    return _cachedToken;
  }

  // Primary: getSession with 3s timeout
  try {
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 3000)
    );
    const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
    if (session?.access_token) {
      _cachedToken = session.access_token;
      _cacheTime = Date.now();
      return _cachedToken;
    }
  } catch {}

  // Fallback: scan localStorage for any Supabase session
  try {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith("sb-")) continue;
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        // Handle multiple possible structures
        const token =
          parsed?.access_token ||
          parsed?.session?.access_token ||
          parsed?.currentSession?.access_token ||
          (Array.isArray(parsed) ? parsed[0]?.access_token : null);
        if (token) {
          _cachedToken = token;
          _cacheTime = Date.now();
          return token;
        }
      } catch {}
    }
  } catch {}

  _cachedToken = null;
  return null;
};

// Clear cache on auth state change
if (supabase) supabase.auth.onAuthStateChange((event, session) => {
  if (session?.access_token) {
    _cachedToken = session.access_token;
    _cacheTime = Date.now();
  } else {
    _cachedToken = null;
    _cacheTime = 0;
  }
});

/**
 * authFetch — authenticated API call with automatic token injection
 */
export const authFetch = async (url, options = {}) => {
  const token = await getToken();
  if (!token) throw new Error("Session expirée — reconnecte-toi");

  const isFormData = options.body instanceof FormData;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
    body: isFormData
      ? options.body
      : options.body !== undefined
        ? (typeof options.body === "string" ? options.body : JSON.stringify(options.body))
        : undefined,
  });

  let data;
  try { data = await res.json(); } catch { data = {}; }

  if (!res.ok) {
    // If 401, clear cache so next call re-fetches token
    if (res.status === 401) { _cachedToken = null; _cacheTime = 0; }
    throw new Error(data?.error || data?.message || `Erreur serveur (${res.status})`);
  }

  return data;
};
