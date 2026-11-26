import React from "react";
import { cn } from "../utils/cn";

const BADGE_STYLES = {
  LOST: "bg-[#D84D57]/10 text-[#D84D57] border-[#D84D57]/25",
  FOUND: "bg-[#15966E]/10 text-[#15966E] border-[#15966E]/25",
  OPEN: "bg-[#2878B9]/10 text-[#2878B9] border-[#2878B9]/25",
  CLAIM_PENDING: "bg-[#D99427]/12 text-[#B47716] border-[#D99427]/30",
  PENDING: "bg-[#D99427]/12 text-[#B47716] border-[#D99427]/30",
  CLAIMED: "bg-[#183B63]/10 text-[#183B63] border-[#183B63]/25",
  APPROVED: "bg-[#15966E]/10 text-[#15966E] border-[#15966E]/25",
  RETURNED: "bg-[#15966E]/15 text-[#0F7656] border-[#15966E]/30",
  REJECTED: "bg-[#D84D57]/10 text-[#D84D57] border-[#D84D57]/25",
  CLOSED: "bg-slate-100 text-[#64748B] border-slate-200",
};

const LABELS = {
  LOST: "Lost Item",
  FOUND: "Found Item",
  OPEN: "Open",
  CLAIM_PENDING: "Claim Under Review",
  PENDING: "Pending Review",
  CLAIMED: "Approved / Awaiting Pickup",
  APPROVED: "Approved",
  RETURNED: "Returned",
  REJECTED: "Rejected",
  CLOSED: "Closed",
};

export default function StatusBadge({ status, className }) {
  const normalized = String(status || "").toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight whitespace-nowrap",
        BADGE_STYLES[normalized] ||
          "bg-slate-100 text-[#64748B] border-slate-200",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[normalized] || status}
    </span>
  );
}
