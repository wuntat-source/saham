import { NextRequest, NextResponse } from 'next/server';
import { gamificationService } from '@/modules/learning/gamification/gamification.service';
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

    const progress = await gamificationService.getStudentProgress(user.id);
    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error: any) {
    console.error('Error in /api/student/progress:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch student progress' },
      { status: 500 }
    );
  }
}
