import React from "react";
import { cn } from "../utils/cn";

const TONES = {
  navy: "bg-[#183B63]/10 text-[#183B63]",
  blue: "bg-[#2878B9]/10 text-[#2878B9]",
  green: "bg-[#15966E]/10 text-[#15966E]",
  amber: "bg-[#D99427]/12 text-[#B47716]",
  red: "bg-[#D84D57]/10 text-[#D84D57]",
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "navy",
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition-all hover:border-[#2878B9]/40 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[#172B4D] tabular-nums sm:text-3xl">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1.5 text-xs text-[#64748B] truncate">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              TONES[tone],
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
