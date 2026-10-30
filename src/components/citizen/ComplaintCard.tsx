'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import type { Complaint } from '@/types/civic';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatDate } from '@/lib/utils/formatters';

interface Props {
  complaint: Complaint;
}

export function ComplaintCard({ complaint }: Props) {
  return (
    <div className="card-clean p-5 flex flex-col justify-between space-y-3.5 bg-white border border-[#E5EAF0]">
      <div>
        {/* Header: Reference ID + Category + Status */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-[#183B66] bg-[#F1F5F9] border border-[#E5EAF0] px-2 py-0.5 rounded">
              {complaint.reference_number}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#718096] bg-[#F8FAFC] border border-[#E5EAF0] px-2 py-0.5 rounded-full font-medium">
              <CategoryIcon category={complaint.category} className="w-3.5 h-3.5 text-[#3978C5]" />
              <span>{complaint.category}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <PriorityBadge level={complaint.priority_level} score={complaint.priority_score} size="sm" />
            <StatusBadge status={complaint.status} size="sm" />
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-[#183B66] text-sm hover:text-[#3978C5] transition-colors line-clamp-1 mb-1">
          <Link href={`/track/${complaint.id}`}>
            {complaint.title}
          </Link>
        </h3>

        {/* Description snippet */}
        <p className="text-xs text-[#718096] line-clamp-2 leading-relaxed mb-3">
          {complaint.description}
        </p>

        {/* AI Summary Highlight */}
        {complaint.ai_summary && (
          <div className="p-2.5 rounded-lg bg-[#EBF3FC] border border-[#D0E2F6] text-xs text-[#263445] leading-relaxed line-clamp-2">
            <span className="font-semibold text-[#183B66]">Summary: </span>
            {complaint.ai_summary}
          </div>
        )}
      </div>

      {/* Footer Meta + Action */}
      <div className="pt-3 border-t border-[#E5EAF0] flex items-center justify-between text-xs text-[#718096]">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 truncate max-w-[170px]" title={complaint.location_name}>
            <MapPin className="w-3.5 h-3.5 text-[#3978C5] shrink-0" />
            <span className="truncate">{complaint.location_name}</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[#A0AEC0]">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{formatDate(complaint.created_at)}</span>
          </span>
        </div>

        <Link
          href={`/track/${complaint.id}`}
          className="inline-flex items-center gap-1 font-semibold text-xs text-[#3978C5] hover:text-[#183B66] transition-colors"
        >
          <span>Track</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
