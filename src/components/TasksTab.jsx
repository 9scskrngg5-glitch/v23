import { useState } from "react";
import { C, F } from "../lib/design";

/**
 * @param {{
 *   tasks: import('../types').Task[],
 *   onAdd: (text: string) => void,
 *   onToggle: (id: string) => void,
 *   onDelete: (id: string) => void,
 *   onClearDone: () => void,
 * }} props
 */
export const TasksTab = ({ tasks, onAdd, onToggle, onDelete, onClearDone }) => {
  const [input, setInput] = useState("");

  const submit = () => {
    onAdd(input);
    setInput("");
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Plan ta session (règles, focus, mindset…)"
          style={{
            flex: 1,
            background: C.bgInner,
            border: "1px solid #181b2e",
            color: C.text,
            padding: "10px 14px",
            borderRadius: 11,
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = C.green)}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
        />
        <button
          onClick={submit}
          style={{
            padding: "10px 20px",
            borderRadius: 11,
            border: "none",
            background: C.green,
            color: "#000",
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 700,
            transition: "opacity 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
        >
          +
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {tasks.length === 0 && (
          <div
            style={{
              color: C.textGhost,
              textAlign: "center",
              padding: 50,
              fontSize: 13,
              fontFamily: "'DM Mono', monospace",
            }}
          >
            Aucune tâche
          </div>
        )}
        {tasks.map((t) => (
          <div
            key={t.id}
            style={{
              background: C.bgInner,
              border: "1px solid #13162a",
              borderRadius: 11,
              padding: "11px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              opacity: t.done ? 0.45 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {/* Checkbox */}
            <button
              onClick={() => onToggle(t.id)}
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                border: `1.5px solid ${t.done ? C.green : C.border}`,
                background: t.done ? C.green : "transparent",
                cursor: "pointer",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              {t.done && (
                <span style={{ fontSize: 10, color: "#000", fontWeight: 800, lineHeight: 1 }}>
                  ✓
                </span>
              )}
            </button>

            <span
              style={{
                flex: 1,
                fontSize: 13,
                textDecoration: t.done ? "line-through" : "none",
                color: t.done ? "#2a3050" : "#c0c4d8",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {t.text}
            </span>

            <button
              onClick={() => onDelete(t.id)}
              style={{
                background: "none",
                border: "none",
                color: C.textGhost,
                cursor: "pointer",
                fontSize: 13,
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.color = C.red)}
              onMouseOut={(e) => (e.target.style.color = C.textGhost)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {tasks.some((t) => t.done) && (
        <button
          onClick={onClearDone}
          style={{
            marginTop: 16,
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #181b2e",
            background: "transparent",
            color: C.textDim,
            cursor: "pointer",
            fontSize: 11,
            fontFamily: "'DM Mono', monospace",
            transition: "color 0.2s",
          }}
          onMouseOver={(e) => (e.target.style.color = C.red)}
          onMouseOut={(e) => (e.target.style.color = C.textDim)}
        >
          Supprimer les tâches complètes
        </button>
      )}
    </div>
  );
};
