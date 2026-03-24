import { useState, useEffect } from "react";

const STORAGE_KEY = "tj_accounts_v1";
const ACTIVE_KEY = "tj_active_account";

export const DEFAULT_ACCOUNT = { id: "default", name: "Compte principal", type: "live", currency: "USD", color: "#00e5a0" };

export const ACCOUNT_TYPES = [
  { id: "live", label: "Compte réel" },
  { id: "demo", label: "Compte demo" },
  { id: "prop", label: "Prop Firm" },
  { id: "backtest", label: "Backtest" },
];

export const useAccounts = () => {
  const [accounts, setAccounts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || [DEFAULT_ACCOUNT]; } catch { return [DEFAULT_ACCOUNT]; }
  });

  const [activeId, setActiveId] = useState(() => {
    return localStorage.getItem(ACTIVE_KEY) || "default";
  });

  const activeAccount = accounts.find(a => a.id === activeId) || accounts[0];

  const save = (next) => { setAccounts(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); };

  const addAccount = (account) => {
    const newAccount = { ...account, id: `acc_${Date.now()}` };
    save([...accounts, newAccount]);
    return newAccount;
  };

  const updateAccount = (id, data) => save(accounts.map(a => a.id === id ? { ...a, ...data } : a));

  const deleteAccount = (id) => {
    if (accounts.length <= 1) return;
    const next = accounts.filter(a => a.id !== id);
    save(next);
    if (activeId === id) switchAccount(next[0].id);
  };

  const switchAccount = (id) => {
    setActiveId(id);
    localStorage.setItem(ACTIVE_KEY, id);
  };

  return { accounts, activeAccount, addAccount, updateAccount, deleteAccount, switchAccount };
};
