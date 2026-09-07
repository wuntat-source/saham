import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { ClassroomIntelligenceService } from '@/modules/classroom/intelligence/classroom-intelligence.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const detail = await ClassroomIntelligenceService.getStudentAnalytics(id);

    if (!detail) {
      return NextResponse.json({ error: 'Student analytics not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: detail });
  } catch (error: any) {
    console.error('Error fetching student analytics:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
