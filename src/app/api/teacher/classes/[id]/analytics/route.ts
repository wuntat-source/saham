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
    const analytics = await ClassroomIntelligenceService.getClassroomAnalytics(id);

    if (!analytics) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: analytics });
  } catch (error: any) {
    console.error('Error fetching classroom analytics:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
