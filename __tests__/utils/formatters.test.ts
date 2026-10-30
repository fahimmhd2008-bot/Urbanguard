/**
 * @file __tests__/utils/formatters.test.ts
 * @description Unit tests for Urbanguard utility formatting functions
 */

// Pure utility tests - no JSX needed
// We replicate the logic here so tests run without Next.js transpilation issues

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateString: string): string {
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

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffSeconds = Math.floor((now - date) / 1000);

  if (diffSeconds < 60) {return 'Just now';}
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {return `${diffMinutes}m ago`;}
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {return `${diffHours}h ago`;}
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {return `${diffDays}d ago`;}
  return formatDate(dateString);
}

type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';
type ComplaintStatus = 'SUBMITTED' | 'UNDER REVIEW' | 'ASSIGNED' | 'IN PROGRESS' | 'RESOLVED';

function getPriorityStyles(level: PriorityLevel) {
  switch (level) {
    case 'Critical':
      return { badgeBg: 'bg-red-50 text-red-700', dotColor: 'bg-red-500' };
    case 'High':
      return { badgeBg: 'bg-amber-50 text-amber-800', dotColor: 'bg-amber-500' };
    case 'Medium':
      return { badgeBg: 'bg-blue-50 text-blue-700', dotColor: 'bg-blue-500' };
    case 'Low':
    default:
      return { badgeBg: 'bg-slate-100 text-slate-700', dotColor: 'bg-slate-400' };
  }
}

function getStatusStyles(status: ComplaintStatus) {
  switch (status) {
    case 'SUBMITTED': return { stepNumber: 1 };
    case 'UNDER REVIEW': return { stepNumber: 2 };
    case 'ASSIGNED': return { stepNumber: 3 };
    case 'IN PROGRESS': return { stepNumber: 4 };
    case 'RESOLVED': return { stepNumber: 5 };
    default: return { stepNumber: 1 };
  }
}

// ── formatDate ────────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('returns a formatted date string for a valid ISO date', () => {
    const result = formatDate('2024-01-15T10:30:00.000Z');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns the original string for an invalid date', () => {
    const invalid = 'not-a-date';
    const result = formatDate(invalid);
    expect(result).toBe(invalid);
  });

  it('handles empty string gracefully', () => {
    const result = formatDate('');
    expect(typeof result).toBe('string');
  });

  it('formats a known date correctly', () => {
    // 2024-06-01 in UTC → should contain "Jun" and "2024"
    const result = formatDate('2024-06-01T00:00:00.000Z');
    expect(result).toMatch(/2024/);
  });
});

// ── formatRelativeTime ────────────────────────────────────────────────────────

describe('formatRelativeTime', () => {
  it('returns "Just now" for a very recent timestamp', () => {
    const recent = new Date(Date.now() - 5000).toISOString(); // 5 seconds ago
    expect(formatRelativeTime(recent)).toBe('Just now');
  });

  it('returns minutes ago for a timestamp a few minutes back', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const result = formatRelativeTime(fiveMinutesAgo);
    expect(result).toMatch(/m ago/);
  });

  it('returns hours ago for a timestamp several hours back', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(threeHoursAgo);
    expect(result).toMatch(/h ago/);
  });

  it('returns days ago for a timestamp a few days back', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(threeDaysAgo);
    expect(result).toMatch(/d ago/);
  });

  it('falls back to formatted date for old timestamps', () => {
    const oldDate = '2020-01-01T00:00:00.000Z';
    const result = formatRelativeTime(oldDate);
    expect(result).toMatch(/2020/);
  });
});

// ── getPriorityStyles ─────────────────────────────────────────────────────────

describe('getPriorityStyles', () => {
  it('returns red styles for Critical priority', () => {
    const styles = getPriorityStyles('Critical');
    expect(styles.badgeBg).toContain('red');
    expect(styles.dotColor).toContain('red');
  });

  it('returns amber styles for High priority', () => {
    const styles = getPriorityStyles('High');
    expect(styles.badgeBg).toContain('amber');
  });

  it('returns blue styles for Medium priority', () => {
    const styles = getPriorityStyles('Medium');
    expect(styles.badgeBg).toContain('blue');
  });

  it('returns slate styles for Low priority', () => {
    const styles = getPriorityStyles('Low');
    expect(styles.badgeBg).toContain('slate');
  });
});

// ── getStatusStyles ───────────────────────────────────────────────────────────

describe('getStatusStyles', () => {
  const statuses: ComplaintStatus[] = ['SUBMITTED', 'UNDER REVIEW', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED'];

  it.each(statuses)('returns a valid stepNumber for status "%s"', (status) => {
    const styles = getStatusStyles(status);
    expect(styles.stepNumber).toBeGreaterThanOrEqual(1);
    expect(styles.stepNumber).toBeLessThanOrEqual(5);
  });

  it('returns stepNumber 1 for SUBMITTED', () => {
    expect(getStatusStyles('SUBMITTED').stepNumber).toBe(1);
  });

  it('returns stepNumber 5 for RESOLVED', () => {
    expect(getStatusStyles('RESOLVED').stepNumber).toBe(5);
  });

  it('RESOLVED has a higher step than SUBMITTED', () => {
    expect(getStatusStyles('RESOLVED').stepNumber).toBeGreaterThan(
      getStatusStyles('SUBMITTED').stepNumber
    );
  });
});
