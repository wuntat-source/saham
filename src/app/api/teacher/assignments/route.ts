import { NextRequest, NextResponse } from 'next/server';
import { teacherLearningService } from '@/modules/learning/teacher/teacher.service';
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

    const assignments = await teacherLearningService.getAssignments(undefined, user.role === 'student' ? user.id : undefined);
    return NextResponse.json({
      success: true,
      assignments,
    });
  } catch (error: any) {
    console.error('Error in GET /api/teacher/assignments:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch assignments' },
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
      return NextResponse.json({ success: false, error: 'Hanya guru yang dapat membuat tugas' }, { status: 403 });
    }

    const body = await request.json();
    const { classId, title, description, deadline, stockUniverse, requiredOutput } = body;

    if (!title || !description || !deadline) {
      return NextResponse.json({ success: false, error: 'Judul, deskripsi, dan batas waktu wajib diisi' }, { status: 400 });
    }

    const assignment = await teacherLearningService.createAssignment({
      classId: classId || 'default-class',
      teacherId: user.id,
      title,
      description,
      deadline,
      stockUniverse,
      requiredOutput: requiredOutput || 'Tesis analisis fundamental dan kesimpulan rasio valuasi',
    });

    return NextResponse.json({
      success: true,
      assignment,
    });
  } catch (error: any) {
    console.error('Error in POST /api/teacher/assignments:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create assignment' },
      { status: 500 }
    );
  }
}
