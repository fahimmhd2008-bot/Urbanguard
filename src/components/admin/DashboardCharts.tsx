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
import type { Complaint } from '@/types/civic';

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
    name: cat.length > 15 ? cat.slice(0, 13) + '...' : cat,
    fullName: cat,
    count,
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
    SUBMITTED: '#94A3B8',
    'UNDER REVIEW': '#8B5CF6',
    ASSIGNED: '#3978C5',
    'IN PROGRESS': '#F59E0B',
    RESOLVED: '#10B981',
  };

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
    color: statusColors[status] || '#94A3B8',
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
    { name: 'Critical', count: priorityCounts.Critical, color: '#EF4444', bg: 'bg-red-50', text: 'text-red-700' },
    { name: 'High', count: priorityCounts.High, color: '#F59E0B', bg: 'bg-amber-50', text: 'text-amber-800' },
    { name: 'Medium', count: priorityCounts.Medium, color: '#3978C5', bg: 'bg-blue-50', text: 'text-blue-700' },
    { name: 'Low', count: priorityCounts.Low, color: '#94A3B8', bg: 'bg-slate-100', text: 'text-slate-700' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Category Breakdown Bar Chart */}
      <div className="card-clean p-6 bg-white border border-[#E5EAF0] lg:col-span-2">
        <h3 className="font-bold text-[#183B66] text-sm mb-0.5">Complaints by Category</h3>
        <p className="text-xs text-[#718096] mb-5">Volume distribution across municipal services</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis dataKey="name" fontSize={11} interval={0} angle={-15} textAnchor="end" stroke="#94A3B8" />
              <YAxis fontSize={11} allowDecimals={false} stroke="#94A3B8" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-[#E5EAF0] text-[#263445] p-2.5 rounded-lg text-xs shadow-md">
                        <p className="font-bold text-[#183B66]">{data.fullName}</p>
                        <p className="text-[#3978C5] font-semibold mt-0.5">{data.count} complaints</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="#3978C5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resolution Status Donut */}
      <div className="card-clean p-6 bg-white border border-[#E5EAF0]">
        <h3 className="font-bold text-[#183B66] text-sm mb-0.5">Status Lifecycle</h3>
        <p className="text-xs text-[#718096] mb-5">Current distribution of pipeline stages</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
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
                      <div className="bg-white border border-[#E5EAF0] text-[#263445] p-2.5 rounded-lg text-xs shadow-md">
                        <p className="font-bold text-[#183B66]">{data.name}</p>
                        <p className="text-[#3978C5] font-semibold mt-0.5">{data.value} complaints</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#718096' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="card-clean p-6 bg-white border border-[#E5EAF0] lg:col-span-3">
        <div className="mb-4">
          <h3 className="font-bold text-[#183B66] text-sm">Priority Scoring Spectrum</h3>
          <p className="text-xs text-[#718096]">
            Objective 4-factor calibrated scores (Critical ≥80, High 60–79, Medium 35–59, Low &lt;35)
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {priorityData.map((prio) => (
            <div
              key={prio.name}
              className={`p-4 rounded-lg border border-[#E5EAF0] ${prio.bg} flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold ${prio.text}`}>
                  {prio.name}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: prio.color }}
                />
              </div>
              <span className="text-2xl font-extrabold text-[#183B66]">{prio.count}</span>
              <p className="text-[11px] text-[#718096] mt-1">
                {complaints.length > 0 ? ((prio.count / complaints.length) * 100).toFixed(0) : 0}% of queue
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
