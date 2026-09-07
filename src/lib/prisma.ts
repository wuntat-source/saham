import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && !envUrl.startsWith('file:.')) {
    return envUrl;
  }

  // Find exact absolute path on Windows
  const prismaDbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
  const rootDbPath = path.resolve(process.cwd(), 'dev.db');

  let targetPath = prismaDbPath;
  if (fs.existsSync(prismaDbPath)) {
    targetPath = prismaDbPath;
  } else if (fs.existsSync(rootDbPath)) {
    targetPath = rootDbPath;
  }

  const normalized = targetPath.replace(/\\/g, '/');
  return `file:${normalized}`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
