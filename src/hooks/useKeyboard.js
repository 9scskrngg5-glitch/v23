import { useEffect } from "react";

export const useKeyboard = (handlers) => {
  useEffect(() => {
    const fn = (e) => {
      // Don't fire when typing in inputs
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;

      const key = e.key.toLowerCase();
      const combo = `${e.metaKey || e.ctrlKey ? "cmd+" : ""}${e.shiftKey ? "shift+" : ""}${key}`;
      // Prevent default for cmd+k
      if (combo === "cmd+k") e.preventDefault();

      if (handlers[combo]) { e.preventDefault(); handlers[combo](); }
      else if (handlers[key]) { e.preventDefault(); handlers[key](); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [handlers]);
};
