'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, RotateCcw, Sparkles, Activity, CheckCircle2 } from 'lucide-react';
import { complaintService } from '@/lib/data/complaintService';

export function Footer() {
  const handleResetData = () => {
    if (confirm('Reset demonstration database to the 42 original realistic sample complaints?')) {
      complaintService.resetToInitialData();
      window.location.reload();
    }
  };

  const lifecycleStages = [
    { name: 'CAPTURE', desc: 'Citizen report & precision GPS coordinate pinning', color: 'from-blue-500/20 to-blue-600/10' },
    { name: 'UNDERSTAND', desc: 'Real-time NLP classification & municipal routing', color: 'from-cyan-500/20 to-cyan-600/10' },
    { name: 'REVEAL', desc: 'Spatial cluster hotspot detection & duplicate grouping', color: 'from-indigo-500/20 to-indigo-600/10' },
    { name: 'ACT', desc: 'Deterministic 4-factor explainable priority scoring', color: 'from-purple-500/20 to-purple-600/10' },
    { name: 'RESOLVE', desc: 'Field crew dispatch, verification & citizen feedback', color: 'from-emerald-500/20 to-emerald-600/10' },
  ];

  return (
    <footer className="w-full bg-[#070b14] border-t border-white/10 text-slate-400 mt-20 relative z-10">
      {/* Lifecycle Flow Ribbon */}
      <div className="bg-[#0b101d]/90 border-b border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <p className="text-center text-xs font-extrabold uppercase tracking-widest text-cyan-400">
              CivicAI Closed-Loop Municipal Lifecycle
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {lifecycleStages.map((stage, idx) => (
              <div
                key={stage.name}
                className={`p-3.5 rounded-2xl bg-gradient-to-b ${stage.color} border border-white/10 backdrop-blur-md hover:border-white/20 transition-all duration-200`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-white">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-cyan-300 text-[11px] font-mono flex items-center justify-center border border-white/10">
                    {idx + 1}
                  </span>
                  <span className="tracking-wider">{stage.name}</span>
                </div>
                <p className="text-[11px] text-slate-300/80 mt-2 leading-relaxed">{stage.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand & Mission */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-black text-xl text-white tracking-tight">
                Civic<span className="text-gradient-blue">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-lg leading-relaxed">
              Autonomous civic intelligence architecture designed to turn unstructured public complaints into explainable, prioritized municipal workflows with verifiable real-world outcomes.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
              <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                PostgreSQL Engine Active
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                <Activity className="w-3 h-3" />
                Deterministic Scoring
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Closed-Loop Verified
              </span>
            </div>
          </div>

          {/* Citizen Portal */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Citizen Gateway
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/submit" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Report a Civic Issue
                </Link>
              </li>
              <li>
                <Link href="/my-complaints" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Citizen Tracking Portal
                </Link>
              </li>
              <li>
                <Link href="/" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Platform Architecture
                </Link>
              </li>
              <li>
                <Link href="/track/CIVIC-2026-1001" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Live Resolution Timeline Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Administration & Controls */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Command & Intelligence
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/admin" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Municipal Command Center
                </Link>
              </li>
              <li>
                <Link href="/admin/map" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Spatial Hotspot Density Map
                </Link>
              </li>
              <li>
                <Link href="/admin/duplicates" className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Duplicate Cluster Merging
                </Link>
              </li>
              <li className="pt-3">
                <button
                  onClick={handleResetData}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 transition-all duration-200"
                  title="Reload 42 pre-seeded realistic complaints"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  Reset Demonstration Dataset
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CivicAI Autonomous Public Infrastructure Engine.</p>
          <p className="font-mono text-[11px] text-slate-400">Zero-Bias • Transparent AI • Real-Time Action</p>
        </div>
      </div>
    </footer>
  );
}
