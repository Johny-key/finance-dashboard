"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/app/context";
import { AlertTriangle, CheckCircle, Pencil, Check, X } from "lucide-react";

const month = "2026-04";
const monthLabel = "Апрель 2026";

function BudgetCard({
  catId,
  catName,
  catColor,
  limit,
  spent,
}: {
  catId: number;
  catName: string;
  catColor: string;
  limit: number;
  spent: number;
}) {
  const { upsertBudget } = useApp();
  const [editing,   setEditing]   = useState(false);
  const [limitEdit, setLimitEdit] = useState(String(limit));

  const pct      = limit > 0 ? (spent / limit) * 100 : 0;
  const exceeded = pct > 100;
  const warning  = pct > 80 && !exceeded;
  const remaining = limit - spent;

  const barColor = exceeded ? "var(--expense)"
                 : warning  ? "var(--warning)"
                 : catColor;

  const save = () => {
    const val = parseInt(limitEdit.replace(/\D/g, ""), 10);
    if (val > 0) upsertBudget({ categoryId: catId, limit: val, month });
    setEditing(false);
  };

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: exceeded ? "1px solid rgba(255,92,138,0.35)" : "1px solid var(--border)",
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-4 right-4 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${catColor}, transparent)` }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ background: catColor }} />
          <span className="text-[14px] font-semibold" style={{ color: "var(--text-primary)", fontFamily: "'Inter', sans-serif" }}>
            {catName}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {exceeded && <AlertTriangle size={14} style={{ color: "var(--expense)" }} />}
          {!exceeded && pct >= 100 && <CheckCircle size={14} style={{ color: "var(--income)" }} />}
          <button
            onClick={() => { setEditing(!editing); setLimitEdit(String(limit)); }}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-all"
            style={{ color: "var(--text-muted)" }}
          >
            <Pencil size={12} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(pct, 100)}%`,
              background: barColor,
              boxShadow: exceeded ? `0 0 10px ${barColor}60` : `0 0 6px ${barColor}30`,
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span
            className="text-[11px]"
            style={{ color: barColor, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}
          >
            {pct.toFixed(0)}%
          </span>
          <span
            className="text-[11px]"
            style={{
              color: remaining < 0 ? "var(--expense)" : "var(--text-muted)",
              fontFamily: "'DM Mono', monospace",
            }}
          >
            {remaining >= 0 ? `осталось ₽${remaining.toLocaleString("ru-RU")}` : `перерасход ₽${Math.abs(remaining).toLocaleString("ru-RU")}`}
          </span>
        </div>
      </div>

      {/* Stats */}
      {editing ? (
        <div className="flex items-center gap-2 mt-3">
          <div
            className="flex items-center gap-1.5 flex-1 px-3 py-2 rounded-xl"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-bright)" }}
          >
            <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>₽</span>
            <input
              value={limitEdit}
              onChange={e => setLimitEdit(e.target.value)}
              onKeyDown={e => e.key === "Enter" && save()}
              className="flex-1 bg-transparent outline-none text-[13px] font-medium w-full"
              style={{ color: "var(--text-primary)", fontFamily: "'DM Mono', monospace" }}
              autoFocus
            />
          </div>
          <button onClick={save} className="p-2 rounded-xl" style={{ background: "var(--coral-dim)", color: "var(--coral)" }}>
            <Check size={14} />
          </button>
          <button onClick={() => setEditing(false)} className="p-2 rounded-xl" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <div className="text-[10px] tracking-widest uppercase mb-0.5" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
              Потрачено
            </div>
            <div className="text-[15px] font-bold" style={{ color: "var(--expense)", fontFamily: "'DM Mono', monospace" }}>
              ₽{spent.toLocaleString("ru-RU")}
            </div>
          </div>
          <div>
            <div className="text-[10px] tracking-widest uppercase mb-0.5" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
              Лимит
            </div>
            <div className="text-[15px] font-bold" style={{ color: "var(--text-secondary)", fontFamily: "'DM Mono', monospace" }}>
              ₽{limit.toLocaleString("ru-RU")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BudgetPage() {
  const { budgets, transactions, categories } = useApp();

  const items = useMemo(() => {
    return budgets
      .filter(b => b.month === month)
      .map(b => {
        const cat   = categories.find(c => c.id === b.categoryId);
        const spent = transactions
          .filter(t => t.type === "expense" && t.categoryId === b.categoryId && t.date.startsWith(month))
          .reduce((s, t) => s + t.amount, 0);
        return { ...b, catName: cat?.name ?? "—", catColor: cat?.color ?? "#888", spent };
      });
  }, [budgets, transactions, categories]);

  const totalLimit  = items.reduce((s, i) => s + i.limit, 0);
  const totalSpent  = items.reduce((s, i) => s + i.spent, 0);
  const overBudget  = items.filter(i => i.spent > i.limit).length;
  const totalPct    = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
  const remaining   = totalLimit - totalSpent;

  return (
    <div className="flex-1 overflow-y-auto p-5 xl:p-6" style={{ background: "var(--bg)" }}>
      {/* Month header */}
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-[22px] font-bold"
          style={{ fontFamily: "'DM Serif Display', serif", color: "var(--text-primary)" }}
        >
          {monthLabel}
        </h2>
        <span
          className="text-[11px] px-3 py-1.5 rounded-lg"
          style={{
            background: overBudget > 0 ? "var(--pink-dim)" : "var(--emerald-dim)",
            color: overBudget > 0 ? "var(--expense)" : "var(--income)",
            border: `1px solid ${overBudget > 0 ? "rgba(255,92,138,0.25)" : "rgba(0,209,160,0.25)"}`,
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {overBudget > 0 ? `${overBudget} превышен` : "В пределах лимитов"}
        </span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Общий лимит", value: `₽${totalLimit.toLocaleString("ru-RU")}`, color: "var(--coral)" },
          { label: "Потрачено",   value: `₽${totalSpent.toLocaleString("ru-RU")}`, color: totalPct > 100 ? "var(--expense)" : totalPct > 80 ? "var(--warning)" : "var(--text-primary)" },
          { label: "Остаток",     value: `₽${Math.abs(remaining).toLocaleString("ru-RU")}`, color: remaining < 0 ? "var(--expense)" : "var(--income)" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-2xl p-4"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              animation: "float-up 0.4s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            <div
              className="text-[10px] tracking-widest uppercase mb-2"
              style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
            >
              {label}
            </div>
            <div
              className="text-xl font-bold"
              style={{ color, fontFamily: "'DM Mono', monospace" }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div
        className="rounded-2xl p-4 mb-6"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div className="flex justify-between mb-2">
          <span className="text-[12px] font-medium" style={{ color: "var(--text-secondary)", fontFamily: "'Inter', sans-serif" }}>
            Общий бюджет
          </span>
          <span
            className="text-[12px] font-bold"
            style={{
              color: totalPct > 100 ? "var(--expense)" : totalPct > 80 ? "var(--warning)" : "var(--income)",
              fontFamily: "'DM Mono', monospace",
            }}
          >
            {totalPct.toFixed(1)}%
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(totalPct, 100)}%`,
              background: totalPct > 100 ? "var(--expense)"
                        : totalPct > 80  ? "var(--warning)"
                        : "linear-gradient(90deg, var(--coral), var(--teal))",
            }}
          />
        </div>
      </div>

      {/* Budget cards grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {items.map(item => (
          <BudgetCard
            key={item.id}
            catId={item.categoryId}
            catName={item.catName}
            catColor={item.catColor}
            limit={item.limit}
            spent={item.spent}
          />
        ))}
      </div>
    </div>
  );
}
