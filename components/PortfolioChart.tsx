"use client";

import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Сен",  income: 148000, expense: 71000 },
  { month: "Окт",  income: 152000, expense: 68000 },
  { month: "Ноя",  income: 149000, expense: 81000 },
  { month: "Дек",  income: 165000, expense: 95000 },
  { month: "Янв",  income: 148000, expense: 71000 },
  { month: "Фев",  income: 151000, expense: 73000 },
  { month: "Мар",  income: 162000, expense: 79000 },
  { month: "Апр",  income: 175000, expense: 76900 },
];

const rub = (n: number) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(n);

const CustomTooltip = ({
  active, payload, label,
}: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 space-y-1"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-bright)",
        boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
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
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[11px]" style={{ color: "var(--text-secondary)", fontFamily: "'DM Mono', monospace" }}>
            {p.name === "income" ? "Доходы" : "Расходы"}
          </span>
          <span className="text-[13px] font-medium" style={{ color: "var(--text-primary)", fontFamily: "'DM Mono', monospace" }}>
            {rub(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function PortfolioChart() {
  return (
    <div
      className="rounded-2xl p-5 h-full relative overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        animation: "float-up 0.5s 0.2s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div
            className="text-[10px] font-medium tracking-widest uppercase mb-1"
            style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
          >
            Динамика доходов и расходов
          </div>
          <div
            className="text-2xl font-bold"
            style={{ fontFamily: "'DM Serif Display', serif", color: "var(--text-primary)" }}
          >
            ₽175 000
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[12px]" style={{ color: "var(--income)", fontFamily: "'DM Mono', monospace" }}>
              +₽13 000
            </span>
            <span className="text-[11px]" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
              +8,0% · vs март
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#3BE8D0" }} />
            <span className="text-[11px]" style={{ color: "var(--text-secondary)", fontFamily: "'DM Mono', monospace" }}>Доходы</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FF7056" }} />
            <span className="text-[11px]" style={{ color: "var(--text-secondary)", fontFamily: "'DM Mono', monospace" }}>Расходы</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#3BE8D0" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#3BE8D0" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#FF7056" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#FF7056" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "'DM Mono', monospace" }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "'DM Mono', monospace" }}
              axisLine={false} tickLine={false}
              tickFormatter={v => `${(v / 1000).toFixed(0)}к`}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
            <Area
              type="monotone" dataKey="income" stroke="#3BE8D0" strokeWidth={2}
              fill="url(#incomeGrad)" dot={false}
              activeDot={{ r: 4, fill: "#3BE8D0", strokeWidth: 0 }}
            />
            <Area
              type="monotone" dataKey="expense" stroke="#FF7056" strokeWidth={2}
              fill="url(#expenseGrad)" dot={false}
              activeDot={{ r: 4, fill: "#FF7056", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
