'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  UserCheck,
  Wrench,
  CheckCheck,
  AlertCircle,
  Building,
} from 'lucide-react';
import { ComplaintStatus, ComplaintStatusHistory } from '@/types/civic';
import { formatDate } from '@/lib/utils/formatters';

interface Props {
  currentStatus: ComplaintStatus;
  history?: ComplaintStatusHistory[];
  assignedDepartment?: string;
  assignedTo?: string;
  resolvedAt?: string;
  createdAt: string;
}

const STAGES: { status: ComplaintStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { status: 'SUBMITTED', label: 'Submitted', icon: Clock },
  { status: 'UNDER REVIEW', label: 'Under Review', icon: AlertCircle },
  { status: 'ASSIGNED', label: 'Assigned', icon: UserCheck },
  { status: 'IN PROGRESS', label: 'In Progress', icon: Wrench },
  { status: 'RESOLVED', label: 'Resolved', icon: CheckCheck },
];

export function TrackingTimeline({
  currentStatus,
  history = [],
  assignedDepartment,
  assignedTo,
  resolvedAt,
  createdAt,
}: Props) {
  const getStageIndex = (status: ComplaintStatus) => {
    return STAGES.findIndex((s) => s.status === status);
  };

  const currentIndex = getStageIndex(currentStatus);

  return (
    <div className="bg-[#0f172a]/80 rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 px-3 py-0.5 rounded-full border border-cyan-500/30">
            Resolution Telemetry
          </span>
          <h3 className="font-extrabold text-white text-xl mt-1">Milestone Lifecycle</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable audit milestones verified by municipal dispatch logs
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">Report Logged</span>
          <span className="text-xs font-mono font-bold text-slate-200">{formatDate(createdAt)}</span>
        </div>
      </div>

      {/* Progress Horizontal Bar on larger screens */}
      <div className="relative mb-6 px-4 hidden sm:block">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 -z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 -translate-y-1/2 -z-0 transition-all duration-500"
          style={{ width: `${Math.max(5, (currentIndex / (STAGES.length - 1)) * 100)}%` }}
        />

        <div className="flex items-center justify-between relative z-10">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const Icon = stage.icon;

            return (
              <div key={stage.status} className="flex flex-col items-center">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                    isCompleted
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20'
                      : isCurrent
                      ? 'bg-blue-600 border-cyan-400 text-white ring-4 ring-cyan-500/20 shadow-xl shadow-blue-500/30 font-bold'
                      : 'bg-[#090d16] border-white/10 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5 text-cyan-300" /> : <Icon className="w-5 h-5" />}
                </div>
                <span
                  className={`mt-2.5 text-xs font-bold tracking-wide ${
                    isCurrent ? 'text-cyan-400' : isCompleted ? 'text-slate-200' : 'text-slate-500'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assignment & Department Banner */}
      {assignedDepartment && (
        <div className="p-4 bg-[#090d16]/90 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400">Assigned Department: </span>
              <span className="text-white font-bold">{assignedDepartment}</span>
              {assignedTo && <span className="text-cyan-400 ml-2 font-medium">• Crew Lead: {assignedTo}</span>}
            </div>
          </div>
          {resolvedAt && (
            <div className="text-emerald-400 font-bold flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <CheckCheck className="w-4 h-4" /> Remediation Verified: {formatDate(resolvedAt)}
            </div>
          )}
        </div>
      )}

      {/* Verified Status Audit Log */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5">
          Municipal Field Log History ({history.length})
        </h4>

        {history.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No field logs recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-[#090d16]/60 border border-white/5 flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                      {log.new_status}
                    </span>
                    {log.updated_by && (
                      <span className="text-slate-400 text-[11px]">
                        by <strong className="text-slate-300 font-medium">{log.updated_by}</strong>
                      </span>
                    )}
                  </div>
                  {(log.public_message || log.internal_note) && (
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {log.public_message || log.internal_note}
                    </p>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 font-mono shrink-0">
                  {formatDate(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
