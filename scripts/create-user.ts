import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/lib/auth';
import { DEFAULT_INITIAL_BALANCE } from '../src/lib/constants';

async function main() {
  const usersToSetup = [
    { username: 'bampri', pass: 'bampri123', name: 'Bampri' },
    { username: 'pidi', pass: 'pidi123', name: 'Pidi' },
  ];

  for (const item of usersToSetup) {
    const passwordHash = await hashPassword(item.pass);
    const emails = [
      `${item.username}@edutradex.com`,
      `${item.username}@gmail.com`,
      item.username,
    ];

    for (const email of emails) {
      try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          await prisma.user.update({
            where: { email },
            data: {
              password_hash: passwordHash,
              name: item.name,
              role: 'student',
            },
          });
          console.log(`Updated user ${item.username} (email: ${email}) with role student`);
        } else {
          await prisma.user.create({
            data: {
              email,
              name: item.name,
              password_hash: passwordHash,
              role: 'student',
              wallet: {
                create: {
                  cash_balance: DEFAULT_INITIAL_BALANCE,
                },
              },
            },
          });
          console.log(`Created user ${item.username} (email: ${email}) with role student`);
        }
      } catch (e: any) {
        console.log(`Note for ${email}: ${e.message}`);
      }
    }
  }

  // Print all students to verify
  const students = await prisma.user.findMany({
    where: { role: 'student' },
    select: { id: true, name: true, email: true, role: true, wallet: { select: { cash_balance: true } } },
  });
  console.log('\n📋 Current Students List in Database:');
  console.table(students.map((s) => ({
    name: s.name,
    email: s.email,
    role: s.role,
    balance: s.wallet ? `Rp${s.wallet.cash_balance.toLocaleString('id-ID')}` : 'Rp0',
  })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
