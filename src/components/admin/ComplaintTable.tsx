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
import type { Complaint } from '@/types/civic';
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
    <div className="card-clean overflow-hidden bg-white border border-[#E5EAF0]">
      {/* Search & Filter Bar */}
      <div className="p-4 sm:p-5 border-b border-[#E5EAF0] bg-[#F8FAFC] space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#A0AEC0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search reference, issue, or street..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-[#E5EAF0] text-xs bg-white text-[#263445] placeholder-[#A0AEC0] focus:border-[#3978C5] focus:outline-none transition-colors"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-[#718096] flex items-center gap-1 whitespace-nowrap">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#3978C5]" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-1.5 rounded-lg border border-[#E5EAF0] text-xs bg-white text-[#263445] font-medium focus:border-[#3978C5] focus:outline-none"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="priority_desc">Highest Priority</option>
              <option value="priority_asc">Lowest Priority</option>
            </select>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[#718096] font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#3978C5]" /> Filter:
          </span>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-md border border-[#E5EAF0] text-xs bg-white text-[#263445] font-medium focus:border-[#3978C5] focus:outline-none"
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
            className="px-2.5 py-1.5 rounded-md border border-[#E5EAF0] text-xs bg-white text-[#263445] font-medium focus:border-[#3978C5] focus:outline-none"
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
            className="px-2.5 py-1.5 rounded-md border border-[#E5EAF0] text-xs bg-white text-[#263445] font-medium focus:border-[#3978C5] focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
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
              className="text-xs text-[#3978C5] hover:text-[#183B66] font-semibold ml-auto transition-colors"
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
            <tr className="bg-[#F8FAFC] border-b border-[#E5EAF0] text-[#718096] uppercase tracking-wider font-bold">
              <th className="py-3 px-4">Reference</th>
              <th className="py-3 px-4">Complaint Title & Location</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Assigned Dept</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5EAF0]">
            {paginatedComplaints.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#718096]">
                  No complaints match your active filter criteria.
                </td>
              </tr>
            ) : (
              paginatedComplaints.map((comp) => (
                <tr
                  key={comp.id}
                  onClick={() => onSelectComplaint(comp)}
                  className="hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-bold text-[#183B66] whitespace-nowrap">
                    {comp.reference_number}
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-bold text-[#263445] truncate text-xs" title={comp.title}>
                      {comp.title}
                    </p>
                    <p className="text-[11px] text-[#718096] truncate mt-0.5" title={comp.location_name}>
                      📍 {comp.location_name}
                    </p>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#718096]">
                      <CategoryIcon category={comp.category} className="w-3.5 h-3.5 text-[#3978C5]" />
                      <span>{comp.category}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <PriorityBadge level={comp.priority_level} score={comp.priority_score} size="sm" />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={comp.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 max-w-[150px] truncate text-[#718096]" title={comp.assigned_department || 'Unassigned'}>
                    {comp.assigned_department || <span className="text-[#A0AEC0] italic">Unassigned</span>}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-[#718096] text-[11px]">
                    {formatDate(comp.created_at)}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectComplaint(comp);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#EBF3FC] text-[#183B66] hover:bg-[#D0E2F6] font-semibold text-xs transition-colors"
                    >
                      <Eye className="w-3 h-3 text-[#3978C5]" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 border-t border-[#E5EAF0] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#718096]">
        <div>
          Showing <strong>{paginatedComplaints.length}</strong> of{' '}
          <strong>{processedComplaints.length}</strong> records
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded border border-[#E5EAF0] bg-white hover:bg-[#F8FAFC] disabled:opacity-40 text-[#263445] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-medium text-[#263445]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded border border-[#E5EAF0] bg-white hover:bg-[#F8FAFC] disabled:opacity-40 text-[#263445] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
