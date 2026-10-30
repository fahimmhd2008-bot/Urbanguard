/**
 * @file __tests__/utils/complaintHelpers.test.ts
 * @description Unit tests for Urbanguard complaint data helpers and validators
 */

// ── Complaint data validation helpers ────────────────────────────────────────

type ComplaintCategory =
  | 'Roads'
  | 'Water and drainage'
  | 'Waste management'
  | 'Electricity and streetlights'
  | 'Public infrastructure'
  | 'Public safety'
  | 'Other';

const VALID_CATEGORIES: ComplaintCategory[] = [
  'Roads',
  'Water and drainage',
  'Waste management',
  'Electricity and streetlights',
  'Public infrastructure',
  'Public safety',
  'Other',
];

const CATEGORY_COLORS: Record<ComplaintCategory, string> = {
  Roads: '#f97316',
  'Water and drainage': '#0284c7',
  'Waste management': '#10b981',
  'Electricity and streetlights': '#eab308',
  'Public infrastructure': '#6366f1',
  'Public safety': '#ef4444',
  Other: '#64748b',
};

function generateReferenceNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `URB-${timestamp}-${random}`;
}

function isValidCategory(cat: string): cat is ComplaintCategory {
  return VALID_CATEGORIES.includes(cat as ComplaintCategory);
}

function validateComplaintForm(data: {
  title: string;
  description: string;
  category: string;
  location_name: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.title || data.title.trim().length < 5) {
    errors.push('Title must be at least 5 characters');
  }
  if (!data.description || data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }
  if (!isValidCategory(data.category)) {
    errors.push('Please select a valid category');
  }
  if (!data.location_name || data.location_name.trim().length < 3) {
    errors.push('Location name must be at least 3 characters');
  }
  return { valid: errors.length === 0, errors };
}

function getPriorityScore(level: string): number {
  switch (level) {
    case 'Critical': return 90;
    case 'High': return 70;
    case 'Medium': return 50;
    case 'Low': return 25;
    default: return 0;
  }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + '…';
}

// ── Category tests ────────────────────────────────────────────────────────────

describe('VALID_CATEGORIES', () => {
  it('contains exactly 7 categories', () => {
    expect(VALID_CATEGORIES).toHaveLength(7);
  });

  it('includes all expected municipal complaint types', () => {
    expect(VALID_CATEGORIES).toContain('Roads');
    expect(VALID_CATEGORIES).toContain('Water and drainage');
    expect(VALID_CATEGORIES).toContain('Waste management');
    expect(VALID_CATEGORIES).toContain('Public safety');
    expect(VALID_CATEGORIES).toContain('Other');
  });
});

describe('CATEGORY_COLORS', () => {
  it('has a color for every valid category', () => {
    VALID_CATEGORIES.forEach((cat) => {
      expect(CATEGORY_COLORS[cat]).toBeDefined();
      expect(CATEGORY_COLORS[cat]).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it('uses distinct colors for different categories', () => {
    const colors = Object.values(CATEGORY_COLORS);
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(colors.length);
  });
});

// ── generateReferenceNumber ───────────────────────────────────────────────────

describe('generateReferenceNumber', () => {
  it('generates a string starting with URB-', () => {
    const ref = generateReferenceNumber();
    expect(ref).toMatch(/^URB-/);
  });

  it('generates unique reference numbers', () => {
    const refs = new Set(Array.from({ length: 100 }, () => generateReferenceNumber()));
    expect(refs.size).toBe(100);
  });

  it('reference number has correct structure (URB-XXXX-XXXX)', () => {
    const ref = generateReferenceNumber();
    const parts = ref.split('-');
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe('URB');
    expect(parts[1].length).toBeGreaterThan(0);
    expect(parts[2].length).toBeGreaterThan(0);
  });
});

// ── isValidCategory ───────────────────────────────────────────────────────────

describe('isValidCategory', () => {
  it('returns true for all valid categories', () => {
    VALID_CATEGORIES.forEach((cat) => {
      expect(isValidCategory(cat)).toBe(true);
    });
  });

  it('returns false for invalid category strings', () => {
    expect(isValidCategory('Unknown')).toBe(false);
    expect(isValidCategory('')).toBe(false);
    expect(isValidCategory('ROADS')).toBe(false); // case-sensitive
  });
});

// ── validateComplaintForm ─────────────────────────────────────────────────────

describe('validateComplaintForm', () => {
  const validData = {
    title: 'Pothole on Main Street',
    description: 'There is a large pothole causing traffic hazards.',
    category: 'Roads',
    location_name: 'Main Street',
  };

  it('returns valid=true for correct input', () => {
    const result = validateComplaintForm(validData);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails validation when title is too short', () => {
    const result = validateComplaintForm({ ...validData, title: 'Hi' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Title must be at least 5 characters');
  });

  it('fails validation when description is too short', () => {
    const result = validateComplaintForm({ ...validData, description: 'short' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Description must be at least 10 characters');
  });

  it('fails validation when category is invalid', () => {
    const result = validateComplaintForm({ ...validData, category: 'Invalid' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Please select a valid category');
  });

  it('fails validation when location is too short', () => {
    const result = validateComplaintForm({ ...validData, location_name: 'AB' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Location name must be at least 3 characters');
  });

  it('can return multiple errors simultaneously', () => {
    const result = validateComplaintForm({
      title: '',
      description: '',
      category: '',
      location_name: '',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

// ── getPriorityScore ──────────────────────────────────────────────────────────

describe('getPriorityScore', () => {
  it('Critical has the highest score', () => {
    const critical = getPriorityScore('Critical');
    expect(critical).toBeGreaterThan(getPriorityScore('High'));
    expect(critical).toBeGreaterThan(getPriorityScore('Medium'));
    expect(critical).toBeGreaterThan(getPriorityScore('Low'));
  });

  it('scores are in descending order by severity', () => {
    expect(getPriorityScore('Critical')).toBeGreaterThan(getPriorityScore('High'));
    expect(getPriorityScore('High')).toBeGreaterThan(getPriorityScore('Medium'));
    expect(getPriorityScore('Medium')).toBeGreaterThan(getPriorityScore('Low'));
  });

  it('returns 0 for unknown priority levels', () => {
    expect(getPriorityScore('Unknown')).toBe(0);
  });
});

// ── truncateText ──────────────────────────────────────────────────────────────

describe('truncateText', () => {
  it('returns full text when under the limit', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('truncates text exceeding the limit and appends ellipsis', () => {
    const result = truncateText('Hello World', 5);
    expect(result).toMatch(/…$/);
    expect(result.length).toBeLessThanOrEqual(6);
  });

  it('does not truncate text at exactly the limit', () => {
    expect(truncateText('Hello', 5)).toBe('Hello');
  });

  it('handles empty strings', () => {
    expect(truncateText('', 10)).toBe('');
  });
});
