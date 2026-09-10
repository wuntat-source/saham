import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && !envUrl.startsWith('file:') && !envUrl.startsWith('.')) {
    return envUrl;
  }

  // Vercel / AWS Serverless read-only filesystem handling
  const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (isVercel) {
    const tmpDbPath = '/tmp/dev.db';
    const bundledDbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
    try {
      if (!fs.existsSync(tmpDbPath) && fs.existsSync(bundledDbPath)) {
        fs.copyFileSync(bundledDbPath, tmpDbPath);
      }
      if (fs.existsSync(tmpDbPath)) {
        return `file:${tmpDbPath}`;
      }
    } catch (e) {
      console.warn('Could not mirror SQLite db to /tmp on serverless:', e);
    }
  }

  // Primary locations for dev.db
  const prismaDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  const rootDbPath = path.join(process.cwd(), 'dev.db');

  let targetPath = prismaDbPath;
  if (fs.existsSync(prismaDbPath)) {
    targetPath = prismaDbPath;
  } else if (fs.existsSync(rootDbPath)) {
    targetPath = rootDbPath;
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
