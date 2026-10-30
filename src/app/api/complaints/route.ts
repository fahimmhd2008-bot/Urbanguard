import { NextResponse } from 'next/server';
import { complaintService } from '@/lib/data/complaintService';

export async function GET() {
  try {
    const list = await complaintService.getAllComplaints();
    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve complaints' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.description || !body.location_name) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and location_name are required' },
        { status: 400 }
      );
    }

    const created = await complaintService.createComplaint({
      title: body.title,
      description: body.description,
      category: body.category,
      location_name: body.location_name,
      latitude: body.latitude || 12.9785,
      longitude: body.longitude || 77.5912,
      image_url: body.image_url,
      user_id: body.user_id,
      user_name: body.user_name,
      user_email: body.user_email,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create complaint' },
      { status: 500 }
    );
  }
}
