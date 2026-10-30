import { Complaint, HotspotCluster, PriorityLevel } from '@/types/civic';
import { calculateDistanceMeters } from '../ai/duplicateDetector';

export { calculateDistanceMeters };

// Cluster complaints within a specified radius (e.g. 450 meters)
export function identifyHotspots(complaints: Complaint[], clusterRadiusMeters = 450): HotspotCluster[] {
  // Only consider complaints with valid coordinates
  const validComplaints = complaints.filter(
    (c) => typeof c.latitude === 'number' && typeof c.longitude === 'number' && !isNaN(c.latitude) && !isNaN(c.longitude)
  );

  const visited = new Set<string>();
  const clusters: HotspotCluster[] = [];

  for (let i = 0; i < validComplaints.length; i++) {
    const root = validComplaints[i];
    if (visited.has(root.id)) continue;

    const group: Complaint[] = [root];
    visited.add(root.id);

    for (let j = i + 1; j < validComplaints.length; j++) {
      const candidate = validComplaints[j];
      if (visited.has(candidate.id)) continue;

      const dist = calculateDistanceMeters(root.latitude, root.longitude, candidate.latitude, candidate.longitude);
      if (dist <= clusterRadiusMeters) {
        group.push(candidate);
        visited.add(candidate.id);
      }
    }

    // Only create a hotspot cluster if there are 2 or more complaints in close proximity
    if (group.length >= 2) {
      // Calculate centroid
      const totalLat = group.reduce((sum, c) => sum + c.latitude, 0);
      const totalLng = group.reduce((sum, c) => sum + c.longitude, 0);
      const centerLat = Number((totalLat / group.length).toFixed(6));
      const centerLng = Number((totalLng / group.length).toFixed(6));

      // Determine highest priority
      const priorityWeights: Record<PriorityLevel, number> = {
        Critical: 4,
        High: 3,
        Medium: 2,
        Low: 1,
      };

      let highestPrio: PriorityLevel = 'Low';
      let maxWeight = 0;
      for (const comp of group) {
        const weight = priorityWeights[comp.priority_level] || 1;
        if (weight > maxWeight) {
          maxWeight = weight;
          highestPrio = comp.priority_level;
        }
      }

      // Dominant category
      const catCount: Record<string, number> = {};
      group.forEach((c) => {
        catCount[c.category] = (catCount[c.category] || 0) + 1;
      });
      const primaryCat = Object.keys(catCount).reduce((a, b) =>
        catCount[a] > catCount[b] ? a : b
      ) as Complaint['category'];

      const unresolvedCount = group.filter((c) => c.status !== 'RESOLVED').length;

      let riskLevel: 'High' | 'Medium' | 'Low' = 'Low';
      if (highestPrio === 'Critical' || group.length >= 4) {
        riskLevel = 'High';
      } else if (highestPrio === 'High' || group.length >= 3) {
        riskLevel = 'Medium';
      }

      clusters.push({
        id: `hotspot-${clusters.length + 1}`,
        center_lat: centerLat,
        center_lng: centerLng,
        radius_meters: clusterRadiusMeters,
        complaint_count: group.length,
        primary_category: primaryCat,
        location_name: root.location_name,
        highest_priority: highestPrio,
        unresolved_count: unresolvedCount,
        complaints: group,
        risk_level: riskLevel,
      });
    }
  }

  // Sort clusters by severity (complaint count & priority)
  return clusters.sort((a, b) => {
    if (a.risk_level === 'High' && b.risk_level !== 'High') return -1;
    if (b.risk_level === 'High' && a.risk_level !== 'High') return 1;
    return b.complaint_count - a.complaint_count;
  });
}
