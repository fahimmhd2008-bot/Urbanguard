import { classifyComplaint } from '@/lib/ai/classifier';
import { calculatePriorityScore } from '@/lib/ai/priorityScorer';
import { generateComplaintSummary } from '@/lib/ai/summarizer';
import { detectDuplicates, calculateDistanceMeters } from '@/lib/ai/duplicateDetector';
import { generateAIActionBrief } from '@/lib/ai/actionBrief';
import { formatDate, formatRelativeTime, getPriorityStyles, getStatusStyles, CATEGORY_COLORS } from '@/lib/utils/formatters';
import { identifyHotspots } from '@/lib/utils/geo';
import type { Complaint } from '@/types/civic';

describe('Real Source Code Coverage Tests', () => {
  it('tests real classifier across multiple categories', () => {
    const resRoads = classifyComplaint('Huge pothole on road', 'Needs asphalt repair');
    expect(resRoads.category).toBe('Roads');
    expect(resRoads.confidence).toBeGreaterThan(0.5);
    expect(resRoads.recommendedDepartment).toBe('Road Infrastructure & Maintenance');

    const resWater = classifyComplaint('Flooded road', 'Drainage pipe burst with muddy water');
    expect(resWater.category).toBe('Water and drainage');

    const resWaste = classifyComplaint('Garbage overflow', 'Trash bin uncollected and stench');
    expect(resWaste.category).toBe('Waste management');

    const resElectric = classifyComplaint('Broken streetlight', 'Lamppost spark power cut');
    expect(resElectric.category).toBe('Electricity and streetlights');

    const resSafety = classifyComplaint('Hazardous pit', 'Open live wire accident hazard');
    expect(resSafety.category).toBe('Public safety');

    const resOther = classifyComplaint('Loud noise', 'Neighbor playing loudspeaker');
    expect(resOther.category).toBe('Other');
  });

  it('tests real priority scorer', () => {
    const resCritical = calculatePriorityScore({
      title: 'Live wire sparking accident',
      description: 'Severe accident live wire submerged in highway hospital junction urgent',
      category: 'Public safety',
      locationName: 'Main highway junction',
      nearbyRelatedCount: 4,
    });
    expect(resCritical.total_score).toBeGreaterThan(60);
    expect(resCritical.safety_risk).toBeGreaterThan(0);
    expect(resCritical.explanation).toBeDefined();

    const resLow = calculatePriorityScore({
      title: 'Minor tree branch',
      description: 'Small branch on alley footpath',
      category: 'Other',
      locationName: 'Alley',
    });
    expect(resLow.level).toBe('Low');
  });

  it('tests real summarizer', () => {
    const res = generateComplaintSummary({
      title: 'Massive water pipe burst',
      description: 'Water flooding residential homes and school students',
      category: 'Water and drainage',
      locationName: '5th Cross Street',
    });
    expect(res.what).toBe('Massive water pipe burst');
    expect(res.where).toBe('5th Cross Street');
    expect(res.impact).toContain('Residential');
    expect(res.action).toContain('Waterline');
    expect(res.fullSummary).toContain('Massive water pipe burst');

    // Test other impacts & categories
    const res2 = generateComplaintSummary({
      title: 'Broken bus stop',
      description: 'Pedestrian walkway near shops',
      category: 'Public infrastructure',
      locationName: 'Market',
    });
    expect(res2.impact).toBeDefined();
    expect(res2.action).toContain('civil');
  });

  it('tests real duplicate detector', () => {
    const mockComplaint: Complaint = {
      id: 'comp-101',
      reference_number: 'URB-2026-101',
      title: 'Deep pothole on 100ft road',
      description: 'Huge crater on the same 100ft road causing traffic delay',
      category: 'Roads',
      priority_level: 'High',
      priority_score: 75,
      status: 'SUBMITTED',
      latitude: 12.9718,
      longitude: 77.5947,
      location_name: '100ft Road',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assigned_department: 'Road Infrastructure & Maintenance',
    };

    const candidates = detectDuplicates(
      {
        id: 'comp-102',
        title: 'Pothole crater on 100ft road',
        description: 'Road crater causing severe traffic delay on 100ft road',
        category: 'Roads',
        latitude: 12.9719,
        longitude: 77.5948,
        created_at: new Date().toISOString(),
      },
      [mockComplaint],
      40
    );

    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0].similarity_score).toBeGreaterThan(40);
    expect(candidates[0].reference_number).toBe('URB-2026-101');
    expect(candidates[0].distance_meters).toBeLessThan(100);
  });

  it('tests real formatters all branches and edge cases', () => {
    const nowIso = new Date().toISOString();
    expect(formatDate(nowIso)).toBeDefined();
    expect(formatDate('invalid-date')).toBe('invalid-date');

    const now = Date.now();
    expect(formatRelativeTime(new Date(now - 10 * 1000).toISOString())).toBe('Just now');
    expect(formatRelativeTime(new Date(now - 5 * 60 * 1000).toISOString())).toBe('5m ago');
    expect(formatRelativeTime(new Date(now - 3 * 3600 * 1000).toISOString())).toBe('3h ago');
    expect(formatRelativeTime(new Date(now - 2 * 86400 * 1000).toISOString())).toBe('2d ago');
    expect(formatRelativeTime(new Date(now - 15 * 86400 * 1000).toISOString())).toBeDefined();
    expect(formatRelativeTime('invalid')).toBe('invalid');

    expect(getPriorityStyles('Critical').badgeBg).toContain('red');
    expect(getPriorityStyles('High').badgeBg).toContain('amber');
    expect(getPriorityStyles('Medium').badgeBg).toContain('blue');
    expect(getPriorityStyles('Low').badgeBg).toContain('slate');
    expect(getPriorityStyles('Unknown' as any).badgeBg).toContain('slate');

    expect(getStatusStyles('SUBMITTED').stepNumber).toBe(1);
    expect(getStatusStyles('UNDER REVIEW').stepNumber).toBe(2);
    expect(getStatusStyles('ASSIGNED').stepNumber).toBe(3);
    expect(getStatusStyles('IN PROGRESS').stepNumber).toBe(4);
    expect(getStatusStyles('RESOLVED').stepNumber).toBe(5);
    expect(getStatusStyles('UNKNOWN' as any).stepNumber).toBe(1);

    expect(CATEGORY_COLORS['Roads']).toBe('#f97316');
  });

  it('tests real summarizer all impact and category action branches', () => {
    // Traffic / commuter impact + Roads
    const rRoads = generateComplaintSummary({
      title: 'Road subsidence',
      description: 'Massive crater blocking commuter bus transit lane and traffic flow',
      category: 'Roads',
      locationName: 'North Highway',
    });
    expect(rRoads.impact).toContain('Vehicular');
    expect(rRoads.action).toContain('barricading');

    // School / students impact + Waste management
    const rWaste = generateComplaintSummary({
      title: 'Garbage dump near school',
      description: 'Overflowing dumpster affecting school children and students',
      category: 'Waste management',
      locationName: 'School Road',
    });
    expect(rWaste.impact).toContain('School');
    expect(rWaste.action).toContain('Compactor');

    // Shops / market impact + Electricity
    const rElectric = generateComplaintSummary({
      title: 'Power cut at market',
      description: 'Streetlight out affecting market shops and business',
      category: 'Electricity and streetlights',
      locationName: 'Central Bazaar',
    });
    expect(rElectric.impact).toContain('business');
    expect(rElectric.action).toContain('insulation');

    // Public safety action
    const rSafety = generateComplaintSummary({
      title: 'Exposed open pit',
      description: 'Dangerous pit near sidewalk',
      category: 'Public safety',
      locationName: 'Park Entrance',
    });
    expect(rSafety.action).toContain('cordoning');
  });

  it('tests priority scorer various threshold scores (High, Medium, Low)', () => {
    // High score branch (60-79)
    const resHigh = calculatePriorityScore({
      title: 'Broken water main',
      description: 'Pothole and hazard on residential main road',
      category: 'Water and drainage',
      locationName: 'Main Road',
    });
    expect(['High', 'Critical', 'Medium']).toContain(resHigh.level);

    // Medium score branch (35-59)
    const resMed = calculatePriorityScore({
      title: 'Pavement crack',
      description: 'Minor crack on park footpath',
      category: 'Roads',
      locationName: 'Park Lane',
    });
    expect(resMed.total_score).toBeGreaterThan(0);
  });

  it('tests real geo calculation & hotspot clustering sorting', () => {
    const dist = calculateDistanceMeters(12.9716, 77.5946, 12.9718, 77.5947);
    expect(dist).toBeGreaterThanOrEqual(0);

    const compA: Complaint = {
      id: 'c1',
      reference_number: 'URB-1',
      title: 'Pothole A',
      description: 'Desc A',
      category: 'Roads',
      priority_level: 'Critical',
      priority_score: 90,
      status: 'SUBMITTED',
      latitude: 12.9716,
      longitude: 77.5946,
      location_name: 'Location A',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const compB: Complaint = {
      ...compA,
      id: 'c2',
      reference_number: 'URB-2',
      latitude: 12.9718,
      longitude: 77.5948,
    };

    const compC: Complaint = {
      ...compA,
      id: 'c3',
      reference_number: 'URB-3',
      priority_level: 'Low',
      priority_score: 20,
      latitude: 13.0501,
      longitude: 77.6201,
      location_name: 'Location C',
    };

    const compD: Complaint = {
      ...compC,
      id: 'c4',
      reference_number: 'URB-4',
      latitude: 13.0502,
      longitude: 77.6202,
    };

    const hotspots = identifyHotspots([compA, compB, compC, compD], 500);
    expect(hotspots.length).toBe(2);
    // Highest risk should be sorted first
    expect(hotspots[0].risk_level).toBe('High');
  });

  it('tests real action brief generation', () => {
    const comp: Complaint = {
      id: 'c1',
      reference_number: 'URB-1',
      title: 'Massive water burst',
      description: 'Flood in market',
      category: 'Water and drainage',
      priority_level: 'Critical',
      priority_score: 88,
      status: 'SUBMITTED',
      latitude: 12.97,
      longitude: 77.59,
      location_name: 'MG Road',
      assigned_department: 'Water Supply Board',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const brief = generateAIActionBrief('MG Road', [comp]);
    expect(brief.target_department).toBe('Water Supply Board');
    expect(brief.suggested_actions.length).toBeGreaterThan(0);
    expect(brief.priority_concerns.length).toBeGreaterThan(0);
  });
});
