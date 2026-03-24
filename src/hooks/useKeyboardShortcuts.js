import { useEffect } from "react";

export const useKeyboardShortcuts = ({ onNewTrade, onTab, tabs }) => {
  useEffect(() => {
    const handler = (e) => {
      // Ignore when typing in inputs
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;

      switch (e.key.toLowerCase()) {
        case "n": onNewTrade?.(); break;
        case "1": onTab?.(tabs?.[0]); break;
        case "2": onTab?.(tabs?.[1]); break;
        case "3": onTab?.(tabs?.[2]); break;
        case "4": onTab?.(tabs?.[3]); break;
        case "5": onTab?.(tabs?.[4]); break;
        case "?":
          // Show shortcuts help — dispatch custom event
          window.dispatchEvent(new CustomEvent("tj:shortcuts"));
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNewTrade, onTab, tabs]);
};
