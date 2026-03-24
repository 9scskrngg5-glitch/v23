import { supabase, isSupabaseConfigured } from "./supabase";

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    maxTrades: 20,
    aiCoach: false,
    export: false,
  },
  pro: {
    name: "Pro",
    price: 9,
    maxTrades: Infinity,
    aiCoach: true,
    export: true,
  },
};

const ADMIN_EMAILS_LIST = (import.meta.env.VITE_ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());

export const getUserPlan = async (userId) => {
  if (!supabase) return "free";
  try {
    // Admins are always Pro
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email && ADMIN_EMAILS_LIST.includes(user.email.toLowerCase())) return "pro";

    const { data } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", userId)
      .single();
    if (data?.status === "active" && data?.plan === "pro") return "pro";
    return "free";
  } catch {
    return "free";
  }
};

export const redirectToCheckout = async () => {
  if (!supabase) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  const res = await fetch("/api/stripe-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
  });
  const { url } = await res.json();
  if (url) window.location.href = url;
};

export const redirectToPortal = async () => {
  if (!supabase) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  const res = await fetch("/api/stripe-portal", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` },
  });
  const { url } = await res.json();
  if (url) window.location.href = url;
};
