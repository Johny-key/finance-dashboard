"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  changeType: "up" | "down" | "neutral";
  subtitle?: string;
  accent?: boolean;
  delay?: number;
}

export default function StatCard({
  label,
  value,
  change,
  changeType,
  subtitle,
  accent = false,
  delay = 0,
}: StatCardProps) {
  const changeColor =
    changeType === "up"   ? "var(--income)"  :
    changeType === "down" ? "var(--expense)" :
                            "var(--text-muted)";

  const ChangeIcon =
    changeType === "up"   ? TrendingUp   :
    changeType === "down" ? TrendingDown :
                            Minus;

  if (accent) {
    return (
      <div
        className="relative rounded-2xl p-5 overflow-hidden cursor-default gradient-border glow-card inner-highlight"
        style={{
          background: "linear-gradient(145deg, rgba(255,112,86,0.10) 0%, rgba(59,232,208,0.05) 50%, rgba(255,112,86,0.07) 100%)",
          border: "1px solid rgba(255,112,86,0.35)",
          animation: `float-up 0.5s ${delay}ms cubic-bezier(0.22, 1, 0.36, 1) both`,
        }}
      >
        {/* Corner violet radial */}
        <div
          className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,112,86,0.22) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,232,208,0.12) 0%, transparent 70%)" }}
        />

        <div className="relative z-10">
          <div
            className="text-[10px] font-medium tracking-widest uppercase mb-3"
            style={{ color: "rgba(255,170,148,0.85)", fontFamily: "'DM Mono', monospace" }}
          >
            {label}
          </div>

          {/* Big shimmer value */}
          <div
            className="text-[28px] xl:text-[32px] font-bold mb-2.5 leading-none shimmer-text"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            {value}
          </div>

          <div className="flex items-center gap-1.5">
            <ChangeIcon size={12} style={{ color: changeColor }} />
            <span className="text-[12px] font-medium" style={{ color: changeColor, fontFamily: "'DM Mono', monospace" }}>
              {change}
            </span>
            {subtitle && (
              <span className="text-[11px]" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden group cursor-default inner-highlight"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        animation: `float-up 0.5s ${delay}ms cubic-bezier(0.22, 1, 0.36, 1) both`,
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-bright)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.35)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Hover radial glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% -20%, rgba(255,112,86,0.06) 0%, transparent 65%)" }}
      />

      <div className="relative z-10">
        <div
          className="text-[10px] font-medium tracking-widest uppercase mb-3"
          style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}
        >
          {label}
        </div>

        <div
          className="text-2xl xl:text-3xl font-bold mb-2 leading-none"
          style={{
            fontFamily: "'DM Mono', monospace",
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </div>

        <div className="flex items-center gap-1.5">
          <ChangeIcon size={12} style={{ color: changeColor }} />
          <span className="text-[12px] font-medium" style={{ color: changeColor, fontFamily: "'DM Mono', monospace" }}>
            {change}
          </span>
          {subtitle && (
            <span className="text-[11px]" style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
