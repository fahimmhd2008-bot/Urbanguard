'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Sparkles,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { Complaint } from '@/types/civic';
import { complaintService } from '@/lib/data/complaintService';
import { TrackingTimeline } from '@/components/citizen/TrackingTimeline';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { formatDate } from '@/lib/utils/formatters';

export default function ComplaintTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (id) {
      setLoading(true);
      complaintService
        .getComplaintById(id)
        .then((found) => {
          if (mounted) setComplaint(found);
        })
        .catch((err) => {
          console.warn('Error loading complaint:', err);
          if (mounted) setComplaint(null);
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    }
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <p className="text-slate-400 text-sm">Retrieving real-time incident telemetry...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center bg-[#0f172a]/80 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Complaint Not Located</h2>
        <p className="text-xs text-slate-400 mt-2 mb-6">
          No municipal record matches identifier &quot;{id}&quot;. Please verify your tracking reference.
        </p>
        <Link
          href="/my-complaints"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-bold shadow-md hover:from-blue-500 hover:to-cyan-500 transition-colors"
        >
          Return to My Complaints
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Tracking link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-8">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/my-complaints"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-xl bg-white/5 border border-white/10"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" /> Back to My Complaints
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <Share2 className="w-3.5 h-3.5 text-cyan-400" /> Share Live Tracking Link
        </button>
      </div>

      {/* Main Complaint Header Card */}
      <div className="bg-[#0f172a]/80 rounded-3xl border border-white/10 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-extrabold text-cyan-300 bg-cyan-950/70 px-3.5 py-1 rounded-xl border border-cyan-500/30">
              {complaint.reference_number}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-slate-300 border border-white/10">
              <CategoryIcon category={complaint.category} className="w-3.5 h-3.5 text-cyan-400" />
              {complaint.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <PriorityBadge level={complaint.priority_level} score={complaint.priority_score} />
            <StatusBadge status={complaint.status} size="md" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
          {complaint.title}
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed">
          {complaint.description}
        </p>

        {/* Location & Meta info */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-5 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-300">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            {complaint.location_name} ({complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)})
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            Filed {formatDate(complaint.created_at)}
          </span>
        </div>
      </div>

      {/* Photo Evidence if uploaded */}
      {complaint.image_url && (
        <div className="bg-[#0f172a]/80 rounded-3xl border border-white/10 p-6 shadow-2xl backdrop-blur-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Submitted Photographic Evidence
          </h3>
          <div className="rounded-2xl overflow-hidden border border-white/10 max-h-80 bg-slate-950 flex items-center justify-center">
            <img
              src={complaint.image_url}
              alt="Photo evidence"
              className="max-h-80 w-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Factual AI Digest */}
      {complaint.ai_summary && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/70 to-indigo-950/70 border border-cyan-500/30 flex items-start gap-4 backdrop-blur-xl shadow-xl">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-cyan-300">CivicAI Structured Digest</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
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
