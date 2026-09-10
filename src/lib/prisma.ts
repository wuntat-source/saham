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

  // Cross-platform candidate locations for dev.db
  const candidates = [
    path.resolve(process.cwd(), 'prisma', 'dev.db'),
    path.resolve(process.cwd(), 'dev.db'),
    path.resolve(__dirname, '..', '..', 'prisma', 'dev.db'),
    path.resolve(__dirname, '..', '..', 'dev.db'),
    path.resolve(__dirname, '..', 'prisma', 'dev.db'),
    path.join(process.cwd(), 'prisma', 'dev.db'),
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

  // Ensure parent directory exists
  try {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch {}

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
