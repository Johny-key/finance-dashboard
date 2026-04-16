"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type TxType = "income" | "expense";
export type View = "dashboard" | "transactions" | "categories" | "budget";

export interface Transaction {
  id: number;
  date: string;
  amount: number;
  type: TxType;
  categoryId: number;
  description: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  type: TxType | "both";
}

export interface Budget {
  id: number;
  categoryId: number;
  limit: number;
  month: string;
}

const INIT_CATEGORIES: Category[] = [
  { id: 1,  name: "Зарплата",       color: "#00D1A0", type: "income"  },
  { id: 2,  name: "Фриланс",        color: "#4DA3FF", type: "income"  },
  { id: 3,  name: "Аренда жилья",   color: "#FF5C8A", type: "expense" },
  { id: 4,  name: "Продукты",       color: "#FF9F43", type: "expense" },
  { id: 5,  name: "Транспорт",      color: "#4DA3FF", type: "expense" },
  { id: 6,  name: "Рестораны",      color: "#FF9F43", type: "expense" },
  { id: 7,  name: "Развлечения",    color: "#7C5CFF", type: "expense" },
  { id: 8,  name: "Одежда",         color: "#FF5C8A", type: "expense" },
  { id: 9,  name: "Здоровье",       color: "#00D1A0", type: "expense" },
  { id: 10, name: "Коммунальные",   color: "#FF9F43", type: "expense" },
];

const INIT_TRANSACTIONS: Transaction[] = [
  { id: 1,  date: "2026-04-14", amount: 1800,   type: "expense", categoryId: 6,  description: "Обед с коллегами"      },
  { id: 2,  date: "2026-04-14", amount: 1200,   type: "expense", categoryId: 5,  description: "Такси, транспорт"       },
  { id: 3,  date: "2026-04-13", amount: 4500,   type: "expense", categoryId: 9,  description: "Поликлиника, аптека"    },
  { id: 4,  date: "2026-04-12", amount: 2400,   type: "expense", categoryId: 7,  description: "Кино, концерт"          },
  { id: 5,  date: "2026-04-10", amount: 8500,   type: "expense", categoryId: 10, description: "Коммунальные услуги"    },
  { id: 6,  date: "2026-04-09", amount: 4100,   type: "expense", categoryId: 4,  description: "ВкусВилл, магазин"      },
  { id: 7,  date: "2026-04-07", amount: 1800,   type: "expense", categoryId: 5,  description: "Метро, каршеринг"       },
  { id: 8,  date: "2026-04-06", amount: 2400,   type: "expense", categoryId: 6,  description: "Ужин в Белуге"          },
  { id: 9,  date: "2026-04-05", amount: 25000,  type: "income",  categoryId: 2,  description: "Проект для клиента"     },
  { id: 10, date: "2026-04-03", amount: 5200,   type: "expense", categoryId: 4,  description: "Лента, Перекрёсток"     },
  { id: 11, date: "2026-04-01", amount: 45000,  type: "expense", categoryId: 3,  description: "Аренда квартиры"        },
  { id: 12, date: "2026-04-01", amount: 150000, type: "income",  categoryId: 1,  description: "Зарплата за март"       },
];

const INIT_BUDGETS: Budget[] = [
  { id: 1, categoryId: 3,  limit: 45000, month: "2026-04" },
  { id: 2, categoryId: 4,  limit: 15000, month: "2026-04" },
  { id: 3, categoryId: 5,  limit: 5000,  month: "2026-04" },
  { id: 4, categoryId: 6,  limit: 5000,  month: "2026-04" },
  { id: 5, categoryId: 7,  limit: 5000,  month: "2026-04" },
  { id: 6, categoryId: 8,  limit: 8000,  month: "2026-04" },
  { id: 7, categoryId: 9,  limit: 6000,  month: "2026-04" },
  { id: 8, categoryId: 10, limit: 7000,  month: "2026-04" },
];

interface AppContextType {
  view: View;
  setView: (v: View) => void;
  showAddModal: boolean;
  setShowAddModal: (v: boolean) => void;
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: number) => void;
  addCategory: (cat: Omit<Category, "id">) => void;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: number) => void;
  upsertBudget: (data: { categoryId: number; limit: number; month: string }) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView]                   = useState<View>("dashboard");
  const [showAddModal, setShowAddModal]   = useState(false);
  const [transactions, setTransactions]   = useState<Transaction[]>(INIT_TRANSACTIONS);
  const [categories, setCategories]       = useState<Category[]>(INIT_CATEGORIES);
  const [budgets, setBudgets]             = useState<Budget[]>(INIT_BUDGETS);

  const addTransaction = useCallback((tx: Omit<Transaction, "id">) => {
    setTransactions(prev => [{ ...tx, id: Date.now() }, ...prev]);
  }, []);
  const updateTransaction = useCallback((tx: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === tx.id ? tx : t));
  }, []);
  const deleteTransaction = useCallback((id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const addCategory = useCallback((cat: Omit<Category, "id">) => {
    setCategories(prev => [...prev, { ...cat, id: Date.now() }]);
  }, []);
  const updateCategory = useCallback((cat: Category) => {
    setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
  }, []);
  const deleteCategory = useCallback((id: number) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const upsertBudget = useCallback((data: { categoryId: number; limit: number; month: string }) => {
    setBudgets(prev => {
      const idx = prev.findIndex(b => b.categoryId === data.categoryId && b.month === data.month);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], limit: data.limit };
        return next;
      }
      return [...prev, { ...data, id: Date.now() }];
    });
  }, []);

  return (
    <AppContext.Provider value={{
      view, setView,
      showAddModal, setShowAddModal,
      transactions, categories, budgets,
      addTransaction, updateTransaction, deleteTransaction,
      addCategory, updateCategory, deleteCategory,
      upsertBudget,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
