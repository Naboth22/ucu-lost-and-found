import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./layouts/DashboardLayout";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BrowseItemsPage from "./pages/BrowseItemsPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import ReportItemPage from "./pages/ReportItemPage";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import MyReportsPage from "./pages/MyReportsPage";
import MyClaimsPage from "./pages/MyClaimsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminClaimsPage from "./pages/AdminClaimsPage";
import AdminReturnsPage from "./pages/AdminReturnsPage";
import ProfilePage from "./pages/ProfilePage";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F5F9] text-sm text-[#64748B]">
        Verifying session...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard"}
        replace
      />
    );
  }
  return <DashboardLayout>{children}</DashboardLayout>;
}

function CatalogShell({ children }) {
  const { user } = useAuth();
  if (user) return <DashboardLayout>{children}</DashboardLayout>;
  return <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</div>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/items"
              element={
                <CatalogShell>
                  <BrowseItemsPage />
                </CatalogShell>
              }
            />
            <Route
              path="/items/:id"
              element={
                <CatalogShell>
                  <ItemDetailPage />
                </CatalogShell>
              }
            />

            <Route
              path="/report"
              element={
                <ProtectedRoute allowedRoles={["STUDENT", "ADMIN"]}>
                  <ReportItemPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["STUDENT", "ADMIN"]}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={["STUDENT"]}>
                  <StudentDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/reports"
              element={
                <ProtectedRoute allowedRoles={["STUDENT"]}>
                  <MyReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/claims"
              element={
                <ProtectedRoute allowedRoles={["STUDENT"]}>
                  <MyClaimsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/claims"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminClaimsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/returns"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminReturnsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
