'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Complaint } from '@/types/civic';
import { complaintService } from '@/lib/data/complaintService';
import { ComplaintTable } from '@/components/admin/ComplaintTable';
import { ComplaintDetailModal } from '@/components/admin/ComplaintDetailModal';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await complaintService.getAllComplaints();
      setComplaints(data || []);
    } catch (err) {
      console.warn('Error loading complaints workbench data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin"
              className="text-xs text-slate-400 hover:text-white font-semibold inline-flex items-center gap-1.5 transition-colors px-3 py-1 rounded-xl bg-white/5 border border-white/10"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Municipal Complaint Workbench
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search, filter, assign departments, and orchestrate the full resolution lifecycle.
          </p>
        </div>

        <Link
          href="/submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all border border-cyan-400/30"
        >
          <PlusCircle className="w-4 h-4 text-cyan-200" /> Log Incident Ticket
        </Link>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="py-24 text-center text-sm text-slate-400">Loading complaints registry...</div>
      ) : (
        <ComplaintTable
          complaints={complaints}
          onSelectComplaint={(c) => setSelectedComplaint(c)}
        />
      )}

      {/* Action / Detail Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={Boolean(selectedComplaint)}
        onClose={() => setSelectedComplaint(null)}
        onUpdate={() => {
          loadData();
          if (selectedComplaint) {
            complaintService.getComplaintById(selectedComplaint.id).then(setSelectedComplaint);
          }
        }}
      />
    </div>
  );
}
