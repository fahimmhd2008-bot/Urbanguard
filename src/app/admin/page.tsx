'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Wrench,
  Users,
  MapPin,
  Sparkles,
  Copy,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import { Complaint, AIActionBrief } from '@/types/civic';
import { complaintService } from '@/lib/data/complaintService';
import { generateAIActionBrief } from '@/lib/ai/actionBrief';
import { MetricCard } from '@/components/admin/MetricCard';
import { DashboardCharts } from '@/components/admin/DashboardCharts';
import { ComplaintDetailModal } from '@/components/admin/ComplaintDetailModal';
import { AIActionBriefModal } from '@/components/admin/AIActionBriefModal';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { formatDate } from '@/lib/utils/formatters';

export default function AdminDashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0,
    high: 0,
    avgResolutionHours: 0,
    resolutionRate: 0,
  });
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [activeBrief, setActiveBrief] = useState<AIActionBrief | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [data, stats] = await Promise.all([
        complaintService.getAllComplaints(),
        complaintService.getMetrics(),
      ]);
      setComplaints(data || []);
      if (stats) setMetrics(stats);
    } catch (err) {
      console.warn('Error loading admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateBrief = () => {
    const brief = generateAIActionBrief('Riverside Sector & North Avenue Corridor', complaints);
    setActiveBrief(brief);
  };

  // Critical issues needing urgent attention
  const criticalComplaints = complaints
    .filter((c) => (c.priority_level === 'Critical' || c.priority_level === 'High') && c.status !== 'RESOLVED')
    .slice(0, 5);

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 bg-indigo-950/70 px-3 py-0.5 rounded-full border border-indigo-500/30">
              Command Center
            </span>
            <span className="text-xs text-slate-400 font-mono">Real-time Triage Ledger</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-2">
            Civic Operations & Action Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time complaint triage, explainable AI scoring, and municipal dispatch control.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerateBrief}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer border border-cyan-400/30"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            Generate AI Action Brief
          </button>

          <Link
            href="/admin/map"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors"
          >
            <MapPin className="w-4 h-4 text-cyan-400" />
            Hotspot Map
          </Link>

          <Link
            href="/admin/duplicates"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-semibold text-xs border border-white/10 transition-colors"
          >
            <Copy className="w-4 h-4 text-purple-400" />
            Duplicates Console
          </Link>
        </div>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
        <MetricCard
          title="Total Reports"
          value={metrics.total}
          icon={FileText}
          variant="slate"
        />
        <MetricCard
          title="Submitted"
          value={metrics.pending}
          icon={Clock}
          variant="slate"
        />
        <MetricCard
          title="Under Review"
          value={metrics.underReview}
          icon={AlertTriangle}
          variant="purple"
        />
        <MetricCard
          title="Assigned"
          value={metrics.assigned}
          icon={Users}
          variant="blue"
        />
        <MetricCard
          title="In Progress"
          value={metrics.inProgress}
          icon={Wrench}
          variant="amber"
        />
        <MetricCard
          title="Resolved"
          value={metrics.resolved}
          subtitle={`${metrics.resolutionRate}% rate`}
          icon={CheckCircle2}
          variant="emerald"
        />
        <MetricCard
          title="Avg Turnaround"
          value={metrics.avgResolutionHours > 0 ? `${metrics.avgResolutionHours}h` : '32h'}
          subtitle="Hours to resolution"
          icon={TrendingUp}
          variant="slate"
        />
      </div>

      {/* DATA VISUALIZATIONS */}
      {complaints.length > 0 && <DashboardCharts complaints={complaints} />}

      {/* CRITICAL PRIORITY UNRESOLVED WORKBENCH */}
      <div className="bg-[#0f172a]/80 rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="p-5 border-b border-white/10 bg-[#090d16]/60 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              Critical & High Priority Active Incidents ({metrics.critical + metrics.high})
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Escalated tickets requiring immediate departmental dispatch and hazard mitigation
            </p>
          </div>

          <Link
            href="/admin/complaints"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1.5 transition-colors"
          >
            Open Complaints Workbench <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-white/5">
          {criticalComplaints.map((comp) => (
            <div
              key={comp.id}
              onClick={() => setSelectedComplaint(comp)}
              className="p-5 hover:bg-white/5 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-2.5 py-0.5 rounded-lg">
                    {comp.reference_number}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                    <CategoryIcon category={comp.category} className="w-3.5 h-3.5 text-cyan-400" />
                    {comp.category}
                  </span>
                  <PriorityBadge level={comp.priority_level} score={comp.priority_score} />
                  <StatusBadge status={comp.status} />
                </div>

                <h4 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors truncate">
                  {comp.title}
                </h4>

                <p className="text-xs text-slate-400 line-clamp-1">
                  📍 {comp.location_name} • Filed {formatDate(comp.created_at)} •{' '}
                  <span className="text-indigo-300 font-semibold">
                    {comp.assigned_department || 'Department Unassigned'}
                  </span>
                </p>
              </div>

              <button
                type="button"
                className="shrink-0 px-4 py-2 rounded-xl bg-white/10 group-hover:bg-cyan-600 text-white font-bold text-xs transition-colors shadow-md"
              >
                Inspect Ticket
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Review Modal */}
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

      {/* AI Action Brief Modal */}
      <AIActionBriefModal
        brief={activeBrief}
        isOpen={Boolean(activeBrief)}
        onClose={() => setActiveBrief(null)}
      />
    </div>
  );
}
