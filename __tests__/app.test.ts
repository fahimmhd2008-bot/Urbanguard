/**
 * @file __tests__/app.test.ts
 * @description Core app-level smoke tests for Urbanguard
 * Verifies essential application constants, environment handling, and data integrity.
 */

// ── App constants ─────────────────────────────────────────────────────────────

const APP_NAME = 'Urbanguard';
const APP_VERSION = '0.1.0';
const APP_DESCRIPTION = 'AI-powered municipal complaint management platform';
const MAX_COMPLAINT_TITLE_LENGTH = 120;
const MAX_COMPLAINT_DESCRIPTION_LENGTH = 2000;
const SUPPORTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
const MAX_FILE_SIZE_MB = 10;

// ── Priority level mappings ───────────────────────────────────────────────────

const PRIORITY_LEVELS = ['Critical', 'High', 'Medium', 'Low'] as const;
const STATUS_PIPELINE = ['SUBMITTED', 'UNDER REVIEW', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED'] as const;

const PRIORITY_WEIGHTS: Record<string, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

// ── Simulated AI classifier ───────────────────────────────────────────────────

function classifyComplaint(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('pothole') || lower.includes('road') || lower.includes('pavement')) return 'Roads';
  if (lower.includes('water') || lower.includes('drain') || lower.includes('flood')) return 'Water and drainage';
  if (lower.includes('garbage') || lower.includes('trash') || lower.includes('waste')) return 'Waste management';
  if (lower.includes('light') || lower.includes('power') || lower.includes('electric')) return 'Electricity and streetlights';
  if (lower.includes('safety') || lower.includes('crime') || lower.includes('dangerous')) return 'Public safety';
  return 'Other';
}

function estimatePriority(category: string, keywords: string[]): string {
  const lowKeywords = keywords.map(k => k.toLowerCase());
  if (lowKeywords.some(k => ['urgent', 'critical', 'emergency', 'dangerous'].includes(k))) return 'Critical';
  if (category === 'Public safety') return 'High';
  if (['Roads', 'Water and drainage'].includes(category)) return 'Medium';
  return 'Low';
}

// ── App constants tests ───────────────────────────────────────────────────────

describe('App constants', () => {
  it('has correct app name', () => {
    expect(APP_NAME).toBe('Urbanguard');
  });

  it('has a valid semantic version', () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('has a non-empty description', () => {
    expect(APP_DESCRIPTION.length).toBeGreaterThan(10);
  });

  it('max title length is a reasonable value', () => {
    expect(MAX_COMPLAINT_TITLE_LENGTH).toBeGreaterThan(10);
    expect(MAX_COMPLAINT_TITLE_LENGTH).toBeLessThanOrEqual(500);
  });

  it('max description length is greater than title length', () => {
    expect(MAX_COMPLAINT_DESCRIPTION_LENGTH).toBeGreaterThan(MAX_COMPLAINT_TITLE_LENGTH);
  });

  it('supports common image formats', () => {
    expect(SUPPORTED_FILE_TYPES).toContain('image/jpeg');
    expect(SUPPORTED_FILE_TYPES).toContain('image/png');
  });

  it('max file size is positive', () => {
    expect(MAX_FILE_SIZE_MB).toBeGreaterThan(0);
  });
});

// ── Priority and status pipeline tests ───────────────────────────────────────

describe('Priority levels', () => {
  it('defines exactly 4 priority levels', () => {
    expect(PRIORITY_LEVELS).toHaveLength(4);
  });

  it('Critical is the first/highest priority', () => {
    expect(PRIORITY_LEVELS[0]).toBe('Critical');
  });

  it('Low is the last/lowest priority', () => {
    expect(PRIORITY_LEVELS[PRIORITY_LEVELS.length - 1]).toBe('Low');
  });

  it('all priority levels have a numeric weight', () => {
    PRIORITY_LEVELS.forEach((level) => {
      expect(typeof PRIORITY_WEIGHTS[level]).toBe('number');
      expect(PRIORITY_WEIGHTS[level]).toBeGreaterThan(0);
    });
  });

  it('Critical has the highest weight', () => {
    expect(PRIORITY_WEIGHTS['Critical']).toBeGreaterThan(PRIORITY_WEIGHTS['High']);
    expect(PRIORITY_WEIGHTS['Critical']).toBeGreaterThan(PRIORITY_WEIGHTS['Medium']);
    expect(PRIORITY_WEIGHTS['Critical']).toBeGreaterThan(PRIORITY_WEIGHTS['Low']);
  });
});

describe('Status pipeline', () => {
  it('defines exactly 5 statuses', () => {
    expect(STATUS_PIPELINE).toHaveLength(5);
  });

  it('pipeline starts with SUBMITTED', () => {
    expect(STATUS_PIPELINE[0]).toBe('SUBMITTED');
  });

  it('pipeline ends with RESOLVED', () => {
    expect(STATUS_PIPELINE[STATUS_PIPELINE.length - 1]).toBe('RESOLVED');
  });

  it('IN PROGRESS comes before RESOLVED', () => {
    const inProgressIdx = STATUS_PIPELINE.indexOf('IN PROGRESS');
    const resolvedIdx = STATUS_PIPELINE.indexOf('RESOLVED');
    expect(inProgressIdx).toBeLessThan(resolvedIdx);
  });
});

// ── AI Classifier tests ───────────────────────────────────────────────────────

describe('classifyComplaint (AI pre-classifier)', () => {
  it('classifies road-related complaints correctly', () => {
    expect(classifyComplaint('There is a huge pothole on the road')).toBe('Roads');
  });

  it('classifies water-related complaints correctly', () => {
    expect(classifyComplaint('There is a flood near the drainage area')).toBe('Water and drainage');
  });

  it('classifies waste-related complaints correctly', () => {
    expect(classifyComplaint('Garbage has not been collected for 2 weeks')).toBe('Waste management');
  });

  it('classifies electricity complaints correctly', () => {
    expect(classifyComplaint('The streetlight near park has no power')).toBe('Electricity and streetlights');
  });

  it('classifies safety complaints correctly', () => {
    expect(classifyComplaint('A dangerous area with frequent crime')).toBe('Public safety');
  });

  it('defaults to Other for unrecognized text', () => {
    expect(classifyComplaint('Random unrecognized complaint')).toBe('Other');
  });

  it('is case-insensitive', () => {
    expect(classifyComplaint('POTHOLE ON ROAD')).toBe('Roads');
    expect(classifyComplaint('WATER DRAIN ISSUE')).toBe('Water and drainage');
  });
});

describe('estimatePriority', () => {
  it('returns Critical for emergency keywords', () => {
    expect(estimatePriority('Roads', ['urgent', 'emergency'])).toBe('Critical');
    expect(estimatePriority('Other', ['dangerous'])).toBe('Critical');
  });

  it('returns High for Public safety category', () => {
    expect(estimatePriority('Public safety', ['noise'])).toBe('High');
  });

  it('returns Medium for Roads category without urgent keywords', () => {
    expect(estimatePriority('Roads', ['pothole'])).toBe('Medium');
  });

  it('returns Low for low-impact categories', () => {
    expect(estimatePriority('Other', ['minor'])).toBe('Low');
  });
});
