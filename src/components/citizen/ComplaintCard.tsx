'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { Complaint } from '@/types/civic';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatDate } from '@/lib/utils/formatters';

interface Props {
  complaint: Complaint;
}

export function ComplaintCard({ complaint }: Props) {
  return (
    <div className="bg-[#0f172a]/75 rounded-3xl border border-white/10 p-5 shadow-xl hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group backdrop-blur-xl">
      <div>
        {/* Header: Reference ID + Category + Status */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg">
              {complaint.reference_number}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              <CategoryIcon category={complaint.category} className="w-3.5 h-3.5 text-cyan-400" />
              {complaint.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <PriorityBadge level={complaint.priority_level} score={complaint.priority_score} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2 leading-snug">
          {complaint.title}
        </h3>

        {/* Description snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3.5">
          {complaint.description}
        </p>

        {/* AI Summary Highlight */}
        {complaint.ai_summary && (
          <div className="mb-4 p-3 rounded-2xl bg-[#090d16]/80 border border-cyan-500/20 flex items-start gap-2.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
              <strong className="font-bold text-cyan-300">AI Summary:</strong> {complaint.ai_summary}
            </p>
          </div>
        )}
      </div>

      {/* Footer Meta + Action */}
      <div className="pt-3.5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 truncate max-w-[170px]" title={complaint.location_name}>
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{complaint.location_name}</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            {formatDate(complaint.created_at)}
          </span>
        </div>

        <Link
          href={`/track/${complaint.id}`}
          className="inline-flex items-center gap-1 font-bold text-xs text-cyan-400 hover:text-cyan-300 group-hover:translate-x-0.5 transition-all"
        >
          Track Issue <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
