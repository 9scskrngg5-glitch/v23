import { useState, useEffect } from "react";
import { storageGet, storageSet, STORAGE_KEYS } from "../lib/storage";
import { uid } from "../lib/trading";

export const useTasks = (user) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await storageGet(STORAGE_KEYS.tasks, user ?? null);
        setTasks(Array.isArray(stored) ? stored : []);
      } catch {
        setTasks([]);
      }
    })();
  }, [user?.id]);

  const persist = async (next) => {
    setTasks(next);
    await storageSet(STORAGE_KEYS.tasks, next, user ?? null);
  };

  const addTask = async (text) => {
    if (!text.trim()) return;
    await persist([...tasks, { id: uid(), text, done: false }]);
  };

  /** @param {string} id */
  const toggleTask = async (id) => {
    await persist(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  /** @param {string} id */
  const deleteTask = async (id) => {
    await persist(tasks.filter((t) => t.id !== id));
  };

  const clearDone = async () => {
    await persist(tasks.filter((t) => !t.done));
  };

  /** @param {import('../types').Task[]} nextTasks */
  const replaceTasks = async (nextTasks) => {
    await persist(Array.isArray(nextTasks) ? nextTasks : []);
  };

  return { tasks, addTask, toggleTask, deleteTask, clearDone, replaceTasks };
};
