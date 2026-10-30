'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  PlusCircle,
  Search,
  ArrowRight,
  MapPin,
  Car,
  Droplets,
  Trash2,
  Zap,
  Building2,
  ShieldAlert,
} from 'lucide-react';
import { complaintService } from '@/lib/data/complaintService';
import type { Complaint } from '@/types/civic';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { StatusBadge } from '@/components/common/StatusBadge';

export default function LandingPage() {
  const router = useRouter();
  const [referenceQuery, setReferenceQuery] = useState('');
  const [featuredComplaints, setFeaturedComplaints] = useState<Complaint[]>([]);
  const [metrics, setMetrics] = useState({
    total: 42,
    resolved: 7,
    inProgress: 8,
    critical: 7,
    resolutionRate: 16.7,
  });

  useEffect(() => {
    let mounted = true;

    complaintService
      .getMetrics()
      .then((res) => {
        if (mounted && res) {setMetrics(res);}
      })
      .catch(() => {});

    complaintService
      .getAllComplaints()
      .then((res) => {
        if (mounted && Array.isArray(res)) {
          setFeaturedComplaints(res.slice(0, 3));
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (referenceQuery.trim()) {
      router.push(`/track/${referenceQuery.trim()}`);
    }
  };

  const categories = [
    {
      name: 'Roads & Potholes',
      desc: 'Structural asphalt damage, dangerous potholes, and broken curbs.',
      icon: Car,
      activeCount: '12 reports',
    },
    {
      name: 'Water & Drainage',
      desc: 'Water pipeline leaks, sewer overflows, and localized drainage blocks.',
      icon: Droplets,
      activeCount: '8 reports',
    },
    {
      name: 'Waste Management',
      desc: 'Uncollected refuse, overflowing commercial bins, and littering.',
      icon: Trash2,
      activeCount: '7 reports',
    },
    {
      name: 'Electricity & Lighting',
      desc: 'Damaged streetlights, dangling wiring, and power outages.',
      icon: Zap,
      activeCount: '6 reports',
    },
    {
      name: 'Public Infrastructure',
      desc: 'Damaged footpaths, broken traffic signals, and park hazards.',
      icon: Building2,
      activeCount: '5 reports',
    },
    {
      name: 'Public Safety',
      desc: 'Missing storm drain covers, unsafe structures, and pedestrian risks.',
      icon: ShieldAlert,
      activeCount: '4 reports',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      
      {/* 1. HERO SECTION */}
      <section className="pt-4 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF3FC] text-[#183B66] text-xs font-semibold border border-[#D0E2F6]">
              <Shield className="w-3.5 h-3.5 text-[#3978C5]" />
              <span>Official Municipal Action Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#183B66] tracking-tight leading-[1.12]">
              Your City. Your Voice. Real Action.
            </h1>

            <p className="text-base sm:text-lg text-[#718096] max-w-xl leading-relaxed">
              Report civic problems, let AI organize and prioritize them, and track progress towards a better community.
            </p>

            {/* Clear Primary & Secondary CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Link
                href="/submit"
                className="btn-primary text-sm !py-3 !px-6"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report an Issue</span>
              </Link>

              <Link
                href="/my-complaints"
                className="btn-secondary text-sm !py-3 !px-6"
              >
                <Search className="w-4 h-4 text-[#718096]" />
                <span>Track My Complaint</span>
              </Link>
            </div>

            {/* Direct Reference Number Search */}
            <form onSubmit={handleTrackSubmit} className="pt-2 max-w-md">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Enter reference number (e.g. CIVIC-2026-1001)"
                  value={referenceQuery}
                  onChange={(e) => setReferenceQuery(e.target.value)}
                  className="w-full bg-white border border-[#E5EAF0] rounded-lg pl-3.5 pr-20 py-2 text-xs text-[#263445] placeholder-[#A0AEC0] focus:outline-none focus:border-[#3978C5] shadow-sm"
                />
                <button
                  type="submit"
                  className="absolute right-1 px-3 py-1 bg-[#183B66] hover:bg-[#122d4f] text-white text-xs font-semibold rounded-md transition-colors"
                >
                  Track
                </button>
              </div>
            </form>
          </div>

          {/* Right Visual Preview of Complaint Tracking & Dashboard */}
          <div className="lg:col-span-5">
            <div className="card-clean p-6 space-y-5 bg-white shadow-sm border border-[#E5EAF0]">
              <div className="flex items-center justify-between border-b border-[#E5EAF0] pb-4">
                <div>
                  <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block">
                    Active Case File
                  </span>
                  <span className="font-mono text-sm font-bold text-[#183B66]">
                    CIVIC-2026-1001
                  </span>
                </div>
                <StatusBadge status="IN PROGRESS" size="sm" />
              </div>

              <div>
                <h3 className="font-bold text-[#263445] text-sm">
                  Dangerous 2-foot crater pothole near Metro Pillar 42
                </h3>
                <p className="text-xs text-[#718096] mt-1 leading-relaxed">
                  High vehicle speed arterial lane with exposed rebar hazard.
                </p>
                <div className="flex items-center gap-1.5 text-xs text-[#718096] mt-2">
                  <MapPin className="w-3.5 h-3.5 text-[#3978C5]" />
                  <span>MG Road / Ring Road Junction</span>
                </div>
              </div>

              {/* Resolution Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold text-[#183B66]">
                  <span>Resolution Lifecycle</span>
                  <span className="text-[#3978C5]">Step 4 of 5</span>
                </div>
                <div className="w-full bg-[#E5EAF0] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#3978C5] h-full rounded-full w-4/5" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#718096] pt-0.5">
                  <span>Submitted</span>
                  <span>Review</span>
                  <span>Assigned</span>
                  <span className="font-bold text-[#3978C5]">In Progress</span>
                  <span>Resolved</span>
                </div>
              </div>

              {/* Triage Info */}
              <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E5EAF0] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#718096] block">Assigned Dept</span>
                  <span className="font-semibold text-[#183B66]">Road Infrastructure</span>
                </div>
                <PriorityBadge level="Critical" score={88} size="sm" />
              </div>

              <Link
                href="/track/CIVIC-2026-1001"
                className="w-full btn-secondary text-xs !py-2 justify-center"
              >
                <span>View Full Public Audit Trail</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#718096]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW URBANGUARD WORKS */}
      <section id="how-it-works" className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#3978C5] uppercase tracking-wider">
            Clear Four-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#183B66]">
            How Urbanguard Works
          </h2>
          <p className="text-sm text-[#718096]">
            Designed for transparency, fairness, and verifiable public outcomes from report to resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-clean p-6 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#EBF3FC] text-[#183B66] flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-[#183B66] text-base">Report an Issue</h3>
            <p className="text-xs text-[#718096] leading-relaxed">
              Submit your report in under a minute with a description, location, and optional photo. No complex paperwork required.
            </p>
          </div>

          <div className="card-clean p-6 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#EBF3FC] text-[#183B66] flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-[#183B66] text-base">AI Triage & Prioritize</h3>
            <p className="text-xs text-[#718096] leading-relaxed">
              Urbanguard analyzes safety risk, public impact, and detects duplicates to calculate an explainable priority score.
            </p>
          </div>

          <div className="card-clean p-6 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#EBF3FC] text-[#183B66] flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-[#183B66] text-base">Municipal Dispatch</h3>
            <p className="text-xs text-[#718096] leading-relaxed">
              Issues are automatically matched and dispatched directly to the responsible public works teams without bureaucratic delays.
            </p>
          </div>

          <div className="card-clean p-6 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#EBF3FC] text-[#183B66] flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h3 className="font-bold text-[#183B66] text-base">Track to Resolution</h3>
            <p className="text-xs text-[#718096] leading-relaxed">
              Follow every status update live with a transparent milestone log and receive confirmation when field work is verified.
            </p>
          </div>
        </div>
      </section>

      {/* 3. MAIN CIVIC COMPLAINT CATEGORIES */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#3978C5] uppercase tracking-wider">
              Municipal Services
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#183B66] mt-1">
              Main Complaint Categories
            </h2>
            <p className="text-sm text-[#718096] mt-1">
              Select an area to quickly report recurring civic issues in your neighborhood.
            </p>
          </div>
          <Link
            href="/submit"
            className="btn-secondary text-xs !py-2 self-start sm:self-auto"
          >
            <span>Start a Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                className="card-clean p-5 flex items-start gap-4 hover:border-[#CBD5E1] cursor-pointer"
                onClick={() => router.push(`/submit?category=${encodeURIComponent(cat.name)}`)}
              >
                <div className="p-2.5 rounded-lg bg-[#F1F5F9] text-[#183B66] shrink-0">
                  <Icon className="w-5 h-5 text-[#3978C5]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[#183B66] text-sm">{cat.name}</h3>
                    <span className="text-[11px] font-semibold text-[#718096]">
                      {cat.activeCount}
                    </span>
                  </div>
                  <p className="text-xs text-[#718096] leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. HOW AI HELPS PRIORITIZE COMPLAINTS */}
      <section className="card-clean p-8 sm:p-12 space-y-8 bg-white border border-[#E5EAF0]">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-[#3978C5] uppercase tracking-wider">
            Explainable Intelligence
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#183B66]">
            How AI Helps Prioritize Complaints
          </h2>
          <p className="text-sm text-[#718096] leading-relaxed">
            Rather than relying on arbitrary queues or manual sorting, Urbanguard calculates a transparent 0–100 priority score using four objective municipal factors:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E5EAF0] space-y-2">
            <span className="text-xs font-extrabold text-[#183B66] block">
              1. Safety Risk (0–40 pts)
            </span>
            <p className="text-xs text-[#718096] leading-relaxed">
              Detects hazard indicators like exposed electrical wires, deep craters, or structural collapse risks.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E5EAF0] space-y-2">
            <span className="text-xs font-extrabold text-[#183B66] block">
              2. Public Impact (0–25 pts)
            </span>
            <p className="text-xs text-[#718096] leading-relaxed">
              Assesses the size of the affected population based on proximity to schools, hospitals, transit, and main roads.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E5EAF0] space-y-2">
            <span className="text-xs font-extrabold text-[#183B66] block">
              3. Urgency & Time (0–20 pts)
            </span>
            <p className="text-xs text-[#718096] leading-relaxed">
              Evaluates the rate of deterioration, weather sensitivity, and unaddressed backlog age.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E5EAF0] space-y-2">
            <span className="text-xs font-extrabold text-[#183B66] block">
              4. Recurrence & Duplicates (0–15 pts)
            </span>
            <p className="text-xs text-[#718096] leading-relaxed">
              Clusters similar neighborhood reports together to identify systemic infrastructure hotspots.
            </p>
          </div>
        </div>
      </section>

      {/* 5. RECENT CITIZEN REPORTS SHOWCASE */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#3978C5] uppercase tracking-wider">
              Transparency Feed
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#183B66] mt-1">
              Recent Citizen Reports
            </h2>
          </div>
          <Link
            href="/my-complaints"
            className="text-xs font-semibold text-[#3978C5] hover:text-[#183B66] flex items-center gap-1"
          >
            <span>View All Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featuredComplaints.map((c) => (
            <div
              key={c.id}
              className="card-clean p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#718096]">
                    {c.reference_number}
                  </span>
                  <PriorityBadge level={c.priority_level} score={c.priority_score} size="sm" />
                </div>
                <h3 className="font-bold text-[#183B66] text-sm line-clamp-1">{c.title}</h3>
                <p className="text-xs text-[#718096] line-clamp-2 leading-relaxed">
                  {c.description}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-[#718096]">
                  <MapPin className="w-3.5 h-3.5 text-[#3978C5] shrink-0" />
                  <span className="truncate">{c.location_name}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5EAF0] flex items-center justify-between">
                <StatusBadge status={c.status} size="sm" />
                <Link
                  href={`/track/${c.reference_number}`}
                  className="text-xs font-semibold text-[#3978C5] hover:text-[#183B66] flex items-center gap-1"
                >
                  <span>Track</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. COMMUNITY IMPACT STATISTICS */}
      <section className="card-clean p-8 sm:p-10 bg-white border border-[#E5EAF0]">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
          <span className="text-xs font-bold text-[#3978C5] uppercase tracking-wider">
            Verifiable Outcomes
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#183B66]">
            Community Impact Statistics
          </h2>
          <p className="text-sm text-[#718096]">
            Real-time public works performance across municipal sectors.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E5EAF0]">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#183B66] block">
              {metrics.total}
            </span>
            <span className="text-xs font-semibold text-[#718096] mt-1 block">
              Incidents Logged
            </span>
          </div>

          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E5EAF0]">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 block">
              {metrics.resolved}
            </span>
            <span className="text-xs font-semibold text-[#718096] mt-1 block">
              Verified Resolved
            </span>
          </div>

          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E5EAF0]">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#3978C5] block">
              4.2h
            </span>
            <span className="text-xs font-semibold text-[#718096] mt-1 block">
              Avg. First Response
            </span>
          </div>

          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E5EAF0]">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#183B66] block">
              89%
            </span>
            <span className="text-xs font-semibold text-[#718096] mt-1 block">
              Citizen Satisfaction
            </span>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CALL TO ACTION */}
      <section className="rounded-xl p-8 sm:p-12 bg-[#183B66] text-white text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Make a Difference in Your Neighborhood
        </h2>
        <p className="text-sm text-slate-200 max-w-lg mx-auto leading-relaxed">
          Report a public issue today. Your submission is instantly organized, prioritized, and tracked through to resolution.
        </p>
        <div className="pt-2">
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#183B66] hover:bg-slate-100 font-bold text-sm rounded-lg shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-[#3978C5]" />
            <span>Submit a Civic Report</span>
          </Link>
        </div>
      </section>

    </div>
  );
}
