import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ClassroomIntelligenceService } from '@/modules/classroom/intelligence/classroom-intelligence.service';
import { StudentAnalyticsDetail } from '@/types/classroom';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    const classEntity = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        members: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!classEntity) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    const studentDetails: StudentAnalyticsDetail[] = [];
    for (const m of classEntity.members) {
      const detail = await ClassroomIntelligenceService.getStudentAnalytics(m.student_id);
      if (detail) {
        studentDetails.push(detail);
      }
    }

    const csvContent = ClassroomIntelligenceService.generateCSVReport(studentDetails);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="edutradex_class_${classEntity.invitation_code}_report.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting classroom report CSV:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
