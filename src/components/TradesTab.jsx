import { C, F, card, inp } from "../lib/design";
import { useState, useMemo } from "react";
import { ImportModal } from "./ImportModal";
import { TradeTemplates } from "./TradeTemplates";
import { TradeForm } from "./TradeForm";
import { TradeRow } from "./TradeRow";

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.65)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 50,
  backdropFilter: "blur(6px)",
  animation: "fadeIn 0.15s ease forwards",
};

/**
 * @param {{
 *   trades: import('../types').Trade[],
 *   pairs: string[],
 *   onAdd: (form: any) => Promise<{error:string|null}>,
 *   onSave: (id: string, form: any) => Promise<{error:string|null}>,
 *   onDelete: (id: string) => void,
 *   emptyForm: Record<string,string>,
 * }} props
 */
export const TradesTab = ({ trades, pairs, onAdd, onSave, onDelete, emptyForm }) => {
  const [showForm, setShowForm] = useState(false);
  const [filterPair, setFilterPair] = useState("ALL");
  const [editTrade, setEditTrade] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false); // Trade | null

  const filtered = useMemo(
    () =>
      filterPair === "ALL" ? trades : trades.filter((t) => t.pair === filterPair),
    [trades, filterPair]
  );

  const handleAdd = async (form) => {
    const result = await onAdd(form);
    if (!result.error) setShowForm(false);
    return result;
  };

  const handleSave = async (form) => {
    const result = await onSave(editTrade.id, form);
    if (!result.error) setEditTrade(null);
    return result;
  };

  const editInitial = editTrade
    ? {
        pair: editTrade.pair || "",
        session: editTrade.session || "",
        entry: editTrade.entry == null ? "" : String(editTrade.entry),
        sl: editTrade.sl == null ? "" : String(editTrade.sl),
        tp: editTrade.tp == null ? "" : String(editTrade.tp),
        result: editTrade.result == null || editTrade.result === "" ? "" : String(editTrade.result),
        rr: editTrade.rr == null ? "" : String(editTrade.rr),
        emotion: editTrade.emotion || "",
        setup: editTrade.setup || "",
        confidence: editTrade.confidence == null || editTrade.confidence === "" ? "" : String(editTrade.confidence),
      }
    : null;

  const btnBase = {
    padding: "7px 14px",
    borderRadius: 7,
    border: "1px solid",
    cursor: "pointer",
    fontSize: 11,
    fontFamily: F.mono,
    transition: "all 0.15s",
  };

  return (
    <div className="fade-in">
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImport={async (newTrades) => {
            for (const t of newTrades) { await onAdd(t); }
          }}
        />
      )}
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {pairs.map((p) => (
            <button
              key={p}
              onClick={() => setFilterPair(p)}
              style={{
                ...btnBase,
                borderColor: filterPair === p ? C.green : C.border,
                background: filterPair === p ? C.greenDim : "transparent",
                color: filterPair === p ? C.green : C.textDim,
              }}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowImport(true)}
          style={{
            padding: "8px 14px", borderRadius: 9,
            border: "1px solid #181b2e", background: "transparent",
            color: C.textDim, cursor: "pointer", fontSize: 11,
            fontWeight: 600, fontFamily: F.mono,
            transition: "all 0.2s", letterSpacing: "0.06em",
          }}
        >
          IMPORT CSV
        </button>
        <button
          onClick={() => setShowTemplates(s => !s)}
          style={{
            padding: "8px 14px", borderRadius: 9,
            border: "1px solid #181b2e", background: "transparent",
            color: C.textDim, cursor: "pointer", fontSize: 11,
            fontWeight: 600, fontFamily: F.mono,
            transition: "all 0.2s", letterSpacing: "0.06em",
          }}
        >
          TEMPLATES
        </button>
        <button
          onClick={() => setShowForm((s) => !s)}
          style={{
            padding: "8px 18px",
            borderRadius: 9,
            border: "none",
            background: showForm ? C.bgInner : C.green,
            color: showForm ? C.textMid : "#000",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 800,
            fontFamily: F.mono,
            transition: "all 0.2s",
          }}
        >
          {showForm ? "Annuler" : "+ Nouveau trade"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div
          className="fade-in"
          style={{
            background: C.bgCard,
            border: "1px solid #181b2e",
            borderRadius: 16,
            padding: 22,
            marginBottom: 16,
          }}
        >
          <TradeForm
            initialValues={emptyForm}
            onSubmit={handleAdd}
            submitLabel="Valider →"
          />
        </div>
      )}

      {/* Templates */}
      {showTemplates && (
        <div className="fade-in" style={{ marginBottom: 16 }}>
          <TradeTemplates onUseTemplate={(tpl) => { setShowTemplates(false); setShowForm(true); }} />
        </div>
      )}

      {/* Trade list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 && (
          <div
            style={{
              color: C.textGhost,
              textAlign: "center",
              padding: 50,
              fontSize: 13,
              fontFamily: F.mono,
            }}
          >
            Aucun trade enregistré
          </div>
        )}
        {filtered.map((t) => (
          <TradeRow
            key={t.id}
            trade={t}
            onClick={() => setEditTrade(t)}
            onDelete={() => onDelete(t.id)}
          />
        ))}
      </div>

      {/* Edit modal */}
      {editTrade && editInitial && (
        <div
          style={modalOverlay}
          onClick={() => setEditTrade(null)}
        >
          <div
            style={{
              width: "min(740px, 95vw)",
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderRadius: 18,
              padding: 22,
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
              animation: "scaleIn 0.18s ease forwards",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: C.textDim,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontFamily: F.mono,
                  }}
                >
                  Modifier un trade
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    marginTop: 3,
                    fontFamily: F.display,
                    color: C.text,
                  }}
                >
                  {editTrade.pair || "Trade"}
                </div>
              </div>
              <button
                onClick={() => setEditTrade(null)}
                style={{
                  background: "transparent",
                  border: "1px solid #181b2e",
                  borderRadius: 9,
                  padding: "7px 14px",
                  color: C.textMid,
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: F.mono,
                  transition: "border-color 0.2s",
                }}
              >
                ✕
              </button>
            </div>
            <TradeForm
              initialValues={editInitial}
              onSubmit={handleSave}
              onCancel={() => setEditTrade(null)}
              submitLabel="Sauvegarder →"
            />
          </div>
        </div>
      )}
    </div>
  );
};
