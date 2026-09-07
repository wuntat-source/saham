import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Silakan login terlebih dahulu.' }, { status: 401 });
    }

    const body = await req.json();
    const { invitation_code } = body;

    if (!invitation_code || invitation_code.trim().length === 0) {
      return NextResponse.json({ error: 'Kode undangan wajib diisi.' }, { status: 400 });
    }

    const cleanCode = invitation_code.trim().toUpperCase();

    const targetClass = await prisma.class.findUnique({
      where: { invitation_code: cleanCode },
    });

    if (!targetClass) {
      return NextResponse.json(
        { error: 'Kode undangan tidak valid atau kelas tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Check if already joined
    const existingMember = await prisma.classMember.findUnique({
      where: {
        class_id_student_id: {
          class_id: targetClass.id,
          student_id: user.userId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'Anda sudah bergabung dalam kelas ini.', class_id: targetClass.id },
        { status: 400 }
      );
    }

    // Join class
    await prisma.classMember.create({
      data: {
        class_id: targetClass.id,
        student_id: user.userId,
      },
    });

    // Ensure wallet exists with class initial balance
    const wallet = await prisma.wallet.findUnique({
      where: { user_id: user.userId },
    });

    if (!wallet) {
      await prisma.wallet.create({
        data: {
          user_id: user.userId,
          cash_balance: targetClass.initial_balance,
        },
      });
    }

    return NextResponse.json({
      success: true,
      class_id: targetClass.id,
      class_name: targetClass.class_name,
      status: 'joined',
    });
  } catch (error: any) {
    console.error('Error joining class:', error);
    return NextResponse.json({ error: error.message || 'Gagal bergabung ke kelas.' }, { status: 500 });
  }
}
