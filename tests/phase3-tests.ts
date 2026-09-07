import { marketRegimeService } from '../src/modules/intelligence/advanced/regime/regime.service';
import { sectorService } from '../src/modules/intelligence/advanced/sector/sector.service';
import { relativeStrengthService } from '../src/modules/intelligence/advanced/relative-strength/relative-strength.service';
import { catalystService } from '../src/modules/intelligence/advanced/catalyst/catalyst.service';
import { anomalyService } from '../src/modules/intelligence/advanced/anomaly/anomaly.service';
import { scenarioService } from '../src/modules/intelligence/advanced/scenario/scenario.service';
import { debateService } from '../src/modules/intelligence/advanced/debate/debate.service';
import { tradingPlanService } from '../src/modules/intelligence/advanced/trading-plan/trading-plan.service';
import { portfolioHealthService } from '../src/modules/intelligence/advanced/portfolio-health/portfolio-health.service';
import { radarService } from '../src/modules/intelligence/advanced/radar/radar.service';
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

async function runPhase3Tests() {
  console.log('====================================================');
  console.log('🚀 RUNNING EDUTRADEX PHASE 3 ADVANCED AI TESTS');
  console.log('====================================================\n');

  // --- 1. MARKET REGIME ENGINE ---
  console.log('--- 1. Market Regime Engine ---');
  const regime = await marketRegimeService.getMarketRegime();
  assert(
    ['BULLISH', 'SIDEWAYS', 'BEARISH', 'HIGH_VOLATILITY'].includes(regime.regime),
    `Market regime classified as valid enum (got ${regime.regime})`
  );
  assert(regime.score >= 0 && regime.score <= 100, `Regime score within 0-100 (got ${regime.score})`);
  assert(regime.confidence >= 70, `Regime confidence >= 70% (got ${regime.confidence}%)`);
  assert(regime.breadth.advancers + regime.breadth.decliners + regime.breadth.unchanged > 0, `Market breadth tracked`);

  // --- 2. SECTOR ENGINE & HIERARCHY ---
  console.log('\n--- 2. Sector Engine & Hierarchy Drilldown ---');
  const sectorsOverview = await sectorService.getSectorsOverview();
  assert(sectorsOverview.sectors.length >= 8, `Sectors overview contains all BEI sectors (found ${sectorsOverview.sectors.length})`);
  assert(sectorsOverview.market.name.includes('IHSG'), `Market benchmark identified as IHSG`);
  assert(sectorsOverview.sectors[0].topStock.ticker !== '', `Top stock in leader sector identified`);

  // --- 3. RELATIVE STRENGTH ENGINE ---
  console.log('\n--- 3. Relative Strength Engine ---');
  const rs = await relativeStrengthService.getStockRelativeStrength('BBCA');
  assert(rs.score >= 0 && rs.score <= 100, `BBCA Relative Strength score within 0-100 (got ${rs.score})`);
  assert(
    ['LEADER', 'OUTPERFORMER', 'IN_LINE', 'LAGGARD'].includes(rs.classification),
    `Relative strength classification is valid (got ${rs.classification})`
  );

  // --- 4. CATALYST ENGINE & TIMELINE ---
  console.log('\n--- 4. Catalyst Engine & Calendar ---');
  const catalystTimeline = await catalystService.getCatalystsTimeline();
  assert(catalystTimeline.total > 0, `Catalysts loaded (total ${catalystTimeline.total})`);
  assert(catalystTimeline.today !== undefined && catalystTimeline.thisWeek !== undefined && catalystTimeline.next30Days !== undefined, `Timeline split into Today, This Week, and Next 30 Days`);
  const bbcaCatalysts = await catalystService.getCatalystsByTicker('BBCA');
  assert(bbcaCatalysts.length > 0, `BBCA catalysts retrieved by ticker`);

  // --- 5. ANOMALY DETECTION ENGINE ---
  console.log('\n--- 5. Anomaly Detection Engine ---');
  const anomalies = await anomalyService.getMarketAnomalies();
  assert(anomalies.length > 0, `Market anomalies scanned (found ${anomalies.length})`);
  assert(
    ['NORMAL', 'WATCH', 'WARNING', 'HIGH_ALERT'].includes(anomalies[0].severity),
    `Anomaly severity categorized properly (got ${anomalies[0].severity})`
  );

  // --- 6. SCENARIO ENGINE (100% PROBABILITY) ---
  console.log('\n--- 6. Scenario Engine (100% Probability Check) ---');
  const scenarios = await scenarioService.getStockScenarios('BBCA');
  assert(scenarios.probabilitySumCheck === 100, `Scenario probabilities strictly total 100% (got ${scenarios.probabilitySumCheck}%)`);
  assert(scenarios.scenarios.bull.probability > 0, `Bull case probability > 0`);
  assert(scenarios.scenarios.base.probability > 0, `Base case probability > 0`);
  assert(scenarios.scenarios.bear.probability > 0, `Bear case probability > 0`);
  assert(scenarios.expectedValuePrice > 0, `Expected value price calculated (got Rp${scenarios.expectedValuePrice.toLocaleString('id-ID')})`);
  assert(scenarios.scenarios.bull.invalidationCondition !== '', `Bull case has invalidation condition`);

  // --- 7. 3-AGENT AI DEBATE ---
  console.log('\n--- 7. 3-Agent AI Debate Chamber ---');
  const debate = await debateService.getStockDebate('BBCA');
  assert(debate.bullAnalyst.convictionScore >= 0 && debate.bullAnalyst.convictionScore <= 100, `Bull Analyst score within 0-100`);
  assert(debate.bearAnalyst.convictionScore >= 0 && debate.bearAnalyst.convictionScore <= 100, `Bear Analyst score within 0-100`);
  assert(debate.aiJudge.verdict.length > 0, `AI Judge synthesized balanced verdict`);
  assert(
    ['BULLISH_BIAS', 'BALANCED_NEUTRAL', 'BEARISH_BIAS'].includes(debate.aiJudge.netConviction),
    `AI Judge net conviction determined (${debate.aiJudge.netConviction})`
  );

  // --- 8. TRADING PLAN & POSITION SIZING ---
  console.log('\n--- 8. Educational Trading Plan & Position Sizing ---');
  const plan = await tradingPlanService.getTradingPlan('BBCA');
  assert(plan.stopLoss < plan.entryZone.min, `Stop loss is placed below entry zone (SL ${plan.stopLoss} < Entry ${plan.entryZone.min})`);
  assert(plan.tp1 < plan.tp2 && plan.tp2 < plan.tp3, `Target profits strictly ascending TP1 < TP2 < TP3`);
  assert(plan.riskRewardRatio > 0, `Risk/Reward ratio computed positive (got 1 : ${plan.riskRewardRatio})`);

  // Position Sizing with 2% risk on Rp100.000.000
  const sizing = tradingPlanService.calculatePositionSize({
    accountBalance: 100_000_000,
    currentPrice: 10_000,
    stopLossPrice: 9_400,
    riskPercentage: 2,
    tp1Price: 10_600,
    tp2Price: 11_200,
  });
  assert(sizing.maxRiskAmountIdr === 2_000_000, `Max risk amount is 2% = Rp2.000.000 (got ${sizing.maxRiskAmountIdr})`);
  assert(sizing.maxLotsAllowed > 0, `Max lots allowed calculated (got ${sizing.maxLotsAllowed} lots)`);
  assert(sizing.potentialLossIdr <= sizing.maxRiskAmountIdr, `Potential loss capped within max risk budget`);

  // --- 9. RADAR HUB DATA AGGREGATION ---
  console.log('\n--- 9. AI Radar Hub Aggregation ---');
  const radar = await radarService.getRadarHubData();
  assert(radar.topSetups.length > 0, `Top Setups stream loaded (${radar.topSetups.length} setups)`);
  assert(radar.breakoutWatch.length > 0, `Breakout Watch stream loaded (${radar.breakoutWatch.length} tickers)`);
  assert(radar.accumulation.length > 0, `Accumulation stream loaded (${radar.accumulation.length} tickers)`);
  assert(radar.anomalyWatch.length > 0, `Anomaly stream loaded (${radar.anomalyWatch.length} items)`);

  // --- 10. PORTFOLIO HEALTH & DIVERSIFICATION ---
  console.log('\n--- 10. Portfolio Health & Diversification ---');
  const student = await prisma.user.findFirst({ where: { role: 'student' } });
  if (student) {
    const health = await portfolioHealthService.getPortfolioHealth(student.id);
    assert(health.healthScore >= 0 && health.healthScore <= 100, `Portfolio Health Score within 0-100 (got ${health.healthScore})`);
    assert(health.diversificationScore >= 0 && health.diversificationScore <= 100, `Diversification score within 0-100`);
    assert(health.optimizationSuggestions.length > 0, `Optimization suggestions provided`);
  }

  console.log('\n====================================================');
  console.log(`🏁 PHASE 3 TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPhase3Tests().catch((e) => {
  console.error('Fatal error during Phase 3 test run:', e);
  process.exit(1);
});
