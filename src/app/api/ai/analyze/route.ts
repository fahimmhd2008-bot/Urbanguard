import { NextResponse } from 'next/server';
import { classifyComplaint } from '@/lib/ai/classifier';
import { calculatePriorityScore } from '@/lib/ai/priorityScorer';
import { generateComplaintSummary } from '@/lib/ai/summarizer';
import { detectDuplicates } from '@/lib/ai/duplicateDetector';
import { complaintService } from '@/lib/data/complaintService';

export async function POST(request: Request) {
  try {
    const { title, description, category, locationName, latitude, longitude } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required for AI analysis' },
        { status: 400 }
      );
    }

    const classification = classifyComplaint(title, description);
    const resolvedCategory = category || classification.category;

    const summary = generateComplaintSummary({
      title,
      description,
      category: resolvedCategory,
      locationName: locationName || 'Metropolitan Area',
    });

    const existingComplaints = await complaintService.getAllComplaints();
    const duplicates = detectDuplicates(
      {
        title,
        description,
        category: resolvedCategory,
        latitude: latitude || 12.9716,
        longitude: longitude || 77.5946,
      },
      existingComplaints,
      50
    );

    const priority = calculatePriorityScore({
      title,
      description,
      category: resolvedCategory,
      locationName: locationName || 'Metropolitan Area',
      nearbyRelatedCount: duplicates.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        classification,
        summary,
        priority,
        duplicate_candidates: duplicates,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'AI analysis pipeline error' },
      { status: 500 }
    );
  }
}
