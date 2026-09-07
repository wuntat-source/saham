import { NextRequest, NextResponse } from 'next/server';
import { skillsService } from '@/modules/learning/skills/skills.service';
import { behaviorService } from '@/modules/learning/behavior/behavior.service';
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

    const [skills, behaviors] = await Promise.all([
      skillsService.getStudentSkills(user.id),
      behaviorService.detectStudentBehaviors(user.id),
    ]);

    return NextResponse.json({
      success: true,
      skills,
      behaviors,
    });
  } catch (error: any) {
    console.error('Error in /api/student/skills:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch student skills' },
      { status: 500 }
    );
  }
}
