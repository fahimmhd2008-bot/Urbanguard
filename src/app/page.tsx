'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  PlusCircle,
  Search,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  Clock,
  Layers,
  AlertTriangle,
  Car,
  Droplets,
  Trash2,
  Zap,
  Building2,
  ShieldAlert,
  Activity,
  ArrowUpRight,
  Sliders,
  Cpu,
  Eye,
} from 'lucide-react';
import { complaintService } from '@/lib/data/complaintService';
import { Complaint } from '@/types/civic';
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

  const [loadingFeed, setLoadingFeed] = useState(true);

  useEffect(() => {
    let mounted = true;

    complaintService
      .getMetrics()
      .then((res) => {
        if (mounted && res) setMetrics(res);
      })
      .catch((err) => {
        console.warn('Failed to load metrics:', err);
      });

    complaintService
      .getAllComplaints()
      .then((res) => {
        if (mounted && Array.isArray(res)) {
          // Pick 3 high-impact complaints for the live feed showcase
          setFeaturedComplaints(res.slice(0, 3));
        }
      })
      .catch((err) => {
        console.warn('Failed to load featured complaints:', err);
      })
      .finally(() => {
        if (mounted) setLoadingFeed(false);
      });

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
      desc: 'Deep craters, structural asphalt breakdown, and hazardous speed bumps.',
      icon: Car,
      gradient: 'from-amber-500/20 to-orange-500/5',
      iconColor: 'text-amber-400',
      borderColor: 'hover:border-amber-500/40',
      activeCount: '12 active',
    },
    {
      name: 'Water & Drainage',
      desc: 'Submerged roads, contaminated mains, burst water lines, and sewage spills.',
      icon: Droplets,
      gradient: 'from-cyan-500/20 to-blue-500/5',
      iconColor: 'text-cyan-400',
      borderColor: 'hover:border-cyan-500/40',
      activeCount: '8 active',
    },
    {
      name: 'Waste Management',
      desc: 'Commercial dumpster overflow, hazardous littering, and health risks.',
      icon: Trash2,
      gradient: 'from-emerald-500/20 to-teal-500/5',
      iconColor: 'text-emerald-400',
      borderColor: 'hover:border-emerald-500/40',
      activeCount: '7 active',
    },
    {
      name: 'Electricity & Lighting',
      desc: 'Dark pedestrian alleys, arcing transformers, and exposed high-voltage wiring.',
      icon: Zap,
      gradient: 'from-yellow-500/20 to-amber-500/5',
      iconColor: 'text-yellow-400',
      borderColor: 'hover:border-yellow-500/40',
      activeCount: '6 active',
    },
    {
      name: 'Public Infrastructure',
      desc: 'Damaged footbridges, buckled sidewalks, and fractured retention walls.',
      icon: Building2,
      gradient: 'from-indigo-500/20 to-purple-500/5',
      iconColor: 'text-indigo-400',
      borderColor: 'hover:border-indigo-500/40',
      activeCount: '5 active',
    },
    {
      name: 'Public Safety Hazards',
      desc: 'Missing manhole covers, unguarded trenches, and waterlogged electric boxes.',
      icon: ShieldAlert,
      gradient: 'from-rose-500/20 to-red-500/5',
      iconColor: 'text-rose-400',
      borderColor: 'hover:border-rose-500/40',
      activeCount: '4 critical',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'CAPTURE',
      desc: 'High-precision GPS geolocation pin, photographic evidence upload, and structured citizen input.',
      badge: 'Multimodal Input',
    },
    {
      step: '02',
      title: 'UNDERSTAND',
      desc: 'Real-time NLP engine extracts 4-part facts (What, Where, Impact, Action) and maps municipal jurisdiction.',
      badge: 'NLP Classifier',
    },
    {
      step: '03',
      title: 'REVEAL',
      desc: 'Haversine clustering detects spatial hotspots and groups duplicates to eliminate backlogs.',
      badge: 'Spatial Clustering',
    },
    {
      step: '04',
      title: 'ACT',
      desc: 'Deterministic 0-100 explainable scoring determines urgency based on safety risk, impact, and frequency.',
      badge: 'Explainable AI',
    },
    {
      step: '05',
      title: 'RESOLVE',
      desc: 'Work orders dispatch directly to department crews with live public status telemetry.',
      badge: 'Verified Outcome',
    },
  ];

  return (
    <div className="space-y-24 sm:space-y-32 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-6 sm:pt-14 pb-12 sm:pb-20">
        {/* Ambient radial blur behind hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/25 via-cyan-500/20 to-indigo-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Top Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/70 border border-blue-500/30 text-blue-300 text-xs font-semibold shadow-lg shadow-blue-900/30 backdrop-blur-md">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span>Autonomous Municipal Action Platform • v2.4</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Turning Citizen Voice into{' '}
              <span className="text-gradient-blue">Intelligent Public Action</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
              No more forgotten complaints or bureaucratic black holes. CivicAI classifies, groups duplicates, calculates explainable priority scores, and coordinates municipal crews in real time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/submit"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-blue-600/30 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-cyan-400/30"
              >
                <PlusCircle className="w-5 h-5 text-cyan-200" />
                Report Civic Incident
              </Link>

              <Link
                href="/admin"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#131b2e]/80 hover:bg-[#1a253f] text-slate-200 hover:text-white font-semibold text-sm border border-white/10 hover:border-white/20 transition-all duration-200 backdrop-blur-md"
              >
                <Cpu className="w-4 h-4 text-purple-400" />
                Admin Command Center
              </Link>
            </div>

            {/* Quick Live Tracking Bar */}
            <div className="pt-4 max-w-lg">
              <form onSubmit={handleTrackSubmit} className="relative flex items-center group">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="text"
                  value={referenceQuery}
                  onChange={(e) => setReferenceQuery(e.target.value)}
                  placeholder="Enter Reference Number (e.g. CIVIC-2026-1001)"
                  className="w-full pl-11 pr-28 py-3.5 rounded-2xl bg-[#0e1526]/90 border border-white/10 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-md shadow-blue-600/20"
                >
                  Track
                </button>
              </form>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-2.5">
                <span>Try active demos:</span>
                <button
                  type="button"
                  onClick={() => setReferenceQuery('CIVIC-2026-1001')}
                  className="text-cyan-400 hover:text-cyan-300 font-mono underline underline-offset-2"
                >
                  CIVIC-2026-1001
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setReferenceQuery('CIVIC-2026-1006')}
                  className="text-cyan-400 hover:text-cyan-300 font-mono underline underline-offset-2"
                >
                  CIVIC-2026-1006
                </button>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Live Simulated Intelligence Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl bg-gradient-to-b from-[#131b2e] to-[#0c1220] p-6 border border-white/15 shadow-2xl shadow-black/80 backdrop-blur-2xl">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Live AI Triage Engine
                    </h4>
                    <p className="text-[10px] text-slate-400">Deterministic scoring active</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  SCORE 88/100 • CRITICAL
                </span>
              </div>

              {/* Simulated Card Content */}
              <div className="py-5 space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase">
                    Incident Digest
                  </span>
                  <h3 className="text-sm font-semibold text-slate-100 mt-0.5">
                    Submerged Electrical Conduit & Sewage Overflow
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Main sewer line burst flooding North Metro subway entrance; water has breached an underground commercial power transformer box.
                  </p>
                </div>

                {/* Score Breakdown Bars */}
                <div className="p-3.5 rounded-2xl bg-[#090d16]/80 border border-white/5 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      Public Safety Risk
                    </span>
                    <span className="font-mono font-bold text-rose-400">38 / 40</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-rose-500 h-full rounded-full w-[95%]" />
                  </div>

                  <div className="flex items-center justify-between text-slate-300 pt-1">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Activity className="w-3.5 h-3.5 text-amber-400" />
                      Infrastructure Impact
                    </span>
                    <span className="font-mono font-bold text-amber-400">22 / 25</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full w-[88%]" />
                  </div>
                </div>

                {/* Routed Department Pill */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-400 text-[11px]">Auto-Routed Department:</span>
                  <span className="px-2.5 py-1 rounded-xl bg-blue-500/15 text-blue-300 border border-blue-500/30 font-semibold text-[11px]">
                    Municipal Water & Sewage
                  </span>
                </div>
              </div>

              {/* Live Status Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Crew Dispatched (ETA: 22m)</span>
                </div>
                <Link
                  href="/track/CIVIC-2026-1006"
                  className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  View Details <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Live Municipal Metrics Strip */}
        <div className="mt-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-3xl bg-[#0f172a]/70 border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="p-3 text-center">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                {metrics.total}
              </span>
              <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">
                Logged Incidents
              </p>
            </div>
            <div className="p-3 text-center border-l border-white/10">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
                {metrics.resolved}
              </span>
              <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">
                Verified Outcomes
              </p>
            </div>
            <div className="p-3 text-center border-l border-white/10">
              <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
                {metrics.inProgress}
              </span>
              <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">
                Active Field Crews
              </p>
            </div>
            <div className="p-3 text-center border-l border-white/10">
              <span className="text-3xl sm:text-4xl font-black text-rose-400 font-mono tracking-tight">
                {metrics.critical}
              </span>
              <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">
                Critical Safety Alerts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSED-LOOP GOVERNANCE (How It Works) */}
      <section className="space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 px-3.5 py-1 rounded-full border border-cyan-500/30">
            <Layers className="w-3.5 h-3.5" />
            Closed-Loop Governance Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            How CivicAI Delivers Verifiable Action
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            From the instant a citizen pins an issue to the final post-repair verification, every step is transparent, explainable, and accountable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((st) => (
            <div
              key={st.step}
              className="p-5 rounded-3xl bg-[#0f172a]/60 border border-white/10 backdrop-blur-md hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-cyan-400 group-hover:scale-110 transition-transform">
                    {st.step}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                    {st.badge}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base mb-2 tracking-wide">{st.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RECENT LIVE COMPLAINT FEED PREVIEW */}
      {featuredComplaints.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Real-Time City Pulse
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1">Live Civic Complaints</h2>
            </div>
            <Link
              href="/my-complaints"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View All 42 Incidents <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredComplaints.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-3xl bg-[#0f172a]/60 border border-white/10 hover:border-white/20 transition-all duration-200 backdrop-blur-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {c.reference_number}
                    </span>
                    <PriorityBadge priority={c.priority} score={c.priority_score} />
                  </div>
                  <h3 className="font-bold text-white text-sm line-clamp-1">{c.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{c.location_address}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                  <StatusBadge status={c.status} />
                  <Link
                    href={`/track/${c.reference_number}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    Track <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ISSUE CATEGORIES SECTION */}
      <section className="space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-950/60 px-3.5 py-1 rounded-full border border-blue-500/30">
            Municipal Scope
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Six Core Civic Domains
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Our autonomous NLP models map incoming citizen reports directly to the municipal departments responsible for remediation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                className={`p-6 rounded-3xl bg-gradient-to-b ${cat.gradient} border border-white/10 ${cat.borderColor} backdrop-blur-xl shadow-lg transition-all duration-300 flex flex-col justify-between group`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${cat.iconColor} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                      {cat.activeCount}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-lg tracking-wide group-hover:text-cyan-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-300/80 leading-relaxed">{cat.desc}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5">
                  <Link
                    href="/submit"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors"
                  >
                    Report in this category <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* EXPLAINABLE AI ARCHITECTURE SECTION */}
      <section>
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-[#131b2e] to-[#090d16] border border-white/15 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/70 px-3.5 py-1 rounded-full border border-cyan-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Explainable AI Governance
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Deterministic Math, Not a Black-Box Chatbot
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Civic decisions require public trust. CivicAI pairs robust NLP with verifiable, reproducible backend scoring. Every decision can be audited, explained to a citizen, and tracked in municipal records.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4">
              <div className="p-4 rounded-2xl bg-[#090d16]/80 border border-white/10 space-y-1.5">
                <strong className="text-cyan-300 text-sm block">4-Factor Priority Score</strong>
                <span className="text-slate-400 leading-relaxed">
                  Calculates Safety Risk (0-40), Public Impact (0-25), Urgency (0-20), and Duplicate Cluster Frequency (0-15) for total score 0-100.
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#090d16]/80 border border-white/10 space-y-1.5">
                <strong className="text-cyan-300 text-sm block">Multi-Factor Duplicate Filter</strong>
                <span className="text-slate-400 leading-relaxed">
                  Identifies duplicate complaints using text token similarity, Haversine geo-distance, and category matching without discarding citizen voices.
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#090d16]/80 border border-white/10 space-y-1.5">
                <strong className="text-cyan-300 text-sm block">Audited Priority Overrides</strong>
                <span className="text-slate-400 leading-relaxed">
                  Municipal officials cannot secretly change scores. Any override requires an audit-logged administrative justification.
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[#090d16]/80 border border-white/10 space-y-1.5">
                <strong className="text-cyan-300 text-sm block">Spatial Hotspot Intelligence</strong>
                <span className="text-slate-400 leading-relaxed">
                  Aggregates neighborhood complaints into density clusters to guide capital budget planning and recurring drainage overhauls.
                </span>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all border border-blue-400/30"
              >
                Open Municipal Command Center <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
