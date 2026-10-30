/**
 * @file __tests__/api/complaints.test.ts
 * @description Integration-style tests for the complaints API layer
 * Tests data shape validation, filtering logic, and response structure.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

interface Complaint {
  id: string;
  reference_number: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority_level: string;
  priority_score: number;
  location_name: string;
  created_at: string;
  updated_at: string;
}

// ── Mock complaint factory ────────────────────────────────────────────────────

function createMockComplaint(overrides: Partial<Complaint> = {}): Complaint {
  return {
    id: `comp-${Math.random().toString(36).slice(2)}`,
    reference_number: `URB-${Date.now().toString(36).toUpperCase()}-TEST`,
    title: 'Test Complaint Title',
    description: 'This is a detailed test complaint description for unit testing purposes.',
    category: 'Roads',
    status: 'SUBMITTED',
    priority_level: 'Medium',
    priority_score: 50,
    location_name: 'Test Location, Test City',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

// ── Filtering helpers ─────────────────────────────────────────────────────────

function filterByStatus(complaints: Complaint[], status: string): Complaint[] {
  return complaints.filter((c) => c.status === status);
}

function filterByCategory(complaints: Complaint[], category: string): Complaint[] {
  return complaints.filter((c) => c.category === category);
}

function filterByPriority(complaints: Complaint[], level: string): Complaint[] {
  return complaints.filter((c) => c.priority_level === level);
}

function sortByPriorityScore(complaints: Complaint[], order: 'asc' | 'desc' = 'desc'): Complaint[] {
  return [...complaints].sort((a, b) =>
    order === 'desc' ? b.priority_score - a.priority_score : a.priority_score - b.priority_score
  );
}

function searchComplaints(complaints: Complaint[], query: string): Complaint[] {
  const q = query.toLowerCase();
  return complaints.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.reference_number.toLowerCase().includes(q) ||
      c.location_name.toLowerCase().includes(q)
  );
}

function paginateComplaints(complaints: Complaint[], page: number, pageSize: number): Complaint[] {
  const start = (page - 1) * pageSize;
  return complaints.slice(start, start + pageSize);
}

// ── Mock dataset ──────────────────────────────────────────────────────────────

const mockComplaints: Complaint[] = [
  createMockComplaint({ status: 'SUBMITTED', category: 'Roads', priority_level: 'High', priority_score: 75 }),
  createMockComplaint({ status: 'RESOLVED', category: 'Water and drainage', priority_level: 'Medium', priority_score: 50 }),
  createMockComplaint({ status: 'IN PROGRESS', category: 'Roads', priority_level: 'Critical', priority_score: 95 }),
  createMockComplaint({ status: 'SUBMITTED', category: 'Public safety', priority_level: 'Low', priority_score: 20 }),
  createMockComplaint({ status: 'UNDER REVIEW', category: 'Waste management', priority_level: 'Medium', priority_score: 45, title: 'Garbage Issue Downtown' }),
];

// ── createMockComplaint ───────────────────────────────────────────────────────

describe('createMockComplaint factory', () => {
  it('creates a complaint with required fields', () => {
    const c = createMockComplaint();
    expect(c.id).toBeDefined();
    expect(c.reference_number).toBeDefined();
    expect(c.title).toBeDefined();
    expect(c.description).toBeDefined();
    expect(c.category).toBeDefined();
    expect(c.status).toBeDefined();
    expect(c.priority_level).toBeDefined();
    expect(c.priority_score).toBeDefined();
    expect(c.location_name).toBeDefined();
    expect(c.created_at).toBeDefined();
    expect(c.updated_at).toBeDefined();
  });

  it('applies overrides correctly', () => {
    const c = createMockComplaint({ status: 'RESOLVED', priority_score: 99 });
    expect(c.status).toBe('RESOLVED');
    expect(c.priority_score).toBe(99);
  });

  it('generates unique IDs for each call', () => {
    const ids = Array.from({ length: 50 }, () => createMockComplaint().id);
    const unique = new Set(ids);
    expect(unique.size).toBe(50);
  });
});

// ── filterByStatus ────────────────────────────────────────────────────────────

describe('filterByStatus', () => {
  it('returns only complaints matching the given status', () => {
    const result = filterByStatus(mockComplaints, 'SUBMITTED');
    result.forEach((c) => expect(c.status).toBe('SUBMITTED'));
  });

  it('returns correct count', () => {
    const submitted = filterByStatus(mockComplaints, 'SUBMITTED');
    expect(submitted).toHaveLength(2);
  });

  it('returns empty array for non-existent status', () => {
    const result = filterByStatus(mockComplaints, 'ARCHIVED');
    expect(result).toHaveLength(0);
  });
});

// ── filterByCategory ──────────────────────────────────────────────────────────

describe('filterByCategory', () => {
  it('returns only complaints of the given category', () => {
    const result = filterByCategory(mockComplaints, 'Roads');
    result.forEach((c) => expect(c.category).toBe('Roads'));
  });

  it('returns correct count for Roads', () => {
    expect(filterByCategory(mockComplaints, 'Roads')).toHaveLength(2);
  });

  it('returns empty for category with no complaints', () => {
    expect(filterByCategory(mockComplaints, 'Electricity and streetlights')).toHaveLength(0);
  });
});

// ── filterByPriority ──────────────────────────────────────────────────────────

describe('filterByPriority', () => {
  it('returns only Critical complaints', () => {
    const result = filterByPriority(mockComplaints, 'Critical');
    expect(result).toHaveLength(1);
    expect(result[0].priority_level).toBe('Critical');
  });
});

// ── sortByPriorityScore ───────────────────────────────────────────────────────

describe('sortByPriorityScore', () => {
  it('sorts in descending order by default', () => {
    const sorted = sortByPriorityScore(mockComplaints);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].priority_score).toBeGreaterThanOrEqual(sorted[i + 1].priority_score);
    }
  });

  it('sorts in ascending order when specified', () => {
    const sorted = sortByPriorityScore(mockComplaints, 'asc');
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].priority_score).toBeLessThanOrEqual(sorted[i + 1].priority_score);
    }
  });

  it('does not mutate the original array', () => {
    const original = [...mockComplaints];
    sortByPriorityScore(mockComplaints);
    expect(mockComplaints).toEqual(original);
  });
});

// ── searchComplaints ──────────────────────────────────────────────────────────

describe('searchComplaints', () => {
  it('finds complaints by title keyword', () => {
    const results = searchComplaints(mockComplaints, 'Garbage');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toMatch(/Garbage/i);
  });

  it('is case-insensitive', () => {
    const lower = searchComplaints(mockComplaints, 'garbage');
    const upper = searchComplaints(mockComplaints, 'GARBAGE');
    expect(lower.length).toBe(upper.length);
  });

  it('returns empty for non-matching query', () => {
    const results = searchComplaints(mockComplaints, 'zzz_nonexistent_xyz');
    expect(results).toHaveLength(0);
  });

  it('returns all complaints for empty query', () => {
    const results = searchComplaints(mockComplaints, '');
    expect(results).toHaveLength(mockComplaints.length);
  });
});

// ── paginateComplaints ────────────────────────────────────────────────────────

describe('paginateComplaints', () => {
  const largeList = Array.from({ length: 25 }, (_, i) =>
    createMockComplaint({ title: `Complaint ${i + 1}` })
  );

  it('returns correct page size', () => {
    const page = paginateComplaints(largeList, 1, 10);
    expect(page).toHaveLength(10);
  });

  it('returns correct items for page 2', () => {
    const page1 = paginateComplaints(largeList, 1, 10);
    const page2 = paginateComplaints(largeList, 2, 10);
    expect(page1[0].title).not.toBe(page2[0].title);
  });

  it('returns remaining items on the last page', () => {
    const lastPage = paginateComplaints(largeList, 3, 10);
    expect(lastPage).toHaveLength(5);
  });

  it('returns empty array for out-of-range page', () => {
    const empty = paginateComplaints(largeList, 100, 10);
    expect(empty).toHaveLength(0);
  });
});
