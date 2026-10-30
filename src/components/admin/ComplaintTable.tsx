'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { Complaint } from '@/types/civic';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatDate } from '@/lib/utils/formatters';

interface Props {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
}

export function ComplaintTable({ complaints, onSelectComplaint }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'priority_desc' | 'priority_asc'>('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter & Sort
  const processedComplaints = useMemo(() => {
    return complaints
      .filter((c) => {
        const matchesSearch =
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCat = categoryFilter === 'ALL' || c.category === categoryFilter;
        const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
        const matchesPriority = priorityFilter === 'ALL' || c.priority_level === priorityFilter;

        return matchesSearch && matchesCat && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'date_asc') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === 'priority_desc') {
          return b.priority_score - a.priority_score;
        }
        if (sortBy === 'priority_asc') {
          return a.priority_score - b.priority_score;
        }
        return 0;
      });
  }, [complaints, searchTerm, categoryFilter, statusFilter, priorityFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(processedComplaints.length / pageSize) || 1;
  const paginatedComplaints = processedComplaints.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-[#0f172a]/80 rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Search & Filter Bar */}
      <div className="p-5 border-b border-white/10 bg-[#090d16]/70 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5">
          {/* Search Box */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search reference, issue title, or street..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 text-xs bg-[#0b0f19] text-white placeholder-slate-500 focus:border-cyan-500/60 focus:outline-none transition-all"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3.5 py-2 rounded-xl border border-white/10 text-xs bg-[#0b0f19] text-slate-200 font-semibold focus:border-cyan-500/60 focus:outline-none"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="priority_desc">Highest Priority (Score)</option>
              <option value="priority_asc">Lowest Priority (Score)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filters:
          </span>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-xl border border-white/10 text-xs bg-[#0b0f19] text-slate-300 font-medium focus:border-cyan-500/60 focus:outline-none"
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

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-xl border border-white/10 text-xs bg-[#0b0f19] text-slate-300 font-medium focus:border-cyan-500/60 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="UNDER REVIEW">UNDER REVIEW</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN PROGRESS">IN PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-xl border border-white/10 text-xs bg-[#0b0f19] text-slate-300 font-medium focus:border-cyan-500/60 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical (≥80)</option>
            <option value="High">High (60-79)</option>
            <option value="Medium">Medium (35-59)</option>
            <option value="Low">Low (&lt;35)</option>
          </select>

          {(searchTerm || categoryFilter !== 'ALL' || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('ALL');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setCurrentPage(1);
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold ml-auto transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Complaints Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#090d16]/90 border-b border-white/10 text-slate-400 uppercase tracking-wider font-bold">
              <th className="py-3.5 px-4">Reference</th>
              <th className="py-3.5 px-4">Complaint Title & Location</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Assigned Dept</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedComplaints.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-500">
                  No complaints match your active filter criteria.
                </td>
              </tr>
            ) : (
              paginatedComplaints.map((comp) => (
                <tr
                  key={comp.id}
                  onClick={() => onSelectComplaint(comp)}
                  className="hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <td className="py-4 px-4 font-mono font-bold text-cyan-300 whitespace-nowrap">
                    {comp.reference_number}
                  </td>
                  <td className="py-4 px-4 max-w-xs">
                    <p className="font-bold text-white truncate text-sm" title={comp.title}>
                      {comp.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5" title={comp.location_name}>
                      📍 {comp.location_name}
                    </p>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-300">
                      <CategoryIcon category={comp.category} className="w-3.5 h-3.5 text-cyan-400" />
                      {comp.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <PriorityBadge level={comp.priority_level} score={comp.priority_score} />
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <StatusBadge status={comp.status} />
                  </td>
                  <td className="py-4 px-4 max-w-[160px] truncate text-slate-300 font-medium" title={comp.assigned_department || 'Unassigned'}>
                    {comp.assigned_department || <span className="text-slate-500 italic">Unassigned</span>}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                    {formatDate(comp.created_at)}
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectComplaint(comp);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-cyan-600 text-white font-bold text-xs transition-colors shadow-md"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Workbench
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-white/10 bg-[#090d16]/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          Showing <strong className="text-white">{paginatedComplaints.length}</strong> of{' '}
          <strong className="text-white">{processedComplaints.length}</strong> incidents
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
