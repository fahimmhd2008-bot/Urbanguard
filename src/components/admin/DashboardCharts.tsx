'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Complaint, ComplaintCategory } from '@/types/civic';
import { CATEGORY_COLORS } from '@/lib/utils/formatters';

interface Props {
  complaints: Complaint[];
}

export function DashboardCharts({ complaints }: Props) {
  // 1. Complaints by Category
  const categoryCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  const categoryData = Object.entries(categoryCounts).map(([cat, count]) => ({
    name: cat.length > 14 ? cat.slice(0, 12) + '...' : cat,
    fullName: cat,
    count,
    fill: CATEGORY_COLORS[cat as ComplaintCategory] || '#38bdf8',
  }));

  // 2. Complaints by Status
  const statusCounts: Record<string, number> = {
    SUBMITTED: 0,
    'UNDER REVIEW': 0,
    ASSIGNED: 0,
    'IN PROGRESS': 0,
    RESOLVED: 0,
  };
  complaints.forEach((c) => {
    if (statusCounts[c.status] !== undefined) {
      statusCounts[c.status]++;
    }
  });

  const statusColors: Record<string, string> = {
    SUBMITTED: '#64748b',
    'UNDER REVIEW': '#a855f7',
    ASSIGNED: '#3b82f6',
    'IN PROGRESS': '#f59e0b',
    RESOLVED: '#10b981',
  };

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
    color: statusColors[status] || '#64748b',
  }));

  // 3. Priority Distribution
  const priorityCounts: Record<string, number> = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  };
  complaints.forEach((c) => {
    priorityCounts[c.priority_level] = (priorityCounts[c.priority_level] || 0) + 1;
  });

  const priorityData = [
    { name: 'Critical', count: priorityCounts.Critical, fill: '#f43f5e' },
    { name: 'High', count: priorityCounts.High, fill: '#fb923c' },
    { name: 'Medium', count: priorityCounts.Medium, fill: '#38bdf8' },
    { name: 'Low', count: priorityCounts.Low, fill: '#94a3b8' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Category Breakdown Bar Chart */}
      <div className="bg-[#0f172a]/80 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl lg:col-span-2">
        <h3 className="font-extrabold text-white text-base mb-1">Complaints by Category</h3>
        <p className="text-xs text-slate-400 mb-6">Volume distribution across municipal services</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis dataKey="name" fontSize={10} interval={0} angle={-15} textAnchor="end" stroke="#64748b" />
              <YAxis fontSize={11} allowDecimals={false} stroke="#64748b" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#090d16] border border-white/15 text-white p-3 rounded-xl text-xs shadow-2xl">
                        <p className="font-bold text-white">{data.fullName}</p>
                        <p className="text-cyan-400 font-mono mt-1">{data.count} complaints</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resolution Status Donut */}
      <div className="bg-[#0f172a]/80 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
        <h3 className="font-extrabold text-white text-base mb-1">Status Lifecycle</h3>
        <p className="text-xs text-slate-400 mb-6">Active queue vs verified resolutions</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={55}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#090d16] border border-white/15 text-white p-3 rounded-xl text-xs shadow-2xl">
                        <p className="font-bold text-white">{data.name}</p>
                        <p className="text-cyan-400 font-mono mt-1">{data.value} complaints</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#94a3b8' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-[#0f172a]/80 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl lg:col-span-3">
        <div className="mb-6">
          <h3 className="font-extrabold text-white text-base">Deterministic Priority Distribution</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            0–100 calibrated score spectrum (Critical ≥80, High 60–79, Medium 35–59, Low &lt;35)
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {priorityData.map((prio) => (
            <div
              key={prio.name}
              className="p-5 rounded-2xl border border-white/10 bg-[#090d16]/80 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {prio.name}
                </span>
                <span
                  className="w-3 h-3 rounded-full shadow-lg"
                  style={{ backgroundColor: prio.fill, boxShadow: `0 0 12px ${prio.fill}` }}
                />
              </div>
              <span className="text-3xl font-black font-mono text-white">{prio.count}</span>
              <p className="text-[11px] text-slate-400 mt-2 font-mono">
                {((prio.count / complaints.length) * 100).toFixed(0)}% of total queue
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
