import { PrismaClient } from '@prisma/client';
import path from 'path';

async function testUrl(label: string, url: string) {
  console.log(`\nTesting [${label}]: ${url}`);
  const client = new PrismaClient({
    datasources: { db: { url } },
    log: ['error'],
  });
  try {
    const user = await client.user.findFirst({ select: { id: true, name: true, email: true } });
    console.log(`✅ SUCCESS for [${label}]: Found user "${user?.name}" (${user?.email})`);
  } catch (e: any) {
    console.error(`❌ FAILED for [${label}]: ${e.message}`);
  } finally {
    await client.$disconnect();
  }
}

async function main() {
  const absPath1 = path.resolve(process.cwd(), 'prisma', 'dev.db').replace(/\\/g, '/');
  const absPath2 = path.resolve(process.cwd(), 'prisma', 'dev.db');
  
  await testUrl('Absolute POSIX forward slashes', `file:${absPath1}`);
  await testUrl('Absolute Windows standard', `file:${absPath2}`);
  await testUrl('Absolute 3 slashes', `file:///${absPath1}`);
  await testUrl('Relative ./dev.db', 'file:./dev.db');
  await testUrl('Relative ./prisma/dev.db', 'file:./prisma/dev.db');
  await testUrl('Default process.env.DATABASE_URL', process.env.DATABASE_URL || 'NONE');
}

main();
