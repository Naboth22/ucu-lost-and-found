import React from "react";

export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white p-4 animate-pulse">
      <div className="aspect-[16/10] w-full rounded-lg bg-slate-200" />
      <div className="mt-4 h-3 w-20 rounded bg-slate-200" />
      <div className="mt-2 h-5 w-3/4 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-full rounded bg-slate-100" />
      <div className="mt-4 h-8 w-full rounded-lg bg-slate-200" />
    </div>
  );
}
