import { NextRequest, NextResponse } from 'next/server';
import { reportService } from '@/modules/learning/report/report.service';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('auth_token')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: sessionToken } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
    }

    const report = await reportService.getStudentWeeklyReport(user.id);
    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('Error in /api/student/report:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch student report' },
      { status: 500 }
    );
  }
}
