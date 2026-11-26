import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GraduationCap, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const registerSchema = z
  .object({
    full_name: z.string().min(3, "Full name is required"),
    student_or_staff_id: z
      .string()
      .min(4, "Valid UCU Registration Number is required"),
    email: z.string().email("Enter a valid email address"),
    phone: z.string().min(7, "Enter a valid phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values) => {
    setError("");
    try {
      await registerUser(values);
      navigate("/student/dashboard");
    } catch (err) {
      setError(err.friendlyMessage || "Registration failed.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F5F9] px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#183B63] text-white">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-[#172B4D]">
            Create Student Account
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            UCU Bishop Barham University College
          </p>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#D84D57]/30 bg-[#D84D57]/10 p-3 text-xs text-[#D84D57]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 grid gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase text-[#172B4D]">
              Full Name
            </label>
            <input
              {...register("full_name")}
              placeholder="e.g. Natukunda Grace"
              className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm focus:border-[#2878B9] focus:outline-none"
            />
            {errors.full_name && (
              <p className="mt-1 text-xs text-[#D84D57]">
                {errors.full_name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#172B4D]">
              Registration / Access No.
            </label>
            <input
              {...register("student_or_staff_id")}
              placeholder="S23B13/0118"
              className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm focus:border-[#2878B9] focus:outline-none"
            />
            {errors.student_or_staff_id && (
              <p className="mt-1 text-xs text-[#D84D57]">
                {errors.student_or_staff_id.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#172B4D]">
              Phone Number
            </label>
            <input
              {...register("phone")}
              placeholder="+256 772 000 000"
              className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm focus:border-[#2878B9] focus:outline-none"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-[#D84D57]">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase text-[#172B4D]">
              University Email
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="grace.natukunda@students.ucu.ac.ug"
              className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm focus:border-[#2878B9] focus:outline-none"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-[#D84D57]">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#172B4D]">
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm focus:border-[#2878B9] focus:outline-none"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-[#D84D57]">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[#172B4D]">
              Confirm Password
            </label>
            <input
              type="password"
              {...register("confirm_password")}
              className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm focus:border-[#2878B9] focus:outline-none"
            />
            {errors.confirm_password && (
              <p className="mt-1 text-xs text-[#D84D57]">
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 sm:col-span-2 rounded-lg bg-[#183B63] py-2.5 text-sm font-semibold text-white hover:bg-[#2878B9] disabled:opacity-60"
          >
            {isSubmitting ? "Creating Account..." : "Register Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#64748B]">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#2878B9] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
