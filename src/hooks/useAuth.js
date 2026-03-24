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

    // getUser() valide le token côté serveur — plus fiable que getSession()
    // qui peut renvoyer un JWT expiré sans le vérifier
    supabase.auth.getUser().then(async ({ data: { user: u }, error }) => {
      if (!mounted) return;
      const safeUser = (!error && u) ? u : null;
      setUser(safeUser);
      if (safeUser) { try { setPlan(await getUserPlan(safeUser.id)); } catch { setPlan("free"); } }
    }).catch(() => { if (mounted) setUser(null); });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) { try { setPlan(await getUserPlan(u.id)); } catch { setPlan("free"); } }
      else setPlan("free");
    });

    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  const signUp = async (email, password) => {
    if (!supabase) return { error: "Backend non configuré" };
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: window.location.origin },
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    return { error: error?.message ?? null };
  };

  const signInWithApple = async () => {
    if (!supabase) return { error: "Backend non configuré" };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: window.location.origin },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setPlan("free");
  };

  return {
    user, plan, authLoading: user === undefined,
    signUp, signIn, signOut, signInWithGoogle, signInWithApple,
  };
};
