import React, { useEffect, useState } from "react";
import {
  Users,
  ClipboardList,
  AlertTriangle,
  SearchCheck,
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
  AlertCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { dashboardService } from "../services/dashboardService";
import StatCard from "../components/StatCard";

const PIE_COLORS = [
  "#183B63",
  "#2878B9",
  "#15966E",
  "#D99427",
  "#D84D57",
  "#64748B",
];

export default function AdminDashboardPage() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    dashboardService
      .getAdminDashboard()
      .then((data) => {
        if (active) setPayload(data);
      })
      .catch((err) => {
        if (active)
          setError(
            err.friendlyMessage || "Could not load administrator analytics.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-sm text-[#64748B]">
        Loading live MySQL analytics...
      </div>
    );
  }

  if (error || !payload) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-[#D84D57]/30 bg-[#D84D57]/10 p-5 text-sm text-[#D84D57]">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{error || "Analytics unavailable."}</span>
      </div>
    );
  }

  const {
    stats,
    categoryBreakdown = [],
    monthlyActivity = [],
    auditLogs = [],
  } = payload;
  const lostVsFound = [
    { name: "Found Items", value: stats.found_items },
    { name: "Lost Items", value: stats.lost_items },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#172B4D]">
          Administrator Analytics &amp; Control
        </h1>
        <p className="text-sm text-[#64748B]">
          Live metrics queried directly from MySQL for UCU Bishop Barham
          University College.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Registered Students"
          value={stats.total_students}
          icon={Users}
          tone="navy"
        />
        <StatCard
          title="Total Item Reports"
          value={stats.total_reports}
          icon={ClipboardList}
          tone="blue"
        />
        <StatCard
          title="Lost Items"
          value={stats.lost_items}
          icon={AlertTriangle}
          tone="red"
        />
        <StatCard
          title="Found Items"
          value={stats.found_items}
          icon={SearchCheck}
          tone="green"
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
          title="Rejected Claims"
          value={stats.rejected_claims}
          icon={XCircle}
          tone="red"
        />
        <StatCard
          title="Returned Items"
          value={stats.returned_items}
          icon={PackageCheck}
          tone="navy"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
          <h2 className="text-base font-bold text-[#172B4D]">
            Lost vs. Found Distribution
          </h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={lostVsFound}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                >
                  <Cell fill="#15966E" />
                  <Cell fill="#D84D57" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
          <h2 className="text-base font-bold text-[#172B4D]">
            Monthly Reporting Activity
          </h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="found"
                  name="Found"
                  fill="#2878B9"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="lost"
                  name="Lost"
                  fill="#183B63"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs lg:col-span-2">
          <h2 className="text-base font-bold text-[#172B4D]">
            Reports by Category
          </h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={85}
                >
                  {categoryBreakdown.map((entry, idx) => (
                    <Cell
                      key={entry.name}
                      fill={PIE_COLORS[idx % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs">
        <h2 className="mb-4 text-base font-bold text-[#172B4D]">
          Recent System Activity Logs
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#E2E8F0] bg-[#F3F5F9] text-xs font-semibold uppercase text-[#64748B]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-xs text-[#64748B]">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#172B4D]">
                    {log.actor_name || "System"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#183B63]">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#64748B]">
                    {log.entity_type} #{log.entity_id ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
