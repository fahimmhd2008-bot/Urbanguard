'use client';

import React from 'react';
import type {
  LucideIcon} from 'lucide-react';
import {
  Car,
  Droplets,
  Trash2,
  Zap,
  Building2,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import type { ComplaintCategory } from '@/types/civic';

interface Props {
  category: ComplaintCategory;
  className?: string;
  size?: number;
}

const CATEGORY_ICONS: Record<ComplaintCategory, LucideIcon> = {
  Roads: Car,
  'Water and drainage': Droplets,
  'Waste management': Trash2,
  'Electricity and streetlights': Zap,
  'Public infrastructure': Building2,
  'Public safety': ShieldAlert,
  Other: HelpCircle,
};

export function CategoryIcon({ category, className = 'w-4 h-4', size }: Props) {
  const IconComponent = CATEGORY_ICONS[category] || HelpCircle;
  return <IconComponent className={className} size={size} />;
}
