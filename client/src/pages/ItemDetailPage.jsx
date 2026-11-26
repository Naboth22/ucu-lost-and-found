import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  PackageSearch,
} from "lucide-react";
import { reportService } from "../services/reportService";
import { claimReturnService } from "../services/claimReturnService";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";

const claimSchema = z.object({
  ownership_explanation: z
    .string()
    .min(10, "Provide a clear explanation of ownership"),
  private_evidence_details: z
    .string()
    .min(5, "Provide private identifying proof"),
});

export default function ItemDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(claimSchema) });

  useEffect(() => {
    let active = true;
    setLoading(true);
    reportService
      .getById(id)
      .then((data) => {
        if (active) setItem(data);
      })
      .catch(() => {
        if (active) setItem(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    if (user?.role === "STUDENT") {
      claimReturnService
        .listMyClaims()
        .then((rows) => {
          if (active) setMyClaims(rows || []);
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [id, user]);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-sm text-[#64748B]">
        Loading item details...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-center">
        <h2 className="text-lg font-bold text-[#172B4D]">
          Item report not found
        </h2>
        <Link
          to="/items"
          className="mt-4 inline-block text-sm font-semibold text-[#2878B9]"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const existingUserClaim = myClaims.find((c) => c.report_id === Number(id));
  const canClaim =
    user &&
    user.role === "STUDENT" &&
    item.report_type === "FOUND" &&
    item.reporter_id !== user.id &&
    (item.status === "OPEN" || item.status === "CLAIM_PENDING") &&
    !existingUserClaim;

  const onSubmitClaim = async (values) => {
    setFeedback({ type: "", message: "" });
    try {
      await claimReturnService.submitClaim({
        report_id: item.id,
        ownership_explanation: values.ownership_explanation,
        private_evidence_details: values.private_evidence_details,
        evidenceFile,
      });
      reset();
      setEvidenceFile(null);
      const updatedClaims = await claimReturnService.listMyClaims();
      setMyClaims(updatedClaims || []);
      const refreshedItem = await reportService.getById(id);
      setItem(refreshedItem);
      setFeedback({
        type: "success",
        message:
          "Ownership claim submitted. An administrator will review your private proof.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.friendlyMessage || "Could not submit claim.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/items"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2878B9] hover:text-[#183B63]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Catalog
      </Link>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-xs lg:col-span-7">
          <div className="aspect-[16/9] w-full bg-[#F3F5F9]">
            {item.image_path ? (
              <img
                src={item.image_path}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-[#64748B]">
                <PackageSearch className="h-12 w-12 text-[#183B63]/35" />
                <span className="mt-2 text-xs font-medium">
                  No photograph uploaded for this report
                </span>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={item.report_type} />
              <StatusBadge status={item.status} />
              <span className="text-xs text-[#64748B]">Report #{item.id}</span>
            </div>

            <h1 className="mt-3 text-2xl font-bold text-[#172B4D]">
              {item.title}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#64748B]">
              {item.description}
            </p>

            <div className="mt-6 grid gap-4 rounded-xl bg-[#F3F5F9] p-4 sm:grid-cols-3">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B]">
                  <Tag className="h-3.5 w-3.5 text-[#183B63]" /> Category
                </p>
                <p className="mt-1 text-sm font-semibold text-[#172B4D]">
                  {item.category}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B]">
                  <MapPin className="h-3.5 w-3.5 text-[#183B63]" /> Campus
                  Location
                </p>
                <p className="mt-1 text-sm font-semibold text-[#172B4D]">
                  {item.location_text}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B]">
                  <Calendar className="h-3.5 w-3.5 text-[#183B63]" /> Date
                </p>
                <p className="mt-1 text-sm font-semibold text-[#172B4D]">
                  {String(item.incident_date).slice(0, 10)}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-slate-50 px-3.5 py-2.5 text-xs text-[#64748B]">
              <Lock className="h-4 w-4 shrink-0 text-[#183B63]" />
              <span>
                Sensitive serial numbers and distinguishing marks are protected
                from unauthorized public disclosure.
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#183B63]/10 text-[#183B63]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#172B4D]">
                  Ownership Verification Claim
                </h2>
                <p className="text-xs text-[#64748B]">
                  Confidential review by BBUC Administration
                </p>
              </div>
            </div>

            {feedback.message && (
              <div
                className={`mt-4 flex items-start gap-2 rounded-lg border p-3 text-xs font-medium ${
                  feedback.type === "success"
                    ? "border-[#15966E]/30 bg-[#15966E]/10 text-[#15966E]"
                    : "border-[#D84D57]/30 bg-[#D84D57]/10 text-[#D84D57]"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {existingUserClaim ? (
              <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-[#F3F5F9] p-4">
                <p className="text-xs font-semibold uppercase text-[#64748B]">
                  Your Submitted Claim
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-[#172B4D]">
                    Claim #{existingUserClaim.id}
                  </span>
                  <StatusBadge status={existingUserClaim.status} />
                </div>
                <p className="mt-2 text-xs text-[#64748B]">
                  {existingUserClaim.ownership_explanation}
                </p>
              </div>
            ) : canClaim ? (
              <form
                onSubmit={handleSubmit(onSubmitClaim)}
                className="mt-5 space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#172B4D]">
                    Ownership Explanation
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe where and when you lost this item..."
                    {...register("ownership_explanation")}
                    className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] p-3 text-sm focus:border-[#2878B9] focus:outline-none"
                  />
                  {errors.ownership_explanation && (
                    <p className="mt-1 text-xs text-[#D84D57]">
                      {errors.ownership_explanation.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#172B4D]">
                    Private Identifying Proof
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide unique serial numbers, contents, or hidden marks..."
                    {...register("private_evidence_details")}
                    className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] p-3 text-sm focus:border-[#2878B9] focus:outline-none"
                  />
                  {errors.private_evidence_details && (
                    <p className="mt-1 text-xs text-[#D84D57]">
                      {errors.private_evidence_details.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#172B4D]">
                    Supporting Evidence Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) =>
                      setEvidenceFile(e.target.files?.[0] || null)
                    }
                    className="mt-1.5 block w-full text-xs text-[#64748B] file:mr-3 file:rounded-lg file:border-0 file:bg-[#F3F5F9] file:px-3 file:py-2 file:font-semibold file:text-[#183B63]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-[#183B63] py-2.5 text-sm font-semibold text-white hover:bg-[#2878B9]"
                >
                  {isSubmitting ? "Submitting..." : "Submit Ownership Claim"}
                </button>
              </form>
            ) : (
              <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-[#F3F5F9] p-4 text-xs text-[#64748B]">
                {!user ? (
                  <>
                    Please{" "}
                    <Link
                      to="/login"
                      className="font-semibold text-[#2878B9] underline"
                    >
                      sign in as a student
                    </Link>{" "}
                    to submit an ownership claim.
                  </>
                ) : item.report_type === "LOST" ? (
                  "This is a Lost Item notice. If you found this item, please file a Found Item report."
                ) : item.reporter_id === user.id ? (
                  "You cannot submit an ownership claim on an item you reported."
                ) : (
                  "This item is no longer accepting new ownership claims."
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
