'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Copy,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Complaint } from '@/types/civic';
import { complaintService } from '@/lib/data/complaintService';
import { detectDuplicates, DuplicateCandidate } from '@/lib/ai/duplicateDetector';
import { ComplaintDetailModal } from '@/components/admin/ComplaintDetailModal';
import { PriorityBadge } from '@/components/common/PriorityBadge';

interface DuplicatePair {
  id: string;
  sourceComplaint: Complaint;
  candidateComplaint: Complaint;
  candidateInfo: DuplicateCandidate;
  reviewStatus: 'PENDING_REVIEW' | 'CONFIRMED_DUPLICATE' | 'REJECTED';
}

export default function AdminDuplicatesPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [pairs, setPairs] = useState<DuplicatePair[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await complaintService.getAllComplaints();
      setComplaints(data || []);

      // Run duplicate detection across all complaints
      const detectedPairs: DuplicatePair[] = [];
      const seenPairs = new Set<string>();

      for (const comp of (data || [])) {
      const candidates = detectDuplicates(
        {
          id: comp.id,
          title: comp.title,
          description: comp.description,
          category: comp.category,
          latitude: comp.latitude,
          longitude: comp.longitude,
          created_at: comp.created_at,
        },
        data,
        60
      );

      for (const cand of candidates) {
        const pairKey = [comp.id, cand.id].sort().join('::');
        if (!seenPairs.has(pairKey)) {
          seenPairs.add(pairKey);
          const matched = data.find((c) => c.id === cand.id);
          if (matched) {
            detectedPairs.push({
              id: pairKey,
              sourceComplaint: comp,
              candidateComplaint: matched,
              candidateInfo: cand,
              reviewStatus: 'PENDING_REVIEW',
            });
          }
        }
      }
    }

      setPairs(detectedPairs);
    } catch (err) {
      console.warn('Failed to load duplicate detection data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = (pairId: string, status: 'CONFIRMED_DUPLICATE' | 'REJECTED') => {
    setPairs((prev) =>
      prev.map((p) => (p.id === pairId ? { ...p, reviewStatus: status } : p))
    );
  };

  const filteredPairs = pairs.filter((p) => {
    if (filterStatus === 'ALL') return true;
    return p.reviewStatus === filterStatus;
  });

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
            AI Duplicate Detection & Merging Workbench
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review algorithmically correlated citizen incident reports. Both submissions remain traceable for public accountability.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              filterStatus === 'ALL'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            All Pairs ({pairs.length})
          </button>
          <button
            onClick={() => setFilterStatus('PENDING_REVIEW')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              filterStatus === 'PENDING_REVIEW'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            Pending Review ({pairs.filter((p) => p.reviewStatus === 'PENDING_REVIEW').length})
          </button>
          <button
            onClick={() => setFilterStatus('CONFIRMED_DUPLICATE')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              filterStatus === 'CONFIRMED_DUPLICATE'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            Confirmed ({pairs.filter((p) => p.reviewStatus === 'CONFIRMED_DUPLICATE').length})
          </button>
        </div>
      </div>

      {/* List of Duplicate Candidates */}
      {loading ? (
        <div className="py-24 text-center text-sm text-slate-400">
          Running spatial & semantic duplicate detector...
        </div>
      ) : filteredPairs.length === 0 ? (
        <div className="bg-[#0f172a]/80 rounded-3xl border border-white/10 p-12 text-center max-w-md mx-auto backdrop-blur-xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Duplicate Pairs in Queue</h3>
          <p className="text-xs text-slate-400 mt-1">
            All detected duplicate candidates have been reviewed or none match the active filter.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredPairs.map((pair) => (
            <div
              key={pair.id}
              className="bg-[#0f172a]/80 rounded-3xl border border-white/10 p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4"
            >
              {/* Pair Confidence Ribbon */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-xs px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                    <Copy className="w-3.5 h-3.5" />
                    {pair.candidateInfo.similarity_score}% Match Confidence
                  </span>
                  <span className="text-xs text-slate-400">
                    Proximity: <strong className="text-white">{pair.candidateInfo.distance_meters}m</strong> • Time gap:{' '}
                    <strong className="text-white">{pair.candidateInfo.time_diff_hours}h</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      pair.reviewStatus === 'CONFIRMED_DUPLICATE'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : pair.reviewStatus === 'REJECTED'
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {pair.reviewStatus.replace('_', ' ')}
                  </span>

                  {pair.reviewStatus === 'PENDING_REVIEW' && (
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={() => handleUpdateStatus(pair.id, 'CONFIRMED_DUPLICATE')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Duplicate
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(pair.id, 'REJECTED')}
                        className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject Match
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Match Explanation Text */}
              <div className="p-3 rounded-2xl bg-[#090d16]/90 border border-cyan-500/20 text-xs text-cyan-200">
                <strong className="text-cyan-400">Algorithmic Rationale:</strong> {pair.candidateInfo.explanation}
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Source Complaint */}
                <div className="p-4 rounded-2xl bg-[#090d16] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-cyan-300">
                      Report A: {pair.sourceComplaint.reference_number}
                    </span>
                    <PriorityBadge
                      level={pair.sourceComplaint.priority_level}
                      score={pair.sourceComplaint.priority_score}
                    />
                  </div>
                  <h4 className="font-bold text-white text-sm">{pair.sourceComplaint.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {pair.sourceComplaint.description}
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>📍 {pair.sourceComplaint.location_name}</span>
                    <button
                      onClick={() => setSelectedComplaint(pair.sourceComplaint)}
                      className="text-cyan-400 hover:text-cyan-300 font-bold"
                    >
                      Inspect Report A →
                    </button>
                  </div>
                </div>

                {/* Candidate Match Complaint */}
                <div className="p-4 rounded-2xl bg-[#090d16] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-cyan-300">
                      Report B: {pair.candidateComplaint.reference_number}
                    </span>
                    <PriorityBadge
                      level={pair.candidateComplaint.priority_level}
                      score={pair.candidateComplaint.priority_score}
                    />
                  </div>
                  <h4 className="font-bold text-white text-sm">{pair.candidateComplaint.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {pair.candidateComplaint.description}
                  </p>
                  <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>📍 {pair.candidateComplaint.location_name}</span>
                    <button
                      onClick={() => setSelectedComplaint(pair.candidateComplaint)}
                      className="text-cyan-400 hover:text-cyan-300 font-bold"
                    >
                      Inspect Report B →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
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
