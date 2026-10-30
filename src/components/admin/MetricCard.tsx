'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'amber' | 'emerald' | 'red' | 'purple' | 'slate';
  badge?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  badge,
}: Props) {
  const variantStyles = {
    blue: {
      iconBg: 'bg-[#EBF3FC] text-[#3978C5] border-[#D0E2F6]',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    red: {
      iconBg: 'bg-red-50 text-red-700 border-red-200',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    slate: {
      iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  };

  const current = variantStyles[variant] || variantStyles.blue;

  return (
    <div className="card-clean p-5 flex flex-col justify-between space-y-3 bg-white border border-[#E5EAF0]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#718096]">{title}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${current.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-[#183B66]">
            {value}
          </span>
          {badge && (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-[11px] text-[#718096] mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
