import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  AlertTriangle,
  SearchCheck,
  Clock,
  CheckCircle2,
  PackageCheck,
  PlusCircle,
  Search,
  Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { dashboardService } from "../services/dashboardService";
import { reportService } from "../services/reportService";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [dashData, setDashData] = useState({
    stats: {
      total_reports: 0,
      lost_items: 0,
      found_items: 0,
      pending_claims: 0,
      approved_claims: 0,
      returned_items: 0,
    },
    notifications: [],
  });
  const [myReports, setMyReports] = useState([]);

  useEffect(() => {
    let active = true;
    dashboardService
      .getStudentDashboard()
      .then((res) => {
        if (active && res) setDashData(res);
      })
      .catch(() => {});

    reportService
      .listMine()
      .then((rows) => {
        if (active) setMyReports(rows || []);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const { stats, notifications } = dashData;
  const today = new Date().toLocaleDateString("en-UG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl bg-[#183B63] p-6 text-white shadow-xs sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2878B9] text-base font-bold uppercase">
            {user?.full_name?.slice(0, 2) || "ST"}
          </div>
          <div>
            <p className="text-xs font-medium text-sky-200">{today}</p>
            <h1 className="mt-0.5 text-xl font-bold sm:text-2xl">
              Welcome back, {user?.full_name}
            </h1>
            <p className="text-xs text-slate-300">
              Reg No: {user?.student_or_staff_id}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/report?type=LOST"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#D84D57] px-3.5 py-2 text-xs font-semibold text-white hover:opacity-95"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Report Lost Item
          </Link>
          <Link
            to="/report?type=FOUND"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#15966E] px-3.5 py-2 text-xs font-semibold text-white hover:opacity-95"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Report Found Item
          </Link>
          <Link
            to="/items"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/25"
          >
            <Search className="h-3.5 w-3.5" />
            Browse Found Items
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="My Total Reports"
          value={stats.total_reports}
          icon={FileText}
          tone="navy"
        />
        <StatCard
          title="My Lost Items"
          value={stats.lost_items}
          icon={AlertTriangle}
          tone="red"
        />
        <StatCard
          title="My Found Items"
          value={stats.found_items}
          icon={SearchCheck}
          tone="blue"
        />
        <StatCard
          title="Pending Claims"
          value={stats.pending_claims}
          icon={Clock}
          tone="amber"
        />
        <StatCard
          title="Approved Claims"
          value={stats.approved_claims}
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          title="Returned Items"
          value={stats.returned_items}
          icon={PackageCheck}
          tone="green"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-[#172B4D]">
              My Recent Reports
            </h2>
            <Link
              to="/student/reports"
              className="text-xs font-semibold text-[#2878B9]"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-[#E2E8F0]">
            {myReports.slice(0, 4).map((rep) => (
              <div
                key={rep.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <Link
                    to={`/items/${rep.id}`}
                    className="truncate text-sm font-semibold text-[#172B4D] hover:text-[#2878B9]"
                  >
                    {rep.title}
                  </Link>
                  <p className="text-xs text-[#64748B]">
                    {rep.location_text} •{" "}
                    {String(rep.incident_date).slice(0, 10)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={rep.report_type} />
                  <StatusBadge status={rep.status} />
                </div>
              </div>
            ))}
            {myReports.length === 0 && (
              <p className="py-4 text-xs text-[#64748B]">
                No reports submitted yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs lg:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-[#172B4D]">
              <Bell className="h-4 w-4 text-[#2878B9]" />
              Notifications
            </h2>
            <Link
              to="/student/claims"
              className="text-xs font-semibold text-[#2878B9]"
            >
              My Claims
            </Link>
          </div>
          <div className="space-y-3">
            {notifications.map((note) => (
              <div
                key={note.id}
                className="rounded-lg border border-[#E2E8F0] bg-[#F3F5F9] p-3.5"
              >
                <p className="text-xs font-bold text-[#172B4D]">{note.title}</p>
                <p className="mt-1 text-xs text-[#64748B]">{note.message}</p>
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-xs text-[#64748B]">No notifications yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
