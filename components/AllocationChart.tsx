"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useApp } from "@/app/context";
import { useMemo } from "react";

const CustomTooltip = ({
  active, payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { color: string; pct: number } }[];
}) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-bright)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      }}
    >
      <div className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>{name}</div>
      <div className="text-[15px] font-bold" style={{ color: p.color, fontFamily: "'DM Mono', monospace" }}>
        {p.pct.toFixed(1)}%
      </div>
      <div className="text-[11px]" style={{ color: "var(--text-secondary)", fontFamily: "'DM Mono', monospace" }}>
        ₽{value.toLocaleString("ru-RU")}
      </div>
    </div>
  );
};

export default function AllocationChart() {
  const { transactions, categories } = useApp();

  const slices = useMemo(() => {
    const expenseTx = transactions.filter(t => t.type === "expense");
    const totalExp = expenseTx.reduce((s, t) => s + t.amount, 0);
    const byCategory: Record<number, number> = {};
    expenseTx.forEach(t => { byCategory[t.categoryId] = (byCategory[t.categoryId] || 0) + t.amount; });
    return Object.entries(byCategory)
      .map(([id, amt]) => {
        const cat = categories.find(c => c.id === +id);
        return cat ? { name: cat.name, value: amt, color: cat.color, pct: (amt / totalExp) * 100 } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b!.value - a!.value) as { name: string; value: number; color: string; pct: number }[];
  }, [transactions, categories]);

  const topSlices = slices.slice(0, 6);
  const total = topSlices.reduce((s, s2) => s + s2.value, 0);

  return (
    <div
      className="rounded-2xl p-5 h-full relative overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        animation: "float-up 0.5s 0.32s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      <div
        className="text-[10px] font-medium tracking-widest uppercase mb-4"
        style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
      >
        Расходы по категориям
      </div>

      {/* Donut */}
      <div className="h-36 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={topSlices}
              cx="50%" cy="50%"
              innerRadius={44} outerRadius={66}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {topSlices.map((s, i) => (
                <Cell key={i} fill={s.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div
            className="text-[9px] tracking-widest uppercase"
            style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
          >
            Расходы
          </div>
          <div
            className="text-[16px] font-bold"
            style={{ color: "var(--text-primary)", fontFamily: "'DM Mono', monospace" }}
          >
            ₽{(total / 1000).toFixed(1)}к
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-1.5 mt-3">
        {topSlices.map(s => (
          <div key={s.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
              <span
                className="text-[11px] truncate"
                style={{ color: "var(--text-secondary)", fontFamily: "'Inter', sans-serif" }}
              >
                {s.name}
              </span>
            </div>
            <span
              className="text-[11px] font-medium tabular-nums shrink-0 ml-2"
              style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
            >
              {s.pct.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
