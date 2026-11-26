import React, { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { reportService } from "../services/reportService";
import ItemCard from "../components/ItemCard";
import EmptyState from "../components/EmptyState";
import SkeletonCard from "../components/SkeletonCard";

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
  "Moonlight Canteen",
  "Administration Block",
  "Board room",
  "Staff Lounge",
];

export default function BrowseItemsPage() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [type, setType] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [location, setLocation] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    reportService
      .listPublic({
        q: q.trim() || undefined,
        type: type === "ALL" ? undefined : type,
        category: category === "ALL" ? undefined : category,
        location: location === "ALL" ? undefined : location,
        status: status === "ALL" ? undefined : status,
        dateFrom: dateFrom || undefined,
        sort,
        page,
        limit: 6,
      })
      .then((res) => {
        if (!active) return;
        setItems(res.data || []);
        setPagination(
          res.pagination || { page: 1, limit: 6, total: 0, totalPages: 1 },
        );
      })
      .catch((err) => {
        if (active)
          setError(
            err.friendlyMessage || "Failed to load reports from server.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [q, type, category, location, status, dateFrom, sort, page]);

  const resetFilters = () => {
    setQ("");
    setType("ALL");
    setCategory("ALL");
    setLocation("ALL");
    setStatus("ALL");
    setDateFrom("");
    setSort("newest");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#172B4D]">
          Campus Lost &amp; Found Catalog
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Live records from UCU Bishop Barham University College.
        </p>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs sm:p-5">
        <div className="grid gap-3 md:grid-cols-12">
          <div className="relative md:col-span-5">
            <Search className="pointer-events-none absolute top-3 left-3.5 h-4 w-4 text-[#64748B]" />
            <input
              type="text"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, keyword, or campus location..."
              className="w-full rounded-lg border border-[#E2E8F0] py-2 pr-3 pl-10 text-sm focus:border-[#2878B9] focus:outline-none"
            />
          </div>

          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm md:col-span-2"
          >
            <option value="ALL">All Types</option>
            <option value="FOUND">Found Items</option>
            <option value="LOST">Lost Items</option>
          </select>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm md:col-span-3"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm md:col-span-2"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-12">
          <select
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm md:col-span-4"
          >
            <option value="ALL">All Campus Locations</option>
            {CAMPUS_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm md:col-span-3"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="CLAIM_PENDING">Claim Under Review</option>
            <option value="CLAIMED">Approved / Awaiting Pickup</option>
            <option value="RETURNED">Returned</option>
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm md:col-span-3"
          />

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F3F5F9] px-3 py-2 text-xs font-semibold text-[#172B4D] hover:bg-slate-200 md:col-span-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-[#D84D57]/30 bg-[#D84D57]/10 p-4 text-sm text-[#D84D57]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
        <span className="inline-flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {pagination.total} total records in database
        </span>
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No matching items found"
          description="Try clearing or adjusting your filters to browse more reports."
          action={
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg bg-[#183B63] px-4 py-2 text-xs font-semibold text-white"
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#172B4D] disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-semibold text-[#172B4D] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
