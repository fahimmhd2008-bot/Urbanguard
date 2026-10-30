'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

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
      gradient: 'from-blue-500/15 to-blue-600/5',
      border: 'border-blue-500/30',
      iconBg: 'bg-blue-500/10 text-cyan-400 border-blue-500/30',
      valColor: 'text-white',
    },
    amber: {
      gradient: 'from-amber-500/15 to-orange-500/5',
      border: 'border-amber-500/30',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      valColor: 'text-white',
    },
    emerald: {
      gradient: 'from-emerald-500/15 to-teal-500/5',
      border: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      valColor: 'text-white',
    },
    red: {
      gradient: 'from-rose-500/15 to-red-500/5',
      border: 'border-rose-500/30',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      valColor: 'text-white',
    },
    purple: {
      gradient: 'from-purple-500/15 to-indigo-500/5',
      border: 'border-purple-500/30',
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      valColor: 'text-white',
    },
    slate: {
      gradient: 'from-slate-800/40 to-slate-900/40',
      border: 'border-white/10',
      iconBg: 'bg-white/5 text-slate-300 border-white/10',
      valColor: 'text-white',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`p-5 rounded-3xl border ${style.border} bg-gradient-to-b ${style.gradient} bg-[#0f172a]/80 shadow-xl backdrop-blur-xl flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl`}
    >
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-2xl border ${style.iconBg} shadow-inner`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-2">
          <span className={`text-3xl font-black font-mono tracking-tight ${style.valColor}`}>
            {value}
          </span>
          {badge && (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1.5 font-medium leading-relaxed">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
