import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  ShieldCheck,
  FilePlus2,
  CheckCircle2,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { reportService } from '../services/reportService';
import ItemCard from '../components/ItemCard';

export default function LandingPage() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    reportService
      .listPublic({ page: 1, limit: 3 })
      .then((res) => setFeatured(res.data || []))
      .catch(() => setFeatured([]));
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F5F9] text-[#172B4D]">
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#183B63] text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-sm font-bold text-[#183B63] sm:text-base">
                UCU Campus Lost &amp; Found
              </span>
              <span className="block text-xs text-[#64748B]">
                Bishop Barham University College (BBUC)
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/items"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[#172B4D] hover:bg-[#F3F5F9] sm:inline-block"
            >
              Browse Catalog
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2 text-sm font-semibold text-[#183B63] hover:bg-[#F3F5F9]"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-[#183B63] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#2878B9]"
            >
              Student Register
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-[#183B63] py-14 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sky-200">
              <ShieldCheck className="h-4 w-4" />
              Official UCU BBUC Property Recovery Platform
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Recover Lost Belongings Across Campus With Verified Accountability.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-200 sm:text-lg">
              Report misplaced or recovered items, search centralized campus records, submit confidential ownership proof, and track physical handovers with campus administration.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/items"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2878B9] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-500"
              >
                <Search className="h-4 w-4" />
                Browse Lost &amp; Found Items
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20"
              >
                Report an Item
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2878B9]/10 text-[#2878B9]">
              <FilePlus2 className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-base font-bold text-[#172B4D]">1. Report Lost or Found Property</h2>
            <p className="mt-2 text-sm text-[#64748B]">
              Log item details, campus location, date, and optional photographs while keeping private serial numbers hidden from public listings.
            </p>
          </div>
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D99427]/12 text-[#B47716]">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-base font-bold text-[#172B4D]">2. Submit Confidential Claim Proof</h2>
            <p className="mt-2 text-sm text-[#64748B]">
              Owners submit private identifying details and supporting evidence reviewed exclusively by authorized BBUC administrators.
            </p>
          </div>
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#15966E]/10 text-[#15966E]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-base font-bold text-[#172B4D]">3. Verified Physical Return</h2>
            <p className="mt-2 text-sm text-[#64748B]">
              Once a claim is approved, campus security verifies student ID at collection and records an auditable handover timestamp.
            </p>
          </div>
        </div>

        {featured.length > 0 && (
          <div className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#172B4D]">Recent Campus Reports</h2>
                <p className="text-sm text-[#64748B]">Latest lost and found items logged at BBUC Kabale</p>
              </div>
              <Link
                to="/items"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#2878B9] hover:text-[#183B63]"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
