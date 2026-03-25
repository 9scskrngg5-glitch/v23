import { useState, useEffect } from "react";
import { C, F, card, inp } from "../lib/design";

const SENTIMENTS = [
  { id: "bullish",  label: "Bullish",  color: C.green,   icon: "▲" },
  { id: "neutral",  label: "Neutral",  color: C.textMid, icon: "◆" },
  { id: "bearish",  label: "Bearish",  color: C.red,     icon: "▼" },
  { id: "volatile", label: "Volatile", color: C.orange,  icon: "≋" },
];
const VOLATILITY = ["Low", "Medium", "High", "Extreme"];
const today = () => new Date().toISOString().slice(0, 10);

const useJournal = () => {
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tj_market_journal") || "{}"); } catch { return {}; }
  });
  const save = (date, entry) => {
    const next = { ...entries, [date]: entry };
    setEntries(next);
    localStorage.setItem("tj_market_journal", JSON.stringify(next));
  };
  return { entries, save };
};

const JournalEntry = ({ date, entry, onSave }) => {
  const [form, setForm] = useState(entry || { sentiment: "", volatility: "", bias: "", news: "", plan: "", reflection: "" });
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handleSave = () => { onSave(date, { ...form, savedAt: Date.now() }); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const dateLabel = new Date(date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{ ...card(), marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: C.textDim, fontFamily: F.mono, marginBottom: 18, textTransform: "capitalize" }}>{dateLabel}</div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", marginBottom: 10, textTransform: "uppercase" }}>Sentiment du marché</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SENTIMENTS.map(s => (
            <button key={s.id} onClick={() => set("sentiment", s.id)} style={{
              padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12,
              fontFamily: F.mono, border: `1px solid ${form.sentiment === s.id ? s.color + "50" : ${C.borde}r}`,
              background: form.sentiment === s.id ? s.color + "12" : "transparent",
              color: form.sentiment === s.id ? s.color : C.textDim, transition: "all 0.15s",
            }}>{s.icon} {s.label}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, letterSpacing: "0.14em", marginBottom: 10, textTransform: "uppercase" }}>Volatilité</div>
        <div style={{ display: "flex", gap: 6 }}>
          {VOLATILITY.map(v => (
            <button key={v} onClick={() => set("volatility", v)} style={{
              padding: "7px 14px", borderRadius: 7, cursor: "pointer", fontSize: 11, fontFamily: F.mono,
              border: `1px solid ${form.volatility === v ? ${C.greenBord} : ${C.borde}r}`,
              background: form.volatility === v ? C.greenDim : "transparent",
              color: form.volatility === v ? C.green : C.textDim, transition: "all 0.15s",
            }}>{v}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        {[["bias", "Biais du jour", "Long BTC, short DXY..."], ["news", "News / Événements", "FOMC, CPI, NFP..."]].map(([k, label, ph]) => (
          <div key={k}>
            <label style={{ fontSize: 9, color: C.textDim, display: "block", marginBottom: 6, fontFamily: F.mono, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</label>
            <input value={form[k] || ""} onChange={e => set(k, e.target.value)} placeholder={ph} style={inp()}
              onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>
        ))}
      </div>

      {[["plan", "Plan du jour", "Niveaux clés à surveiller, setups potentiels..."], ["reflection", "Réflexion de fin de journée", "Ce qui a bien marché, leçons apprises..."]].map(([k, label, ph]) => (
        <div key={k} style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 9, color: C.textDim, display: "block", marginBottom: 6, fontFamily: F.mono, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</label>
          <textarea value={form[k] || ""} onChange={e => set(k, e.target.value)} placeholder={ph}
            style={{ ...inp(), minHeight: 80, resize: "vertical" }}
            onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>
      ))}

      <button onClick={handleSave} style={{
        padding: "10px 22px", borderRadius: 8, border: saved ? `1px solid ${C.greenBord}` : "none",
        background: saved ? C.greenDim : C.green, color: saved ? C.green : "#000",
        cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: F.mono, letterSpacing: "0.06em", transition: "all 0.2s",
      }}>{saved ? "SAUVEGARDÉ ✓" : "SAUVEGARDER"}</button>
    </div>
  );
};

export const MarketJournal = () => {
  const { entries, save } = useJournal();
  const [selectedDate, setSelectedDate] = useState(today());

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { date: d.toISOString().slice(0, 10), d };
  });

  const sentimentColor = (date) => {
    const e = entries[date]; if (!e?.sentiment) return C.border;
    return SENTIMENTS.find(s => s.id === e.sentiment)?.color || C.border;
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
          style={{ ...inp({ width: "auto" }), colorScheme: "dark" }}
          onFocus={e => e.target.style.borderColor = C.green} onBlur={e => e.target.style.borderColor = C.border}
        />
      </div>

      {/* Calendar strip */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {last7.map(({ date, d }) => {
          const active = selectedDate === date;
          const color = sentimentColor(date);
          const hasEntry = !!entries[date]?.savedAt;
          return (
            <button key={date} onClick={() => setSelectedDate(date)} style={{
              flex: 1, padding: "10px 6px", borderRadius: 10, textAlign: "center", cursor: "pointer",
              border: `1px solid ${active ? ${C.greenBord} : ${C.borde}r}`,
              background: active ? C.greenDim : "transparent",
            }}>
              <div style={{ fontSize: 9, color: C.textDim, fontFamily: F.mono, marginBottom: 4 }}>{d.toLocaleDateString("fr-FR", { weekday: "short" }).slice(0,2).toUpperCase()}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: active ? C.green : C.textMid, fontFamily: "'Syne', sans-serif" }}>{d.getDate()}</div>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: hasEntry ? color : "transparent", margin: "4px auto 0", border: hasEntry ? `1px solid ${color}` : "none" }} />
            </button>
          );
        })}
      </div>

      <JournalEntry date={selectedDate} entry={entries[selectedDate]} onSave={save} />
    </div>
  );
};
