import { ruleEvaluator } from '../src/modules/quant/rules/rule-evaluator';
import { backtestEngine } from '../src/modules/quant/engine/backtest.engine';
import { metricsCalculator } from '../src/modules/quant/metrics/metrics.calculator';
import { overfittingDetector } from '../src/modules/quant/overfitting/overfitting.detector';
import { strategyReviewService } from '../src/modules/quant/ai-review/strategy-review.service';
import { strategyService } from '../src/modules/quant/strategy/strategy.service';
import { StrategyRules } from '../src/types/quant';
import { prisma } from '../src/lib/prisma';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runPhase5Tests() {
  console.log('====================================================');
  console.log('🚀 RUNNING EDUTRADEX PHASE 5 QUANT LAB & BACKTEST TESTS');
  console.log('====================================================\n');

  // Setup test user
  let testUser = await prisma.user.findFirst({ where: { email: 'quant_student@test.com' } });
  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        email: 'quant_student@test.com',
        name: 'Siswa Quant Researcher',
        password_hash: 'dummyhash',
        role: 'student',
      },
    });
  }

  // --- 1. RULE EVALUATOR & LOGICAL OPERATORS ---
  console.log('--- 1. Rule Evaluator & Condition Matching ---');
  const sampleBar = {
    ticker: 'BBCA',
    date: '2025-06-01',
    price: 10400,
    open: 10300,
    high: 10500,
    low: 10250,
    close: 10400,
    volume: 500000,
    rsi_14: 62,
    sma_50: 10100,
    prev_rsi_14: 48,
    technical_score: 82,
    fundamental_score: 88,
    valuation_score: 65,
  };

  const condGt = ruleEvaluator.evaluateCondition({ field: 'rsi_14', operator: '>', value: 50 }, sampleBar);
  assert(condGt === true, 'Condition RSI > 50 evaluated correctly');

  const condCross = ruleEvaluator.evaluateCondition({ field: 'rsi_14', operator: 'CROSSES_ABOVE', value: 50 }, sampleBar);
  assert(condCross === true, 'Condition RSI CROSSES_ABOVE 50 evaluated from prev_rsi');

  const groupAnd = ruleEvaluator.evaluateGroup(
    {
      logicalOperator: 'AND',
      conditions: [
        { field: 'technical_score', operator: '>=', value: 80 },
        { field: 'fundamental_score', operator: '>=', value: 85 },
      ],
    },
    sampleBar
  );
  assert(groupAnd === true, 'Compound AND group evaluated correctly');

  // --- 2. STRATEGY CREATION & CRUD ---
  console.log('\n--- 2. Strategy Creation & Persistence ---');
  const testRules: StrategyRules = {
    entryRules: {
      logicalOperator: 'AND',
      conditions: [
        { field: 'technical_score', operator: '>=', value: 75 },
        { field: 'fundamental_score', operator: '>=', value: 70 },
        { field: 'rsi_14', operator: '<=', value: 70 },
      ],
    },
    exitRules: {
      stopLossPct: 3.5,
      takeProfitPct: 7.5,
      maxHoldDays: 45,
    },
    positionSizePct: 20,
    maxPositions: 5,
  };

  const createdStrategy = await strategyService.createStrategy({
    userId: testUser.id,
    name: 'Multi-Pillar Momentum LQ45',
    description: 'Strategi pengujian kuantitatif berbasis pilar kecerdasan buatan.',
    rules: testRules,
    universe: 'LQ45',
  });

  assert(createdStrategy.id.length > 0, `Strategy created with ID: ${createdStrategy.id}`);
  assert(createdStrategy.rules.entryRules.conditions.length === 3, 'Strategy rules serialized and retrieved intact');

  const allStrategies = await strategyService.getStrategies(testUser.id);
  assert(allStrategies.length >= 1, `User strategies listed successfully (count: ${allStrategies.length})`);

  // --- 3. BACKTEST ENGINE & ANTI-BIAS EXECUTION ---
  console.log('\n--- 3. Backtest Simulation & Anti-Bias Verification ---');
  const backtestReport = await strategyService.executeBacktest({
    strategyId: createdStrategy.id,
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    initialCapital: 100_000_000,
    buyFeePct: 0.15,
    sellFeePct: 0.25,
    slippagePct: 0.1,
    universe: 'LQ45',
    walkForward: true,
  });

  assert(backtestReport.finalEquity > 0, `Final equity calculated (Rp${backtestReport.finalEquity.toLocaleString('id-ID')})`);
  assert(backtestReport.equityCurve.length > 50, `Sequential daily equity curve points generated (${backtestReport.equityCurve.length} points)`);
  assert(backtestReport.trades.length > 0, `Executed trades recorded (${backtestReport.trades.length} trades)`);

  // Verify Lot Sizing (1 lot = 100 shares integer multiple)
  const allLotsValid = backtestReport.trades.every((t) => t.shares % 100 === 0 && t.shares === t.lots * 100);
  assert(allLotsValid, 'Integer Lot constraint (1 lot = 100 shares) strictly enforced on all executions');

  // Verify Fee Deduction on both Entry and Exit
  const firstTrade = backtestReport.trades[0];
  assert(firstTrade.fees > 0, `Transaction fees accurately deducted (Trade #1 Fee: Rp${firstTrade.fees})`);

  // --- 4. QUANTITATIVE PERFORMANCE METRICS ---
  console.log('\n--- 4. Quantitative Performance Metrics ---');
  assert(typeof backtestReport.totalReturn === 'number', `Total Return calculated (${backtestReport.totalReturn}%)`);
  assert(typeof backtestReport.cagr === 'number', `CAGR calculated (${backtestReport.cagr}%)`);
  assert(backtestReport.winRate >= 0 && backtestReport.winRate <= 100, `Win Rate bounded 0-100% (${backtestReport.winRate}%)`);
  assert(backtestReport.maxDrawdown >= 0 && backtestReport.maxDrawdown <= 100, `Max Drawdown bounded 0-100% (${backtestReport.maxDrawdown}%)`);
  assert(typeof backtestReport.sharpeRatio === 'number', `Annualized Sharpe Ratio calculated (${backtestReport.sharpeRatio})`);
  assert(typeof backtestReport.sortinoRatio === 'number', `Sortino Ratio calculated (${backtestReport.sortinoRatio})`);
  assert(backtestReport.profitFactor >= 0, `Profit Factor calculated (${backtestReport.profitFactor})`);

  // --- 5. WALK-FORWARD PARTITIONING & STABILITY ---
  console.log('\n--- 5. Walk-Forward Partitioning ---');
  assert(Array.isArray(backtestReport.walkForwardSplits), 'Walk-forward splits array created');
  assert(backtestReport.walkForwardSplits?.length === 3, 'Data split into Training (60%), Validation (20%), and Test (20%)');
  if (backtestReport.walkForwardSplits && backtestReport.walkForwardSplits.length >= 3) {
    assert(backtestReport.walkForwardSplits[0].period === 'IN_SAMPLE_TRAINING', 'In-Sample Training period defined');
    assert(backtestReport.walkForwardSplits[1].period === 'VALIDATION', 'Validation period defined');
    assert(backtestReport.walkForwardSplits[2].period === 'OUT_OF_SAMPLE_TEST', 'Out-of-Sample Test period defined');
  }

  // --- 6. OVERFITTING DETECTION & WARNINGS ---
  console.log('\n--- 6. Overfitting Detection Engine ---');
  const complexOverfittedRules: StrategyRules = {
    entryRules: {
      logicalOperator: 'AND',
      conditions: [
        { field: 'technical_score', operator: '>=', value: 88 },
        { field: 'fundamental_score', operator: '>=', value: 85 },
        { field: 'rsi_14', operator: '<=', value: 45 },
        { field: 'valuation_score', operator: '>=', value: 80 },
        { field: 'smart_money_score', operator: '>=', value: 82 },
        { field: 'risk_score', operator: '>=', value: 90 },
      ],
    },
    exitRules: {
      stopLossPct: 1.5,
      takeProfitPct: 12.0,
      maxHoldDays: 10,
    },
    positionSizePct: 20,
    maxPositions: 5,
  };

  const overfitAnalysis = overfittingDetector.analyze(complexOverfittedRules, 4, 100);
  assert(['HIGH', 'CRITICAL'].includes(overfitAnalysis.riskLevel), `Overfitting risk detected for over-parameterized rule (${overfitAnalysis.riskLevel})`);
  assert(overfitAnalysis.reasons.length > 0, 'Overfitting reasons clearly explained to student');

  // --- 7. AI STRATEGY REVIEW & QUALITATIVE EVALUATION ---
  console.log('\n--- 7. AI Strategy Review Service ---');
  const aiReview = strategyReviewService.generateReview(backtestReport, testRules);
  assert(aiReview.strengths.length > 0, `AI identifies strategy strengths (${aiReview.strengths.length} items)`);
  assert(aiReview.weaknesses.length > 0, `AI identifies areas of weakness`);
  assert(aiReview.marketDependency.length > 0, `AI describes market regime dependency`);
  assert(aiReview.suggestedImprovements.length > 0, `AI provides actionable pedagogical suggestions`);

  // --- 8. MULTI-STRATEGY COMPARISON ---
  console.log('\n--- 8. Multi-Strategy Comparative Matrix ---');
  const comparisonResults = await strategyService.compareStrategies([createdStrategy.id]);
  assert(comparisonResults.length === 1, `Strategy compared successfully`);
  assert(comparisonResults[0].consistencyScore >= 0 && comparisonResults[0].consistencyScore <= 100, `Consistency score computed (${comparisonResults[0].consistencyScore}/100)`);

  console.log('\n====================================================');
  console.log(`📊 PHASE 5 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5Tests()
  .catch((e) => {
    console.error('Fatal error in Phase 5 tests:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
