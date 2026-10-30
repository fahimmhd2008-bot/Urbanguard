'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { ComplaintForm } from '@/components/citizen/ComplaintForm';

export default function SubmitComplaintPage() {
  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 space-y-6">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#718096] hover:text-[#183B66] transition-colors px-3 py-1.5 rounded-lg bg-white border border-[#E5EAF0]"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#3978C5]" />
          <span>Back to Home</span>
        </Link>
        <Link
          href="/my-complaints"
          className="text-xs font-semibold text-[#3978C5] hover:text-[#183B66] transition-colors"
        >
          Track Submitted Complaints →
        </Link>
      </div>

      {/* Emergency Advisory Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-800">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold text-amber-900">Life-Threatening Emergency Notice: </strong>
          If this incident involves an active structural collapse, gas leak, active fire, or severe injury, please contact emergency dispatch immediately at{' '}
          <strong className="underline font-bold text-amber-950">112 / 911</strong> before submitting an online report.
        </div>
      </div>

      {/* Complaint Submission Form */}
      <ComplaintForm />
    </div>
  );
}
