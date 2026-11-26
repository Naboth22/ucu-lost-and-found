import React, { useEffect, useState } from "react";
import { PackageCheck } from "lucide-react";
import { claimReturnService } from "../services/claimReturnService";
import ConfirmModal from "../components/ConfirmModal";

export default function AdminReturnsPage() {
  const [claims, setClaims] = useState([]);
  const [returnsList, setReturnsList] = useState([]);
  const [activeClaim, setActiveClaim] = useState(null);
  const [collectorName, setCollectorName] = useState("");
  const [collectorId, setCollectorId] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    const [allClaims, allReturns] = await Promise.all([
      claimReturnService.listAdminClaims(),
      claimReturnService.listReturns(),
    ]);
    setClaims(allClaims || []);
    setReturnsList(allReturns || []);
  };

  useEffect(() => {
    loadData().catch(() => {});
  }, []);

  const awaitingCollection = claims.filter(
    (c) => c.status === "APPROVED" && c.report_status !== "RETURNED",
  );

  const openModal = (claim) => {
    setActiveClaim(claim);
    setCollectorName(claim.claimant_name);
    setCollectorId(claim.claimant_id_number);
    setNotes("Verified UCU Student ID card in person.");
    setError("");
  };

  const handleConfirm = async () => {
    if (!collectorName.trim() || !collectorId.trim()) {
      setError("Collector full name and UCU ID number are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await claimReturnService.confirmReturn({
        claim_id: activeClaim.id,
        collector_name: collectorName.trim(),
        collector_id_number: collectorId.trim(),
        verification_notes: notes.trim(),
      });
      await loadData();
      setActiveClaim(null);
    } catch (err) {
      setError(err.friendlyMessage || "Could not confirm physical return.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#172B4D]">
          Physical Item Return Confirmation
        </h1>
        <p className="text-sm text-[#64748B]">
          Verify student identity at handover before marking approved items as
          physically returned.
        </p>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
        <h2 className="mb-4 text-base font-bold text-[#172B4D]">
          Approved Claims Awaiting Physical Collection
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E2E8F0] bg-[#F3F5F9] text-xs font-semibold uppercase text-[#64748B]">
              <tr>
                <th className="px-4 py-3">Claim ID</th>
                <th className="px-4 py-3">Approved Item</th>
                <th className="px-4 py-3">Approved Student</th>
                <th className="px-4 py-3 text-right">Handover Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {awaitingCollection.map((claim) => (
                <tr key={claim.id}>
                  <td className="px-4 py-3 font-semibold text-[#172B4D]">
                    #{claim.id}
                  </td>
                  <td className="px-4 py-3 text-[#172B4D]">
                    {claim.report_title}
                  </td>
                  <td className="px-4 py-3 text-[#64748B]">
                    {claim.claimant_name} ({claim.claimant_id_number})
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openModal(claim)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#15966E] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-95"
                    >
                      <PackageCheck className="h-3.5 w-3.5" />
                      Confirm Physical Return
                    </button>
                  </td>
                </tr>
              ))}
              {awaitingCollection.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-xs text-[#64748B]"
                  >
                    All approved claims have been physically collected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
        <h2 className="mb-4 text-base font-bold text-[#172B4D]">
          Completed Return Register
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E2E8F0] bg-[#F3F5F9] text-xs font-semibold uppercase text-[#64748B]">
              <tr>
                <th className="px-4 py-3">Return ID</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Collected By</th>
                <th className="px-4 py-3">Confirmed By</th>
                <th className="px-4 py-3">Collection Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {returnsList.map((ret) => (
                <tr key={ret.id}>
                  <td className="px-4 py-3 font-semibold text-[#172B4D]">
                    #{ret.id}
                  </td>
                  <td className="px-4 py-3 text-[#172B4D]">{ret.item_title}</td>
                  <td className="px-4 py-3 text-[#64748B]">
                    {ret.collector_name} ({ret.collector_id_number})
                  </td>
                  <td className="px-4 py-3 text-[#64748B]">
                    {ret.confirmed_by_name}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#64748B]">
                    {new Date(ret.returned_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        open={Boolean(activeClaim)}
        title="Confirm Physical Handover"
        description={activeClaim?.report_title}
        confirmLabel="Complete Return & Lock Item"
        tone="green"
        loading={submitting}
        onClose={() => setActiveClaim(null)}
        onConfirm={handleConfirm}
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold uppercase text-[#172B4D]">
              Collecting Student Name
            </label>
            <input
              value={collectorName}
              onChange={(e) => setCollectorName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block font-semibold uppercase text-[#172B4D]">
              Verified UCU ID Number
            </label>
            <input
              value={collectorId}
              onChange={(e) => setCollectorId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block font-semibold uppercase text-[#172B4D]">
              Handover Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#E2E8F0] p-2.5 text-sm"
            />
          </div>
          {error && <p className="text-xs text-[#D84D57]">{error}</p>}
        </div>
      </ConfirmModal>
    </div>
  );
}
