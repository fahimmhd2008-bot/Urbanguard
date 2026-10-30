'use client';

import React from 'react';
import { PriorityLevel } from '@/types/civic';
import { getPriorityStyles } from '@/lib/utils/formatters';

interface Props {
  level: PriorityLevel;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ level, score, showScore = true, size = 'sm' }: Props) {
  const styles = getPriorityStyles(level);

  const sizeClass = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${styles.badgeBg} ${styles.badgeBorder} ${sizeClass}`}
    >
      <span className={`w-2 h-2 rounded-full ${styles.dotColor}`} />
      <span>{level}</span>
      {showScore && typeof score === 'number' && (
        <span className="opacity-75 font-mono text-[11px]">({score})</span>
      )}
    </span>
  );
}
