"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/app/context";
import { Trash2, ArrowDownLeft, ArrowUpRight, Filter, Search } from "lucide-react";

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });

type TypeFilter = "all" | "income" | "expense";

export default function TransactionsPage() {
  const { transactions, categories, deleteTransaction } = useApp();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [catFilter,  setCatFilter]  = useState<number | "all">("all");
  const [search,     setSearch]     = useState("");

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      if (catFilter  !== "all" && tx.categoryId !== catFilter) return false;
      if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, typeFilter, catFilter, search]);

  const totalIncome  = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance      = totalIncome - totalExpense;

  return (
    <div className="flex-1 overflow-y-auto p-5 xl:p-6" style={{ background: "var(--bg)" }}>
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "Доходы",  value: totalIncome,  color: "var(--income)",  prefix: "+" },
          { label: "Расходы", value: totalExpense,  color: "var(--expense)", prefix: "−" },
          { label: "Итого",   value: Math.abs(balance), color: balance >= 0 ? "var(--income)" : "var(--expense)", prefix: balance >= 0 ? "+" : "−" },
        ].map(({ label, value, color, prefix }) => (
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
              {prefix}₽{value.toLocaleString("ru-RU")}
            </div>
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div
        className="flex items-center gap-3 mb-4 px-4 py-3 rounded-2xl flex-wrap"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <Filter size={13} style={{ color: "var(--text-muted)" }} />

        {/* Type */}
        <div className="flex gap-1">
          {(["all", "income", "expense"] as TypeFilter[]).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
              style={{
                background: typeFilter === t ? "var(--coral-dim)" : "transparent",
                border: typeFilter === t ? "1px solid rgba(255,112,86,0.3)" : "1px solid transparent",
                color: typeFilter === t ? "var(--coral)" : "var(--text-muted)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {t === "all" ? "Все" : t === "income" ? "Доходы" : "Расходы"}
            </button>
          ))}
        </div>

        <div className="w-px h-5" style={{ background: "var(--border)" }} />

        {/* Category */}
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value === "all" ? "all" : +e.target.value)}
          className="text-[12px] px-3 py-1.5 rounded-lg outline-none cursor-pointer"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          <option value="all">Все категории</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Search */}
        <div
          className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
        >
          <Search size={12} style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="text-[12px] bg-transparent outline-none w-32"
            style={{ color: "var(--text-primary)", fontFamily: "'DM Mono', monospace" }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        {/* Thead */}
        <div
          className="grid gap-4 px-5 py-3"
          style={{
            gridTemplateColumns: "1fr 90px 120px 80px 120px 40px",
            background: "var(--bg-elevated)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {["Описание", "Дата", "Категория", "Тип", "Сумма", ""].map((h, i) => (
            <div
              key={i}
              className="text-[10px] tracking-widest uppercase"
              style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div style={{ background: "var(--bg-card)" }}>
          {filtered.length === 0 ? (
            <div
              className="py-16 text-center text-[14px]"
              style={{ color: "var(--text-muted)", fontFamily: "'Inter', sans-serif" }}
            >
              Нет транзакций
            </div>
          ) : (
            filtered.map((tx, i) => {
              const cat = categories.find(c => c.id === tx.categoryId);
              const isIncome = tx.type === "income";
              return (
                <div
                  key={tx.id}
                  className="grid gap-4 px-5 py-3 items-center transition-all hover:bg-white/[0.02] group"
                  style={{
                    gridTemplateColumns: "1fr 90px 120px 80px 120px 40px",
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  {/* Description */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: `color-mix(in srgb, ${cat?.color ?? "#888"} 12%, transparent)`,
                        color: cat?.color ?? "#888",
                      }}
                    >
                      {isIncome
                        ? <ArrowDownLeft size={12} />
                        : <ArrowUpRight  size={12} />
                      }
                    </div>
                    <span
                      className="text-[13px] font-medium truncate"
                      style={{ color: "var(--text-primary)", fontFamily: "'Inter', sans-serif" }}
                    >
                      {tx.description}
                    </span>
                  </div>

                  {/* Date */}
                  <div
                    className="text-[12px] tabular-nums"
                    style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
                  >
                    {fmtDate(tx.date)}
                  </div>

                  {/* Category */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: cat?.color ?? "#888" }}
                    />
                    <span
                      className="text-[12px] truncate"
                      style={{ color: "var(--text-secondary)", fontFamily: "'Inter', sans-serif" }}
                    >
                      {cat?.name ?? "—"}
                    </span>
                  </div>

                  {/* Type badge */}
                  <div>
                    <span
                      className="text-[10px] px-2.5 py-1 rounded-lg font-medium"
                      style={{
                        background: isIncome ? "var(--emerald-dim)" : "var(--pink-dim)",
                        color: isIncome ? "var(--income)" : "var(--expense)",
                        fontFamily: "'DM Mono', monospace",
                        border: `1px solid ${isIncome ? "rgba(0,209,160,0.2)" : "rgba(255,92,138,0.2)"}`,
                      }}
                    >
                      {isIncome ? "Доход" : "Расход"}
                    </span>
                  </div>

                  {/* Amount */}
                  <div
                    className="text-[13px] font-bold tabular-nums"
                    style={{
                      color: isIncome ? "var(--income)" : "var(--expense)",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    {isIncome ? "+" : "−"}₽{tx.amount.toLocaleString("ru-RU")}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10"
                    style={{ color: "var(--expense)" }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
