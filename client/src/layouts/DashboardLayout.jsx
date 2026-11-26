import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  FileText,
  ShieldCheck,
  PackageCheck,
  UserCircle,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cn } from "../utils/cn";

const STUDENT_NAV = [
  { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/items", label: "Browse Items", icon: Search },
  { to: "/report", label: "Report Lost / Found", icon: PlusCircle },
  { to: "/student/reports", label: "My Reports", icon: FileText },
  { to: "/student/claims", label: "My Claims", icon: ShieldCheck },
  { to: "/profile", label: "My Profile", icon: UserCircle },
];

const ADMIN_NAV = [
  { to: "/admin/dashboard", label: "Admin Analytics", icon: LayoutDashboard },
  { to: "/admin/claims", label: "Ownership Claims", icon: ShieldCheck },
  { to: "/admin/returns", label: "Return Confirmations", icon: PackageCheck },
  { to: "/items", label: "Public Catalog", icon: Search },
  { to: "/profile", label: "Account Profile", icon: UserCircle },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = user?.role === "ADMIN" ? ADMIN_NAV : STUDENT_NAV;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-[#183B63] text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <Link
          to="/"
          className="flex items-center gap-3"
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2878B9] text-white shadow-xs">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight">UCU BBUC</p>
            <p className="text-[11px] text-slate-300">Lost & Found Portal</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-4 py-3">
        <span className="inline-flex items-center rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-sky-200">
          {user?.role === "ADMIN"
            ? "Administrator Workspace"
            : "Student Portal"}
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#2878B9] text-white shadow-xs"
                  : "text-slate-200 hover:bg-white/10 hover:text-white",
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2878B9] text-xs font-bold uppercase">
            {user?.full_name?.slice(0, 2) || "UC"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {user?.full_name}
            </p>
            <p className="truncate text-xs text-slate-300">
              {user?.student_or_staff_id}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 transition-colors hover:bg-[#D84D57] hover:border-[#D84D57]"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F5F9] lg:flex">
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw]">
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E2E8F0] bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-[#E2E8F0] p-2 text-[#172B4D] hover:bg-[#F3F5F9] lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-[#172B4D]">
              Bishop Barham University College — Lost &amp; Found
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#183B63] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2878B9]"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Report Item</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
