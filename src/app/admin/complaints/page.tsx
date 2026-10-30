'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import type { Complaint } from '@/types/civic';
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
    } catch {
      // Continue
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/admin"
              className="text-xs text-[#718096] hover:text-[#183B66] font-semibold inline-flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded-md bg-white border border-[#E5EAF0]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#3978C5]" /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#183B66]">
            Complaints Management
          </h1>
          <p className="text-xs text-[#718096] mt-0.5">
            Filter, search, assign municipal departments, and manage the complete resolution lifecycle.
          </p>
        </div>

        <Link
          href="/submit"
          className="btn-primary text-xs !py-2.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#718096]">Loading complaints registry...</div>
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
