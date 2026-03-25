import { useState, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { C, F, card, inp } from "../lib/design";

const QUESTIONS = [
  { id: "best",    label: "Meilleur trade de la semaine",   ph: "Décris ton meilleur trade et pourquoi il était bon..." },
  { id: "worst",   label: "Pire trade de la semaine",       ph: "Décris ton pire trade et ce que tu aurais dû faire..." },
  { id: "emotion", label: "Gestion émotionnelle",           ph: "Comment tu as géré tes émotions cette semaine ?" },
  { id: "respect", label: "Respect du plan",                ph: "As-tu respecté ton plan de trading ?" },
  { id: "next",    label: "Objectif semaine prochaine",     ph: "Qu'est-ce que tu veux améliorer ?" },
];

const weekKey = () => {
  const d = new Date(); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return `week_${new Date(d.setDate(diff)).toISOString().slice(0, 10)}`;
};

const useReviews = () => {
  const [reviews, setReviews] = useState(() => { try { return JSON.parse(localStorage.getItem("tj_weekly_reviews") || "{}"); } catch { return {}; } });
  const save = (key, review) => { const next = { ...reviews, [key]: review }; setReviews(next); localStorage.setItem("tj_weekly_reviews", JSON.stringify(next)); };
  return { reviews, save };
};

export const WeeklyReview = ({ trades, isPro, onUpgrade }) => {
  const { reviews, save } = useReviews();
  const key = weekKey();
  const [form, setForm] = useState(reviews[key] || { rating: 0, answers: {} });
  const [aiInsight, setAiInsight] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const weekTrades = useMemo(() => {
    const monday = new Date(); const day = monday.getDay(); monday.setDate(monday.getDate() - day + (day === 0 ? -6 : 1)); monday.setHours(0,0,0,0);
    return trades.filter(t => (t.createdAt ?? 0) >= monday.getTime() && t.result !== "");
  }, [trades]);

  const weekPnL = weekTrades.reduce((a, t) => a + Number(t.result), 0);
  const weekWins = weekTrades.filter(t => Number(t.result) > 0).length;
  const weekWR = weekTrades.length ? ((weekWins / weekTrades.length) * 100).toFixed(0) : 0;

  const handleAI = async () => {
    if (!isPro) { onUpgrade(); return; }
    setAiLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const summary = `Semaine: ${weekTrades.length} trades, WR ${weekWR}%, PnL ${weekPnL.toFixed(2)}$\n` + QUESTIONS.map(q => `${q.label}: ${form.answers[q.id] || "N/A"}`).join("\n");
      const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` }, body: JSON.stringify({ prompt: `Tu es un coach de trading. Voici la review hebdomadaire:\n\n${summary}\n\nDonne un feedback concis (3-4 points) et un plan d'action pour la semaine prochaine.` }) });
      const data = await res.json();
      setAiInsight(data.text || "");
    } catch (e) { console.error(e); }
    setAiLoading(false);
  };

  const pastReviews = Object.entries(reviews).filter(([k]) => k !== key).sort(([a], [b]) => b.localeCompare(a)).slice(0, 4);

  return (
    <div className="fade-in">
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "PnL Semaine", value: `${weekPnL >= 0 ? "+" : ""}${weekPnL.toFixed(2)}$`, color: weekPnL >= 0 ? C.green : C.red },
          { label: "Win Rate",    value: `${weekWR}%`,            color: Number(weekWR) >= 50 ? C.green : C.red },
          { label: "Trades",      value: weekTrades.length,        color: C.text },
        ].map(s => (
          <div key={s.label} style={{ ...card() }}>
            <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'Syne', sans-serif", letterSpacing: "-0.02em" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Rating */}
      <div style={{ ...card(), marginBottom: 14 }}>
        <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>Note globale</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {[1,2,3,4,5].map(r => (
            <button key={r} onClick={() => setForm(f => ({ ...f, rating: r }))} style={{
              width: 40, height: 40, borderRadius: 8,
              border: `1px solid ${form.rating >= r ? C.greenBord : C.border}`,
              background: form.rating >= r ? C.greenDim : "transparent",
              color: form.rating >= r ? C.green : C.textDim,
              cursor: "pointer", fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 700,
            }}>{r}</button>
          ))}
          {form.rating > 0 && <span style={{ fontSize: 12, color: C.textDim, fontFamily: F.mono, marginLeft: 8 }}>
            {["", "Semaine à oublier", "Semaine difficile", "Semaine correcte", "Bonne semaine", "Semaine excellente"][form.rating]}
          </span>}
        </div>
      </div>

      {/* Questions */}
      <div style={{ ...card(), marginBottom: 14 }}>
        <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>Questions de coaching</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {QUESTIONS.map(q => (
            <div key={q.id}>
              <label style={{ fontSize: 12, color: C.textMid, display: "block", marginBottom: 6, fontFamily: F.mono }}>{q.label}</label>
              <textarea value={form.answers?.[q.id] || ""} onChange={e => setForm(f => ({ ...f, answers: { ...f.answers, [q.id]: e.target.value } }))}
                placeholder={q.ph} style={{ ...inp(), minHeight: 72, resize: "vertical" }}
                onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>
          ))}
        </div>
      </div>

      {/* AI */}
      <div style={{ ...card(), marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: aiInsight ? 14 : 0 }}>
          <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", textTransform: "uppercase" }}>Coaching AI</div>
          <button onClick={handleAI} disabled={aiLoading} style={{
            padding: "7px 16px", borderRadius: 7,
            border: `1px solid ${!isPro ? C.orangeBord : C.greenBord}`,
            background: !isPro ? C.orangeDim : C.greenDim,
            color: !isPro ? C.orange : aiLoading ? C.textDim : C.green,
            cursor: "pointer", fontSize: 10, fontFamily: F.mono, letterSpacing: "0.06em",
          }}>{!isPro ? "UPGRADE" : aiLoading ? "ANALYSE..." : "ANALYSER MA SEMAINE →"}</button>
        </div>
        {aiInsight && <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.75, borderLeft: `2px solid ${C.greenBord}`, paddingLeft: 14, whiteSpace: "pre-wrap" }}>{aiInsight}</div>}
      </div>

      <button onClick={() => { save(key, { ...form, savedAt: Date.now() }); setSaved(true); setTimeout(() => setSaved(false), 2000); }} style={{
        padding: "11px 24px", borderRadius: 9, border: saved ? `1px solid ${C.greenBord}` : "none",
        background: saved ? C.greenDim : C.green, color: saved ? C.green : "#000",
        cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: F.mono, letterSpacing: "0.06em", marginBottom: 24,
      }}>{saved ? "SAUVEGARDÉ ✓" : "SAUVEGARDER LA REVIEW"}</button>

      {/* Past reviews */}
      {pastReviews.length > 0 && (
        <div>
          <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>Reviews précédentes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pastReviews.map(([k, r]) => (
              <div key={k} style={{ ...card(), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: C.textMid, fontFamily: F.mono }}>Semaine du {new Date(k.replace("week_", "") + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</div>
                  {r.answers?.next && <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{r.answers.next.slice(0, 60)}...</div>}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1,2,3,4,5].map(n => <div key={n} style={{ width: 8, height: 8, borderRadius: 2, background: r.rating >= n ? C.green : C.bgInner }} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
