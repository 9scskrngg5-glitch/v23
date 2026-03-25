import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { getUserPlan } from "../lib/stripe";

export const useAuth = () => {
  const [user, setUser] = useState(undefined);
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setUser(null);
      return;
    }

    let mounted = true;

    // Handle OAuth redirect — Supabase puts tokens in URL hash after redirect
    const handleRedirect = async () => {
      const hash = window.location.hash;
      if (hash && (hash.includes("access_token") || hash.includes("error"))) {
        // Let Supabase parse the hash automatically via detectSessionInUrl
        // Clean the URL after a short delay
        setTimeout(() => {
          window.history.replaceState(null, "", window.location.pathname);
        }, 500);
      }
    };
    handleRedirect();

    // Get current user — validates token server-side
    supabase.auth.getUser().then(async ({ data: { user: u }, error }) => {
      if (!mounted) return;
      const safeUser = (!error && u) ? u : null;
      setUser(safeUser);
      if (safeUser) { try { setPlan(await getUserPlan(safeUser.id)); } catch { setPlan("free"); } }
    }).catch(() => { if (mounted) setUser(null); });

    // Listen for auth state changes — fires when OAuth redirect completes
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        try { setPlan(await getUserPlan(u.id)); } catch { setPlan("free"); }
      } else {
        setPlan("free");
      }
    });

    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  const signUp = async (email, password) => {
    if (!supabase) return { error: "Backend non configuré" };
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    return { error: error?.message ?? null };
  };

  const signIn = async (email, password, rememberMe = true) => {
    if (!supabase) return { error: "Backend non configuré" };
    const { error } = await supabase.auth.signInWithPassword({
      email, password,
      options: { persistSession: rememberMe },
    });
    return { error: error?.message ?? null };
  };

  const signInWithGoogle = async () => {
    if (!supabase) return { error: "Backend non configuré" };
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      // signInWithOAuth redirects the browser — if we get here it failed
      if (error) return { error: error.message };
      return { error: null }; // redirect will happen
    } catch (e) {
      return { error: e?.message || "Erreur OAuth" };
    }
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setPlan("free");
  };

  return {
    user, plan,
    authLoading: user === undefined,
    signUp, signIn, signOut, signInWithGoogle,
    // Keep signInWithApple for API compat even if not used
    signInWithApple: async () => ({ error: "Apple OAuth non configuré" }),
  };
};
