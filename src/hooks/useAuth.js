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

    const loadPlan = async (u) => {
      if (!u) return;
      try { setPlan(await getUserPlan(u.id)); }
      catch { setPlan("free"); }
    };

    // Step 1: getSession() is INSTANT — reads from localStorage cache
    // This resolves the session immediately without a network call
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadPlan(u);
      
      // Step 2: Validate token in background (doesn't block UI)
      if (u) {
        supabase.auth.getUser().then(({ data: { user: validated }, error }) => {
          if (!mounted) return;
          if (error || !validated) {
            // Token invalid — sign out silently
            setUser(null);
            setPlan("free");
          }
        }).catch(() => {});
      }
    }).catch(() => {
      if (mounted) setUser(null);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadPlan(u);
      else setPlan("free");
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
      if (error) return { error: error.message };
      return { error: null };
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
    signInWithApple: async () => ({ error: "Apple OAuth non configuré" }),
  };
};
