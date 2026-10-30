'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { ComplaintForm } from '@/components/citizen/ComplaintForm';

export default function SubmitComplaintPage() {
  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-xl bg-white/5 border border-white/10"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" /> Back to Home
        </Link>
        <Link
          href="/my-complaints"
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          View Submitted Complaints →
        </Link>
      </div>

      {/* Emergency Advisory Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3.5 text-xs text-amber-200 backdrop-blur-md">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold text-amber-300">Life-Threatening Emergency Notice: </strong>
          If this incident involves an active structural collapse, gas leak, active fire, or severe injury, please contact emergency services immediately at{' '}
          <strong className="underline font-bold text-white">112 / 911</strong> before submitting an asynchronous complaint.
        </div>
      </div>

      {/* Complaint Submission Form */}
      <ComplaintForm />
    </div>
  );
}
