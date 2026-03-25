import { useState, useRef } from "react";
import { C, F } from "../lib/design";
import { detectAndParse } from "../lib/importers";
import { uid } from "../lib/trading";

const mono = "'DM Mono', monospace";
const sans = "'DM Sans', sans-serif";

const FORMAT_INFO = {
  binance: { label: "Binance Futures", color: C.orange, hint: "Historique des trades futures" },
  metatrader: { label: "MetaTrader 4/5", color: C.green, hint: "Export statement MT4/MT5" },
  generic: { label: "Format générique", color: C.textMid, hint: "CSV avec colonnes pair, result, etc." },
  unknown: { label: "Format inconnu", color: C.red, hint: "" },
};

export const ImportModal = ({ onImport, onClose }) => {
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const fileRef = useRef();

  const processFile = (file) => {
    if (!file) return;
    setError(""); setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsed = detectAndParse(text);
      if (parsed.error) { setError(parsed.error); return; }
      // Add UIDs
      parsed.trades = parsed.trades.map(t => ({ ...t, id: uid(), flags: [] }));
      setResult(parsed);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleImport = async () => {
    if (!result?.trades?.length) return;
    setImporting(true);
    await onImport(result.trades);
    setImporting(false);
    onClose();
  };

  const fmt = result ? FORMAT_INFO[result.format] : null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 100, backdropFilter: "blur(6px)" }} onClick={onClose}>
      <div style={{ width: "min(520px, 95vw)", background: C.bgInner, border: "1px solid #181b2e", borderRadius: 18, padding: 28 }} onClick={e => e.stopPropagation()}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, color: C.textDim, fontFamily: mono, letterSpacing: "0.15em", marginBottom: 4 }}>IMPORT CSV</div>
            <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: C.text }}>Importer des trades</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #181b2e", borderRadius: 7, color: C.textDim, cursor: "pointer", fontSize: 12, padding: "7px 14px", fontFamily: mono }}>✕</button>
        </div>

        {/* Supported formats */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {[["Binance Futures", C.orange], ["MetaTrader 4/5", C.green], ["CSV générique", C.textMid]].map(([label, color]) => (
            <span key={label} style={{ fontSize: 10, fontFamily: mono, letterSpacing: "0.06em", padding: "3px 10px", borderRadius: 20, border: `1px solid ${color}30`, color, background: `${color}08` }}>
              {label}
            </span>
          ))}
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? C.green : result ? "rgba(0,229,160,0.3)" : C.border}`,
            borderRadius: 12, padding: "28px 20px", textAlign: "center",
            cursor: "pointer", transition: "all 0.2s", marginBottom: 14,
            background: dragging ? "rgba(0,229,160,0.03)" : "transparent",
          }}
        >
          <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={e => processFile(e.target.files[0])} />
          <div style={{ fontSize: 24, marginBottom: 8, color: C.textDim, fontFamily: mono }}>⊕</div>
          <div style={{ fontSize: 13, color: C.textDim, fontFamily: sans }}>
            {result ? "Clique pour changer de fichier" : "Glisse ton fichier CSV ici ou clique pour choisir"}
          </div>
          <div style={{ fontSize: 11, color: C.textDim, fontFamily: mono, marginTop: 6 }}>
            .csv · .txt
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(255,77,109,0.07)", border: "1px solid rgba(255,77,109,0.18)", padding: "10px 14px", borderRadius: 10, color: C.red, fontSize: 12, fontFamily: mono, marginBottom: 14 }}>
            {error}
          </div>
        )}

        {/* Result preview */}
        {result && fmt && (
          <div style={{ background: C.bgCard, border: "1px solid #13162a", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontFamily: mono, color: fmt.color, letterSpacing: "0.08em" }}>{fmt.label}</span>
              <span style={{ fontSize: 11, fontFamily: mono, color: C.textDim }}>{result.count} trades détectés</span>
            </div>
            {/* Preview first 3 trades */}
            {result.trades.slice(0, 3).map((t, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: i > 0 ? "1px solid #0e1120" : "none" }}>
                <span style={{ fontSize: 11, color: C.textMid, fontFamily: mono }}>{t.pair}</span>
                <span style={{ fontSize: 11, color: Number(t.result) >= 0 ? C.green : C.red, fontFamily: mono }}>
                  {Number(t.result) >= 0 ? "+" : ""}{Number(t.result).toFixed(2)}$
                </span>
              </div>
            ))}
            {result.count > 3 && (
              <div style={{ fontSize: 10, color: C.textDim, fontFamily: mono, marginTop: 8 }}>
                + {result.count - 3} autres trades...
              </div>
            )}
          </div>
        )}

        {/* CSV template download */}
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => {
            const csv = "pair,result,session,entry,sl,tp,rr,emotion,setup,confidence\nBTC/USDT,+120,New York,104500,104000,105500,3.00,calme,Break of structure,8\n";
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = "template-trades.csv"; a.click();
            URL.revokeObjectURL(url);
          }} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 11, fontFamily: mono, letterSpacing: "0.06em", padding: 0 }}>
            Télécharger template CSV →
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 18px", borderRadius: 8, border: "1px solid #181b2e", background: "transparent", color: C.textDim, cursor: "pointer", fontSize: 12, fontFamily: mono, letterSpacing: "0.06em" }}>
            ANNULER
          </button>
          <button onClick={handleImport} disabled={!result?.trades?.length || importing} style={{
            padding: "10px 22px", borderRadius: 8, border: "none",
            background: result?.trades?.length ? C.green : "#0d1020",
            color: result?.trades?.length ? "#000" : C.textDim,
            cursor: result?.trades?.length ? "pointer" : "not-allowed",
            fontSize: 12, fontWeight: 700, fontFamily: mono, letterSpacing: "0.06em",
          }}>
            {importing ? "IMPORT..." : `IMPORTER ${result?.count || ""} TRADES`}
          </button>
        </div>
      </div>
    </div>
  );
};
