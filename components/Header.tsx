"use client";

import { useApp, View } from "@/app/context";
import { Plus, Calendar, ChevronDown, LayoutDashboard, ArrowLeftRight, Tag, Target } from "lucide-react";

const VIEW_META: Record<View, { title: string; subtitle: string; Icon: React.ElementType }> = {
  dashboard:    { title: "Финансовый обзор",  subtitle: "Апрель 2026",                        Icon: LayoutDashboard },
  transactions: { title: "Транзакции",         subtitle: "Управление доходами и расходами",    Icon: ArrowLeftRight  },
  categories:   { title: "Категории",          subtitle: "Организация финансовых потоков",     Icon: Tag             },
  budget:       { title: "Бюджет",             subtitle: "Планирование и контроль расходов",   Icon: Target          },
};

export default function Header() {
  const { view, setShowAddModal } = useApp();
  const { title, subtitle } = VIEW_META[view];
  const showAddBtn = view === "dashboard" || view === "transactions";

  return (
    <header
      className="flex items-center justify-between px-6 py-4 border-b shrink-0"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border)",
        animation: "float-up 0.4s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      {/* Title */}
      <div>
        <h1
          className="text-[19px] font-bold leading-tight"
          style={{ fontFamily: "'Inter', sans-serif", color: "var(--text-primary)", fontWeight: 600 }}
        >
          {title}
        </h1>
        <div
          className="flex items-center gap-1.5 text-[11px] mt-0.5"
          style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
        >
          <Calendar size={11} />
          <span>{subtitle}</span>
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2">
        {/* Month selector */}
        <button
          className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:border-[var(--border-bright)]"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          <span className="text-[12px]" style={{ fontFamily: "'DM Mono', monospace" }}>
            Апр 2026
          </span>
          <ChevronDown size={12} style={{ color: "var(--text-muted)" }} />
        </button>

        {/* Add transaction */}
        {showAddBtn && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #FF7056, #3BE8D0)",
              color: "#111",
              boxShadow: "0 4px 18px rgba(255,112,86,0.38)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <Plus size={15} strokeWidth={2.5} />
            <span className="hidden md:block">Добавить</span>
          </button>
        )}
      </div>
    </header>
  );
}
