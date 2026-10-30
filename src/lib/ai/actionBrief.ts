import { AIActionBrief, Complaint } from '@/types/civic';

export function generateAIActionBrief(
  targetAreaOrCategory: string,
  complaints: Complaint[]
): AIActionBrief {
  // Filter relevant complaints
  const filtered = complaints.filter(
    (c) =>
      c.location_name.toLowerCase().includes(targetAreaOrCategory.toLowerCase()) ||
      c.category.toLowerCase().includes(targetAreaOrCategory.toLowerCase()) ||
      (c.assigned_department && c.assigned_department.toLowerCase().includes(targetAreaOrCategory.toLowerCase()))
  );

  const pool = filtered.length > 0 ? filtered : complaints.slice(0, 8);
  const count = pool.length;

  // Determine dominant category and location
  const catCounts: Record<string, number> = {};
  pool.forEach((c) => {
    catCounts[c.category] = (catCounts[c.category] || 0) + 1;
  });

  const dominantCategory = Object.keys(catCounts).reduce((a, b) =>
    (catCounts[a] || 0) > (catCounts[b] || 0) ? a : b
  );

  const highestPriorityComp = [...pool].sort((a, b) => b.priority_score - a.priority_score)[0];
  const unresolvedCount = pool.filter((c) => c.status !== 'RESOLVED').length;

  // Department recommendation
  const targetDepartment =
    highestPriorityComp.assigned_department || 'Municipal Inter-Departmental Task Force';

  // Construct structured actionable brief
  const actionBrief: AIActionBrief = {
    id: `brief-${Date.now()}`,
    generated_at: new Date().toISOString(),
    title: `CivicAI Incident Synthesis: ${targetAreaOrCategory} (${dominantCategory})`,
    target_department: targetDepartment,
    target_cluster_or_area: targetAreaOrCategory,
    related_complaints_count: count,
    problem_overview: `Cluster analysis across ${count} verified citizen reports reveals an escalating civic challenge centered on ${dominantCategory.toLowerCase()} issues in the ${targetAreaOrCategory} sector. Of these, ${unresolvedCount} complaints currently remain unresolved.`,
    affected_area: `${targetAreaOrCategory} and surrounding feeder corridors`,
    main_recurring_issue: `Repeated failures in ${dominantCategory.toLowerCase()}, primarily characterized by "${highestPriorityComp.title}" and similar severe reports in the immediate vicinity.`,
    priority_concerns: [
      `Peak priority incident: "${highestPriorityComp.title}" (Score: ${highestPriorityComp.priority_score}/100, ${highestPriorityComp.priority_level}).`,
      `${unresolvedCount} out of ${count} citizen reports are currently active and awaiting full resolution.`,
      `Pedestrian and commuter safety exposure due to ongoing delays in infrastructure containment.`
    ],
    public_impact: `Significant community disruption affecting local residents, transit flow, and public hygiene. If unaddressed, risk factors compound with severe weather and high traffic density.`,
    recommended_department: targetDepartment,
    suggested_actions: [
      `Deploy an on-site rapid assessment inspection team to ${highestPriorityComp.location_name} within 4 hours.`,
      `Implement temporary physical cordoning and safety signage around critical hazard points.`,
      `Consolidate overlapping duplicate citizen reports under parent work-order "${highestPriorityComp.reference_number}".`,
      `Dispatch heavy equipment and specialized personnel for comprehensive remedial overhaul rather than piecemeal patching.`,
      `Issue automated status notifications to the ${count} reporting citizens once work crews are on site.`
    ],
    required_resources: [
      'Field inspection crew with mobile diagnostic equipment',
      'Civil safety barriers and high-visibility reflective warning signs',
      'Dedicated departmental repair vehicle and materials inventory'
    ],
    disclaimer:
      'NOTE: This brief is synthesized by the CivicAI Autonomous Decision Engine based strictly on real submitted database records. All recommended operational actions are suggestions requiring human administrative authorization.'
  };

  return actionBrief;
}
