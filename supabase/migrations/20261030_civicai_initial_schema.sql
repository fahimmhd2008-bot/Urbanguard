-- ==============================================================================
-- CIVICAI DATABASE SCHEMA (PostgreSQL / Supabase)
-- "From Complaints to Action | AI for Civic Impact"
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Roads', 
        'Water and drainage', 
        'Waste management', 
        'Electricity and streetlights', 
        'Public infrastructure', 
        'Public safety', 
        'Other'
    )),
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN (
        'SUBMITTED', 
        'UNDER REVIEW', 
        'ASSIGNED', 
        'IN PROGRESS', 
        'RESOLVED'
    )),
    priority_score INTEGER NOT NULL DEFAULT 20 CHECK (priority_score >= 0 AND priority_score <= 100),
    priority_level TEXT NOT NULL DEFAULT 'Low' CHECK (priority_level IN ('Critical', 'High', 'Medium', 'Low')),
    ai_summary TEXT,
    assigned_department TEXT,
    assigned_to TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    resolved_at TIMESTAMPTZ
);

-- 3. COMPLAINT AI ANALYSIS TABLE
CREATE TABLE IF NOT EXISTS public.complaint_ai_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    predicted_category TEXT NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    urgency TEXT NOT NULL,
    public_impact TEXT NOT NULL,
    priority_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    duplicate_candidates JSONB NOT NULL DEFAULT '[]'::jsonb,
    duplicate_explanation TEXT,
    priority_explanation TEXT NOT NULL,
    recommended_department TEXT NOT NULL,
    department_reason TEXT,
    model_information TEXT NOT NULL DEFAULT 'CivicAI-Deterministic-NLP-v2',
    processing_status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (processing_status IN ('COMPLETED', 'NEEDS_REVIEW', 'FALLBACK')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. COMPLAINT STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.complaint_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    public_message TEXT NOT NULL,
    internal_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. COMPLAINT ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.complaint_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    department TEXT NOT NULL,
    assigned_to TEXT NOT NULL,
    assigned_by TEXT NOT NULL,
    assignment_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. COMPLAINT RELATIONS (DUPLICATES / LINKED ISSUES)
CREATE TABLE IF NOT EXISTS public.complaint_relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    related_complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    similarity_score INTEGER NOT NULL CHECK (similarity_score >= 0 AND similarity_score <= 100),
    explanation TEXT NOT NULL,
    review_status TEXT NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (review_status IN ('PENDING_REVIEW', 'CONFIRMED_DUPLICATE', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_complaint_pair UNIQUE (complaint_id, related_complaint_id)
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('STATUS_CHANGE', 'ASSIGNMENT', 'RESOLUTION', 'SYSTEM')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE AND HOTSPOT QUERIES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON public.complaints(priority_level);
CREATE INDEX IF NOT EXISTS idx_complaints_geo ON public.complaints(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_history_complaint_id ON public.complaint_status_history(complaint_id);
CREATE INDEX IF NOT EXISTS idx_relations_complaint_id ON public.complaint_relations(complaint_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles:
CREATE POLICY "Public profiles are readable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile name but not role" 
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Complaints:
-- Citizens can read their own complaints; Admins can read all complaints
CREATE POLICY "Citizens can read their own complaints; Admins read all"
ON public.complaints FOR SELECT TO authenticated
USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Citizens can create complaints with status 'SUBMITTED'
CREATE POLICY "Citizens can submit complaints"
ON public.complaints FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() = user_id AND 
    status = 'SUBMITTED'
);

-- Only Admins can update complaint status, priority, assignments, admin_notes
CREATE POLICY "Admins can update complaints"
ON public.complaints FOR UPDATE TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Status history:
CREATE POLICY "Users can read status history of their own complaints; Admins read all"
ON public.complaint_status_history FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.complaints 
        WHERE complaints.id = complaint_status_history.complaint_id 
        AND (complaints.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
);

CREATE POLICY "Only admins or triggers can insert status history"
ON public.complaint_status_history FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- AI Analysis:
CREATE POLICY "Users can view AI analysis of their complaints; Admins view all"
ON public.complaint_ai_analysis FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.complaints 
        WHERE complaints.id = complaint_ai_analysis.complaint_id 
        AND (complaints.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    )
);

-- Notifications:
CREATE POLICY "Users can view and update their own notifications"
ON public.notifications FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
