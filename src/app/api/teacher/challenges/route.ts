import { NextRequest, NextResponse } from 'next/server';
import { teacherLearningService } from '@/modules/learning/teacher/teacher.service';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const challenges = await teacherLearningService.getChallenges();
    return NextResponse.json({
      success: true,
      challenges,
    });
  } catch (error: any) {
    console.error('Error in GET /api/teacher/challenges:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('auth_token')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: sessionToken } });
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Hanya guru yang dapat membuat tantangan' }, { status: 403 });
    }

    const body = await request.json();
    const { classId, title, type, description, endDate, rewardXp } = body;

    if (!title || !description || !endDate) {
      return NextResponse.json({ success: false, error: 'Judul, deskripsi, dan tanggal selesai wajib diisi' }, { status: 400 });
    }

    const challenge = await teacherLearningService.createChallenge({
      classId: classId || 'default-class',
      teacherId: user.id,
      title,
      type: type || 'PORTFOLIO',
      description,
      endDate,
      rewardXp: rewardXp ? parseInt(rewardXp) : 250,
    });

    return NextResponse.json({
      success: true,
      challenge,
    });
  } catch (error: any) {
    console.error('Error in POST /api/teacher/challenges:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create challenge' },
      { status: 500 }
    );
  }
}
