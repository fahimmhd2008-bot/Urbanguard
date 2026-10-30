'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  Users,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Building,
  UserCheck,
  Edit3,
  ExternalLink,
  Save,
  MessageSquare,
} from 'lucide-react';
import { Complaint, ComplaintStatus, PriorityLevel } from '@/types/civic';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatDate } from '@/lib/utils/formatters';
import { complaintService } from '@/lib/data/complaintService';

interface Props {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const DEPARTMENTS = [
  'Road Infrastructure & Maintenance',
  'Water Supply and Drainage Board',
  'Solid Waste Management Corporation',
  'Municipal Electrical Department',
  'Public Works & Safety Inspection',
  'General Municipal Administration',
];

const ALLOWED_STATUS_FLOW: ComplaintStatus[] = [
  'SUBMITTED',
  'UNDER REVIEW',
  'ASSIGNED',
  'IN PROGRESS',
  'RESOLVED',
];

export function ComplaintDetailModal({ complaint, isOpen, onClose, onUpdate }: Props) {
  if (!complaint) return null;

  // Status update state
  const [targetStatus, setTargetStatus] = useState<ComplaintStatus>(complaint.status);
  const [publicMessage, setPublicMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Department assignment state
  const [selectedDept, setSelectedDept] = useState(complaint.assigned_department || DEPARTMENTS[0]);
  const [assignedLead, setAssignedLead] = useState(complaint.assigned_to || '');
  const [assigning, setAssigning] = useState(false);

  // Priority override state
  const [showOverride, setShowOverride] = useState(false);
  const [overrideScore, setOverrideScore] = useState(complaint.priority_score);
  const [overrideReason, setOverrideReason] = useState('');
  const [savingOverride, setSavingOverride] = useState(false);

  const aiAnalysis = complaint.ai_analysis;
  const priorityBreakdown = aiAnalysis?.priority_breakdown;

  // Handle Status Update
  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicMessage.trim()) {
      alert('Please provide a citizen-facing update message explaining this status change.');
      return;
    }
    try {
      setStatusUpdating(true);
      await complaintService.updateStatus(
        complaint.id,
        targetStatus,
        'Admin Supervisor',
        publicMessage,
        internalNote
      );
      setPublicMessage('');
      setInternalNote('');
      onUpdate();
    } finally {
      setStatusUpdating(false);
    }
  };

  // Handle Department Assignment
  const handleAssignDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAssigning(true);
      await complaintService.assignDepartment(
        complaint.id,
        selectedDept,
        assignedLead || 'Field Team Alpha',
        'Admin Supervisor',
        'Direct departmental routing from management workbench'
      );
      onUpdate();
    } finally {
      setAssigning(false);
    }
  };

  // Handle Priority Override
  const handleOverridePriority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      alert('A mandatory administrative rationale is required to override the AI priority assessment.');
      return;
    }
    try {
      setSavingOverride(true);
      await complaintService.overridePriority(
        complaint.id,
        Number(overrideScore),
        overrideReason,
        'Admin Supervisor'
      );
      setShowOverride(false);
      setOverrideReason('');
      onUpdate();
    } finally {
      setSavingOverride(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Complaint Workbench: ${complaint.reference_number}`}
      subtitle={`Submitted by ${complaint.user_name || 'Citizen'} on ${formatDate(complaint.created_at)}`}
      maxWidth="4xl"
    >
      <div className="space-y-6 text-sm">
        {/* Top Header Card */}
        <div className="bg-[#090d16]/90 p-5 sm:p-6 rounded-3xl border border-white/10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/70 px-3 py-1 rounded-xl border border-cyan-500/30">
                {complaint.reference_number}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-300">
                <CategoryIcon category={complaint.category} className="w-3.5 h-3.5 text-cyan-400" />
                {complaint.category}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <PriorityBadge level={complaint.priority_level} score={complaint.priority_score} />
              <StatusBadge status={complaint.status} size="md" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">{complaint.title}</h2>
          <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">{complaint.description}</p>

          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-300">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              {complaint.location_name} ({complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)})
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-500">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              {formatDate(complaint.created_at)}
            </span>
            {complaint.user_email && (
              <span className="inline-flex items-center gap-1.5 text-slate-500">
                <Users className="w-4 h-4 text-slate-500 shrink-0" />
                {complaint.user_email}
              </span>
            )}
          </div>
        </div>

        {/* Photo Evidence if present */}
        {complaint.image_url && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Photo Evidence Uploaded by Citizen
            </h4>
            <div className="rounded-2xl overflow-hidden border border-white/10 max-h-72 bg-slate-950 flex items-center justify-center">
              <img
                src={complaint.image_url}
                alt="Complaint evidence"
                className="max-h-72 w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* AI INTELLIGENCE BREAKDOWN SECTION */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-blue-950/70 to-indigo-950/70 border border-cyan-500/30 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-300 font-extrabold text-base">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>CivicAI Decision Engine Assessment</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/30">
              Model: {aiAnalysis?.model_information || 'CivicAI-Deterministic-NLP-v2'}
            </span>
          </div>

          {/* 4-Part Structured AI Summary */}
          <div className="bg-[#090d16]/90 rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Factual 4-Part Incident Summary
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <strong className="text-white block mb-1">What Happened:</strong>
                <span className="text-slate-300">{aiAnalysis?.summary.what || complaint.title}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <strong className="text-white block mb-1">Where:</strong>
                <span className="text-slate-300">{aiAnalysis?.summary.where || complaint.location_name}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <strong className="text-white block mb-1">Who/What is Affected:</strong>
                <span className="text-slate-300">{aiAnalysis?.summary.impact || 'Local pedestrians and commuters'}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <strong className="text-white block mb-1">Recommended Remediation:</strong>
                <span className="text-slate-300">{aiAnalysis?.summary.action || 'On-site municipal team inspection'}</span>
              </div>
            </div>
          </div>

          {/* Explainable Priority Scoring Breakdown */}
          <div className="bg-[#090d16]/90 rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Explainable Priority Score Breakdown (0 - 100)
                </h5>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calculated by deterministic backend logic from validated incident factors
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOverride(!showOverride)}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {showOverride ? 'Cancel Override' : 'Admin Override'}
              </button>
            </div>

            {/* Visual Score Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                  <span>Safety Risk</span>
                  <span className="text-rose-400 font-mono">{priorityBreakdown?.safety_risk ?? 20}/40</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-1.5 rounded-full"
                    style={{ width: `${((priorityBreakdown?.safety_risk ?? 20) / 40) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                  <span>Public Impact</span>
                  <span className="text-cyan-400 font-mono">{priorityBreakdown?.public_impact ?? 15}/25</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-1.5 rounded-full"
                    style={{ width: `${((priorityBreakdown?.public_impact ?? 15) / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                  <span>Urgency</span>
                  <span className="text-amber-400 font-mono">{priorityBreakdown?.urgency ?? 12}/20</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full"
                    style={{ width: `${((priorityBreakdown?.urgency ?? 12) / 20) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                  <span>Related Freq.</span>
                  <span className="text-purple-400 font-mono">{priorityBreakdown?.frequency_score ?? 8}/15</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-1.5 rounded-full"
                    style={{ width: `${((priorityBreakdown?.frequency_score ?? 8) / 15) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Text Rationale */}
            <div className="p-3.5 rounded-xl bg-white/5 text-xs text-slate-300 border border-white/5 leading-relaxed">
              <strong className="text-white">Human-Readable Rationale: </strong>
              {aiAnalysis?.priority_explanation ||
                `${complaint.priority_level} priority (${complaint.priority_score}/100) based on verified safety risk criteria.`}
            </div>

            {/* Admin Override Form if toggled */}
            {showOverride && (
              <form onSubmit={handleOverridePriority} className="mt-3 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Administrative Priority Score Override
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      New Score (0 - 100)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={overrideScore}
                      onChange={(e) => setOverrideScore(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#090d16] border border-white/10 text-white text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Mandatory Reason for Override
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. VIP corridor event scheduled, priority escalated"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#090d16] border border-white/10 text-white text-xs"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={savingOverride}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingOverride ? 'Saving...' : 'Apply Admin Override'}
                </button>
              </form>
            )}
          </div>

          {/* AI Duplicate Candidate Suggestions */}
          {aiAnalysis?.duplicate_candidates && aiAnalysis.duplicate_candidates.length > 0 && (
            <div className="bg-[#090d16]/90 rounded-2xl p-4 sm:p-5 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Possible Duplicate Incident Reports ({aiAnalysis.duplicate_candidates.length})
                </h5>
                <span className="text-[11px] text-slate-400">Traceable & Unmerged</span>
              </div>
              <div className="divide-y divide-white/5 max-h-40 overflow-y-auto">
                {aiAnalysis.duplicate_candidates.map((cand) => (
                  <div key={cand.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-300">{cand.reference_number}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {cand.similarity_score}% Match
                        </span>
                        <span className="text-[11px] text-slate-400">~{cand.distance_meters}m away</span>
                      </div>
                      <p className="font-semibold text-white mt-1">{cand.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{cand.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* WORKFLOW ACTIONS: ASSIGNMENT & STATUS UPDATE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Department Assignment */}
          <form onSubmit={handleAssignDept} className="p-5 bg-[#090d16]/80 rounded-3xl border border-white/10 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Building className="w-4 h-4" />
              Department Assignment
            </h4>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Responsible Agency
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0f172a] border border-white/10 text-xs text-white focus:border-cyan-500/60 focus:outline-none"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Assigned Officer / Lead Engineer
              </label>
              <input
                type="text"
                value={assignedLead}
                onChange={(e) => setAssignedLead(e.target.value)}
                placeholder="e.g. Eng. Marcus Vance (Team 2)"
                className="w-full px-3 py-2 rounded-xl bg-[#0f172a] border border-white/10 text-xs text-white placeholder-slate-500 focus:border-cyan-500/60 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={assigning}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <UserCheck className="w-4 h-4" />
              {assigning ? 'Assigning...' : 'Confirm Department Assignment'}
            </button>
          </form>

          {/* Status Workflow Transition */}
          <form onSubmit={handleStatusChange} className="p-5 bg-[#090d16]/80 rounded-3xl border border-white/10 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Status Transition
            </h4>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                New Resolution Milestone
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as ComplaintStatus)}
                className="w-full px-3 py-2 rounded-xl bg-[#0f172a] border border-white/10 text-xs text-white font-bold focus:border-cyan-500/60 focus:outline-none"
              >
                {ALLOWED_STATUS_FLOW.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Citizen-Facing Public Note <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={publicMessage}
                onChange={(e) => setPublicMessage(e.target.value)}
                placeholder="e.g. Inspection team dispatched. Material arriving on site."
                className="w-full px-3 py-2 rounded-xl bg-[#0f172a] border border-white/10 text-xs text-white placeholder-slate-500 focus:border-cyan-500/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Internal Administrative Note (Optional)
              </label>
              <input
                type="text"
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="e.g. Budget voucher #892 approved by municipal commissioner"
                className="w-full px-3 py-2 rounded-xl bg-[#0f172a] border border-white/10 text-xs text-white placeholder-slate-500 focus:border-cyan-500/60 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={statusUpdating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4" />
              {statusUpdating ? 'Updating...' : `Update Status to ${targetStatus}`}
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
