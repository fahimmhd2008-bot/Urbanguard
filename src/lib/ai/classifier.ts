import { ComplaintCategory } from '@/types/civic';

interface ClassificationResult {
  category: ComplaintCategory;
  confidence: number;
  recommendedDepartment: string;
  departmentReason: string;
  matchedKeywords: string[];
}

const CATEGORY_RULES: Record<
  ComplaintCategory,
  {
    keywords: string[];
    department: string;
    departmentRationale: string;
    weightMultiplier: number;
  }
> = {
  Roads: {
    keywords: [
      'pothole', 'crater', 'asphalt', 'road', 'street', 'pavement', 'resurfacing',
      'speed breaker', 'bump', 'cobblestone', 'flyover', 'bridge expansion',
      'traffic lane', 'tar', 'trench on road', 'road caved in', 'subsidence'
    ],
    department: 'Road Infrastructure & Maintenance',
    departmentRationale: 'Assigned for roadway civil works, asphalt leveling, and structural pavement repair.',
    weightMultiplier: 1.0,
  },
  'Water and drainage': {
    keywords: [
      'drainage', 'waterlogging', 'flooding', 'flood', 'sewer', 'sewage',
      'manhole', 'water main', 'pipe burst', 'tap water', 'drinking water',
      'muddy water', 'leak', 'water contamination', 'stormwater', 'canal', 'gutter'
    ],
    department: 'Water Supply and Drainage Board',
    departmentRationale: 'Assigned for pipeline restoration, storm drain desilting, and water quality testing.',
    weightMultiplier: 1.0,
  },
  'Waste management': {
    keywords: [
      'garbage', 'trash', 'dustbin', 'dump', 'waste', 'litter', 'overflowing bin',
      'organic waste', 'stray dogs', 'stench', 'smell', 'carcass', 'sweep', 'sweeping',
      'plastic waste', 'dumpster', 'sanitation'
    ],
    department: 'Solid Waste Management Corporation',
    departmentRationale: 'Assigned for municipal waste compaction, street sweeping, and sanitary clearance.',
    weightMultiplier: 1.0,
  },
  'Electricity and streetlights': {
    keywords: [
      'streetlight', 'street light', 'lamp', 'dark', 'lamppost', 'electricity',
      'power cut', 'spark', 'transformer', 'wires', 'cable', 'voltage', 'shock',
      'electric pole', 'junction box', 'signal light', 'traffic light'
    ],
    department: 'Municipal Electrical Department',
    departmentRationale: 'Assigned for high/low voltage repairs, streetlight illumination, and grid safety.',
    weightMultiplier: 1.0,
  },
  'Public infrastructure': {
    keywords: [
      'bus shelter', 'bus stop', 'footpath', 'sidewalk', 'paver', 'curb',
      'park bench', 'retaining wall', 'elevator', 'foot overbridge', 'railing',
      'bridge', 'library', 'community center', 'public toilet', 'monument'
    ],
    department: 'Public Works & Safety Inspection',
    departmentRationale: 'Assigned for public civil assets, pedestrian walkways, and municipal architectural maintenance.',
    weightMultiplier: 1.0,
  },
  'Public safety': {
    keywords: [
      'hazard', 'danger', 'open pit', 'exposed wire', 'chemical', 'toxic',
      'accident', 'skid', 'collapsed', 'swimming pool uncovered', 'guard rail missing',
      'playground broken', 'sharp metal', 'deep trench', 'fire hazard', 'electrocution'
    ],
    department: 'Public Works & Safety Inspection',
    departmentRationale: 'Assigned to the Safety Task Force for immediate risk containment and physical cordoning.',
    weightMultiplier: 1.1,
  },
  Other: {
    keywords: ['noise', 'loudspeaker', 'stray animal', 'encroachment', 'tree branch', 'general'],
    department: 'General Municipal Administration',
    departmentRationale: 'Assigned to General Administration for preliminary inspection and routing.',
    weightMultiplier: 0.5,
  },
};

export function classifyComplaint(title: string, description: string): ClassificationResult {
  const combinedText = `${title.toLowerCase()} ${description.toLowerCase()}`;
  
  let bestCategory: ComplaintCategory = 'Other';
  let highestScore = 0;
  let bestKeywords: string[] = [];

  for (const [catName, config] of Object.entries(CATEGORY_RULES) as [ComplaintCategory, typeof CATEGORY_RULES[ComplaintCategory]][]) {
    const matched = config.keywords.filter((kw) => combinedText.includes(kw));
    const score = matched.length * config.weightMultiplier;

    if (score > highestScore) {
      highestScore = score;
      bestCategory = catName;
      bestKeywords = matched;
    }
  }

  // Calculate normalized confidence score
  const confidence = highestScore > 0 ? Math.min(0.96, 0.65 + highestScore * 0.08) : 0.45;
  const categoryConfig = CATEGORY_RULES[bestCategory];

  return {
    category: bestCategory,
    confidence: Number(confidence.toFixed(2)),
    recommendedDepartment: categoryConfig.department,
    departmentReason: categoryConfig.departmentRationale,
    matchedKeywords: bestKeywords,
  };
}
