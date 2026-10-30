'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  UserCheck,
  Wrench,
  CheckCheck,
  AlertCircle,
  Building2,
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
    <div className="card-clean p-6 sm:p-8 space-y-6 bg-white border border-[#E5EAF0]">
      <div className="flex items-center justify-between border-b border-[#E5EAF0] pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#3978C5] bg-[#EBF3FC] px-2.5 py-0.5 rounded-full inline-block">
            Resolution Lifecycle
          </span>
          <h3 className="font-extrabold text-[#183B66] text-lg mt-1">
            Progress Timeline
          </h3>
          <p className="text-xs text-[#718096]">
            Transparent municipal dispatch and remediation milestones
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-[#718096] block">Submitted On</span>
          <span className="text-xs font-semibold text-[#183B66]">{formatDate(createdAt)}</span>
        </div>
      </div>

      {/* Progress Horizontal Bar on larger screens */}
      <div className="relative my-6 px-4 hidden sm:block">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-[#E5EAF0] -translate-y-1/2 -z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-[#3978C5] -translate-y-1/2 -z-0 transition-all duration-300"
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
                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                    isCompleted
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                      : isCurrent
                      ? 'bg-[#183B66] border-[#183B66] text-white shadow-sm ring-4 ring-[#EBF3FC]'
                      : 'bg-white border-[#CBD5E1] text-[#A0AEC0]'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`mt-2 text-xs font-semibold ${
                    isCurrent ? 'text-[#183B66]' : isCompleted ? 'text-emerald-700' : 'text-[#718096]'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Department Assignment Info */}
      {assignedDepartment && (
        <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E5EAF0] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#EBF3FC] flex items-center justify-center text-[#183B66]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[#718096]">Assigned Department: </span>
              <strong className="text-[#183B66] font-semibold">{assignedDepartment}</strong>
              {assignedTo && <span className="text-[#718096] ml-2">• Lead: <strong>{assignedTo}</strong></span>}
            </div>
          </div>
          {resolvedAt && (
            <div className="text-emerald-700 font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200">
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> Resolved on: {formatDate(resolvedAt)}
            </div>
          )}
        </div>
      )}

      {/* Verified Status Audit Log */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#183B66]">
          Status Updates ({history.length})
        </h4>

        {history.length === 0 ? (
          <p className="text-xs text-[#718096] italic">No updates recorded yet.</p>
        ) : (
          <div className="space-y-2.5">
            {history.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E5EAF0] flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#183B66] text-xs">
                      {log.new_status}
                    </span>
                    {log.updated_by && (
                      <span className="text-[#718096] text-[11px]">
                        by {log.updated_by}
                      </span>
                    )}
                  </div>
                  {(log.public_message || log.internal_note) && (
                    <p className="text-[#718096] text-xs leading-relaxed">
                      {log.public_message || log.internal_note}
                    </p>
                  )}
                </div>
                <span className="text-[11px] text-[#718096] shrink-0">
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
