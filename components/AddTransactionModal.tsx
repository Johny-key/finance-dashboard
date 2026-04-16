"use client";

import { useState } from "react";
import { useApp } from "@/app/context";
import { X, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default function AddTransactionModal() {
  const { categories, addTransaction, setShowAddModal } = useApp();

  const [type,        setType]        = useState<"income" | "expense">("expense");
  const [amount,      setAmount]      = useState("");
  const [description, setDescription] = useState("");
  const [categoryId,  setCategoryId]  = useState<number | "">("");
  const [date,        setDate]        = useState(new Date().toISOString().slice(0, 10));

  const filteredCats = categories.filter(c => c.type === type || c.type === "both");

  const submit = () => {
    const amt = parseFloat(amount.replace(/[^\d.]/g, ""));
    if (!amt || !description.trim() || !categoryId || !date) return;
    addTransaction({ type, amount: amt, description: description.trim(), categoryId: +categoryId, date });
    setShowAddModal(false);
  };

  const inputStyle = {
    background: "var(--bg-input)",
    border: "1px solid var(--border-bright)",
    color: "var(--text-primary)",
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
      onClick={e => e.target === e.currentTarget && setShowAddModal(false)}
    >
      <div
        className="w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-6 animate-scale-in"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-bright)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
        }}
      >
        {/* Title */}
        <div className="flex items-center justify-between mb-6">
          <h3
            className="text-[20px] font-bold"
            style={{ fontFamily: "'DM Serif Display', serif", color: "var(--text-primary)" }}
          >
            Новая транзакция
          </h3>
          <button
            onClick={() => setShowAddModal(false)}
            className="p-2 rounded-xl hover:bg-white/5 transition-all"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Type toggle */}
        <div
          className="grid grid-cols-2 gap-2 p-1.5 rounded-xl mb-5"
          style={{ background: "var(--bg-input)" }}
        >
          {(["expense", "income"] as const).map(t => (
            <button
              key={t}
              onClick={() => { setType(t); setCategoryId(""); }}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold transition-all"
              style={{
                background: type === t
                  ? (t === "income" ? "var(--emerald-dim)" : "var(--pink-dim)")
                  : "transparent",
                border: type === t
                  ? `1px solid ${t === "income" ? "rgba(0,209,160,0.3)" : "rgba(255,92,138,0.3)"}`
                  : "1px solid transparent",
                color: type === t
                  ? (t === "income" ? "var(--income)" : "var(--expense)")
                  : "var(--text-muted)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {t === "income" ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
              {t === "income" ? "Доход" : "Расход"}
            </button>
          ))}
        </div>

        {/* Amount */}
        <label className="block mb-4">
          <span
            className="text-[10px] tracking-widest uppercase mb-1.5 block"
            style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
          >
            Сумма (₽)
          </span>
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl"
            style={inputStyle}
          >
            <span
              className="text-[18px] font-medium"
              style={{ color: type === "income" ? "var(--income)" : "var(--expense)" }}
            >
              ₽
            </span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              className="flex-1 bg-transparent outline-none text-[18px] font-bold"
              style={{ color: "var(--text-primary)", fontFamily: "'DM Mono', monospace" }}
            />
          </div>
        </label>

        {/* Description */}
        <label className="block mb-4">
          <span
            className="text-[10px] tracking-widest uppercase mb-1.5 block"
            style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
          >
            Описание
          </span>
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Напр., Продукты в Ленте"
            className="w-full px-4 py-3 rounded-xl outline-none text-[14px]"
            style={inputStyle}
          />
        </label>

        {/* Category */}
        <label className="block mb-4">
          <span
            className="text-[10px] tracking-widest uppercase mb-1.5 block"
            style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
          >
            Категория
          </span>
          <div className="flex flex-wrap gap-2">
            {filteredCats.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
                style={{
                  background: categoryId === cat.id
                    ? `color-mix(in srgb, ${cat.color} 18%, transparent)`
                    : "var(--bg-input)",
                  border: categoryId === cat.id
                    ? `1px solid ${cat.color}50`
                    : "1px solid var(--border)",
                  color: categoryId === cat.id ? cat.color : "var(--text-muted)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
                {cat.name}
              </button>
            ))}
          </div>
        </label>

        {/* Date */}
        <label className="block mb-6">
          <span
            className="text-[10px] tracking-widest uppercase mb-1.5 block"
            style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
          >
            Дата
          </span>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl outline-none text-[14px]"
            style={{ ...inputStyle, colorScheme: "dark" }}
          />
        </label>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={submit}
            className="flex-1 py-3 rounded-xl text-[14px] font-semibold transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #FF7056, #3BE8D0)",
              color: "#fff",
              boxShadow: "0 4px 18px rgba(255,112,86,0.38)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Сохранить
          </button>
          <button
            onClick={() => setShowAddModal(false)}
            className="px-5 py-3 rounded-xl text-[14px] transition-all"
            style={{
              background: "var(--bg-input)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
