import { NextResponse } from 'next/server';
import { complaintService } from '@/lib/data/complaintService';
import { sanitizeString, validateLatitude, validateLongitude, sanitizeImageUrl } from '@/lib/security/sanitize';
import { ValidationError } from '@/lib/errors/AppError';
import type { ComplaintCategory } from '@/types/civic';

/**
 * GET /api/complaints
 * Returns all active complaints from Supabase or fallback demo dataset.
 */
export async function GET() {
  try {
    const list = await complaintService.getAllComplaints();
    return NextResponse.json(
      {
        success: true,
        count: list.length,
        data: list,
        timestamp: new Date().toISOString(),
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
        error: 'Failed to retrieve complaints',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/complaints
 * Ingests, sanitizes, and persists a citizen complaint report.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      throw new ValidationError('Invalid JSON request body');
    }

    const cleanTitle = sanitizeString(body.title, 120);
    const cleanDescription = sanitizeString(body.description, 2000);
    const cleanLocation = sanitizeString(body.location_name, 150);

    if (!cleanTitle || cleanTitle.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Title is required and must be at least 5 characters' },
        { status: 400 }
      );
    }

    if (!cleanDescription || cleanDescription.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Description is required and must be at least 10 characters' },
        { status: 400 }
      );
    }

    if (!cleanLocation) {
      return NextResponse.json(
        { success: false, error: 'Valid location name is required' },
        { status: 400 }
      );
    }

    const cleanLatitude = validateLatitude(body.latitude, 12.9785);
    const cleanLongitude = validateLongitude(body.longitude, 77.5912);
    const cleanImageUrl = sanitizeImageUrl(body.image_url);

    const created = await complaintService.createComplaint({
      title: cleanTitle,
      description: cleanDescription,
      category: body.category ? (sanitizeString(body.category, 50) as ComplaintCategory) : undefined,
      location_name: cleanLocation,
      latitude: cleanLatitude,
      longitude: cleanLongitude,
      image_url: cleanImageUrl,
      user_id: body.user_id ? sanitizeString(body.user_id, 100) : undefined,
      user_name: body.user_name ? sanitizeString(body.user_name, 100) : undefined,
      user_email: body.user_email ? sanitizeString(body.user_email, 150) : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Complaint registered and prioritized successfully',
        data: created,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create complaint',
        message: error instanceof Error ? error.message : 'Unknown server error',
      },
      { status: 500 }
    );
  }
}
