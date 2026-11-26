import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, PlusCircle } from "lucide-react";
import { reportService } from "../services/reportService";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";

export default function MyReportsPage() {
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    reportService
      .listMine()
      .then((rows) => {
        if (active) setMyReports(rows || []);
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#172B4D]">
            My Reported Items
          </h1>
          <p className="text-sm text-[#64748B]">
            Track and edit eligible lost or found reports you submitted.
          </p>
        </div>
        <Link
          to="/report"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#183B63] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2878B9]"
        >
          <PlusCircle className="h-4 w-4" />
          New Report
        </Link>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 text-sm text-[#64748B]">
          Loading your reports...
        </div>
      ) : myReports.length === 0 ? (
        <EmptyState
          title="You haven't reported any items yet"
          description="Submit a Lost or Found report whenever you misplace or discover an item on campus."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white shadow-xs">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E2E8F0] bg-[#F3F5F9] text-xs font-semibold uppercase text-[#64748B]">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {myReports.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-[#172B4D]">
                    <Link
                      to={`/items/${rep.id}`}
                      className="hover:text-[#2878B9]"
                    >
                      {rep.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={rep.report_type} />
                  </td>
                  <td className="px-4 py-3 text-[#64748B]">
                    {rep.location_text}
                  </td>
                  <td className="px-4 py-3 text-[#64748B]">
                    {String(rep.incident_date).slice(0, 10)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={rep.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {rep.status === "OPEN" ? (
                      <Link
                        to={`/report?edit=${rep.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] px-2.5 py-1 text-xs font-semibold text-[#183B63] hover:bg-[#F3F5F9]"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Link>
                    ) : (
                      <span className="text-xs text-[#64748B]">Locked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
