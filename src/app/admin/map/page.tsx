'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Layers,
  ChevronRight,
} from 'lucide-react';
import type { Complaint, HotspotCluster } from '@/types/civic';
import { complaintService } from '@/lib/data/complaintService';
import { identifyHotspots } from '@/lib/utils/geo';
import { CivicMap } from '@/components/map/CivicMap';
import { ComplaintDetailModal } from '@/components/admin/ComplaintDetailModal';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { CategoryIcon } from '@/components/common/CategoryIcon';

export default function AdminMapPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [activeCluster, setActiveCluster] = useState<HotspotCluster | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await complaintService.getAllComplaints();
      setComplaints(data || []);
    } catch (err) {
      console.warn('Error loading map complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const hotspots = identifyHotspots(complaints);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin"
              className="text-xs text-slate-400 hover:text-white font-semibold inline-flex items-center gap-1.5 transition-colors px-3 py-1 rounded-xl bg-white/5 border border-white/10"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Spatial Density & Incident Hotspot Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Algorithmic radius clustering identifying recurring physical infrastructure failures and critical hotspots.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs">
          <span className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 text-rose-300 font-bold border border-rose-500/30">
            {hotspots.length} Verified Hotspots
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30">
            {complaints.filter((c) => c.latitude).length} Mapped Coordinates
          </span>
        </div>
      </div>

      {/* Main Grid: Hotspot Sidebar + Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Hotspots Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#0f172a]/80 rounded-3xl border border-white/10 p-5 shadow-2xl backdrop-blur-xl">
            <h3 className="font-extrabold text-white text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Detected Geo-Clusters ({hotspots.length})
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Spatial radius: 450m density threshold
            </p>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {hotspots.map((spot) => (
                <div
                  key={spot.id}
                  onClick={() => setActiveCluster(spot)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    activeCluster?.id === spot.id
                      ? 'border-cyan-400 bg-gradient-to-r from-blue-900/60 to-cyan-900/60 text-white shadow-lg shadow-cyan-900/30'
                      : 'border-white/10 bg-[#090d16]/70 hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-bold text-white truncate">
                      {spot.location_name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        spot.risk_level === 'High'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {spot.risk_level} Risk
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2.5">
                    <CategoryIcon category={spot.primary_category} className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{spot.primary_category}</span>
                    <span>•</span>
                    <span className="font-bold text-slate-200">{spot.complaint_count} reports</span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Active: {spot.unresolved_count}</span>
                    <span className="font-bold text-cyan-400 inline-flex items-center gap-0.5 text-[10px]">
                      View details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl bg-[#0f172a]">
            <CivicMap
              complaints={complaints}
              selectedComplaintId={selectedComplaint?.id}
              onSelectComplaint={(c) => setSelectedComplaint(c)}
              height="580px"
            />
          </div>

          {/* Active Cluster Details Box if selected */}
          {activeCluster && (
            <div className="p-5 rounded-3xl bg-[#0f172a]/90 border border-cyan-500/30 shadow-2xl space-y-4 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-white">
                    Cluster Analysis: {activeCluster.location_name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Centroid: [{activeCluster.center_lat}, {activeCluster.center_lng}] • {activeCluster.complaint_count} verified citizen reports
                  </p>
                </div>
                <button
                  onClick={() => setActiveCluster(null)}
                  className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 border border-white/10"
                >
                  Dismiss
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {activeCluster.complaints.map((comp) => (
                  <div
                    key={comp.id}
                    onClick={() => setSelectedComplaint(comp)}
                    className="p-3.5 rounded-2xl bg-[#090d16] border border-white/10 hover:border-cyan-500/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="font-mono font-bold text-cyan-300">{comp.reference_number}</span>
                      <PriorityBadge level={comp.priority_level} score={comp.priority_score} />
                    </div>
                    <p className="font-bold text-white truncate text-sm">{comp.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{comp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
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
    </div>
  );
}
