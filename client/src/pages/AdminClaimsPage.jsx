import React, { useEffect, useState } from "react";
import { Eye, CheckCircle, XCircle, Lock } from "lucide-react";
import { claimReturnService } from "../services/claimReturnService";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [decisionType, setDecisionType] = useState("APPROVED");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadClaims = async () => {
    const rows = await claimReturnService.listAdminClaims();
    setClaims(rows || []);
  };

  useEffect(() => {
    loadClaims().catch(() => {});
  }, []);

  const openDecisionModal = (claim, type) => {
    setSelectedClaim(claim);
    setDecisionType(type);
    setReason("");
    setError("");
  };

  const handleConfirmDecision = async () => {
    if (!reason.trim() || reason.trim().length < 5) {
      setError("Please enter a decision reason of at least 5 characters.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await claimReturnService.decideClaim(selectedClaim.id, {
        decision: decisionType,
        decision_reason: reason.trim(),
      });
      await loadClaims();
      setSelectedClaim(null);
    } catch (err) {
      setError(err.friendlyMessage || "Could not process claim decision.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#172B4D]">
          Ownership Claims Management
        </h1>
        <p className="text-sm text-[#64748B]">
          Compare confidential claimant evidence against private report notes
          before approving or rejecting.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#E2E8F0] bg-[#F3F5F9] text-xs font-semibold uppercase text-[#64748B]">
            <tr>
              <th className="px-4 py-3">Claim ID</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Claimant</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Review Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {claims.map((claim) => (
              <tr key={claim.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-[#172B4D]">
                  #{claim.id}
                </td>
                <td className="px-4 py-3 font-medium text-[#172B4D]">
                  {claim.report_title}
                </td>
                <td className="px-4 py-3 text-[#64748B]">
                  {claim.claimant_name}
                  <span className="block text-xs">
                    {claim.claimant_id_number}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[#64748B]">
                  {new Date(claim.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={claim.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  {claim.status === "PENDING" ? (
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        onClick={() => openDecisionModal(claim, "APPROVED")}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#15966E] px-2.5 py-1.5 text-xs font-semibold text-white hover:opacity-95"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => openDecisionModal(claim, "REJECTED")}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#D84D57] px-2.5 py-1.5 text-xs font-semibold text-white hover:opacity-95"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openDecisionModal(claim, "VIEW")}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] px-2.5 py-1 text-xs font-semibold text-[#172B4D]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Details
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={Boolean(selectedClaim)}
        title={
          decisionType === "VIEW"
            ? `Claim #${selectedClaim?.id} Audit Record`
            : `${decisionType === "APPROVED" ? "Approve" : "Reject"} Claim #${selectedClaim?.id}`
        }
        description={selectedClaim?.report_title}
        confirmLabel={
          decisionType === "VIEW"
            ? "Close"
            : decisionType === "APPROVED"
              ? "Approve Ownership Claim"
              : "Reject Ownership Claim"
        }
        tone={
          decisionType === "REJECTED"
            ? "red"
            : decisionType === "APPROVED"
              ? "green"
              : "navy"
        }
        loading={submitting}
        onClose={() => setSelectedClaim(null)}
        onConfirm={
          decisionType === "VIEW"
            ? () => setSelectedClaim(null)
            : handleConfirmDecision
        }
      >
        {selectedClaim && (
          <div className="space-y-3 text-xs">
            <div className="rounded-lg border border-[#2878B9]/25 bg-[#2878B9]/5 p-3">
              <p className="flex items-center gap-1.5 font-bold text-[#183B63]">
                <Lock className="h-3.5 w-3.5" /> Private Report Notes (On File)
              </p>
              <p className="mt-1 text-[#172B4D]">
                {selectedClaim.report_private_info ||
                  "No private report notes recorded."}
              </p>
            </div>

            <div className="rounded-lg border border-[#E2E8F0] bg-[#F3F5F9] p-3">
              <p className="font-bold text-[#172B4D]">
                Claimant Explanation ({selectedClaim.claimant_name})
              </p>
              <p className="mt-1 text-[#64748B]">
                {selectedClaim.ownership_explanation}
              </p>
              <p className="mt-2 font-bold text-[#172B4D]">
                Claimant Private Proof
              </p>
              <p className="mt-1 text-[#172B4D]">
                {selectedClaim.private_evidence_details}
              </p>
            </div>

            {decisionType !== "VIEW" ? (
              <div>
                <label className="block font-semibold uppercase text-[#172B4D]">
                  Decision Reason (Required)
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Document how ownership was verified or why the claim was rejected..."
                  className="mt-1 w-full rounded-lg border border-[#E2E8F0] p-2.5 text-sm"
                />
                {error && (
                  <p className="mt-1 text-xs text-[#D84D57]">{error}</p>
                )}
              </div>
            ) : (
              <div className="rounded-lg bg-slate-100 p-3">
                <p>
                  <strong>Decision:</strong> {selectedClaim.status}
                </p>
                <p className="mt-1">
                  <strong>Reason:</strong> {selectedClaim.decision_reason}
                </p>
                <p className="mt-1">
                  <strong>Admin:</strong> {selectedClaim.decided_by_name}
                </p>
              </div>
            )}
          </div>
        )}
      </ConfirmModal>
    </div>
  );
}
