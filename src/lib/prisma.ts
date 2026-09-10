import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && !envUrl.startsWith('file:')) {
    return envUrl;
  }

  // Candidate absolute locations for dev.db on Windows / server environments
  const candidates = [
    path.resolve(process.cwd(), 'prisma', 'dev.db'),
    path.resolve(process.cwd(), 'dev.db'),
    path.resolve(__dirname, '..', '..', 'prisma', 'dev.db'),
    path.resolve(__dirname, '..', '..', 'dev.db'),
    path.resolve(__dirname, '..', 'prisma', 'dev.db'),
    'f:/Antigravity/saham/prisma/dev.db',
    'f:/Antigravity/saham/dev.db',
  ];

  let targetPath = candidates[0];
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        targetPath = candidate;
        break;
      }
    } catch {
      // Continue searching
    }
  }

  const normalized = targetPath.replace(/\\/g, '/');
  return `file:${normalized}`;
}

const dbUrl = getDatabaseUrl();
process.env.DATABASE_URL = dbUrl;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
