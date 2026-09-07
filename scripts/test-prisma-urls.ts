import { PrismaClient } from '@prisma/client';
import path from 'path';

async function test(label: string, url: string) {
  console.log(`[${label}] Testing: ${url}`);
  try {
    const p = new PrismaClient({ datasources: { db: { url } } });
    const count = await p.user.count();
    console.log(`[${label}] Success! User count = ${count}`);
    await p.$disconnect();
  } catch (err: any) {
    console.error(`[${label}] Error: ${err.message}`);
  }
}

async function run() {
  const p1 = path.resolve(process.cwd(), 'prisma', 'dev.db').replace(/\\/g, '/');
  await test('Path 1 (file:F:/...)', 'file:' + p1);
  await test('Path 2 (file:///F:/...)', 'file:///' + p1);
  await test('Path 3 (file:./prisma/dev.db)', 'file:./prisma/dev.db');
  await test('Path 4 (file:./dev.db)', 'file:./dev.db');
}

run();
