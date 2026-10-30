import { NextResponse } from 'next/server';
import { classifyComplaint } from '@/lib/ai/classifier';
import { calculatePriorityScore } from '@/lib/ai/priorityScorer';
import { generateComplaintSummary } from '@/lib/ai/summarizer';
import { detectDuplicates } from '@/lib/ai/duplicateDetector';
import { complaintService } from '@/lib/data/complaintService';
import { sanitizeString, validateLatitude, validateLongitude } from '@/lib/security/sanitize';

/**
 * POST /api/ai/analyze
 * Comprehensive AI pipeline endpoint for incident triage, classification,
 * 4-factor explainable priority scoring, and spatial-text duplicate detection.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);

    if (!rawBody || typeof rawBody !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request payload' },
        { status: 400 }
      );
    }

    const title = sanitizeString(rawBody.title, 120);
    const description = sanitizeString(rawBody.description, 2000);
    const category = rawBody.category ? sanitizeString(rawBody.category, 50) : undefined;
    const locationName = sanitizeString(rawBody.locationName, 150) || 'Metropolitan Area';
    const latitude = validateLatitude(rawBody.latitude, 12.9716);
    const longitude = validateLongitude(rawBody.longitude, 77.5946);

    if (!title || title.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Title is required for AI analysis' },
        { status: 400 }
      );
    }

    if (!description || description.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Description is required for AI analysis' },
        { status: 400 }
      );
    }

    // 1. NLP Classification
    const classification = classifyComplaint(title, description);
    const resolvedCategory = (category as any) || classification.category;

    // 2. Structured 4-Part Incident Summary
    const summary = generateComplaintSummary({
      title,
      description,
      category: resolvedCategory,
      locationName,
    });

    // 3. Multi-factor duplicate candidate detection
    const existingComplaints = await complaintService.getAllComplaints();
    const duplicates = detectDuplicates(
      {
        title,
        description,
        category: resolvedCategory,
        latitude,
        longitude,
      },
      existingComplaints,
      50
    );

    // 4. Explainable 0-100 Priority Scoring
    const priority = calculatePriorityScore({
      title,
      description,
      category: resolvedCategory,
      locationName,
      nearbyRelatedCount: duplicates.length,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          classification,
          summary,
          priority,
          duplicate_candidates: duplicates,
          model_info: {
            pipeline: 'Urbanguard AI Civic Decision Engine v2.4',
            algorithm: 'Hybrid Deterministic Keyword & Multi-factor Spatial Vector Scoring',
            confidence: classification.confidence,
          },
          timestamp: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'AI analysis pipeline error',
        message: error instanceof Error ? error.message : 'Unknown pipeline error',
      },
      { status: 500 }
    );
  }
}
