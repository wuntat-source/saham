import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { DEFAULT_INITIAL_BALANCE } from '@/lib/constants';

function generateCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'teacher' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Hanya guru yang dapat membuat kelas.' }, { status: 403 });
    }

    const body = await req.json();
    const { className, initialBalance = DEFAULT_INITIAL_BALANCE } = body;

    if (!className || className.trim().length === 0) {
      return NextResponse.json({ error: 'Nama kelas wajib diisi.' }, { status: 400 });
    }

    let code = generateCode(6);
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const existing = await prisma.class.findUnique({ where: { invitation_code: code } });
      if (!existing) {
        isUnique = true;
      } else {
        code = generateCode(6);
        attempts++;
      }
    }

    const newClass = await prisma.class.create({
      data: {
        teacher_id: user.userId,
        class_name: className.trim(),
        invitation_code: code,
        initial_balance: parseFloat(initialBalance) || DEFAULT_INITIAL_BALANCE,
      },
    });

    return NextResponse.json({ success: true, class: newClass });
  } catch (error: any) {
    console.error('Error creating class:', error);
    return NextResponse.json({ error: error.message || 'Gagal membuat kelas.' }, { status: 500 });
  }
}
