'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PlusCircle, Search, FileText, CheckCircle2 } from 'lucide-react';
import { Complaint } from '@/types/civic';
import { complaintService } from '@/lib/data/complaintService';
import { ComplaintCard } from '@/components/citizen/ComplaintCard';

export default function MyComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    complaintService
      .getAllComplaints()
      .then((data) => {
        if (mounted) setComplaints(data);
      })
      .catch((err) => {
        console.warn('Failed to load complaints in my-complaints:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = categoryFilter === 'ALL' || c.category === categoryFilter;

      let matchesTab = true;
      if (activeTab === 'ACTIVE') {
        matchesTab = c.status !== 'RESOLVED';
      } else if (activeTab === 'RESOLVED') {
        matchesTab = c.status === 'RESOLVED';
      }

      return matchesSearch && matchesCat && matchesTab;
    });
  }, [complaints, searchTerm, categoryFilter, activeTab]);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 px-3 py-0.5 rounded-full border border-cyan-500/30">
            Citizen Ledger
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-2">
            Public Incident Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time telemetry and milestone verification across all submitted municipal complaints.
          </p>
        </div>

        <Link
          href="/submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all border border-cyan-400/30"
        >
          <PlusCircle className="w-4 h-4 text-cyan-200" />
          Submit New Report
        </Link>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="bg-[#0f172a]/80 rounded-3xl border border-white/10 p-4 sm:p-5 shadow-xl backdrop-blur-xl space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All Incidents ({complaints.length})
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'ACTIVE'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Active Field Ops ({complaints.filter((c) => c.status !== 'RESOLVED').length})
          </button>
          <button
            onClick={() => setActiveTab('RESOLVED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'RESOLVED'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Verified Resolved ({complaints.filter((c) => c.status === 'RESOLVED').length})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by reference ID, title keyword, or street location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090d16]/90 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
            />
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#090d16]/90 border border-white/10 text-xs text-slate-300 font-semibold focus:border-cyan-500/60 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Roads">Roads & Potholes</option>
              <option value="Water and drainage">Water & Drainage</option>
              <option value="Waste management">Waste Management</option>
              <option value="Electricity and streetlights">Electricity & Lights</option>
              <option value="Public infrastructure">Public Infrastructure</option>
              <option value="Public safety">Public Safety</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Grid */}
      {loading ? (
        <div className="py-24 text-center text-sm text-slate-400 font-medium">
          Loading municipal complaints registry...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0f172a]/80 rounded-3xl border border-white/10 p-12 text-center max-w-md mx-auto backdrop-blur-xl">
          <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Complaints Matched</h3>
          <p className="text-xs text-slate-400 mt-1 mb-6 leading-relaxed">
            There are no incident records matching your active search query or category filter.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-xs shadow-md hover:from-blue-500 hover:to-cyan-500 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-cyan-200" /> File a New Complaint
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((comp) => (
            <ComplaintCard key={comp.id} complaint={comp} />
          ))}
        </div>
      )}
    </div>
  );
}
