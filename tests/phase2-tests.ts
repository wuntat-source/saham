import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateATR,
  calculateStochastic,
  calculateADX,
  calculateOBV,
  OHLCV,
} from '../src/modules/intelligence/technical/indicators';
import { fundamentalService } from '../src/modules/intelligence/fundamental/fundamental.service';
import { technicalService } from '../src/modules/intelligence/technical/technical.service';
import { valuationService } from '../src/modules/intelligence/valuation/valuation.service';
import { smartMoneyService } from '../src/modules/intelligence/smart-money/smart-money.service';
import { sentimentService } from '../src/modules/intelligence/sentiment/sentiment.service';
import { riskService } from '../src/modules/intelligence/risk/risk.service';
import { scoringService, DEFAULT_WEIGHTS } from '../src/modules/intelligence/scoring/scoring.service';
import { screenerService } from '../src/modules/intelligence/screener/screener.service';
import { explanationService } from '../src/modules/intelligence/explanation/explanation.service';
import { tradingService } from '../src/modules/trading/services/trading.service';
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

async function runPhase2Tests() {
  console.log('====================================================');
  console.log('🚀 RUNNING EDUTRADEX PHASE 2 AI INTELLIGENCE TESTS');
  console.log('====================================================\n');

  // --- 1. TECHNICAL INDICATORS TEST ---
  console.log('--- 1. Technical Math Indicators ---');
  const testPrices = [100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122, 124, 126, 128, 130];
  const sma5 = calculateSMA(testPrices, 5);
  assert(sma5 === 126, `calculateSMA(5) equals 126 (got ${sma5})`);

  const ema5 = calculateEMA(testPrices, 5);
  assert(ema5 !== null && ema5 > 120, `calculateEMA(5) computed properly (got ${ema5})`);

  const rsi = calculateRSI(testPrices, 14);
  assert(rsi !== null && rsi > 70, `calculateRSI on monotonic rise is overbought > 70 (got ${rsi})`);

  const sampleCandles: OHLCV[] = Array.from({ length: 40 }, (_, i) => ({
    date: `2024-01-${(i + 1).toString().padStart(2, '0')}`,
    open: 1000 + i * 10,
    high: 1020 + i * 10,
    low: 990 + i * 10,
    close: 1015 + i * 10,
    volume: 1_000_000 + i * 50_000,
  }));

  const macd = calculateMACD(sampleCandles.map((c) => c.close));
  assert(macd.line !== null && macd.signal !== null, `calculateMACD returns line and signal`);

  const bb = calculateBollingerBands(sampleCandles.map((c) => c.close), 20, 2);
  assert(
    bb.upper !== null && bb.middle !== null && bb.lower !== null && bb.upper > bb.middle && bb.middle > bb.lower,
    `calculateBollingerBands returns valid upper > middle > lower bands`
  );

  const atr = calculateATR(sampleCandles, 14);
  assert(atr !== null && atr > 0, `calculateATR returns positive range`);

  const stochastic = calculateStochastic(sampleCandles, 14, 3);
  assert(stochastic.k !== null && stochastic.k >= 0 && stochastic.k <= 100, `calculateStochastic %K between 0-100`);

  const obv = calculateOBV(sampleCandles);
  assert(obv > 0, `calculateOBV positive on rising volume`);

  // --- 2. FUNDAMENTAL ENGINE TEST ---
  console.log('\n--- 2. Fundamental Engine & Missing Data ---');
  const fFull = fundamentalService.evaluate({
    revenue: 100_000_000_000_000,
    revenueGrowth: 12.0,
    netProfit: 50_000_000_000_000,
    roe: 22.0,
    operatingCashFlow: 55_000_000_000_000,
    debtToEquity: 0.15,
  });
  assert(fFull.score >= 80, `Strong fundamental metrics produce high score >= 80 (got ${fFull.score})`);
  assert(fFull.confidence >= 80, `Full fundamental data yields high confidence >= 80 (got ${fFull.confidence})`);

  const fMissing = fundamentalService.evaluate({
    revenue: 100_000_000_000_000,
    netProfit: null,
    roe: null,
  });
  assert(fMissing.missingFields.length > 0, `Missing fields are tracked explicitly without crashing`);
  assert(fMissing.confidence < fFull.confidence, `Missing data decreases confidence score`);

  // --- 3. VALUATION ENGINE TEST ---
  console.log('\n--- 3. Valuation Engine & Sector Benchmarking ---');
  const vUndervalued = valuationService.evaluate({
    pe: 8.0,
    pbv: 1.1,
    dividendYield: 7.5,
    fcfYield: 10.0,
    sectorAvgPe: 15.0,
    sectorAvgPbv: 2.0,
  });
  assert(vUndervalued.status === 'UNDERVALUED', `Low P/E vs sector is classified as UNDERVALUED (got ${vUndervalued.status})`);
  assert(vUndervalued.score >= 75, `Undervalued stock gets high valuation score >= 75 (got ${vUndervalued.score})`);

  const vOvervalued = valuationService.evaluate({
    pe: 45.0,
    pbv: 6.5,
    dividendYield: 0.5,
    sectorAvgPe: 15.0,
    sectorAvgPbv: 2.0,
  });
  assert(vOvervalued.status === 'OVERVALUED', `High P/E vs sector is classified as OVERVALUED (got ${vOvervalued.status})`);
  assert(vOvervalued.score <= 45, `Overvalued stock receives lower valuation score <= 45 (got ${vOvervalued.score})`);

  // --- 4. SMART MONEY & SENTIMENT & RISK ENGINES ---
  console.log('\n--- 4. Smart Money, Sentiment & Risk Engines ---');
  const smAccum = smartMoneyService.evaluate({
    dataAvailable: true,
    foreignNetFlow1D: 50_000_000_000,
    foreignNetFlow5D: 250_000_000_000,
    foreignNetFlow20D: 800_000_000_000,
    topBrokerConcentration: 70,
  });
  assert(smAccum.status === 'ACCUMULATION', `Large foreign inflows categorized as ACCUMULATION`);
  assert(smAccum.score >= 80, `Accumulation flow receives high score >= 80`);

  const smMissing = smartMoneyService.evaluate({ dataAvailable: false });
  assert(smMissing.status === 'DATA NOT AVAILABLE', `Missing flow data returns DATA NOT AVAILABLE`);

  const sent = sentimentService.evaluate([
    { id: '1', headline: 'Laba Rekor', summary: 'Kinerja prima', source: 'Bisnis', publishedAt: new Date().toISOString(), sentiment: 'positive', score: 90 },
  ]);
  assert(sent.sentimentLabel === 'BULLISH', `Positive headlines return BULLISH label`);

  const r = riskService.evaluate({ volatility30D: 12.0, maxDrawdown1Y: 8.0, liquidityDailyTurnover: 300_000_000_000, debtToEquity: 0.2 });
  assert(r.riskLevel === 'LOW', `Low volatility and deep liquidity classified as LOW risk (got ${r.riskLevel})`);

  // --- 5. OVERALL SCORING & WEIGHTS TEST ---
  console.log('\n--- 5. Overall Scoring & Weight Integrity ---');
  const weights = scoringService.getWeights();
  const sumWeights =
    weights.fundamental +
    weights.technical +
    weights.valuation +
    weights.smartMoney +
    weights.sentiment +
    weights.risk +
    weights.dataQuality +
    weights.marketRegime;
  assert(Math.abs(sumWeights - 1.0) < 0.0001, `Scoring weights sum precisely to 100% (got ${sumWeights * 100}%)`);

  const overview = await screenerService.getStockIntelligence('BBCA');
  assert(overview.overallScore >= 0 && overview.overallScore <= 100, `BBCA overall score clamped in 0-100 (got ${overview.overallScore})`);
  assert(overview.confidenceScore >= 0 && overview.confidenceScore <= 100, `BBCA confidence clamped in 0-100 (got ${overview.confidenceScore})`);
  assert(overview.strongestPillar !== undefined, `Strongest pillar identified: ${overview.strongestPillar}`);

  // --- 6. SCREENER & TOP 10 RANKINGS TEST ---
  console.log('\n--- 6. Screener & Top 10 Generator ---');
  const top10 = await screenerService.getTop10();
  assert(top10.length === 10, `getTop10() returns exactly 10 stocks (got ${top10.length})`);
  assert(top10[0].rank === 1 && top10[0].overallScore >= top10[1].overallScore, `Top 10 is strictly ordered by score`);

  const screenerResult = await screenerService.screenStocks({ sector: 'Financials', minScore: 50 });
  assert(screenerResult.items.length > 0, `Screener filters by sector correctly (found ${screenerResult.items.length} financials)`);
  assert(screenerResult.items.every((i) => i.sector === 'Financials'), `All filtered items match requested sector`);

  // --- 7. EXPLAINABLE AI ENGINE TEST ---
  console.log('\n--- 7. Explainable AI Pipeline (DATA -> CALCULATION -> INTERPRETATION) ---');
  const explanation = await screenerService.explainScore('BBCA', 'fundamental');
  assert(explanation.evidence.length > 0, `Explanation includes deterministic evidence data points`);
  assert(explanation.calculation.length > 0, `Explanation describes calculation formula`);
  assert(explanation.interpretation.length > 0, `Explanation provides qualitative strategic takeaway`);
  assert(explanation.riskFactors.length > 0, `Explanation identifies relevant risk factors`);

  // --- 8. PHASE 1 REGRESSION TEST ---
  console.log('\n--- 8. Phase 1 Trading Engine Compatibility ---');
  const student = await prisma.user.findFirst({ where: { role: 'student' } });
  if (student) {
    const quote = await prisma.wallet.findUnique({ where: { user_id: student.id } });
    assert(quote !== null, `Student wallet is accessible without schema conflict`);
  }

  console.log('\n====================================================');
  console.log(`🏁 TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPhase2Tests().catch((e) => {
  console.error('Fatal error during test run:', e);
  process.exit(1);
});
