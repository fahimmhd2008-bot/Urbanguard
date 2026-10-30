'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PlusCircle, Search, FileText } from 'lucide-react';
import type { Complaint } from '@/types/civic';
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
        if (mounted) {setComplaints(data);}
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) {setLoading(false);}
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
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#3978C5] uppercase tracking-wider">
            Citizen Ledger
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#183B66] mt-1">
            Track Complaints & Issues
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-0.5">
            Transparent milestone audit across all verified municipal submissions.
          </p>
        </div>

        <Link
          href="/submit"
          className="btn-primary text-xs !py-2.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report an Issue</span>
        </Link>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="card-clean p-4 space-y-3 bg-white border border-[#E5EAF0]">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E5EAF0] pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-[#183B66] text-white shadow-sm'
                : 'text-[#718096] hover:text-[#183B66] hover:bg-[#F1F5F9]'
            }`}
          >
            All Reports ({complaints.length})
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'ACTIVE'
                ? 'bg-[#3978C5] text-white shadow-sm'
                : 'text-[#718096] hover:text-[#183B66] hover:bg-[#F1F5F9]'
            }`}
          >
            Active In Progress ({complaints.filter((c) => c.status !== 'RESOLVED').length})
          </button>
          <button
            onClick={() => setActiveTab('RESOLVED')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'RESOLVED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[#718096] hover:text-[#183B66] hover:bg-[#F1F5F9]'
            }`}
          >
            Resolved ({complaints.filter((c) => c.status === 'RESOLVED').length})
          </button>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          <div className="sm:col-span-8 relative flex items-center">
            <Search className="w-4 h-4 text-[#A0AEC0] absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, reference code, or street location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E5EAF0] rounded-lg pl-9 pr-3.5 py-2 text-xs text-[#263445] placeholder-[#A0AEC0] focus:outline-none focus:border-[#3978C5] focus:bg-white transition-colors"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by Category"
              className="w-full bg-[#F8FAFC] border border-[#E5EAF0] rounded-lg px-3 py-2 text-xs text-[#263445] focus:outline-none focus:border-[#3978C5] focus:bg-white transition-colors"
            >
              <option value="ALL">All Categories</option>
              <option value="Roads">Roads & Potholes</option>
              <option value="Water and drainage">Water & Drainage</option>
              <option value="Waste management">Waste Management</option>
              <option value="Electricity and streetlights">Electricity & Lighting</option>
              <option value="Public infrastructure">Public Infrastructure</option>
              <option value="Public safety">Public Safety</option>
              <option value="Other">Other Issues</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <p className="text-sm font-semibold text-[#183B66]">Loading citizen reports...</p>
          <p className="text-xs text-[#718096]">Accessing Urbanguard municipal records.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-clean p-12 text-center space-y-3 bg-white border border-[#E5EAF0]">
          <FileText className="w-8 h-8 text-[#A0AEC0] mx-auto" />
          <h3 className="font-bold text-[#183B66] text-sm">No Reports Found</h3>
          <p className="text-xs text-[#718096] max-w-sm mx-auto">
            No complaints matched your search filter. Try clearing filters or submit a new report.
          </p>
          <div className="pt-2">
            <Link href="/submit" className="btn-primary text-xs !py-2">
              Submit a Report
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <ComplaintCard key={c.id} complaint={c} />
          ))}
        </div>
      )}
    </div>
  );
}
