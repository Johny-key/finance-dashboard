"use client";

import { useApp } from "@/app/context";
import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";

export default function BudgetSummary() {
  const { budgets, transactions, categories, setView } = useApp();
  const month = "2026-04";

  const items = useMemo(() => {
    return budgets
      .filter(b => b.month === month)
      .map(b => {
        const cat = categories.find(c => c.id === b.categoryId);
        const spent = transactions
          .filter(t => t.type === "expense" && t.categoryId === b.categoryId && t.date.startsWith(month))
          .reduce((s, t) => s + t.amount, 0);
        const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
        return { cat, limit: b.limit, spent, pct };
      })
      .sort((a, b) => b.pct - a.pct);
  }, [budgets, transactions, categories, month]);

  return (
    <div
      className="rounded-2xl p-5 h-full relative overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        animation: "float-up 0.5s 0.48s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div
          className="text-[10px] font-medium tracking-widest uppercase"
          style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
        >
          Бюджет апрель
        </div>
        <button
          onClick={() => setView("budget")}
          className="text-[11px] transition-colors hover:opacity-70"
          style={{ color: "var(--coral)", fontFamily: "'DM Mono', monospace" }}
        >
          Детали →
        </button>
      </div>

      <div className="space-y-3">
        {items.slice(0, 5).map(({ cat, limit, spent, pct }) => {
          const exceeded = pct > 100;
          const warning  = pct > 80 && !exceeded;
          const barColor = exceeded ? "var(--expense)"
                         : warning  ? "var(--warning)"
                         : cat?.color ?? "var(--coral)";

          return (
            <div key={cat?.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cat?.color ?? "#888" }} />
                  <span
                    className="text-[12px] font-medium"
                    style={{ color: "var(--text-secondary)", fontFamily: "'Inter', sans-serif" }}
                  >
                    {cat?.name ?? "—"}
                  </span>
                  {exceeded && (
                    <AlertTriangle size={11} style={{ color: "var(--expense)" }} />
                  )}
                </div>
                <span
                  className="text-[11px] tabular-nums"
                  style={{
                    color: exceeded ? "var(--expense)" : warning ? "var(--warning)" : "var(--text-muted)",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  {Math.min(pct, 999).toFixed(0)}%
                </span>
              </div>

              {/* Progress bar */}
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: "var(--bg-elevated)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    background: barColor,
                    boxShadow: exceeded ? `0 0 8px ${barColor}50` : "none",
                  }}
                />
              </div>

              <div
                className="text-[10px] mt-0.5 text-right"
                style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
              >
                ₽{spent.toLocaleString("ru-RU")} / ₽{limit.toLocaleString("ru-RU")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
