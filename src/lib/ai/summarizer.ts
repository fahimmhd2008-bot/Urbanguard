interface SummarizerInput {
  title: string;
  description: string;
  category: string;
  locationName: string;
}

interface StructuredSummary {
  what: string;
  where: string;
  impact: string;
  action: string;
  fullSummary: string;
}

export function generateComplaintSummary(input: SummarizerInput): StructuredSummary {
  const { title, description, category, locationName } = input;
  
  // Extract core facts
  const cleanTitle = title.trim();
  const cleanLocation = locationName.trim();

  // Determine what happened
  const what = cleanTitle;

  // Determine where it happened
  const where = cleanLocation || 'Unspecified location';

  // Determine what is affected based on description text
  let impact = 'Local community and road users in the immediate vicinity';
  const descLower = description.toLowerCase();

  if (descLower.includes('home') || descLower.includes('house') || descLower.includes('resident')) {
    impact = 'Residential homes and neighborhood families';
  } else if (descLower.includes('traffic') || descLower.includes('lane') || /\bbus\b/.test(descLower) || descLower.includes('commuter')) {
    impact = 'Vehicular traffic, commuters, and transit flow';
  } else if (descLower.includes('pedestrian') || descLower.includes('walkway') || descLower.includes('footpath') || descLower.includes('crosswalk')) {
    impact = 'Pedestrians and vulnerable sidewalk users';
  } else if (descLower.includes('school') || descLower.includes('children') || descLower.includes('student')) {
    impact = 'School students, parents, and nearby educational institutions';
  } else if (descLower.includes('shop') || descLower.includes('market') || descLower.includes('business')) {
    impact = 'Local businesses, shoppers, and commercial activities';
  }

  // Determine recommended municipal action based on category
  let action = 'Site inspection and remedial maintenance by the municipal ward team';
  if (category === 'Roads') {
    action = 'Immediate hazard barricading, pothole patching, or asphalt resurfacing';
  } else if (category === 'Water and drainage') {
    action = 'Waterline pressure isolation, suction de-watering, or drain canal desilting';
  } else if (category === 'Waste management') {
    action = 'Compactor truck waste dispatch, bin replacement, and antiseptic wash';
  } else if (category === 'Electricity and streetlights') {
    action = 'Electrical circuit insulation test and lighting fixture restoration';
  } else if (category === 'Public safety') {
    action = 'Emergency physical cordoning and safety compliance enforcement';
  } else if (category === 'Public infrastructure') {
    action = 'Structural civil engineering assessment and component repair';
  }

  const fullSummary = `${what} reported at ${where}, affecting ${impact.toLowerCase()}. Recommended action: ${action.toLowerCase()}.`;

  return {
    what,
    where,
    impact,
    action,
    fullSummary,
  };
}
