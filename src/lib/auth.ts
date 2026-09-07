import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'edutradex-super-secret-key-2026-production';
const COOKIE_NAME = 'edutradex_token';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getFullCurrentUser() {
  const payload = await getCurrentUser();
  if (!payload) return null;

  return prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      wallet: true,
      taughtClasses: true,
      enrolledClasses: {
        include: {
          class: {
            include: {
              teacher: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      },
    },
  });
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
