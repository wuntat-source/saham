import { prisma } from '../src/lib/prisma';
import { executeOrder } from '../src/lib/order-engine';
import { BUY_BROKER_FEE_RATE, SELL_BROKER_FEE_RATE, SHARES_PER_LOT } from '../src/lib/constants';

async function runTests() {
  console.log('🧪 Starting EduTradeX Financial Engine Verification...');

  // 1. Find demo student
  const student = await prisma.user.findUnique({
    where: { email: 'siswa1@edutradex.id' },
    include: { wallet: true },
  });

  if (!student) {
    throw new Error('Demo student not found in database!');
  }

  console.log(`✅ Test User found: ${student.name} (Wallet: Rp${student.wallet?.cash_balance.toLocaleString('id-ID')})`);

  // 2. Test BUY Execution
  const testBuyLots = 10;
  const testStock = 'BBCA';
  const testBuyPrice = 10000;

  console.log(`\nTesting BUY ${testBuyLots} lots of ${testStock} @ Rp${testBuyPrice}...`);
  const initialCash = student.wallet?.cash_balance || 0;

  const buyResult = await executeOrder({
    userId: student.id,
    stockCode: testStock,
    orderType: 'BUY',
    orderMode: 'LIMIT',
    lotQuantity: testBuyLots,
    customPrice: testBuyPrice,
  });

  const expectedShares = testBuyLots * SHARES_PER_LOT; // 1000 shares
  const expectedGross = expectedShares * testBuyPrice; // 10,000,000
  const expectedFee = expectedGross * BUY_BROKER_FEE_RATE; // 15,000
  const expectedSettlement = expectedGross + expectedFee; // 10,015,000

  console.log(`Expected settlement: Rp${expectedSettlement}, Actual: Rp${buyResult.totalSettlement}`);
  if (buyResult.totalSettlement !== expectedSettlement) {
    throw new Error('BUY settlement calculation mismatch!');
  }
  console.log('✅ BUY Order executed with exact 0.15% broker fee calculation');

  // 3. Test SELL Execution
  const testSellLots = 5;
  const testSellPrice = 11000;

  console.log(`\nTesting SELL ${testSellLots} lots of ${testStock} @ Rp${testSellPrice}...`);
  const sellResult = await executeOrder({
    userId: student.id,
    stockCode: testStock,
    orderType: 'SELL',
    orderMode: 'LIMIT',
    lotQuantity: testSellLots,
    customPrice: testSellPrice,
  });

  const expectedSellShares = testSellLots * SHARES_PER_LOT; // 500 shares
  const expectedSellGross = expectedSellShares * testSellPrice; // 5,500,000
  const expectedSellFee = expectedSellGross * SELL_BROKER_FEE_RATE; // 13,750
  const expectedSellSettlement = expectedSellGross - expectedSellFee; // 5,486,250

  console.log(`Expected Sell settlement: Rp${expectedSellSettlement}, Actual: Rp${sellResult.totalSettlement}`);
  if (sellResult.totalSettlement !== expectedSellSettlement) {
    throw new Error('SELL settlement calculation mismatch!');
  }
  console.log('✅ SELL Order executed with exact 0.25% broker fee calculation');
  console.log(`Realized P&L: Rp${sellResult.realizedPnl?.toLocaleString('id-ID')}`);

  console.log('\n🎉 ALL FINANCIAL ENGINE TESTS PASSED PERFECTLY!\n');
}

runTests()
  .catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
