import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding EduTradeX database...');

  // Clear existing
  await prisma.transaction.deleteMany();
  await prisma.order.deleteMany();
  await prisma.portfolio.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.classMember.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('guru123', 10);
  const studentPasswordHash = await bcrypt.hash('siswa123', 10);

  // 1. Create Teacher
  const teacher = await prisma.user.create({
    data: {
      name: 'Budi Santoso, S.Pd.',
      email: 'guru@edutradex.id',
      password_hash: passwordHash,
      role: 'teacher',
      wallet: {
        create: {
          cash_balance: 100000000.0,
        },
      },
    },
  });

  // 2. Create Class
  const classItem = await prisma.class.create({
    data: {
      teacher_id: teacher.id,
      class_name: 'Kelas XII IPS 1 - Ekonomi & Pasar Modal',
      invitation_code: 'SMAN1-EKO',
      initial_balance: 100000000.0,
    },
  });

  // 3. Create Students
  const studentsData = [
    { name: 'Ahmad Fauzi', email: 'siswa1@edutradex.id', stock: 'BBCA', lots: 35, buyPrice: 9800 },
    { name: 'Siti Nurhaliza', email: 'siswa2@edutradex.id', stock: 'BBRI', lots: 60, buyPrice: 4850 },
    { name: 'Kevin Pratama', email: 'siswa3@edutradex.id', stock: 'TLKM', lots: 80, buyPrice: 3200 },
    { name: 'Dewi Lestari', email: 'siswa4@edutradex.id', stock: 'ASII', lots: 50, buyPrice: 5100 },
    { name: 'Rizky Ramadhan', email: 'siswa5@edutradex.id', stock: 'GOTO', lots: 2000, buyPrice: 52 },
  ];

  for (const s of studentsData) {
    const student = await prisma.user.create({
      data: {
        name: s.name,
        email: s.email,
        password_hash: studentPasswordHash,
        role: 'student',
      },
    });

    // Join class
    await prisma.classMember.create({
      data: {
        class_id: classItem.id,
        student_id: student.id,
      },
    });

    // Calculate trade
    const shares = s.lots * 100;
    const totalAmount = shares * s.buyPrice;
    const fee = totalAmount * 0.0015;
    const totalSettlement = totalAmount + fee;
    const remainingCash = 100000000.0 - totalSettlement;

    // Create Wallet
    await prisma.wallet.create({
      data: {
        user_id: student.id,
        cash_balance: remainingCash,
      },
    });

    // Create Portfolio
    await prisma.portfolio.create({
      data: {
        user_id: student.id,
        stock_code: s.stock,
        total_shares: shares,
        avg_buy_price: s.buyPrice,
      },
    });

    // Create Order
    const order = await prisma.order.create({
      data: {
        user_id: student.id,
        stock_code: s.stock,
        order_type: 'BUY',
        order_mode: 'MARKET',
        target_price: s.buyPrice,
        lot_quantity: s.lots,
        status: 'FILLED',
      },
    });

    // Create Transaction
    await prisma.transaction.create({
      data: {
        order_id: order.id,
        user_id: student.id,
        stock_code: s.stock,
        type: 'BUY',
        price: s.buyPrice,
        lot_quantity: s.lots,
        total_amount: totalAmount,
        broker_fee: fee,
        total_settlement: totalSettlement,
        realized_pnl: 0,
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`Teacher login: guru@edutradex.id (pw: guru123)`);
  console.log(`Student login: siswa1@edutradex.id (pw: siswa123)`);
  console.log(`Classroom Code: SMAN1-EKO`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
