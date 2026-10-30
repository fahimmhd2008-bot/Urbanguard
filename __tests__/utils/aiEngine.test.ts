/**
 * @file __tests__/utils/aiEngine.test.ts
 * @description Unit tests for Urbanguard's AI classification, priority scoring, and duplicate detection logic.
 */

// ── AI Classification Engine ──────────────────────────────────────────────────

type ComplaintCategory =
  | 'Roads'
  | 'Water and drainage'
  | 'Waste management'
  | 'Electricity and streetlights'
  | 'Public infrastructure'
  | 'Public safety'
  | 'Other';

interface ClassificationResult {
  category: ComplaintCategory;
  confidence: number;
  keywords: string[];
}

const CATEGORY_KEYWORDS: Record<ComplaintCategory, string[]> = {
  Roads: ['pothole', 'road', 'pavement', 'highway', 'street', 'traffic', 'crack', 'asphalt'],
  'Water and drainage': ['water', 'drain', 'flood', 'pipe', 'sewage', 'leak', 'overflow'],
  'Waste management': ['garbage', 'trash', 'waste', 'litter', 'dump', 'bins', 'collection'],
  'Electricity and streetlights': ['light', 'electric', 'power', 'outage', 'streetlight', 'wire', 'voltage'],
  'Public infrastructure': ['bridge', 'building', 'sidewalk', 'footpath', 'bench', 'park', 'fence'],
  'Public safety': ['crime', 'unsafe', 'dangerous', 'accident', 'violence', 'theft', 'hazard'],
  Other: [],
};

function classifyComplaint(title: string, description: string): ClassificationResult {
  const text = `${title} ${description}`.toLowerCase();
  const scores: Record<ComplaintCategory, number> = {
    Roads: 0,
    'Water and drainage': 0,
    'Waste management': 0,
    'Electricity and streetlights': 0,
    'Public infrastructure': 0,
    'Public safety': 0,
    Other: 0,
  };

  const matchedKeywords: string[] = [];

  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [ComplaintCategory, string[]][]) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        scores[cat]++;
        matchedKeywords.push(kw);
      }
    }
  }

  let best: ComplaintCategory = 'Other';
  let bestScore = 0;
  for (const [cat, score] of Object.entries(scores) as [ComplaintCategory, number][]) {
    if (score > bestScore) {
      bestScore = score;
      best = cat;
    }
  }

  const totalKeywords = Object.values(CATEGORY_KEYWORDS).flat().length;
  const confidence = bestScore > 0 ? Math.min(Math.round((bestScore / 5) * 100), 99) : 30;

  return { category: best, confidence, keywords: matchedKeywords };
}

// ── Priority Scorer ───────────────────────────────────────────────────────────

interface PriorityResult {
  level: 'Critical' | 'High' | 'Medium' | 'Low';
  score: number;
  factors: string[];
}

function calculatePriorityScore(opts: {
  title: string;
  description: string;
  category: ComplaintCategory;
  nearbyRelatedCount?: number;
}): PriorityResult {
  let score = 30;
  const factors: string[] = [];

  const urgentWords = ['urgent', 'emergency', 'critical', 'immediately', 'dangerous', 'hazard'];
  const text = `${opts.title} ${opts.description}`.toLowerCase();

  if (urgentWords.some((w) => text.includes(w))) {
    score += 40;
    factors.push('Urgent keywords detected');
  }

  if (opts.category === 'Public safety') {
    score += 25;
    factors.push('Public safety category');
  } else if (['Roads', 'Water and drainage', 'Electricity and streetlights'].includes(opts.category)) {
    score += 15;
    factors.push('High-impact infrastructure category');
  }

  if ((opts.nearbyRelatedCount ?? 0) >= 3) {
    score += 15;
    factors.push('Multiple nearby reports');
  }

  score = Math.min(score, 100);

  let level: PriorityResult['level'];
  if (score >= 80) { level = 'Critical'; }
  else if (score >= 60) { level = 'High'; }
  else if (score >= 40) { level = 'Medium'; }
  else { level = 'Low'; }

  return { level, score, factors };
}

// ── Duplicate Detector ────────────────────────────────────────────────────────

interface ReportLocation {
  latitude: number;
  longitude: number;
  title: string;
  category: string;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function detectDuplicates(
  incoming: ReportLocation,
  existing: ReportLocation[],
  radiusMetres: number
): ReportLocation[] {
  return existing.filter((ex) => {
    const distance = haversineDistance(
      incoming.latitude, incoming.longitude,
      ex.latitude, ex.longitude
    );
    return distance <= radiusMetres && ex.category === incoming.category;
  });
}

// ── Classification Tests ──────────────────────────────────────────────────────

describe('classifyComplaint', () => {
  it('classifies road complaints correctly', () => {
    const result = classifyComplaint('Large pothole', 'There is a large pothole on the road that damages vehicles');
    expect(result.category).toBe('Roads');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.keywords.length).toBeGreaterThan(0);
  });

  it('classifies water complaints correctly', () => {
    const result = classifyComplaint('Flooding near drain', 'The drain is overflowing and causing a flood');
    expect(result.category).toBe('Water and drainage');
  });

  it('classifies waste complaints correctly', () => {
    const result = classifyComplaint('Garbage not collected', 'Trash and garbage bins are overflowing with waste');
    expect(result.category).toBe('Waste management');
  });

  it('classifies electricity complaints correctly', () => {
    const result = classifyComplaint('Power outage', 'The streetlight has a power outage and electric wire is exposed');
    expect(result.category).toBe('Electricity and streetlights');
  });

  it('classifies safety complaints correctly', () => {
    const result = classifyComplaint('Dangerous area', 'This area is unsafe due to frequent theft and crime');
    expect(result.category).toBe('Public safety');
  });

  it('falls back to Other for ambiguous text', () => {
    const result = classifyComplaint('General feedback', 'This is just general feedback');
    expect(result.category).toBe('Other');
  });

  it('returns confidence between 0 and 100', () => {
    const result = classifyComplaint('Pothole road crack pavement', 'Road pavement crack street highway');
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(100);
  });

  it('returns an array of matched keywords', () => {
    const result = classifyComplaint('pothole road', 'street crack');
    expect(Array.isArray(result.keywords)).toBe(true);
  });
});

// ── Priority Scorer Tests ─────────────────────────────────────────────────────

describe('calculatePriorityScore', () => {
  it('returns Critical for urgent public safety issues', () => {
    const result = calculatePriorityScore({
      title: 'Emergency: dangerous situation',
      description: 'Immediate hazard',
      category: 'Public safety',
    });
    expect(result.level).toBe('Critical');
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  it('returns Medium or higher for public safety without urgent keywords', () => {
    const result = calculatePriorityScore({
      title: 'Safety concern at park',
      description: 'Some safety issues reported',
      category: 'Public safety',
    });
    expect(['Medium', 'High', 'Critical']).toContain(result.level);
    expect(result.score).toBeGreaterThanOrEqual(40);
  });

  it('boost score for clustered reports', () => {
    const base = calculatePriorityScore({ title: 'Pothole', description: 'Road issue', category: 'Roads', nearbyRelatedCount: 0 });
    const clustered = calculatePriorityScore({ title: 'Pothole', description: 'Road issue', category: 'Roads', nearbyRelatedCount: 5 });
    expect(clustered.score).toBeGreaterThan(base.score);
  });

  it('score is always between 0 and 100', () => {
    const result = calculatePriorityScore({
      title: 'Critical emergency urgent dangerous hazard',
      description: 'Immediate critical emergency',
      category: 'Public safety',
      nearbyRelatedCount: 10,
    });
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('includes factors array in result', () => {
    const result = calculatePriorityScore({
      title: 'Urgent pothole',
      description: 'emergency road issue',
      category: 'Roads',
    });
    expect(Array.isArray(result.factors)).toBe(true);
    expect(result.factors.length).toBeGreaterThan(0);
  });

  it('Low level for minimal-impact reports', () => {
    const result = calculatePriorityScore({
      title: 'Minor issue',
      description: 'Just a small cosmetic issue',
      category: 'Other',
    });
    expect(result.level).toBe('Low');
  });
});

// ── Haversine Distance Tests ──────────────────────────────────────────────────

describe('haversineDistance', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineDistance(12.9716, 77.5946, 12.9716, 77.5946)).toBe(0);
  });

  it('returns positive distance for different coordinates', () => {
    const dist = haversineDistance(12.9716, 77.5946, 12.9800, 77.6000);
    expect(dist).toBeGreaterThan(0);
  });

  it('distance is symmetric', () => {
    const d1 = haversineDistance(12.97, 77.59, 13.00, 77.65);
    const d2 = haversineDistance(13.00, 77.65, 12.97, 77.59);
    expect(Math.abs(d1 - d2)).toBeLessThan(0.001);
  });

  it('known distance is approximately correct (Bangalore ~7km)', () => {
    // Distance between two points ~7km apart in Bangalore
    const dist = haversineDistance(12.9716, 77.5946, 13.0358, 77.5970);
    expect(dist).toBeGreaterThan(5000);
    expect(dist).toBeLessThan(10000);
  });
});

// ── Duplicate Detector Tests ──────────────────────────────────────────────────

describe('detectDuplicates', () => {
  const incoming: ReportLocation = {
    latitude: 12.9716,
    longitude: 77.5946,
    title: 'Pothole',
    category: 'Roads',
  };

  const existing: ReportLocation[] = [
    { latitude: 12.9720, longitude: 77.5950, title: 'Road issue', category: 'Roads' },      // nearby + same cat
    { latitude: 12.9716, longitude: 77.5946, title: 'Exact same location', category: 'Roads' }, // exact match
    { latitude: 13.5000, longitude: 78.0000, title: 'Far away', category: 'Roads' },          // far away
    { latitude: 12.9720, longitude: 77.5950, title: 'Different category', category: 'Other' }, // nearby diff cat
  ];

  it('detects nearby same-category reports as duplicates', () => {
    const dupes = detectDuplicates(incoming, existing, 100);
    expect(dupes.length).toBeGreaterThanOrEqual(1);
  });

  it('does not flag far-away reports as duplicates', () => {
    const dupes = detectDuplicates(incoming, existing, 100);
    expect(dupes.every((d) => d.title !== 'Far away')).toBe(true);
  });

  it('does not flag different-category nearby reports', () => {
    const dupes = detectDuplicates(incoming, existing, 100);
    expect(dupes.every((d) => d.category === incoming.category)).toBe(true);
  });

  it('returns empty array when no duplicates found', () => {
    const dupes = detectDuplicates(incoming, [], 100);
    expect(dupes).toHaveLength(0);
  });

  it('radius expansion finds more duplicates', () => {
    const small = detectDuplicates(incoming, existing, 1);
    const large = detectDuplicates(incoming, existing, 100000);
    expect(large.length).toBeGreaterThanOrEqual(small.length);
  });
});
