import { prisma } from '../src/lib/prisma';

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
  });
  console.log(`✅ Success querying database via prisma! Total users found: ${users.length}`);
  console.log(users.map((u) => `${u.name} (${u.email}) [${u.role}]`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
