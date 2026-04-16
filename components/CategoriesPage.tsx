"use client";

import { useState } from "react";
import { useApp, Category } from "@/app/context";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

const PALETTE = ["#FF7056","#3BE8D0","#00D1A0","#FF9F43","#FF5C8A","#a78bfa","#34d399","#f97316","#60a5fa","#fb7185"];

function CategoryCard({ cat, spent }: { cat: Category; spent: number }) {
  const { deleteCategory, updateCategory } = useApp();
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(cat.name);
  const [color, setColor]     = useState(cat.color);

  const save = () => {
    updateCategory({ ...cat, name: name.trim() || cat.name, color });
    setEditing(false);
  };

  return (
    <div
      className="relative rounded-2xl p-4 group transition-all"
      style={{
        background: "var(--bg-card)",
        border: editing ? `1px solid ${cat.color}50` : "1px solid var(--border)",
      }}
    >
      {/* Color accent bar */}
      <div className="absolute top-0 left-4 right-4 h-px rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${cat.color}, transparent)` }} />

      {editing ? (
        <div className="space-y-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full text-[13px] px-3 py-2 rounded-lg outline-none"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-bright)",
              color: "var(--text-primary)",
              fontFamily: "'Inter', sans-serif",
            }}
          />
          {/* Palette */}
          <div className="flex gap-1.5 flex-wrap">
            {PALETTE.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-6 h-6 rounded-full transition-all"
                style={{
                  background: c,
                  border: color === c ? "2px solid white" : "2px solid transparent",
                  transform: color === c ? "scale(1.15)" : "scale(1)",
                }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium" style={{ background: "var(--coral-dim)", color: "var(--coral)", border: "1px solid rgba(255,112,86,0.3)", fontFamily: "'Inter', sans-serif" }}>
              <Check size={12} /> Сохранить
            </button>
            <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px]" style={{ color: "var(--text-muted)", fontFamily: "'Inter', sans-serif" }}>
              <X size={12} /> Отмена
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: cat.color }} />
              <span className="text-[14px] font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Inter', sans-serif" }}>
                {cat.name}
              </span>
            </div>
            {/* Actions (hover) */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: "var(--text-muted)" }}>
                <Pencil size={12} />
              </button>
              <button onClick={() => deleteCategory(cat.id)} className="p-1.5 rounded-lg hover:bg-red-500/10" style={{ color: "var(--expense)" }}>
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Type badge */}
          <span
            className="inline-block text-[10px] px-2 py-0.5 rounded-md tracking-wider uppercase"
            style={{
              background: cat.type === "income" ? "var(--emerald-dim)" : "var(--pink-dim)",
              color: cat.type === "income" ? "var(--income)" : "var(--expense)",
              fontFamily: "'DM Mono', monospace",
              border: `1px solid ${cat.type === "income" ? "rgba(0,209,160,0.2)" : "rgba(255,92,138,0.2)"}`,
            }}
          >
            {cat.type === "income" ? "Доход" : "Расход"}
          </span>

          {/* Spending this month */}
          {spent > 0 && (
            <div className="mt-3">
              <div
                className="text-[11px]"
                style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
              >
                Апрель: <span style={{ color: cat.type === "income" ? "var(--income)" : "var(--expense)" }}>
                  {cat.type === "income" ? "+" : "−"}₽{spent.toLocaleString("ru-RU")}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AddCategoryModal({ onClose }: { onClose: () => void }) {
  const { addCategory } = useApp();
  const [name,  setName]  = useState("");
  const [color, setColor] = useState(PALETTE[0]);
  const [type,  setType]  = useState<"income" | "expense">("expense");

  const submit = () => {
    if (!name.trim()) return;
    addCategory({ name: name.trim(), color, type });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 animate-scale-in"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-bright)" }}
      >
        <h3 className="text-[18px] font-bold mb-5" style={{ fontFamily: "'DM Serif Display', serif", color: "var(--text-primary)" }}>
          Новая категория
        </h3>

        {/* Name */}
        <label className="block mb-4">
          <span className="text-[10px] tracking-widest uppercase mb-1.5 block" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
            Название
          </span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Например: Кофе"
            className="w-full px-4 py-2.5 rounded-xl outline-none text-[14px]"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border-bright)",
              color: "var(--text-primary)",
              fontFamily: "'Inter', sans-serif",
            }}
          />
        </label>

        {/* Type */}
        <div className="mb-4">
          <span className="text-[10px] tracking-widest uppercase mb-1.5 block" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
            Тип
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(["income", "expense"] as const).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className="py-2 rounded-xl text-[13px] font-medium transition-all"
                style={{
                  background: type === t ? (t === "income" ? "var(--emerald-dim)" : "var(--pink-dim)") : "var(--bg-input)",
                  border: type === t ? `1px solid ${t === "income" ? "rgba(0,209,160,0.3)" : "rgba(255,92,138,0.3)"}` : "1px solid var(--border)",
                  color: type === t ? (t === "income" ? "var(--income)" : "var(--expense)") : "var(--text-muted)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {t === "income" ? "Доход" : "Расход"}
              </button>
            ))}
          </div>
        </div>

        {/* Color palette */}
        <div className="mb-6">
          <span className="text-[10px] tracking-widest uppercase mb-2 block" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
            Цвет
          </span>
          <div className="flex gap-2 flex-wrap">
            {PALETTE.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full transition-all"
                style={{
                  background: c,
                  border: color === c ? "2px solid white" : "2px solid transparent",
                  transform: color === c ? "scale(1.2)" : "scale(1)",
                  boxShadow: color === c ? `0 0 10px ${c}60` : "none",
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={submit}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
            style={{ background: "linear-gradient(135deg, #FF7056, #3BE8D0)", color: "#111", fontFamily: "'Inter', sans-serif" }}
          >
            Создать
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-[13px]"
            style={{ background: "var(--bg-input)", color: "var(--text-muted)", border: "1px solid var(--border)", fontFamily: "'Inter', sans-serif" }}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const { categories, transactions } = useApp();
  const [showModal, setShowModal] = useState(false);

  const month = "2026-04";
  const getSpent = (catId: number) =>
    transactions
      .filter(t => t.categoryId === catId && t.date.startsWith(month))
      .reduce((s, t) => s + t.amount, 0);

  const income  = categories.filter(c => c.type === "income");
  const expense = categories.filter(c => c.type === "expense");

  return (
    <div className="flex-1 overflow-y-auto p-5 xl:p-6" style={{ background: "var(--bg)" }}>
      {/* Add button */}
      <div className="flex justify-end mb-5">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold"
          style={{
            background: "linear-gradient(135deg, #FF7056, #3BE8D0)",
            color: "#fff",
            boxShadow: "0 4px 18px rgba(255,112,86,0.35)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <Plus size={15} strokeWidth={2.5} />
          Добавить категорию
        </button>
      </div>

      {/* Income categories */}
      <div className="mb-6">
        <div
          className="flex items-center gap-2 mb-3"
        >
          <div className="w-2 h-2 rounded-full" style={{ background: "var(--income)" }} />
          <span className="text-[11px] tracking-widest uppercase" style={{ color: "var(--income)", fontFamily: "'DM Mono', monospace" }}>
            Доходы ({income.length})
          </span>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
          {income.map(cat => (
            <CategoryCard key={cat.id} cat={cat} spent={getSpent(cat.id)} />
          ))}
        </div>
      </div>

      {/* Expense categories */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full" style={{ background: "var(--expense)" }} />
          <span className="text-[11px] tracking-widest uppercase" style={{ color: "var(--expense)", fontFamily: "'DM Mono', monospace" }}>
            Расходы ({expense.length})
          </span>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
          {expense.map(cat => (
            <CategoryCard key={cat.id} cat={cat} spent={getSpent(cat.id)} />
          ))}
        </div>
      </div>

      {showModal && <AddCategoryModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
