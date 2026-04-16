"use client";

import { useApp } from "@/app/context";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

const fmtDate = (s: string) => {
  const d = new Date(s);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
};

export default function Transactions() {
  const { transactions, categories, setView } = useApp();
  const latest = transactions.slice(0, 5);

  return (
    <div
      className="rounded-2xl p-5 h-full relative overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        animation: "float-up 0.5s 0.4s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div
          className="text-[10px] font-medium tracking-widest uppercase"
          style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
        >
          Последние операции
        </div>
        <button
          onClick={() => setView("transactions")}
          className="text-[11px] transition-colors hover:opacity-70"
          style={{ color: "var(--coral)", fontFamily: "'DM Mono', monospace" }}
        >
          Все →
        </button>
      </div>

      <div className="space-y-1">
        {latest.map((tx, i) => {
          const cat = categories.find(c => c.id === tx.categoryId);
          const isIncome = tx.type === "income";
          return (
            <div
              key={tx.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-default group hover:bg-white/[0.02]"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Icon */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: `color-mix(in srgb, ${cat?.color ?? "#888"} 12%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${cat?.color ?? "#888"} 22%, transparent)`,
                  color: cat?.color ?? "#888",
                }}
              >
                {isIncome
                  ? <ArrowDownLeft size={13} />
                  : <ArrowUpRight  size={13} />
                }
              </div>

              {/* Description */}
              <div className="flex-1 min-w-0">
                <div
                  className="text-[13px] font-medium truncate"
                  style={{ color: "var(--text-primary)", fontFamily: "'Inter', sans-serif" }}
                >
                  {tx.description}
                </div>
                <div
                  className="text-[11px] mt-0.5"
                  style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
                >
                  {cat?.name} · {fmtDate(tx.date)}
                </div>
              </div>

              {/* Amount */}
              <div
                className="text-[13px] font-medium tabular-nums shrink-0"
                style={{
                  color: isIncome ? "var(--income)" : "var(--expense)",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {isIncome ? "+" : "−"}₽{tx.amount.toLocaleString("ru-RU")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
