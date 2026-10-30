'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, RotateCcw, CheckCircle2 } from 'lucide-react';
import { complaintService } from '@/lib/data/complaintService';

export function Footer() {
  const handleResetData = () => {
    if (confirm('Reset demonstration database to the 42 original realistic sample complaints?')) {
      complaintService.resetToInitialData();
      window.location.reload();
    }
  };

  return (
    <footer className="w-full bg-white border-t border-[#E5EAF0] text-[#718096] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#183B66] text-white flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-[#183B66]">
                Urban<span className="text-[#3978C5]">gurad</span>
              </span>
            </div>
            <p className="text-xs text-[#718096] max-w-sm leading-relaxed">
              Urbangurad connects citizens with municipal departments through explainable AI prioritization, structured triage, and transparent milestone tracking.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#263445]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EBF3FC] text-[#183B66] font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3978C5]" />
                Municipal Triage Verified
              </span>
            </div>
          </div>

          {/* Citizen Portal Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#183B66] mb-3">
              Citizen Portal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/submit" className="hover:text-[#183B66] transition-colors">
                  Report an Issue
                </Link>
              </li>
              <li>
                <Link href="/my-complaints" className="hover:text-[#183B66] transition-colors">
                  Track My Complaint
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-[#183B66] transition-colors">
                  How Urbangurad Works
                </Link>
              </li>
              <li>
                <Link href="/track/CIVIC-2026-1001" className="hover:text-[#183B66] transition-colors">
                  Sample Resolution Audit
                </Link>
              </li>
            </ul>
          </div>

          {/* Municipal Admin Links */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#183B66] mb-3">
              Municipal Operations
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/admin" className="hover:text-[#183B66] transition-colors">
                  Operations Overview
                </Link>
              </li>
              <li>
                <Link href="/admin/complaints" className="hover:text-[#183B66] transition-colors">
                  Complaints Management
                </Link>
              </li>
              <li>
                <Link href="/admin/map" className="hover:text-[#183B66] transition-colors">
                  Hotspot Map
                </Link>
              </li>
              <li>
                <Link href="/admin/duplicates" className="hover:text-[#183B66] transition-colors">
                  Duplicate Detection
                </Link>
              </li>
              <li className="pt-2">
                <button
                  onClick={handleResetData}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#F1F5F9] hover:bg-[#E5EAF0] text-[#183B66] text-xs font-semibold transition-colors"
                  title="Reload 42 sample complaints"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo Dataset</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-10 pt-6 border-t border-[#E5EAF0] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#718096]">
          <p>© {new Date().getFullYear()} Urbangurad. All municipal public service rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#183B66] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#183B66] cursor-pointer">Public Terms of Service</span>
            <span className="hover:text-[#183B66] cursor-pointer">Civic Accountability</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
