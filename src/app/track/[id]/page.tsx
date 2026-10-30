'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Sparkles,
  AlertCircle,
  Share2,
  Check,
} from 'lucide-react';
import type { Complaint } from '@/types/civic';
import { complaintService } from '@/lib/data/complaintService';
import { TrackingTimeline } from '@/components/citizen/TrackingTimeline';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { formatDate } from '@/lib/utils/formatters';

export default function ComplaintTrackingPage() {
  const params = useParams();
  const id = params?.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (id) {
      setLoading(true);
      complaintService
        .getComplaintById(id)
        .then((found) => {
          if (mounted) {setComplaint(found);}
        })
        .catch(() => {
          if (mounted) {setComplaint(null);}
        })
        .finally(() => {
          if (mounted) {setLoading(false);}
        });
    }
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-[#718096] text-sm">Loading incident details from Urbanguard...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center card-clean p-8 bg-white border border-[#E5EAF0]">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[#183B66]">Report Not Found</h2>
        <p className="text-xs text-[#718096] mt-1.5 mb-5 leading-relaxed">
          No record matched reference &quot;{id}&quot;. Please verify the tracking number and try again.
        </p>
        <Link
          href="/my-complaints"
          className="btn-primary text-xs !py-2"
        >
          Return to My Reports
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Top back navigation & share */}
      <div className="flex items-center justify-between">
        <Link
          href="/my-complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#718096] hover:text-[#183B66] transition-colors px-3 py-1.5 rounded-lg bg-white border border-[#E5EAF0]"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#3978C5]" />
          <span>Back to All Reports</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5EAF0] bg-white text-[#718096] hover:text-[#183B66] text-xs font-semibold transition-colors"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-[#3978C5]" />}
          <span>{copiedLink ? 'Link Copied' : 'Share Link'}</span>
        </button>
      </div>

      {/* Main Complaint Header Card */}
      <div className="card-clean p-6 sm:p-8 space-y-4 bg-white border border-[#E5EAF0]">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#E5EAF0]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-[#183B66] bg-[#F1F5F9] px-3 py-1 rounded-md border border-[#E5EAF0]">
              {complaint.reference_number}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#F8FAFC] text-[#718096] border border-[#E5EAF0]">
              <CategoryIcon category={complaint.category} className="w-3.5 h-3.5 text-[#3978C5]" />
              <span>{complaint.category}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <PriorityBadge level={complaint.priority_level} score={complaint.priority_score} size="sm" />
            <StatusBadge status={complaint.status} size="sm" />
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-[#183B66]">
          {complaint.title}
        </h1>

        <p className="text-xs sm:text-sm text-[#718096] leading-relaxed">
          {complaint.description}
        </p>

        {/* Location & Meta info */}
        <div className="pt-3 border-t border-[#E5EAF0] flex flex-wrap items-center gap-4 text-xs text-[#718096]">
          <span className="inline-flex items-center gap-1.5 font-medium text-[#263445]">
            <MapPin className="w-3.5 h-3.5 text-[#3978C5] shrink-0" />
            <span>{complaint.location_name}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#A0AEC0] shrink-0" />
            <span>Reported {formatDate(complaint.created_at)}</span>
          </span>
        </div>
      </div>

      {/* Photo Evidence if uploaded */}
      {complaint.image_url && (
        <div className="card-clean p-5 space-y-3 bg-white border border-[#E5EAF0]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#183B66]">
            Submitted Photo Evidence
          </h3>
          <div className="rounded-lg overflow-hidden border border-[#E5EAF0] max-h-72 bg-[#F8FAFC] flex items-center justify-center">
            <img
              src={complaint.image_url}
              alt="Photo evidence"
              className="max-h-72 w-full object-cover"
            />
          </div>
        </div>
      )}

      {/* AI Structured Summary */}
      {complaint.ai_summary && (
        <div className="p-4 sm:p-5 rounded-lg bg-[#EBF3FC] border border-[#D0E2F6] flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#3978C5] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-[#183B66]">Urbanguard Triage Summary</h3>
            <p className="text-xs text-[#263445] leading-relaxed">
              {complaint.ai_summary}
            </p>
          </div>
        </div>
      )}

      {/* Real-time Tracking Timeline */}
      <TrackingTimeline
        currentStatus={complaint.status}
        history={complaint.status_history}
        assignedDepartment={complaint.assigned_department}
        assignedTo={complaint.assigned_to}
        resolvedAt={complaint.resolved_at}
        createdAt={complaint.created_at}
      />
    </div>
  );
}
