import { useState, useMemo } from "react";
import { C, F, card } from "../lib/design";
import { supabase } from "../lib/supabase";

const analyzePrediction = (trades) => {
  const closed = trades.filter(t => t.result !== "");
  if (closed.length < 10) return null;

  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  // Win rate at current hour
  const sameHour = closed.filter(t => new Date(t.createdAt ?? 0).getHours() === hour);
  const hourWR = sameHour.length > 0 ? (sameHour.filter(t => Number(t.result) > 0).length / sameHour.length) * 100 : null;

  // Win rate on current day of week
  const sameDay = closed.filter(t => new Date(t.createdAt ?? 0).getDay() === dayOfWeek);
  const dayWR = sameDay.length > 0 ? (sameDay.filter(t => Number(t.result) > 0).length / sameDay.length) * 100 : null;

  // Recent form (last 5 trades)
  const recent5 = closed.slice(-5);
  const recentWR = (recent5.filter(t => Number(t.result) > 0).length / recent5.length) * 100;

  // Revenge trading pattern
  let revengeRisk = false;
  const lastThree = closed.slice(-3);
  if (lastThree.filter(t => Number(t.result) < 0).length >= 2) revengeRisk = true;

  // Overall score
  let score = 50;
  if (hourWR !== null) score += (hourWR - 50) * 0.3;
  if (dayWR !== null) score += (dayWR - 50) * 0.2;
  score += (recentWR - 50) * 0.5;
  if (revengeRisk) score -= 20;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const recommendation = score >= 65 ? "CONDITIONS FAVORABLES" : score >= 45 ? "CONDITIONS NEUTRES" : "CONDITIONS DÉFAVORABLES";
  const recColor = score >= 65 ? C.green : score >= 45 ? C.orange : C.red;

  const insights = [];
  if (hourWR !== null && sameHour.length >= 3) {
    insights.push({ text: `À ${String(hour).padStart(2,"0")}h, ton WR historique est ${hourWR.toFixed(0)}%`, good: hourWR >= 50 });
  }
  if (dayWR !== null && sameDay.length >= 3) {
    insights.push({ text: `Le ${DAYS[dayOfWeek]}, ton WR historique est ${dayWR.toFixed(0)}%`, good: dayWR >= 50 });
  }
  if (recentWR < 40) {
    insights.push({ text: `Tes 5 derniers trades: ${recentWR.toFixed(0)}% WR — forme basse`, good: false });
  } else if (recentWR >= 60) {
    insights.push({ text: `Tes 5 derniers trades: ${recentWR.toFixed(0)}% WR — en forme !`, good: true });
  }
  if (revengeRisk) {
    insights.push({ text: "2+ pertes consécutives récentes — risque de revenge trading", good: false });
  }

  return { score, recommendation, recColor, insights };
};

export const AIPrediction = ({ trades, isPro, onUpgrade }) => {
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const prediction = useMemo(() => analyzePrediction(trades), [trades]);

  const runDeepAnalysis = async () => {
    if (!isPro) { onUpgrade(); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const closed = trades.filter(t => t.result !== "").slice(-30);
      const summary = closed.map(t => `${new Date(t.createdAt??0).toLocaleDateString("fr-FR")} ${String(new Date(t.createdAt??0).getHours()).padStart(2,"0")}h — ${t.pair} — ${t.result}$ — RR:${t.rr} — Emotion:${t.emotion||"N/A"}`).join("\n");

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
        body: JSON.stringify({ prompt: `Tu es un analyste quantitatif de trading. Analyse ces ${closed.length} trades et donne:\n1. Les 2-3 patterns temporels clés (heures/jours favorables)\n2. Une prédiction sur si maintenant est un bon moment pour trader\n3. Un conseil spécifique et actionnable pour la prochaine session\n\nSois concis et direct.\n\nTrades:\n${summary}` }),
      });
      const data = await res.json();
      setAiAnalysis(data.text || "");
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (!prediction) return (
    <div style={{ ...card(), textAlign: "center", color: C.textGhost, fontSize: 12, fontFamily: F.mono }}>
      Ajoute au moins 10 trades pour activer la prédiction AI.
    </div>
  );

  // Score gauge
  const gaugeColor = prediction.recColor;

  return (
    <div style={{ ...card() }}>
      <div style={{ fontSize: 10, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", marginBottom: 16, textTransform: "uppercase" }}>
        Prédiction AI — Dois-je trader maintenant ?
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        {/* Score circle */}
        <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
          <svg width="90" height="90" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="45" cy="45" r="36" fill="none" stroke={C.bgInner} strokeWidth="7" />
            <circle cx="45" cy="45" r="36" fill="none" stroke={gaugeColor} strokeWidth="7"
              strokeDasharray={`${(prediction.score / 100) * 2 * Math.PI * 36} ${2 * Math.PI * 36}`}
              strokeLinecap="round" style={{ transition: "stroke-dasharray 0.8s ease" }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: gaugeColor, lineHeight: 1 }}>{prediction.score}</div>
            <div style={{ fontSize: 8, color: C.textDim, fontFamily: F.mono }}>/100</div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: gaugeColor, fontFamily: F.mono, letterSpacing: "0.06em", marginBottom: 8 }}>
            {prediction.recommendation}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {prediction.insights.map((ins, i) => (
              <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                <span style={{ fontSize: 11, color: ins.good ? C.green : C.red, flexShrink: 0, marginTop: 1 }}>{ins.good ? "+" : "−"}</span>
                <span style={{ fontSize: 12, color: C.textMid }}>{ins.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deep AI analysis */}
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: aiAnalysis ? 12 : 0 }}>
          <span style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono }}>Analyse approfondie</span>
          <button onClick={runDeepAnalysis} disabled={loading} style={{
            padding: "7px 14px", borderRadius: 7,
            border: `1px solid ${!isPro ? C.orangeBord : C.greenBord}`,
            background: !isPro ? C.orangeDim : C.greenDim,
            color: !isPro ? C.orange : C.green,
            cursor: "pointer", fontSize: 10, fontFamily: F.mono, letterSpacing: "0.06em",
          }}>
            {!isPro ? "PRO" : loading ? "ANALYSE..." : "ANALYSER →"}
          </button>
        </div>
        {aiAnalysis && (
          <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.75, borderLeft: `2px solid ${C.greenBord}`, paddingLeft: 14, whiteSpace: "pre-wrap", marginTop: 12 }}>
            {aiAnalysis}
          </div>
        )}
      </div>
    </div>
  );
};
