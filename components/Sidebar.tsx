"use client";

import { LayoutDashboard, ArrowLeftRight, Tag, Target, Bell, Settings, LogOut, Flame } from "lucide-react";
import { useApp, View } from "@/app/context";

const NAV: { icon: React.ElementType; label: string; view: View }[] = [
  { icon: LayoutDashboard, label: "Обзор",       view: "dashboard"     },
  { icon: ArrowLeftRight,  label: "Транзакции",   view: "transactions"  },
  { icon: Tag,             label: "Категории",    view: "categories"    },
  { icon: Target,          label: "Бюджет",       view: "budget"        },
];

const BOTTOM = [
  { icon: Bell,     label: "Уведомления" },
  { icon: Settings, label: "Настройки"   },
  { icon: LogOut,   label: "Выйти"       },
];

export default function Sidebar() {
  const { view, setView } = useApp();

  return (
    <aside
      className="flex flex-col w-[72px] xl:w-[220px] h-full border-r shrink-0 relative overflow-hidden"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border-bright) 1px, transparent 1px), linear-gradient(90deg, var(--border-bright) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 xl:px-5 py-6 border-b relative z-10"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, #FF7056, #3BE8D0)",
            boxShadow: "0 0 20px rgba(255,112,86,0.40)",
          }}
        >
          <Flame size={16} className="text-white" />
        </div>
        <div className="hidden xl:block">
          <div
            className="text-[15px] font-bold tracking-wide"
            style={{ fontFamily: "'Inter', sans-serif", color: "var(--text-primary)" }}
          >
            Финтрек
          </div>
          <div
            className="text-[10px] tracking-widest uppercase"
            style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
          >
            Personal Finance
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 relative z-10">
        <div
          className="hidden xl:block text-[9px] tracking-widest uppercase mb-3 px-2"
          style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
        >
          Меню
        </div>
        {NAV.map(({ icon: Icon, label, view: v }) => {
          const active = view === v;
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              className="w-full flex items-center gap-3 px-2.5 xl:px-3 py-2.5 rounded-xl transition-all duration-200 group relative"
              style={{
                background: active ? "var(--coral-dim)" : "transparent",
                border: active ? "1px solid rgba(255,112,86,0.22)" : "1px solid transparent",
              }}
            >
              {active && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: "var(--coral)" }}
                />
              )}
              <Icon
                size={17}
                style={{ color: active ? "var(--coral)" : "var(--text-muted)" }}
                className="shrink-0 transition-colors group-hover:opacity-80"
              />
              <span
                className="hidden xl:block text-[13px] font-medium transition-colors"
                style={{
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 h-px" style={{ background: "var(--border)" }} />

      {/* Bottom items */}
      <div className="px-3 py-4 space-y-0.5 relative z-10">
        {BOTTOM.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="w-full flex items-center gap-3 px-2.5 xl:px-3 py-2.5 rounded-xl transition-all hover:bg-white/[0.03]"
          >
            <Icon size={17} style={{ color: "var(--text-muted)" }} className="shrink-0" />
            <span
              className="hidden xl:block text-[13px] font-medium"
              style={{ color: "var(--text-muted)", fontFamily: "'Inter', sans-serif" }}
            >
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* User row */}
      <div
        className="flex items-center gap-3 px-4 xl:px-5 py-4 border-t relative z-10"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
          style={{
            background: "linear-gradient(135deg, #2A2018, #352810)",
            border: "1px solid rgba(228,227,217,0.12)",
            color: "var(--coral)",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          АК
        </div>
        <div className="hidden xl:block min-w-0">
          <div
            className="text-[12px] font-semibold truncate"
            style={{ color: "var(--text-primary)" }}
          >
            Алекс К.
          </div>
          <div
            className="text-[10px] truncate"
            style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
          >
            Премиум
          </div>
        </div>
      </div>
    </aside>
  );
}
