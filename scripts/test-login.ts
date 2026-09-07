import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function test() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: 'pidi@edutradex.com' },
        { email: 'bampri@edutradex.com' },
        { name: 'pidi' },
        { name: 'bampri' },
      ],
    },
  });

  console.log('Found users:', users.length);
  for (const u of users) {
    const isPidiPass = await bcrypt.compare('pidi123', u.password_hash);
    const isBampriPass = await bcrypt.compare('bampri123', u.password_hash);
    console.log(`User: ${u.email} (${u.name}) -> pidi123: ${isPidiPass}, bampri123: ${isBampriPass}`);
  }
}

test().finally(() => prisma.$disconnect());
