export type ComplaintCategory =
  | 'Roads'
  | 'Water and drainage'
  | 'Waste management'
  | 'Electricity and streetlights'
  | 'Public infrastructure'
  | 'Public safety'
  | 'Other';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER REVIEW'
  | 'ASSIGNED'
  | 'IN PROGRESS'
  | 'RESOLVED';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type UserRole = 'citizen' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Complaint {
  id: string;
  reference_number: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  location_name: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  status: ComplaintStatus;
  priority_score: number; // 0-100
  priority_level: PriorityLevel;
  ai_summary: string;
  assigned_department?: string;
  assigned_to?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  // Computed or joined relations
  ai_analysis?: ComplaintAIAnalysis;
  status_history?: ComplaintStatusHistory[];
  duplicate_relations?: ComplaintRelation[];
}

export interface PriorityBreakdown {
  safety_risk: number; // 0-40
  public_impact: number; // 0-25
  urgency: number; // 0-20
  frequency_score: number; // 0-15
  total_score: number; // 0-100
  level: PriorityLevel;
  explanation: string;
  override_score?: number;
  override_reason?: string;
  overridden_by?: string;
}

export interface ComplaintAIAnalysis {
  id: string;
  complaint_id: string;
  predicted_category: ComplaintCategory;
  confidence_score: number; // 0-1
  summary: {
    what: string;
    where: string;
    impact: string;
    action: string;
  };
  urgency_factor: 'Immediate' | 'High' | 'Moderate' | 'Routine';
  public_impact_factor: 'Massive' | 'High' | 'Moderate' | 'Localized';
  priority_breakdown: PriorityBreakdown;
  duplicate_candidates: Array<{
    id: string;
    reference_number: string;
    title: string;
    similarity_score: number;
    distance_meters: number;
    explanation: string;
  }>;
  duplicate_explanation?: string;
  priority_explanation: string;
  recommended_department: string;
  department_reason: string;
  model_information: string;
  processing_status: 'COMPLETED' | 'NEEDS_REVIEW' | 'FALLBACK';
  created_at: string;
}

export interface ComplaintStatusHistory {
  id: string;
  complaint_id: string;
  old_status: ComplaintStatus | null;
  new_status: ComplaintStatus;
  updated_by: string;
  public_message: string;
  internal_note?: string;
  created_at: string;
}

export interface ComplaintAssignment {
  id: string;
  complaint_id: string;
  department: string;
  assigned_to: string;
  assigned_by: string;
  assignment_note?: string;
  created_at: string;
}

export interface ComplaintRelation {
  id: string;
  complaint_id: string;
  related_complaint_id: string;
  related_reference_number?: string;
  related_title?: string;
  similarity_score: number; // 0-100
  explanation: string;
  review_status: 'PENDING_REVIEW' | 'CONFIRMED_DUPLICATE' | 'REJECTED';
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  complaint_id: string;
  complaint_reference: string;
  title: string;
  message: string;
  type: 'STATUS_CHANGE' | 'ASSIGNMENT' | 'RESOLUTION' | 'SYSTEM';
  is_read: boolean;
  created_at: string;
}

export interface HotspotCluster {
  id: string;
  center_lat: number;
  center_lng: number;
  radius_meters: number;
  complaint_count: number;
  primary_category: ComplaintCategory;
  location_name: string;
  highest_priority: PriorityLevel;
  unresolved_count: number;
  complaints: Complaint[];
  risk_level: 'High' | 'Medium' | 'Low';
}

export interface AIActionBrief {
  id: string;
  generated_at: string;
  title: string;
  target_department: string;
  target_cluster_or_area: string;
  related_complaints_count: number;
  problem_overview: string;
  affected_area: string;
  main_recurring_issue: string;
  priority_concerns: string[];
  public_impact: string;
  recommended_department: string;
  suggested_actions: string[];
  required_resources: string[];
  disclaimer: string;
}
