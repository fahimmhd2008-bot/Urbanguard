import type { Complaint } from '@/types/civic';

export interface DuplicateCandidate {
  id: string;
  reference_number: string;
  title: string;
  similarity_score: number; // 0 - 100
  distance_meters: number;
  explanation: string;
  time_diff_hours: number;
}

// Calculate distance in meters using Haversine formula
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Tokenize text into normalized unique words (excluding common stop words)
const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'near', 'with', 'to', 'for', 'of', 'from', 'by', 'has', 'have', 'been', 'there', 'very', 'please', 'this', 'that'
]);

function tokenize(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  return new Set(words);
}

// Compute Jaccard word similarity between two texts (0.0 - 1.0)
function computeTextSimilarity(textA: string, textB: string): number {
  const setA = tokenize(textA);
  const setB = tokenize(textB);
  if (setA.size === 0 || setB.size === 0) {return 0;}

  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) {
      intersectionCount++;
    }
  }

  const unionSize = new Set([...setA, ...setB]).size;
  return unionSize > 0 ? intersectionCount / unionSize : 0;
}

export function detectDuplicates(
  target: {
    id?: string;
    title: string;
    description: string;
    category: string;
    latitude: number;
    longitude: number;
    created_at?: string;
  },
  existingComplaints: Complaint[],
  threshold = 55
): DuplicateCandidate[] {
  const targetText = `${target.title} ${target.description}`;
  const targetDate = target.created_at ? new Date(target.created_at).getTime() : Date.now();

  const candidates: DuplicateCandidate[] = [];

  for (const comp of existingComplaints) {
    // Skip self
    if (target.id && comp.id === target.id) {continue;}

    // Geographic distance
    const distanceMeters = calculateDistanceMeters(
      target.latitude,
      target.longitude,
      comp.latitude,
      comp.longitude
    );

    // Text similarity
    const compText = `${comp.title} ${comp.description}`;
    const textSim = computeTextSimilarity(targetText, compText);

    // Category match
    const categoryMatch = target.category === comp.category;

    // Time difference in hours
    const compDate = new Date(comp.created_at).getTime();
    const timeDiffHours = Math.abs(targetDate - compDate) / (1000 * 60 * 60);

    // Multi-factor weighted score calculation
    let geoScore = 0;
    if (distanceMeters <= 50) {geoScore = 40;}
    else if (distanceMeters <= 200) {geoScore = 32;}
    else if (distanceMeters <= 500) {geoScore = 20;}
    else if (distanceMeters <= 1000) {geoScore = 10;}

    const textScore = Math.round(textSim * 40); // 0 - 40
    const catScore = categoryMatch ? 15 : 0; // 0 - 15

    let timeScore = 0;
    if (timeDiffHours <= 24) {timeScore = 10;}
    else if (timeDiffHours <= 72) {timeScore = 6;}
    else if (timeDiffHours <= 168) {timeScore = 3;}

    const totalSimilarity = Math.min(100, geoScore + textScore + catScore + timeScore);

    if (totalSimilarity >= threshold) {
      // Craft human-readable explanation
      const reasons: string[] = [];
      if (distanceMeters <= 200) {
        reasons.push(`located within ${distanceMeters}m of the same coordinate`);
      } else if (distanceMeters <= 600) {
        reasons.push(`located ${distanceMeters}m away in the same immediate area`);
      }

      if (categoryMatch) {
        reasons.push(`both filed under "${target.category}"`);
      }

      if (textSim >= 0.25) {
        reasons.push(`describing virtually identical physical symptoms`);
      }

      if (timeDiffHours <= 48) {
        reasons.push(`submitted within ${Math.round(timeDiffHours)} hours of each other`);
      }

      const explanation = `Potential duplicate (${totalSimilarity}% confidence) because both reports are ${reasons.join(', ')}.`;

      candidates.push({
        id: comp.id,
        reference_number: comp.reference_number,
        title: comp.title,
        similarity_score: totalSimilarity,
        distance_meters: distanceMeters,
        explanation,
        time_diff_hours: Math.round(timeDiffHours),
      });
    }
  }

  // Sort descending by similarity score
  return candidates.sort((a, b) => b.similarity_score - a.similarity_score);
}
