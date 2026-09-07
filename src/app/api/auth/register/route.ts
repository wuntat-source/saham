import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { DEFAULT_INITIAL_BALANCE } from '@/lib/constants';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role = 'student' } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama, email, dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const validRole = role === 'teacher' ? 'teacher' : 'student';

    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        password_hash: passwordHash,
        role: validRole,
        wallet: {
          create: {
            cash_balance: DEFAULT_INITIAL_BALANCE,
          },
        },
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'student' | 'teacher',
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Gagal mendaftar.' }, { status: 500 });
  }
}
