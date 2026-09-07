import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ClassroomIntelligenceService } from '@/modules/classroom/intelligence/classroom-intelligence.service';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');

    let classes;
    if (classId) {
      classes = await prisma.class.findMany({
        where: { id: classId },
      });
    } else {
      classes = await prisma.class.findMany({
        where: user.role === 'teacher' ? { teacher_id: user.userId } : {},
      });
    }

    const summaries = [];
    for (const c of classes) {
      const analytics = await ClassroomIntelligenceService.getClassroomAnalytics(c.id);
      if (analytics) {
        summaries.push(analytics);
      }
    }

    return NextResponse.json({ success: true, reports: summaries });
  } catch (error: any) {
    console.error('Error generating classroom reports:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
