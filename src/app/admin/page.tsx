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
  RotateCcw,
} from 'lucide-react';
import type { Complaint, AIActionBrief } from '@/types/civic';
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
      if (stats) {setMetrics(stats);}
    } catch {
      // Continue with memory defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateBrief = () => {
    const brief = generateAIActionBrief('Central Corridor & Metro Zone', complaints);
    setActiveBrief(brief);
  };

  // Critical issues needing urgent attention
  const criticalComplaints = complaints
    .filter((c) => (c.priority_level === 'Critical' || c.priority_level === 'High') && c.status !== 'RESOLVED')
    .slice(0, 5);

  const departmentsList = [
    { name: 'Road Infrastructure & Maintenance', active: 12, lead: 'Eng. Marcus Vance', sla: '94%' },
    { name: 'Water Supply and Drainage Board', active: 8, lead: 'Chief Officer Elena Rostova', sla: '91%' },
    { name: 'Solid Waste Management Corporation', active: 7, lead: 'Director David Chen', sla: '88%' },
    { name: 'Municipal Electrical Department', active: 6, lead: 'Inspector Aisha Patel', sla: '96%' },
    { name: 'Public Works & Safety Inspection', active: 5, lead: 'Supt. Robert Sterling', sla: '92%' },
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#3978C5] uppercase tracking-wider">
              Municipal Operations
            </span>
            <span className="text-xs text-[#718096]">• Urbanguard Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#183B66] mt-1">
            Municipal Operations Dashboard
          </h1>
          <p className="text-xs text-[#718096]">
            Real-time public incident triage, explainable AI scoring, and departmental dispatch control.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleGenerateBrief}
            className="btn-primary text-xs !py-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Generate AI Action Brief</span>
          </button>

          <Link
            href="/admin/map"
            className="btn-secondary text-xs !py-2"
          >
            <MapPin className="w-3.5 h-3.5 text-[#3978C5]" />
            <span>Hotspot Map</span>
          </Link>

          <Link
            href="/admin/duplicates"
            className="btn-secondary text-xs !py-2"
          >
            <Copy className="w-3.5 h-3.5 text-[#3978C5]" />
            <span>Duplicate Detection</span>
          </Link>
        </div>
      </div>

      {/* Internal Admin Navigation Tabs */}
      <div className="card-clean p-2 bg-white border border-[#E5EAF0] flex items-center gap-1 overflow-x-auto text-xs font-semibold">
        <Link
          href="/admin"
          className="px-3 py-1.5 rounded-md bg-[#183B66] text-white shadow-sm whitespace-nowrap"
        >
          Overview
        </Link>
        <Link
          href="/admin/complaints"
          className="px-3 py-1.5 rounded-md text-[#718096] hover:text-[#183B66] hover:bg-[#F1F5F9] whitespace-nowrap transition-colors"
        >
          Complaints ({metrics.total})
        </Link>
        <a
          href="#charts"
          className="px-3 py-1.5 rounded-md text-[#718096] hover:text-[#183B66] hover:bg-[#F1F5F9] whitespace-nowrap transition-colors"
        >
          Analytics & Charts
        </a>
        <Link
          href="/admin/map"
          className="px-3 py-1.5 rounded-md text-[#718096] hover:text-[#183B66] hover:bg-[#F1F5F9] whitespace-nowrap transition-colors"
        >
          Hotspot Map
        </Link>
        <Link
          href="/admin/duplicates"
          className="px-3 py-1.5 rounded-md text-[#718096] hover:text-[#183B66] hover:bg-[#F1F5F9] whitespace-nowrap transition-colors"
        >
          Duplicate Detection
        </Link>
        <a
          href="#departments"
          className="px-3 py-1.5 rounded-md text-[#718096] hover:text-[#183B66] hover:bg-[#F1F5F9] whitespace-nowrap transition-colors"
        >
          Departments
        </a>
        <a
          href="#settings"
          className="px-3 py-1.5 rounded-md text-[#718096] hover:text-[#183B66] hover:bg-[#F1F5F9] whitespace-nowrap transition-colors"
        >
          Settings
        </a>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <MetricCard
          title="Total Reports"
          value={metrics.total}
          icon={FileText}
          variant="slate"
        />
        <MetricCard
          title="Pending"
          value={metrics.pending}
          subtitle="Awaiting triage"
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
          title="Critical"
          value={metrics.critical}
          subtitle="Safety alerts"
          icon={TrendingUp}
          variant="red"
        />
      </div>

      {/* DATA VISUALIZATIONS */}
      <div id="charts">
        {complaints.length > 0 && <DashboardCharts complaints={complaints} />}
      </div>

      {/* CRITICAL PRIORITY UNRESOLVED WORKBENCH */}
      <div className="card-clean bg-white border border-[#E5EAF0] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E5EAF0] bg-[#F8FAFC] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#183B66] text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Critical & High Priority Active Incidents ({criticalComplaints.length})
            </h3>
            <p className="text-xs text-[#718096] mt-0.5">
              Escalated tickets requiring immediate departmental dispatch and hazard mitigation
            </p>
          </div>

          <Link
            href="/admin/complaints"
            className="text-xs font-semibold text-[#3978C5] hover:text-[#183B66] inline-flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#E5EAF0]">
          {criticalComplaints.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#718096]">
              No active critical incidents requiring escalation.
            </div>
          ) : (
            criticalComplaints.map((comp) => (
              <div
                key={comp.id}
                onClick={() => setSelectedComplaint(comp)}
                className="p-4 hover:bg-[#F8FAFC] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#183B66] bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#E5EAF0]">
                      {comp.reference_number}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-[#718096] bg-[#F8FAFC] border border-[#E5EAF0] px-2 py-0.5 rounded-full font-medium">
                      <CategoryIcon category={comp.category} className="w-3.5 h-3.5 text-[#3978C5]" />
                      <span>{comp.category}</span>
                    </span>
                    <PriorityBadge level={comp.priority_level} score={comp.priority_score} size="sm" />
                    <StatusBadge status={comp.status} size="sm" />
                  </div>

                  <h4 className="font-bold text-[#183B66] text-sm truncate">
                    {comp.title}
                  </h4>

                  <p className="text-xs text-[#718096] line-clamp-1">
                    📍 {comp.location_name} • Reported {formatDate(comp.created_at)} •{' '}
                    <strong className="text-[#263445] font-semibold">
                      {comp.assigned_department || 'Unassigned'}
                    </strong>
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-secondary text-xs !py-1.5 shrink-0"
                >
                  Inspect File
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DEPARTMENTS PERFORMANCE OVERVIEW */}
      <div id="departments" className="card-clean p-6 bg-white border border-[#E5EAF0] space-y-4">
        <div>
          <h3 className="font-bold text-[#183B66] text-sm">
            Municipal Department Allocations
          </h3>
          <p className="text-xs text-[#718096] mt-0.5">
            Active workload, crew leadership, and SLA adherence across municipal agencies
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5EAF0] text-[#718096] uppercase font-bold">
                <th className="py-2.5 px-3">Department Agency</th>
                <th className="py-2.5 px-3">Active Tickets</th>
                <th className="py-2.5 px-3">Operations Lead</th>
                <th className="py-2.5 px-3 text-right">SLA Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAF0]">
              {departmentsList.map((dept) => (
                <tr key={dept.name} className="hover:bg-[#F8FAFC]">
                  <td className="py-3 px-3 font-semibold text-[#183B66]">{dept.name}</td>
                  <td className="py-3 px-3 text-[#263445]">{dept.active} reports</td>
                  <td className="py-3 px-3 text-[#718096]">{dept.lead}</td>
                  <td className="py-3 px-3 text-right font-semibold text-emerald-700">{dept.sla}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SETTINGS & SYSTEM CONTROLS */}
      <div id="settings" className="card-clean p-6 bg-white border border-[#E5EAF0] space-y-4">
        <div>
          <h3 className="font-bold text-[#183B66] text-sm">
            Platform Settings & Demonstration Controls
          </h3>
          <p className="text-xs text-[#718096] mt-0.5">
            Manage demonstration data, triage thresholds, and system preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E5EAF0] space-y-2">
            <h4 className="font-bold text-xs text-[#183B66]">Reset Demonstration Database</h4>
            <p className="text-xs text-[#718096] leading-relaxed">
              Restore the original 42 realistic municipal complaints across all 6 civic categories with full status history.
            </p>
            <button
              onClick={() => {
                if (confirm('Reset demonstration database to initial realistic complaints?')) {
                  complaintService.resetToInitialData();
                  window.location.reload();
                }
              }}
              className="btn-secondary text-xs !py-1.5 mt-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Data</span>
            </button>
          </div>

          <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E5EAF0] space-y-2">
            <h4 className="font-bold text-xs text-[#183B66]">AI Automation Engine Mode</h4>
            <p className="text-xs text-[#718096] leading-relaxed">
              Confidence threshold set to <strong>85%</strong> for auto-suggesting municipal departments and scoring public safety risk.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Autonomous NLP Classification Active</span>
            </div>
          </div>
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
