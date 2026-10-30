import { PriorityBreakdown, PriorityLevel } from '@/types/civic';

interface ScoringInput {
  title: string;
  description: string;
  category: string;
  locationName: string;
  nearbyRelatedCount?: number;
}

// Critical keywords indicating immediate physical danger
const SEVERE_SAFETY_KEYWORDS = [
  'accident', 'death', 'killed', 'electrocution', 'sparking', 'live wire',
  'submerged electrical', 'open manhole', 'cave-in', 'sinkhole', 'crater',
  'injury', 'injured', 'hospital', 'gas leak', 'toxic', 'chemical spill',
  'collapsed', 'falling debris', 'geyser', 'deep trench', 'fire hazard'
];

const MODERATE_SAFETY_KEYWORDS = [
  'skid', 'trip', 'fall', 'sharp', 'broken glass', 'jagged', 'flickering',
  'pitch dark', 'swerving', 'hazard', 'unmarked bump', 'pothole'
];

// Keywords indicating high public impact
const MASS_IMPACT_KEYWORDS = [
  'main road', 'highway', 'arterial', 'metro', 'hospital', 'school',
  'junction', 'bus stop', 'market square', 'hundreds', 'entire street',
  'drinking water', 'residential layout', 'flooded homes', 'inundation', 'gridlock'
];

const MODERATE_IMPACT_KEYWORDS = [
  'footpath', 'park', 'alley', 'lane', 'neighborhood', 'dozen', 'shopkeepers',
  'crosswalk', 'sidewalk'
];

// Keywords indicating urgency
const IMMEDIATE_URGENCY_KEYWORDS = [
  'immediate', 'urgent', 'emergency', 'now', 'hours', 'rising', 'gushing',
  'burst', 'today', 'continuous', 'actively'
];

const MODERATE_URGENCY_KEYWORDS = [
  'days', 'uncollected', 'worsening', 'accumulating', 'leaking', 'overdue'
];

export function calculatePriorityScore(input: ScoringInput): PriorityBreakdown {
  const text = `${input.title} ${input.description} ${input.locationName}`.toLowerCase();
  
  // 1. Safety Risk (0 - 40 points)
  let safetyScore = 5; // Baseline
  const severeSafetyMatches = SEVERE_SAFETY_KEYWORDS.filter(k => text.includes(k));
  const moderateSafetyMatches = MODERATE_SAFETY_KEYWORDS.filter(k => text.includes(k));

  if (severeSafetyMatches.length > 0) {
    safetyScore = Math.min(40, 24 + severeSafetyMatches.length * 5);
  } else if (moderateSafetyMatches.length > 0) {
    safetyScore = Math.min(25, 12 + moderateSafetyMatches.length * 4);
  }

  // 2. Public Impact (0 - 25 points)
  let publicImpactScore = 5;
  const massImpactMatches = MASS_IMPACT_KEYWORDS.filter(k => text.includes(k));
  const moderateImpactMatches = MODERATE_IMPACT_KEYWORDS.filter(k => text.includes(k));

  if (massImpactMatches.length > 0) {
    publicImpactScore = Math.min(25, 14 + massImpactMatches.length * 3);
  } else if (moderateImpactMatches.length > 0) {
    publicImpactScore = Math.min(16, 8 + moderateImpactMatches.length * 2);
  }

  // 3. Urgency (0 - 20 points)
  let urgencyScore = 4;
  const immediateMatches = IMMEDIATE_URGENCY_KEYWORDS.filter(k => text.includes(k));
  const moderateUrgencyMatches = MODERATE_URGENCY_KEYWORDS.filter(k => text.includes(k));

  if (immediateMatches.length > 0) {
    urgencyScore = Math.min(20, 12 + immediateMatches.length * 3);
  } else if (moderateUrgencyMatches.length > 0) {
    urgencyScore = Math.min(13, 7 + moderateUrgencyMatches.length * 2);
  }

  // 4. Related Complaint Frequency (0 - 15 points)
  // Higher points when multiple nearby complaints confirm a recurring or worsening crisis
  const nearbyCount = input.nearbyRelatedCount || 0;
  let frequencyScore = 0;
  if (nearbyCount >= 4) {
    frequencyScore = 15;
  } else if (nearbyCount === 3) {
    frequencyScore = 12;
  } else if (nearbyCount === 2) {
    frequencyScore = 8;
  } else if (nearbyCount === 1) {
    frequencyScore = 5;
  }

  // Total deterministic calculation
  const totalScore = Math.min(100, Math.max(5, safetyScore + publicImpactScore + urgencyScore + frequencyScore));

  // Determine Level
  let level: PriorityLevel = 'Low';
  if (totalScore >= 80) {
    level = 'Critical';
  } else if (totalScore >= 60) {
    level = 'High';
  } else if (totalScore >= 35) {
    level = 'Medium';
  } else {
    level = 'Low';
  }

  // Generate transparent human-readable explanation
  const rationaleParts: string[] = [];
  if (safetyScore >= 25) {
    rationaleParts.push(`Severe physical hazard identified (${severeSafetyMatches.slice(0, 3).join(', ')})`);
  } else if (safetyScore >= 12) {
    rationaleParts.push(`Moderate safety concern detected (${moderateSafetyMatches.slice(0, 2).join(', ')})`);
  }

  if (publicImpactScore >= 15) {
    rationaleParts.push(`high transit or residential exposure near ${input.locationName}`);
  }

  if (urgencyScore >= 12) {
    rationaleParts.push(`immediate intervention required`);
  }

  if (frequencyScore >= 8) {
    rationaleParts.push(`amplified by ${nearbyCount} matching incident reports nearby`);
  }

  const explanation = rationaleParts.length > 0
    ? `${level} priority (${totalScore}/100) because the report indicates ${rationaleParts.join(', ')}.`
    : `Standard priority (${totalScore}/100) based on routine maintenance criteria in ${input.category}.`;

  return {
    safety_risk: safetyScore,
    public_impact: publicImpactScore,
    urgency: urgencyScore,
    frequency_score: frequencyScore,
    total_score: totalScore,
    level,
    explanation,
  };
}
