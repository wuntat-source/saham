import { prisma } from '../src/lib/prisma';
import { tradingService } from '../src/modules/trading/services/trading.service';
import { portfolioService } from '../src/modules/portfolio/services/portfolio.service';
import { classroomService } from '../src/modules/classroom/services/classroom.service';
import { leaderboardService } from '../src/modules/leaderboard/services/leaderboard.service';
import { BUY_BROKER_FEE_RATE, SELL_BROKER_FEE_RATE, SHARES_PER_LOT } from '../src/lib/constants';
import bcrypt from 'bcryptjs';

async function runPhase1TestSuite() {
  console.log('====================================================');
  console.log('🧪 EDUTRADEX V2 — PHASE 1 COMPREHENSIVE TEST SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  // --- 1. SETUP TEST USERS ---
  console.log('1. Setting up clean test users and classroom...');
  const pwHash = await bcrypt.hash('testpass123', 10);

  // Clean test data
  const testEmailTeacher = 'test_teacher@edutradex.id';
  const testEmailStudent = 'test_student@edutradex.id';

  await prisma.user.deleteMany({
    where: { email: { in: [testEmailTeacher, testEmailStudent] } },
  });

  const testTeacher = await prisma.user.create({
    data: {
      name: 'Bpk. Guru Penguji',
      email: testEmailTeacher,
      password_hash: pwHash,
      role: 'teacher',
    },
  });

  const testStudent = await prisma.user.create({
    data: {
      name: 'Siswa Uji Coba',
      email: testEmailStudent,
      password_hash: pwHash,
      role: 'student',
    },
  });

  assert(testTeacher.role === 'teacher', 'Teacher role properly assigned');
  assert(testStudent.role === 'student', 'Student role properly assigned');

  // --- 2. CLASSROOM & INITIAL BALANCE ---
  console.log('\n2. Testing Classroom Creation & Student Join...');
  const createdClass = await classroomService.createClass(testTeacher.id, 'Kelas Simulasi Phase 1', 100_000_000);
  assert(createdClass.initial_balance === 100_000_000, 'Class created with initial balance Rp100.000.000');
  assert(createdClass.invitation_code.length === 6, 'Unique 6-character invitation code generated');

  const joinedClass = await classroomService.joinClass(testStudent.id, createdClass.invitation_code);
  assert(joinedClass.id === createdClass.id, 'Student successfully joined classroom via code');

  // Verify Wallet Initialization
  const studentWallet = await prisma.wallet.findUnique({ where: { user_id: testStudent.id } });
  assert(studentWallet !== null && studentWallet.cash_balance === 100_000_000, 'Student wallet automatically initialized with Rp100.000.000');

  // --- 3. BUY ORDER EXECUTION & WEIGHTED AVERAGE ---
  console.log('\n3. Testing BUY Order Execution & Weighted Average Formula...');
  const buy1Lots = 10;
  const buy1Price = 10000;
  const buy1Shares = buy1Lots * SHARES_PER_LOT; // 1,000 shares
  const buy1Gross = buy1Shares * buy1Price; // Rp 10,000,000
  const buy1Fee = buy1Gross * BUY_BROKER_FEE_RATE; // Rp 15,000 (0.15%)
  const buy1Settlement = buy1Gross + buy1Fee; // Rp 10,015,000

  const buy1Result = await tradingService.executeOrder(testStudent.id, {
    stock_code: 'BBCA',
    order_type: 'BUY',
    order_mode: 'LIMIT',
    lot_quantity: buy1Lots,
    target_price: buy1Price,
  });

  assert(buy1Result.broker_fee === buy1Fee, `BUY fee is exactly 0.15% (Expected: ${buy1Fee}, Got: ${buy1Result.broker_fee})`);
  assert(buy1Result.total_settlement === buy1Settlement, `BUY settlement is gross + fee (Expected: ${buy1Settlement}, Got: ${buy1Result.total_settlement})`);
  assert(buy1Result.remaining_cash === 100_000_000 - buy1Settlement, `Wallet cash correctly debited (Remaining: ${buy1Result.remaining_cash})`);

  // Buy 2: additional 10 lots of BBCA at Rp 12,000 to test Weighted Average
  const buy2Lots = 10;
  const buy2Price = 12000;
  const buy2Result = await tradingService.executeOrder(testStudent.id, {
    stock_code: 'BBCA',
    order_type: 'BUY',
    order_mode: 'LIMIT',
    lot_quantity: buy2Lots,
    target_price: buy2Price,
  });

  // Expected new average = (1000 * 10000 + 1000 * 12000) / 2000 = 11000
  const portfolioAfterBuy = await prisma.portfolio.findUnique({
    where: { user_id_stock_code: { user_id: testStudent.id, stock_code: 'BBCA' } },
  });
  assert(portfolioAfterBuy?.total_shares === 2000, 'Total shares updated to 2000 (20 lots)');
  assert(portfolioAfterBuy?.avg_buy_price === 11000, `New Weighted Average is exactly Rp11.000 (Got: ${portfolioAfterBuy?.avg_buy_price})`);

  // --- 4. BUY VALIDATION (INSUFFICIENT CASH REJECTION) ---
  console.log('\n4. Testing BUY Validation (Insufficient Cash Rejection)...');
  let buyFailedAsExpected = false;
  try {
    // Attempt to buy 10,000 lots requiring ~Rp 100 Billion
    await tradingService.executeOrder(testStudent.id, {
      stock_code: 'BBCA',
      order_type: 'BUY',
      order_mode: 'LIMIT',
      lot_quantity: 10000,
      target_price: 10000,
    });
  } catch (err: any) {
    buyFailedAsExpected = true;
    assert(err.message.includes('Saldo kas virtual tidak mencukupi'), 'Properly threw Insufficient Virtual Cash error');
  }
  assert(buyFailedAsExpected, 'Order rejected when wallet cash is insufficient');

  // --- 5. SELL ORDER EXECUTION & REALIZED P&L ---
  console.log('\n5. Testing SELL Order Execution & Realized P&L Formula...');
  // Sell 10 lots (1,000 shares) of BBCA at Rp 13,000
  // Avg buy price was Rp 11,000
  // Gross = 1,000 * 13,000 = 13,000,000
  // Fee = 13,000,000 * 0.0025 = 32,500 (0.25%)
  // Settlement = 13,000,000 - 32,500 = 12,967,500
  // Realized PnL = (13,000 - 11,000) * 1,000 - 32,500 = 2,000,000 - 32,500 = 1,967,500
  const sellLots = 10;
  const sellPrice = 13000;
  const expectedSellGross = sellLots * SHARES_PER_LOT * sellPrice;
  const expectedSellFee = expectedSellGross * SELL_BROKER_FEE_RATE;
  const expectedSellSettlement = expectedSellGross - expectedSellFee;
  const expectedRealizedPnl = (sellPrice - 11000) * (sellLots * SHARES_PER_LOT) - expectedSellFee;

  const sellResult = await tradingService.executeOrder(testStudent.id, {
    stock_code: 'BBCA',
    order_type: 'SELL',
    order_mode: 'LIMIT',
    lot_quantity: sellLots,
    target_price: sellPrice,
  });

  assert(sellResult.broker_fee === expectedSellFee, `SELL fee is exactly 0.25% (Expected: ${expectedSellFee}, Got: ${sellResult.broker_fee})`);
  assert(sellResult.total_settlement === expectedSellSettlement, `SELL settlement is gross - fee (Expected: ${expectedSellSettlement}, Got: ${sellResult.total_settlement})`);
  assert(sellResult.realized_pnl === expectedRealizedPnl, `Realized P&L correctly calculated (Expected: ${expectedRealizedPnl}, Got: ${sellResult.realized_pnl})`);

  // --- 6. SELL VALIDATION (INSUFFICIENT SHARES REJECTION) ---
  console.log('\n6. Testing SELL Validation (Insufficient Shares Rejection)...');
  let sellFailedAsExpected = false;
  try {
    // Attempt to sell 50 lots when student only has 10 lots remaining
    await tradingService.executeOrder(testStudent.id, {
      stock_code: 'BBCA',
      order_type: 'SELL',
      order_mode: 'LIMIT',
      lot_quantity: 50,
      target_price: 13000,
    });
  } catch (err: any) {
    sellFailedAsExpected = true;
    assert(err.message.includes('Jumlah lot saham tidak mencukupi'), 'Properly threw Insufficient Shares error');
  }
  assert(sellFailedAsExpected, 'Order rejected when owned shares is less than requested');

  // --- 7. PORTFOLIO & LEADERBOARD METRICS ---
  console.log('\n7. Testing Portfolio & Leaderboard Calculations...');
  const studentPortfolio = await portfolioService.getUserPortfolio(testStudent.id);
  assert(studentPortfolio.cash_balance > 0, 'Cash balance computed accurately');
  assert(studentPortfolio.total_equity === studentPortfolio.cash_balance + studentPortfolio.market_value, 'Total Equity = Cash + Market Value verified');
  assert(studentPortfolio.return_percent !== undefined, 'ROI % calculated accurately');

  const leaderboardResult = await leaderboardService.getClassLeaderboard(createdClass.id);
  assert(leaderboardResult.leaderboard.length === 1, 'Leaderboard includes enrolled student');
  assert(leaderboardResult.leaderboard[0].rank === 1, 'Leaderboard correctly assigned #1 rank');

  // Clean up test records
  await prisma.user.deleteMany({
    where: { email: { in: [testEmailTeacher, testEmailStudent] } },
  });

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} PHASE 1 TESTS PASSED SUCCESSFULLY!`);
  console.log('====================================================\n');
}

runPhase1TestSuite()
  .catch((e) => {
    console.error('Test suite failure:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
