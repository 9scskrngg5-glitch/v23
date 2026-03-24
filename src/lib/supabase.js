import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("[TradingJournal] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquant. L'app fonctionnera en mode local uniquement.");
}

// Create a dummy client if env vars missing — prevents crash
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: localStorage,
      },
    })
  : null;

export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey);
