import React, { useEffect, useState } from "react";
import { claimReturnService } from "../services/claimReturnService";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";

export default function MyClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    claimReturnService
      .listMyClaims()
      .then((rows) => {
        if (active) setClaims(rows || []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#172B4D]">
          My Ownership Claims
        </h1>
        <p className="text-sm text-[#64748B]">
          Monitor claim verification decisions and physical collection
          readiness.
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 text-sm text-[#64748B]">
          Loading your claims...
        </div>
      ) : claims.length === 0 ? (
        <EmptyState
          title="No ownership claims submitted"
          description="Browse found items in the catalog to claim belongings that belong to you."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-[#64748B]">
                    Claim #{claim.id}
                  </span>
                  <h3 className="mt-0.5 text-base font-bold text-[#172B4D]">
                    {claim.report_title}
                  </h3>
                </div>
                <StatusBadge status={claim.status} />
              </div>

              <p className="mt-3 text-xs leading-relaxed text-[#64748B]">
                <strong>Your explanation:</strong> {claim.ownership_explanation}
              </p>

              {claim.decision_reason && (
                <div className="mt-3 rounded-lg bg-[#F3F5F9] p-3 text-xs text-[#172B4D]">
                  <strong>Admin Decision Note:</strong> {claim.decision_reason}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-[#E2E8F0] pt-3 text-xs">
                <span className="text-[#64748B]">Handover Status:</span>
                <StatusBadge status={claim.report_status || "OPEN"} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
