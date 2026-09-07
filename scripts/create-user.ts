import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/lib/auth';
import { DEFAULT_INITIAL_BALANCE } from '../src/lib/constants';

async function main() {
  const passwordHash = await hashPassword('bampri123');

  // Create or update user with email bampri@edutradex.com and bampri
  const emails = ['bampri@edutradex.com', 'bampri@gmail.com', 'bampri'];

  for (const email of emails) {
    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        await prisma.user.update({
          where: { email },
          data: {
            password_hash: passwordHash,
            name: 'bampri',
            role: 'student',
          },
        });
        console.log(`Updated user with email: ${email}`);
      } else {
        const user = await prisma.user.create({
          data: {
            email,
            name: 'bampri',
            password_hash: passwordHash,
            role: 'student',
            wallet: {
              create: {
                cash_balance: DEFAULT_INITIAL_BALANCE,
              },
            },
          },
        });
        console.log(`Created user with email: ${email}`);
      }
    } catch (e: any) {
      console.log(`Note for ${email}: ${e.message}`);
    }
  }

  console.log('🎉 User account bampri setup completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
