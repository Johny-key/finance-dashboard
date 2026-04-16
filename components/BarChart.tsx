"use client";

import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useApp } from "@/app/context";
import { useMemo } from "react";

const CustomTooltip = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; fill: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 space-y-1"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-bright)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      }}
    >
      <div
        className="text-[10px] tracking-widest uppercase mb-2"
        style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
      >
        {label}
      </div>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-[11px]" style={{ color: "var(--text-secondary)", fontFamily: "'DM Mono', monospace" }}>
            {p.name === "limit" ? "Лимит" : "Факт"}
          </span>
          <span className="text-[12px] font-medium" style={{ color: "var(--text-primary)", fontFamily: "'DM Mono', monospace" }}>
            ₽{p.value.toLocaleString("ru-RU")}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function BarChartWidget() {
  const { transactions, budgets, categories } = useApp();
  const month = "2026-04";

  const data = useMemo(() => {
    return budgets
      .filter(b => b.month === month)
      .map(b => {
        const cat = categories.find(c => c.id === b.categoryId);
        const spent = transactions
          .filter(t => t.type === "expense" && t.categoryId === b.categoryId && t.date.startsWith(month))
          .reduce((s, t) => s + t.amount, 0);
        return { name: cat?.name ?? "—", limit: b.limit, spent };
      })
      .slice(0, 6);
  }, [budgets, transactions, categories, month]);

  const totalLimit = data.reduce((s, d) => s + d.limit, 0);
  const totalSpent = data.reduce((s, d) => s + d.spent, 0);
  const pct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  return (
    <div
      className="rounded-2xl p-5 h-full relative overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        animation: "float-up 0.5s 0.28s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div
            className="text-[10px] font-medium tracking-widest uppercase mb-1"
            style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
          >
            Бюджет vs Факт
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: "var(--teal)" }} />
              <span className="text-[11px]" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>Лимит</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: "var(--coral)" }} />
              <span className="text-[11px]" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>Факт</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-[18px] font-bold"
            style={{
              fontFamily: "'DM Mono', monospace",
              color: pct > 100 ? "var(--expense)" : pct > 80 ? "var(--warning)" : "var(--income)",
            }}
          >
            {pct}%
          </div>
          <div className="text-[10px]" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
            использовано
          </div>
        </div>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <ReBarChart data={data} barSize={10} barGap={2} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--text-muted)", fontSize: 9, fontFamily: "'DM Mono', monospace" }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--text-muted)", fontSize: 9, fontFamily: "'DM Mono', monospace" }}
              axisLine={false} tickLine={false}
              tickFormatter={v => `${(v / 1000).toFixed(0)}к`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
            <Bar dataKey="limit" fill="#3BE8D0" fillOpacity={0.35} radius={[3, 3, 0, 0]} />
            <Bar dataKey="spent" fill="#FF7056" fillOpacity={0.85} radius={[3, 3, 0, 0]} />
          </ReBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
