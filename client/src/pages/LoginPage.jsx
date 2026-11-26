import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GraduationCap, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const loginSchema = z.object({
  email: z.string().email("Enter a valid UCU email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const account = await login(values);
      navigate(
        account.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard",
      );
    } catch (err) {
      setServerError(err.friendlyMessage || "Invalid login credentials.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F5F9] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#183B63] text-white">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-[#172B4D]">
            Sign in to UCU Lost &amp; Found
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Bishop Barham University College Portal
          </p>
        </div>

        {serverError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#D84D57]/30 bg-[#D84D57]/10 p-3 text-xs font-medium text-[#D84D57]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#172B4D]">
              University Email
            </label>
            <input
              type="email"
              placeholder="name@students.ucu.ac.ug"
              {...register("email")}
              className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm text-[#172B4D] focus:border-[#2878B9] focus:outline-none"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-[#D84D57]">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#172B4D]">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm text-[#172B4D] focus:border-[#2878B9] focus:outline-none"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-[#D84D57]">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#183B63] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2878B9] disabled:opacity-60"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#64748B]">
          New student at BBUC?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#2878B9] hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
