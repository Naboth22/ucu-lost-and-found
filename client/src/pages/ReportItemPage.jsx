import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, CheckCircle2 } from "lucide-react";
import { reportService } from "../services/reportService";

const CATEGORIES = [
  "Electronics & Laptops",
  "Student IDs & Documents",
  "Bags & Backpacks",
  "Books & Stationery",
  "Keys & Access Cards",
  "Wallets & Accessories",
  "Clothing & Personal Items",
  "Other",
];

const CAMPUS_LOCATIONS = [
  "Library (BBUC)",
  "Multipurpose Hall",
  "ICT Computer LabLab",
  "Old Chapel",
  "Staff Lounge",
  "Administration Block",
  "Board roam",
  "Main Gate",
];

const reportSchema = z.object({
  report_type: z.enum(["LOST", "FOUND"]),
  title: z.string().min(3, "Enter a clear item title"),
  category: z.string().min(1, "Select a category"),
  location_text: z.string().min(1, "Select a campus location"),
  incident_date: z.string().min(1, "Select the date lost or found"),
  description: z.string().min(10, "Provide a helpful public description"),
  private_identifying_info: z.string().optional(),
});

export default function ReportItemPage() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const defaultType = searchParams.get("type") === "FOUND" ? "FOUND" : "LOST";
  const navigate = useNavigate();

  const [imageFile, setImageFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      report_type: defaultType,
      title: "",
      category: CATEGORIES[0],
      location_text: CAMPUS_LOCATIONS[0],
      incident_date: new Date().toISOString().split("T")[0],
      description: "",
      private_identifying_info: "",
    },
  });

  useEffect(() => {
    if (!editId) return;
    reportService
      .getById(editId)
      .then((data) => {
        reset({
          report_type: data.report_type,
          title: data.title,
          category: data.category,
          location_text: data.location_text,
          incident_date: String(data.incident_date).slice(0, 10),
          description: data.description,
          private_identifying_info: data.private_identifying_info || "",
        });
      })
      .catch(() => {});
  }, [editId, reset]);

  const selectedType = watch("report_type");

  const onSubmit = async (values) => {
    setErrorMsg("");
    try {
      if (editId) {
        await reportService.update(editId, values, imageFile);
      } else {
        await reportService.create(values, imageFile);
      }
      navigate("/student/reports");
    } catch (err) {
      setErrorMsg(err.friendlyMessage || "Failed to save report.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#172B4D]">
          {editId ? `Edit Report #${editId}` : "Report Lost or Found Property"}
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Log accurate item details to help reunite belongings across UCU Bishop
          Barham University College.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-[#D84D57]/30 bg-[#D84D57]/10 p-3.5 text-xs font-medium text-[#D84D57]">
          {errorMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs"
      >
        {!editId && (
          <div>
            <label className="block text-xs font-semibold uppercase text-[#172B4D]">
              Report Type
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {["LOST", "FOUND"].map((type) => (
                <label
                  key={type}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 text-sm font-semibold transition-colors ${
                    selectedType === type
                      ? "border-[#183B63] bg-[#183B63] text-white"
                      : "border-[#E2E8F0] bg-[#F3F5F9] text-[#172B4D]"
                  }`}
                >
                  <input
                    type="radio"
                    value={type}
                    {...register("report_type")}
                    className="sr-only"
                  />
                  <CheckCircle2 className="h-4 w-4" />
                  {type === "LOST" ? "I Lost an Item" : "I Found an Item"}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase text-[#172B4D]">
              Item Title
            </label>
            <input
              {...register("title")}
              placeholder="e.g. HP EliteBook 65W Charger or UCU Student ID"
              className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm focus:border-[#2878B9] focus:outline-none"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-[#D84D57]">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#172B4D]">
              Category
            </label>
            <select
              {...register("category")}
              className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#172B4D]">
              Date {selectedType === "LOST" ? "Lost" : "Found"}
            </label>
            <input
              type="date"
              {...register("incident_date")}
              className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm"
            />
            {errors.incident_date && (
              <p className="mt-1 text-xs text-[#D84D57]">
                {errors.incident_date.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase text-[#172B4D]">
              Campus Location
            </label>
            <select
              {...register("location_text")}
              className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm"
            >
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase text-[#172B4D]">
              Public Description
            </label>
            <textarea
              rows={3}
              {...register("description")}
              placeholder="Describe appearance, color, brand, and context..."
              className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] p-3 text-sm focus:border-[#2878B9] focus:outline-none"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-[#D84D57]">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2 rounded-xl border border-[#2878B9]/25 bg-[#2878B9]/5 p-4">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase text-[#183B63]">
              <Lock className="h-3.5 w-3.5" />
              Private Identifying Information (Hidden from Public)
            </label>
            <textarea
              rows={2}
              {...register("private_identifying_info")}
              placeholder="Serial numbers, secret marks, or contents used by admins to verify ownership..."
              className="mt-2 w-full rounded-lg border border-[#E2E8F0] bg-white p-3 text-sm focus:border-[#2878B9] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase text-[#172B4D]">
              Item Photograph (Optional — JPG, PNG, WebP up to 5MB)
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="mt-1.5 block w-full text-xs text-[#64748B] file:mr-3 file:rounded-lg file:border-0 file:bg-[#183B63] file:px-3.5 file:py-2 file:font-semibold file:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#E2E8F0] pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#172B4D]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-[#183B63] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2878B9]"
          >
            {isSubmitting
              ? "Saving..."
              : editId
                ? "Save Report Changes"
                : "Submit Report"}
          </button>
        </div>
      </form>
    </div>
  );
}
