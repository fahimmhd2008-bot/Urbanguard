'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Building2,
  UserCheck,
  Edit3,
  Save,
  Users,
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '@/types/civic';
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
        assignedLead,
        'Admin Supervisor',
        'Assigned via Urbangurad Admin Workbench'
      );
      onUpdate();
    } finally {
      setAssigning(false);
    }
  };

  // Handle Admin Override of Priority Score
  const handleOverridePriority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      alert('Please enter a mandatory administrative justification for the priority override.');
      return;
    }
    try {
      setSavingOverride(true);
      await complaintService.overridePriority(
        complaint.id,
        overrideScore,
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
      title={`Complaint File: ${complaint.reference_number}`}
      subtitle={`Submitted by ${complaint.user_name || 'Citizen'} on ${formatDate(complaint.created_at)}`}
      maxWidth="4xl"
    >
      <div className="space-y-6 text-xs sm:text-sm">
        {/* Top Header Card */}
        <div className="p-5 rounded-lg bg-[#F8FAFC] border border-[#E5EAF0] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#183B66] bg-white border border-[#E5EAF0] px-2.5 py-0.5 rounded">
                {complaint.reference_number}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white border border-[#E5EAF0] text-[#718096]">
                <CategoryIcon category={complaint.category} className="w-3.5 h-3.5 text-[#3978C5]" />
                <span>{complaint.category}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <PriorityBadge level={complaint.priority_level} score={complaint.priority_score} size="sm" />
              <StatusBadge status={complaint.status} size="sm" />
            </div>
          </div>

          <h2 className="text-lg font-bold text-[#183B66]">{complaint.title}</h2>
          <p className="text-[#718096] leading-relaxed text-xs">{complaint.description}</p>

          <div className="pt-3 border-t border-[#E5EAF0] flex flex-wrap items-center gap-4 text-xs text-[#718096]">
            <span className="inline-flex items-center gap-1 font-medium text-[#263445]">
              <MapPin className="w-3.5 h-3.5 text-[#3978C5] shrink-0" />
              <span>{complaint.location_name}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#A0AEC0] shrink-0" />
              <span>{formatDate(complaint.created_at)}</span>
            </span>
            {complaint.user_email && (
              <span className="inline-flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#A0AEC0] shrink-0" />
                <span>{complaint.user_email}</span>
              </span>
            )}
          </div>
        </div>

        {/* Photo Evidence if present */}
        {complaint.image_url && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#183B66] mb-2">
              Citizen Photo Evidence
            </h4>
            <div className="rounded-lg overflow-hidden border border-[#E5EAF0] max-h-64 bg-[#F8FAFC] flex items-center justify-center">
              <img
                src={complaint.image_url}
                alt="Complaint evidence"
                className="max-h-64 w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* AI Triage Assessment Section */}
        <div className="p-5 rounded-lg bg-[#EBF3FC] border border-[#D0E2F6] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#183B66] font-bold text-sm">
              <Sparkles className="w-4 h-4 text-[#3978C5]" />
              <span>Urbangurad Decision Engine Assessment</span>
            </div>
            <span className="text-[10px] font-mono text-[#718096]">
              {aiAnalysis?.model_information || 'Urbangurad-NLP-v2'}
            </span>
          </div>

          {/* Factual 4-Part Incident Summary */}
          <div className="bg-white rounded-lg p-4 border border-[#D0E2F6] space-y-2.5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#183B66]">
              Structured Summary
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5EAF0]">
                <strong className="text-[#183B66] block mb-0.5">What Happened:</strong>
                <span className="text-[#718096]">{aiAnalysis?.summary.what || complaint.title}</span>
              </div>
              <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5EAF0]">
                <strong className="text-[#183B66] block mb-0.5">Where:</strong>
                <span className="text-[#718096]">{aiAnalysis?.summary.where || complaint.location_name}</span>
              </div>
              <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5EAF0]">
                <strong className="text-[#183B66] block mb-0.5">Who/What Affected:</strong>
                <span className="text-[#718096]">{aiAnalysis?.summary.impact || 'Local pedestrians and commuters'}</span>
              </div>
              <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5EAF0]">
                <strong className="text-[#183B66] block mb-0.5">Recommended Action:</strong>
                <span className="text-[#718096]">{aiAnalysis?.summary.action || 'On-site municipal team inspection'}</span>
              </div>
            </div>
          </div>

          {/* Priority Score Breakdown */}
          <div className="bg-white rounded-lg p-4 border border-[#D0E2F6] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#183B66]">
                  Priority Score Factors (Score: {complaint.priority_score}/100)
                </h5>
                <p className="text-[11px] text-[#718096]">
                  Deterministic score calculated from validated public safety criteria
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOverride(!showOverride)}
                className="text-xs font-semibold text-[#3978C5] hover:text-[#183B66] inline-flex items-center gap-1 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{showOverride ? 'Cancel' : 'Admin Override'}</span>
              </button>
            </div>

            {/* Visual Score Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5EAF0]">
                <div className="flex justify-between text-xs font-semibold text-[#183B66] mb-1">
                  <span>Safety Risk</span>
                  <span className="text-red-600 font-mono">{priorityBreakdown?.safety_risk ?? 20}/40</span>
                </div>
                <div className="w-full bg-[#E5EAF0] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-1.5 rounded-full"
                    style={{ width: `${((priorityBreakdown?.safety_risk ?? 20) / 40) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5EAF0]">
                <div className="flex justify-between text-xs font-semibold text-[#183B66] mb-1">
                  <span>Public Impact</span>
                  <span className="text-[#3978C5] font-mono">{priorityBreakdown?.public_impact ?? 15}/25</span>
                </div>
                <div className="w-full bg-[#E5EAF0] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#3978C5] h-1.5 rounded-full"
                    style={{ width: `${((priorityBreakdown?.public_impact ?? 15) / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5EAF0]">
                <div className="flex justify-between text-xs font-semibold text-[#183B66] mb-1">
                  <span>Urgency</span>
                  <span className="text-amber-600 font-mono">{priorityBreakdown?.urgency ?? 12}/20</span>
                </div>
                <div className="w-full bg-[#E5EAF0] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full"
                    style={{ width: `${((priorityBreakdown?.urgency ?? 12) / 20) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E5EAF0]">
                <div className="flex justify-between text-xs font-semibold text-[#183B66] mb-1">
                  <span>Recurrence</span>
                  <span className="text-purple-600 font-mono">{priorityBreakdown?.frequency_score ?? 8}/15</span>
                </div>
                <div className="w-full bg-[#E5EAF0] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-1.5 rounded-full"
                    style={{ width: `${((priorityBreakdown?.frequency_score ?? 8) / 15) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Rationale text */}
            <p className="text-xs text-[#718096] bg-[#F8FAFC] p-2.5 rounded border border-[#E5EAF0] leading-relaxed">
              <strong className="text-[#183B66]">Rationale: </strong>
              {aiAnalysis?.priority_explanation ||
                `${complaint.priority_level} priority based on verified safety risk criteria.`}
            </p>

            {/* Admin Override Form if toggled */}
            {showOverride && (
              <form onSubmit={handleOverridePriority} className="p-3.5 bg-amber-50 rounded-lg border border-amber-200 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Administrative Priority Score Override
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      New Score (0 - 100)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={overrideScore}
                      onChange={(e) => setOverrideScore(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-md bg-white border border-amber-200 text-xs text-[#263445]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      Mandatory Reason
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. VIP corridor event scheduled"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-md bg-white border border-amber-200 text-xs text-[#263445]"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={savingOverride}
                  className="px-3 py-1.5 rounded-md bg-[#183B66] text-white font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingOverride ? 'Saving...' : 'Apply Override'}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* WORKFLOW ACTIONS: ASSIGNMENT & STATUS UPDATE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Department Assignment */}
          <form onSubmit={handleAssignDept} className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E5EAF0] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#183B66] flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#3978C5]" />
              Department Assignment
            </h4>

            <div>
              <label className="block text-[11px] font-semibold text-[#718096] mb-1">
                Responsible Agency
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-white border border-[#E5EAF0] text-xs text-[#263445] focus:outline-none focus:border-[#3978C5]"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#718096] mb-1">
                Lead Officer
              </label>
              <input
                type="text"
                value={assignedLead}
                onChange={(e) => setAssignedLead(e.target.value)}
                placeholder="e.g. Eng. Marcus Vance (Team 2)"
                className="w-full px-3 py-2 rounded-md bg-white border border-[#E5EAF0] text-xs text-[#263445] focus:outline-none focus:border-[#3978C5]"
              >
              </input>
            </div>

            <button
              type="submit"
              disabled={assigning}
              className="w-full btn-primary text-xs !py-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>{assigning ? 'Assigning...' : 'Assign Department'}</span>
            </button>
          </form>

          {/* Status Workflow Transition */}
          <form onSubmit={handleStatusChange} className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E5EAF0] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#183B66] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Update Status
            </h4>

            <div>
              <label className="block text-[11px] font-semibold text-[#718096] mb-1">
                New Milestone
              </label>
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as ComplaintStatus)}
                className="w-full px-3 py-2 rounded-md bg-white border border-[#E5EAF0] text-xs text-[#263445] font-semibold focus:outline-none focus:border-[#3978C5]"
              >
                {ALLOWED_STATUS_FLOW.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#718096] mb-1">
                Public Note for Citizen <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={publicMessage}
                onChange={(e) => setPublicMessage(e.target.value)}
                placeholder="e.g. Work crew dispatched to site."
                className="w-full px-3 py-2 rounded-md bg-white border border-[#E5EAF0] text-xs text-[#263445] focus:outline-none focus:border-[#3978C5]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#718096] mb-1">
                Internal Administrative Note
              </label>
              <input
                type="text"
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="e.g. Work order #412 approved"
                className="w-full px-3 py-2 rounded-md bg-white border border-[#E5EAF0] text-xs text-[#263445] focus:outline-none focus:border-[#3978C5]"
              />
            </div>

            <button
              type="submit"
              disabled={statusUpdating}
              className="w-full btn-primary text-xs !py-2"
            >
              <Save className="w-4 h-4" />
              <span>{statusUpdating ? 'Updating...' : `Set Status to ${targetStatus}`}</span>
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
