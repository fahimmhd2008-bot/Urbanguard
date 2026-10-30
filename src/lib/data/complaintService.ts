import type {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  ComplaintStatusHistory,
  NotificationItem,
  PriorityLevel,
} from '@/types/civic';
import { INITIAL_COMPLAINTS, INITIAL_STATUS_HISTORY } from './mockComplaints';
import { classifyComplaint } from '../ai/classifier';
import { calculatePriorityScore } from '../ai/priorityScorer';
import { generateComplaintSummary } from '../ai/summarizer';
import { detectDuplicates } from '../ai/duplicateDetector';
import { getSupabaseClient, isSupabaseConfigured } from '../supabase/client';

const STORAGE_KEY = 'civicai_complaints_v1';
const HISTORY_KEY = 'civicai_history_v1';
const NOTIFICATIONS_KEY = 'civicai_notifications_v1';

// Initial in-app notifications
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    user_id: 'user-citizen-01',
    complaint_id: 'c-001',
    complaint_reference: 'CIVIC-2026-1001',
    title: 'Work Crew On Site',
    message: 'Your report "Dangerous 2-foot deep crater pothole near Metro Pillar 42" is now IN PROGRESS. Eng. Marcus Vance dispatched.',
    type: 'STATUS_CHANGE',
    is_read: false,
    created_at: '2026-10-29T10:15:00Z',
  },
  {
    id: 'notif-2',
    user_id: 'user-citizen-06',
    complaint_id: 'c-006',
    complaint_reference: 'CIVIC-2026-1006',
    title: 'Assigned to Water Board',
    message: 'Your report on Riverside sewer flooding was reviewed and assigned to Water Supply and Drainage Board under Chief Officer Elena Rostova.',
    type: 'ASSIGNMENT',
    is_read: false,
    created_at: '2026-10-28T07:00:00Z',
  },
  {
    id: 'notif-3',
    user_id: 'user-citizen-09',
    complaint_id: 'c-009',
    complaint_reference: 'CIVIC-2026-1009',
    title: 'Complaint Resolved',
    message: 'Your report regarding the missing manhole on Riverside Avenue has been marked RESOLVED. Ductile iron cover verified.',
    type: 'RESOLUTION',
    is_read: true,
    created_at: '2026-10-26T15:30:00Z',
  },
];

class ComplaintService {
  private memoryComplaints: Complaint[] = [...INITIAL_COMPLAINTS];
  private memoryHistory: Record<string, ComplaintStatusHistory[]> = { ...INITIAL_STATUS_HISTORY };
  private memoryNotifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    if (typeof window === 'undefined') {return;}

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.memoryComplaints = JSON.parse(stored);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memoryComplaints));
      }

      const storedHistory = localStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        this.memoryHistory = JSON.parse(storedHistory);
      } else {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(this.memoryHistory));
      }

      const storedNotifs = localStorage.getItem(NOTIFICATIONS_KEY);
      if (storedNotifs) {
        this.memoryNotifications = JSON.parse(storedNotifs);
      } else {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(this.memoryNotifications));
      }
    } catch {
      // Fallback to memory
    }
  }

  private save() {
    if (typeof window === 'undefined') {return;}
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memoryComplaints));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(this.memoryHistory));
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(this.memoryNotifications));
    } catch {
      // Storage unavailable
    }
  }

  private supabaseAvailable: boolean | null = null;

  async isSupabaseConnected(): Promise<boolean> {
    if (!isSupabaseConfigured) {return false;}
    if (this.supabaseAvailable !== null) {return this.supabaseAvailable;}

    const supabase = getSupabaseClient();
    if (!supabase) {
      this.supabaseAvailable = false;
      return false;
    }

    try {
      const { error } = await supabase.from('complaints').select('id').limit(1);
      if (error) {
        if (error.code === 'PGRST205' || (error as any).status === 404) {
          this.supabaseAvailable = false;
          return false;
        }
      }
      this.supabaseAvailable = !error;
      return this.supabaseAvailable;
    } catch {
      this.supabaseAvailable = false;
      return false;
    }
  }

  // --- COMPLAINTS RETRIEVAL ---
  async getAllComplaints(): Promise<Complaint[]> {
    // When running in the browser, route through the local Next.js API route to prevent
    // direct unhandled 404 network warnings if remote tables are not yet migrated
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/complaints');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            this.memoryComplaints = json.data;
            return json.data;
          }
        }
      } catch {
        // Fall through to local memory
      }

      return [...this.memoryComplaints].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    // Server-side retrieval: safely query Supabase only if connected and verified
    const connected = await this.isSupabaseConnected();
    if (connected) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('complaints')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            return data as Complaint[];
          }
        } catch (err) {
          console.warn('[CivicAI] Supabase fetch error, fallback to local store:', err);
        }
      }
    }

    return [...this.memoryComplaints].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // Consistent alias for getAllComplaints
  async getComplaints(): Promise<Complaint[]> {
    return this.getAllComplaints();
  }

  async getComplaintById(id: string): Promise<Complaint | null> {
    const found = this.memoryComplaints.find((c) => c.id === id || c.reference_number === id);
    if (found) {
      const copy = { ...found };
      copy.status_history = this.memoryHistory[found.id] || [];
      return copy;
    }

    if (typeof window !== 'undefined') {
      await this.getAllComplaints();
      const refound = this.memoryComplaints.find((c) => c.id === id || c.reference_number === id);
      if (refound) {
        const copy = { ...refound };
        copy.status_history = this.memoryHistory[refound.id] || [];
        return copy;
      }
    }

    const connected = await this.isSupabaseConnected();
    if (connected) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('complaints')
            .select('*')
            .or(`id.eq.${id},reference_number.eq.${id}`)
            .single();

          if (!error && data) {
            const comp = data as Complaint;
            comp.status_history = await this.getStatusHistory(id);
            return comp;
          }
        } catch (err) {
          console.warn('[CivicAI] Supabase fetch by id failed:', err);
        }
      }
    }

    return null;
  }

  // --- SUBMIT COMPLAINT WITH FULL AI PIPELINE ---
  async createComplaint(input: {
    title: string;
    description: string;
    category?: ComplaintCategory;
    location_name: string;
    latitude: number;
    longitude: number;
    image_url?: string;
    user_id?: string;
    user_name?: string;
    user_email?: string;
  }): Promise<Complaint> {
    const id = `c-${Date.now()}`;
    const year = new Date().getFullYear();
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const reference_number = `CIVIC-${year}-${randomHex}`;

    // 1. AI Classification & Department Recommendation
    const classification = classifyComplaint(input.title, input.description);
    const resolvedCategory = input.category || classification.category;

    // 2. AI 4-Part Summarization
    const summaryResult = generateComplaintSummary({
      title: input.title,
      description: input.description,
      category: resolvedCategory,
      locationName: input.location_name,
    });

    // 3. AI Duplicate Detection against existing records
    const duplicateCandidates = detectDuplicates(
      {
        id,
        title: input.title,
        description: input.description,
        category: resolvedCategory,
        latitude: input.latitude,
        longitude: input.longitude,
      },
      this.memoryComplaints,
      50
    );

    // 4. Deterministic Explainable Priority Scoring
    const priorityBreakdown = calculatePriorityScore({
      title: input.title,
      description: input.description,
      category: resolvedCategory,
      locationName: input.location_name,
      nearbyRelatedCount: duplicateCandidates.length,
    });

    const now = new Date().toISOString();

    const newComplaint: Complaint = {
      id,
      reference_number,
      user_id: input.user_id || 'user-citizen-current',
      user_name: input.user_name || 'Verified Citizen',
      user_email: input.user_email || 'citizen@civic.local',
      title: input.title.trim(),
      description: input.description.trim(),
      category: resolvedCategory,
      location_name: input.location_name.trim(),
      latitude: input.latitude,
      longitude: input.longitude,
      image_url: input.image_url,
      status: 'SUBMITTED',
      priority_score: priorityBreakdown.total_score,
      priority_level: priorityBreakdown.level,
      ai_summary: summaryResult.fullSummary,
      assigned_department: classification.recommendedDepartment,
      created_at: now,
      updated_at: now,
      ai_analysis: {
        id: `ai-${Date.now()}`,
        complaint_id: id,
        predicted_category: classification.category,
        confidence_score: classification.confidence,
        summary: {
          what: summaryResult.what,
          where: summaryResult.where,
          impact: summaryResult.impact,
          action: summaryResult.action,
        },
        urgency_factor: priorityBreakdown.urgency >= 12 ? 'Immediate' : 'High',
        public_impact_factor: priorityBreakdown.public_impact >= 15 ? 'Massive' : 'Moderate',
        priority_breakdown: priorityBreakdown,
        duplicate_candidates: duplicateCandidates,
        priority_explanation: priorityBreakdown.explanation,
        recommended_department: classification.recommendedDepartment,
        department_reason: classification.departmentReason,
        model_information: 'CivicAI-Autonomous-NLP-v2',
        processing_status: 'COMPLETED',
        created_at: now,
      },
    };

    // Initial Status History Entry
    const initialHistoryEntry: ComplaintStatusHistory = {
      id: `sh-${Date.now()}-1`,
      complaint_id: id,
      old_status: null,
      new_status: 'SUBMITTED',
      updated_by: newComplaint.user_name || 'Citizen',
      public_message: 'Complaint submitted with GPS coordinates and photo evidence.',
      created_at: now,
    };

    // AI Validation History Entry
    const aiReviewHistoryEntry: ComplaintStatusHistory = {
      id: `sh-${Date.now()}-2`,
      complaint_id: id,
      old_status: 'SUBMITTED',
      new_status: 'UNDER REVIEW',
      updated_by: 'CivicAI Decision Engine',
      public_message: `Auto-verified & classified under ${resolvedCategory} with ${priorityBreakdown.level} priority (${priorityBreakdown.total_score}/100).`,
      internal_note: `Confidence: ${(classification.confidence * 100).toFixed(0)}%. ${duplicateCandidates.length} duplicate candidates detected.`,
      created_at: new Date(Date.now() + 1000).toISOString(),
    };

    // Save to local store
    this.memoryComplaints.unshift(newComplaint);
    this.memoryHistory[id] = [initialHistoryEntry, aiReviewHistoryEntry];

    // Create Notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      user_id: newComplaint.user_id,
      complaint_id: id,
      complaint_reference: reference_number,
      title: 'Complaint Registered',
      message: `Your report "${newComplaint.title}" was submitted successfully. Tracking Reference: ${reference_number}`,
      type: 'SYSTEM',
      is_read: false,
      created_at: now,
    };
    this.memoryNotifications.unshift(notif);
    this.save();

    // Sync to Supabase if configured and table exists
    const connected = await this.isSupabaseConnected();
    if (connected) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('complaints').insert({
            id: newComplaint.id,
            reference_number: newComplaint.reference_number,
            user_id: newComplaint.user_id,
            title: newComplaint.title,
            description: newComplaint.description,
            category: newComplaint.category,
            location_name: newComplaint.location_name,
            latitude: newComplaint.latitude,
            longitude: newComplaint.longitude,
            image_url: newComplaint.image_url,
            status: newComplaint.status,
            priority_score: newComplaint.priority_score,
            priority_level: newComplaint.priority_level,
            ai_summary: newComplaint.ai_summary,
            assigned_department: newComplaint.assigned_department,
            created_at: newComplaint.created_at,
            updated_at: newComplaint.updated_at,
          });
        } catch (err) {
          console.warn('[CivicAI] Supabase insert failed:', err);
        }
      }
    } else if (typeof window !== 'undefined') {
      // In browser, notify server API in background
      fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }).catch(() => {});
    }

    return newComplaint;
  }

  // --- UPDATE COMPLAINT STATUS ---
  async updateStatus(
    id: string,
    newStatus: ComplaintStatus,
    updatedBy: string,
    publicMessage: string,
    internalNote?: string
  ): Promise<Complaint | null> {
    const comp = this.memoryComplaints.find((c) => c.id === id);
    if (!comp) {return null;}

    const oldStatus = comp.status;
    const now = new Date().toISOString();

    comp.status = newStatus;
    comp.updated_at = now;
    if (newStatus === 'RESOLVED') {
      comp.resolved_at = now;
    }

    // Add status history
    const historyEntry: ComplaintStatusHistory = {
      id: `sh-${Date.now()}`,
      complaint_id: id,
      old_status: oldStatus,
      new_status: newStatus,
      updated_by: updatedBy,
      public_message: publicMessage || `Complaint status changed from ${oldStatus} to ${newStatus}.`,
      internal_note: internalNote,
      created_at: now,
    };

    if (!this.memoryHistory[id]) {
      this.memoryHistory[id] = [];
    }
    this.memoryHistory[id].push(historyEntry);

    // Create Notification for the citizen
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      user_id: comp.user_id,
      complaint_id: comp.id,
      complaint_reference: comp.reference_number,
      title: `Status Updated: ${newStatus}`,
      message: publicMessage || `Your complaint ${comp.reference_number} is now marked ${newStatus}.`,
      type: newStatus === 'RESOLVED' ? 'RESOLUTION' : 'STATUS_CHANGE',
      is_read: false,
      created_at: now,
    };
    this.memoryNotifications.unshift(notif);
    this.save();

    // Sync to Supabase if configured and table exists
    const connected = await this.isSupabaseConnected();
    if (connected) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase
            .from('complaints')
            .update({
              status: newStatus,
              updated_at: now,
              resolved_at: comp.resolved_at || null,
            })
            .eq('id', id);

          await supabase.from('complaint_status_history').insert({
            complaint_id: id,
            old_status: oldStatus,
            new_status: newStatus,
            updated_by: updatedBy,
            public_message: historyEntry.public_message,
            internal_note: internalNote || null,
            created_at: now,
          });
        } catch (err) {
          console.warn('[CivicAI] Supabase status update failed:', err);
        }
      }
    }

    return comp;
  }

  // --- ASSIGN DEPARTMENT ---
  async assignDepartment(
    id: string,
    department: string,
    assignedTo: string,
    assignedBy: string,
    note?: string
  ): Promise<Complaint | null> {
    const comp = this.memoryComplaints.find((c) => c.id === id);
    if (!comp) {return null;}

    comp.assigned_department = department;
    comp.assigned_to = assignedTo;
    comp.updated_at = new Date().toISOString();

    if (comp.status === 'SUBMITTED' || comp.status === 'UNDER REVIEW') {
      comp.status = 'ASSIGNED';
    }

    const historyEntry: ComplaintStatusHistory = {
      id: `sh-${Date.now()}`,
      complaint_id: id,
      old_status: 'UNDER REVIEW',
      new_status: 'ASSIGNED',
      updated_by: assignedBy,
      public_message: `Assigned to ${department}${assignedTo ? ` (Lead: ${assignedTo})` : ''}.`,
      internal_note: note,
      created_at: new Date().toISOString(),
    };

    if (!this.memoryHistory[id]) {this.memoryHistory[id] = [];}
    this.memoryHistory[id].push(historyEntry);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      user_id: comp.user_id,
      complaint_id: comp.id,
      complaint_reference: comp.reference_number,
      title: 'Department Assigned',
      message: `Your complaint has been assigned to ${department}.`,
      type: 'ASSIGNMENT',
      is_read: false,
      created_at: new Date().toISOString(),
    };
    this.memoryNotifications.unshift(notif);
    this.save();

    return comp;
  }

  // --- OVERRIDE PRIORITY WITH MANDATORY REASON ---
  async overridePriority(
    id: string,
    newScore: number,
    reason: string,
    adminName: string
  ): Promise<Complaint | null> {
    const comp = this.memoryComplaints.find((c) => c.id === id);
    if (!comp) {return null;}

    let level: PriorityLevel = 'Low';
    if (newScore >= 80) {level = 'Critical';}
    else if (newScore >= 60) {level = 'High';}
    else if (newScore >= 35) {level = 'Medium';}

    comp.priority_score = newScore;
    comp.priority_level = level;
    comp.admin_notes = `${comp.admin_notes || ''}\n[Priority Override by ${adminName} to ${newScore}/100 (${level})]: ${reason}`.trim();
    comp.updated_at = new Date().toISOString();

    this.save();
    return comp;
  }

  // --- STATUS HISTORY ---
  async getStatusHistory(complaintId: string): Promise<ComplaintStatusHistory[]> {
    return this.memoryHistory[complaintId] || [];
  }

  // --- NOTIFICATIONS ---
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    if (!userId) {return this.memoryNotifications;}
    return this.memoryNotifications.filter((n) => n.user_id === userId || n.user_id === 'user-citizen-current');
  }

  async markNotificationRead(id: string): Promise<void> {
    const notif = this.memoryNotifications.find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
      this.save();
    }
  }

  // --- REAL METRICS COMPUTATION (NO HARDCODING) ---
  async getMetrics() {
    const complaints = await this.getAllComplaints();
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === 'SUBMITTED').length;
    const underReview = complaints.filter((c) => c.status === 'UNDER REVIEW').length;
    const assigned = complaints.filter((c) => c.status === 'ASSIGNED').length;
    const inProgress = complaints.filter((c) => c.status === 'IN PROGRESS').length;
    const resolved = complaints.filter((c) => c.status === 'RESOLVED').length;
    const critical = complaints.filter((c) => c.priority_level === 'Critical').length;
    const high = complaints.filter((c) => c.priority_level === 'High').length;

    // Calculate Average Resolution Time in hours
    const resolvedWithDates = complaints.filter((c) => c.status === 'RESOLVED' && c.resolved_at);
    let avgResolutionHours = 0;
    if (resolvedWithDates.length > 0) {
      const totalHours = resolvedWithDates.reduce((acc, c) => {
        const start = new Date(c.created_at).getTime();
        const end = new Date(c.resolved_at!).getTime();
        return acc + Math.max(1, (end - start) / (1000 * 60 * 60));
      }, 0);
      avgResolutionHours = Number((totalHours / resolvedWithDates.length).toFixed(1));
    }

    return {
      total,
      pending,
      underReview,
      assigned,
      inProgress,
      resolved,
      critical,
      high,
      avgResolutionHours,
      resolutionRate: total > 0 ? Number(((resolved / total) * 100).toFixed(1)) : 0,
    };
  }

  // --- SEED RESET ---
  resetToInitialData() {
    this.memoryComplaints = [...INITIAL_COMPLAINTS];
    this.memoryHistory = { ...INITIAL_STATUS_HISTORY };
    this.memoryNotifications = [...INITIAL_NOTIFICATIONS];
    this.save();
  }
}

export const complaintService = new ComplaintService();
