import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    await updateProfile({ full_name: fullName, phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#172B4D]">Account Profile</h1>
        <p className="text-sm text-[#64748B]">
          Manage your contact details for campus recovery notifications.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-4 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs"
      >
        {saved && (
          <div className="rounded-lg bg-[#15966E]/10 p-3 text-xs font-semibold text-[#15966E]">
            Profile updated successfully.
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold uppercase text-[#64748B]">
            University ID / Role
          </label>
          <p className="mt-1 text-sm font-semibold text-[#172B4D]">
            {user?.student_or_staff_id} ({user?.role})
          </p>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-[#64748B]">
            Email Address
          </label>
          <p className="mt-1 text-sm font-medium text-[#172B4D]">
            {user?.email}
          </p>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-[#64748B]">
            Full Name
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-[#64748B]">
            Phone Number
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-[#183B63] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2878B9]"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}
