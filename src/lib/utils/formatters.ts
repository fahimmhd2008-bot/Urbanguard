import type { ComplaintCategory, ComplaintStatus, PriorityLevel } from '@/types/civic';

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {return dateString;}
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString).getTime();
    const now = Date.now();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) {return 'Just now';}
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {return `${diffMinutes}m ago`;}
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {return `${diffHours}h ago`;}
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {return `${diffDays}d ago`;}

    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

export function getPriorityStyles(level: PriorityLevel): {
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  barColor: string;
} {
  switch (level) {
    case 'Critical':
      return {
        badgeBg: 'bg-red-50 text-red-700',
        badgeText: 'text-red-700',
        badgeBorder: 'border-red-200',
        dotColor: 'bg-red-500',
        barColor: 'bg-red-500',
      };
    case 'High':
      return {
        badgeBg: 'bg-amber-50 text-amber-800',
        badgeText: 'text-amber-800',
        badgeBorder: 'border-amber-200',
        dotColor: 'bg-amber-500',
        barColor: 'bg-amber-500',
      };
    case 'Medium':
      return {
        badgeBg: 'bg-blue-50 text-blue-700',
        badgeText: 'text-blue-700',
        badgeBorder: 'border-blue-200',
        dotColor: 'bg-blue-500',
        barColor: 'bg-blue-500',
      };
    case 'Low':
    default:
      return {
        badgeBg: 'bg-slate-100 text-slate-700',
        badgeText: 'text-slate-700',
        badgeBorder: 'border-slate-200',
        dotColor: 'bg-slate-400',
        barColor: 'bg-slate-400',
      };
  }
}

export function getStatusStyles(status: ComplaintStatus): {
  bg: string;
  text: string;
  border: string;
  stepNumber: number;
} {
  switch (status) {
    case 'SUBMITTED':
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', stepNumber: 1 };
    case 'UNDER REVIEW':
      return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', stepNumber: 2 };
    case 'ASSIGNED':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', stepNumber: 3 };
    case 'IN PROGRESS':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', stepNumber: 4 };
    case 'RESOLVED':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', stepNumber: 5 };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', stepNumber: 1 };
  }
}

export const CATEGORY_COLORS: Record<ComplaintCategory, string> = {
  Roads: '#f97316',
  'Water and drainage': '#0284c7',
  'Waste management': '#10b981',
  'Electricity and streetlights': '#eab308',
  'Public infrastructure': '#6366f1',
  'Public safety': '#ef4444',
  Other: '#64748b',
};
