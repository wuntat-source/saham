/**
 * EDU TRADE X V2 — AI INVESTMENT LENS TEST SUITE
 * 6 Investment Methodologies, Common Data Layer, Scenarios, 5-Year Return Model, Consensus & Disagreements
 */

import { CommonDataEngine } from '../src/modules/investment-lens/data/common-data-engine';
import { InstitutionalLensEngine } from '../src/modules/investment-lens/lenses/institutional-lens.engine';
import { LongTermQualityLensEngine } from '../src/modules/investment-lens/lenses/long-term-quality-lens.engine';
import { FundamentalGrowthLensEngine } from '../src/modules/investment-lens/lenses/fundamental-growth-lens.engine';
import { MacroCatalystLensEngine } from '../src/modules/investment-lens/lenses/macro-catalyst-lens.engine';
import { EarningsExpectationsLensEngine } from '../src/modules/investment-lens/lenses/earnings-expectations-lens.engine';
import { QualityCompounderLensEngine } from '../src/modules/investment-lens/lenses/quality-compounder-lens.engine';
import { ConsensusLensEngine } from '../src/modules/investment-lens/consensus/consensus-lens.engine';
import { LENS_REGISTRY, getLensMetadata } from '../src/modules/investment-lens/metadata/lens-registry';
import { prisma } from '../src/lib/prisma';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    failed++;
  }
}

async function runInvestmentLensTests() {
  console.log('\n=============================================================');
  console.log('--- STARTING AI INVESTMENT LENS TEST SUITE ---');
  console.log('=============================================================\n');

  // 1. REGISTRY & METADATA TESTS
  console.log('1. Testing Lens Metadata Registry...');
  assert(LENS_REGISTRY.length === 6, 'Contains exactly 6 distinct investment methodologies');
  assert(getLensMetadata('institutional')?.name === 'Institutional / Risk-Adjusted', 'Retrieves institutional metadata by slug');
  assert(getLensMetadata('LONG_TERM_QUALITY')?.slug === 'long-term', 'Retrieves long-term metadata by type');
  assert(Boolean(getLensMetadata('growth')?.primaryFocus.includes('Earnings Acceleration')), 'Metadata contains primary focus');

  // 2. COMMON DATA ENGINE TESTS
  console.log('\n2. Testing Common Validated Data Engine...');
  const data = await CommonDataEngine.getNormalizedData('BBCA');
  assert(data.ticker === 'BBCA', 'Normalizes stock ticker to BBCA');
  assert(data.roe > 0, `Normalized ROE exists (Got: ${data.roe}%)`);
  assert(data.roic > 0, `Normalized ROIC exists (Got: ${data.roic.toFixed(1)}%)`);
  assert(data.dcfFairValue > 0, `Calculated DCF fair value (Got: Rp${data.dcfFairValue})`);
  assert(data.dataQuality === 'HIGH' || data.dataQuality === 'MEDIUM', `Valid data quality status (${data.dataQuality})`);
  assert(typeof data.marketRegime === 'string', `Identified market regime: ${data.marketRegime}`);

  // 3. LENS 1: INSTITUTIONAL / RISK-ADJUSTED TESTS
  console.log('\n3. Testing Lens 1 (Institutional / Risk-Adjusted)...');
  const inst = InstitutionalLensEngine.analyze(data);
  assert(inst.score >= 0 && inst.score <= 100, `Institutional score bounded 0-100 (Got: ${inst.score})`);
  assert(inst.confidence >= 50 && inst.confidence <= 100, `Confidence score bounded (Got: ${inst.confidence}%)`);
  assert(inst.pillarScores.businessQuality > 0, `Calculates business quality (${inst.pillarScores.businessQuality})`);
  assert(inst.pillarScores.riskScore > 0, `Calculates downside risk score (${inst.pillarScores.riskScore})`);
  assert(inst.scenarios.length === 3, 'Generates Bull, Base, and Bear scenarios');
  assert(inst.scenarios.some(s => s.name === 'Bull Case'), 'Contains Bull Case scenario');
  assert(inst.scenarios.some(s => s.name === 'Bear Case'), 'Contains Bear Case scenario');
  assert(inst.transparency.length >= 2, 'Provides transparent Fact vs Calculation vs AI Opinion breakdown');
  assert(!!inst.educationalGuide.whatDoesThisMean, 'Includes Student Educational Guide (What does this mean)');

  // 4. LENS 2: LONG-TERM QUALITY & VALUATION TESTS
  console.log('\n4. Testing Lens 2 (Long-Term Quality & Valuation)...');
  const longTerm = LongTermQualityLensEngine.analyze(data);
  assert(longTerm.score >= 0 && longTerm.score <= 100, `Long-term quality score bounded (Got: ${longTerm.score})`);
  assert(['UNDERVALUED', 'FAIRLY VALUED', 'OVERVALUED'].includes(longTerm.valuationStatus), `Valid valuation status (${longTerm.valuationStatus})`);
  assert(longTerm.pillarScores.compoundingPotential > 0, `Compounding potential computed (${longTerm.pillarScores.compoundingPotential})`);
  assert(typeof longTerm.estimatedAnnualizedReturn === 'number', `Annualized 5-10Y return computed (${longTerm.estimatedAnnualizedReturn}%)`);
  assert(longTerm.metrics.economicMoatWidth === 'WIDE' || longTerm.metrics.economicMoatWidth === 'NARROW', 'Classifies economic moat width');

  // 5. LENS 3: FUNDAMENTAL GROWTH TESTS
  console.log('\n5. Testing Lens 3 (Fundamental Growth)...');
  const growth = FundamentalGrowthLensEngine.analyze(data);
  assert(growth.score >= 0 && growth.score <= 100, `Growth score bounded (Got: ${growth.score})`);
  assert(
    ['GROWTH AT REASONABLE PRICE (GARP)', 'EXPENSIVE GROWTH', 'VALUE TRAP', 'QUALITY GROWTH'].includes(growth.classification),
    `Valid growth classification (${growth.classification})`
  );
  assert(growth.fivePointThesis.length === 5, 'Produces a structured 5-point investment thesis');
  assert(growth.growthVsExpectations.actualRevenueGrowth !== undefined, 'Compares actual growth vs expectations');

  // 6. LENS 4: MACRO + FUNDAMENTAL + CATALYST TESTS
  console.log('\n6. Testing Lens 4 (Macro + Fundamental + Catalyst)...');
  const macro = MacroCatalystLensEngine.analyze(data);
  assert(macro.score >= 0 && macro.score <= 100, `Macro score bounded (Got: ${macro.score})`);
  assert(macro.dominantMacroVariables.length >= 2, 'Identified dominant macro variables');
  assert(macro.sensitivities.length >= 3, 'Executed sensitivity shocks (Revenue, Margin, Rates)');
  assert(macro.sensitivities.some(s => s.variable.includes('Margin')), 'Includes margin sensitivity test');
  assert(macro.catalystsNext3To12Months.length >= 2, 'Mapped upcoming 3-12 month catalytic events');

  // 7. LENS 5: EARNINGS & MARKET EXPECTATIONS TESTS
  console.log('\n7. Testing Lens 5 (Earnings & Market Expectations)...');
  const earnings = EarningsExpectationsLensEngine.analyze(data);
  assert(earnings.score >= 0 && earnings.score <= 100, `Earnings expectations score bounded (Got: ${earnings.score})`);
  assert(
    ['POSITIVE SURPRISE', 'NEGATIVE SURPRISE', 'IN-LINE', 'EXPECTATION RISK'].includes(earnings.expectationClassification),
    `Valid expectation classification (${earnings.expectationClassification})`
  );
  assert(earnings.scenarios.length === 3, 'Models BEAT, IN-LINE, and MISS probabilistic outcomes');
  assert(earnings.scenarios.some(s => s.outcome === 'BEAT'), 'Includes BEAT scenario with sentiment response');

  // 8. LENS 6: QUALITY COMPOUNDER & 5-YEAR RETURN MODEL TESTS
  console.log('\n8. Testing Lens 6 (Quality Compounder & 5-Year Return Model)...');
  const compounder = QualityCompounderLensEngine.analyze(data);
  assert(compounder.score >= 0 && compounder.score <= 100, `Compounder score bounded (Got: ${compounder.score})`);
  assert(
    ['POTENTIAL COMPOUNDER', 'CYCLICAL', 'VALUE TRAP', 'MATURE BUSINESS'].includes(compounder.compounderClassification),
    `Valid compounder classification (${compounder.compounderClassification})`
  );
  assert(compounder.fiveYearReturnModel.fundamentalReturnPctAnnualized > 0, 'Decomposes fundamental earnings return');
  assert(compounder.fiveYearReturnModel.dividendReturnPctAnnualized >= 0, 'Decomposes dividend return');
  assert(compounder.fiveYearReturnModel.totalEstimatedShareholderReturnAnnualized > 0, `Computes total estimated 5Y shareholder return (${compounder.fiveYearReturnModel.totalEstimatedShareholderReturnAnnualized}% / yr)`);

  // 9. CONSENSUS & DISAGREEMENT ENGINE TESTS
  console.log('\n9. Testing Consensus Lens & Disagreement Detector Engine...');
  const evaluation = await ConsensusLensEngine.evaluateStock('BBCA');
  const consensus = evaluation.consensus;

  assert(consensus.consensusScore >= 0 && consensus.consensusScore <= 100, `Consensus score bounded (Got: ${consensus.consensusScore})`);
  assert(consensus.scores.length === 6, 'Contains scores from all 6 methodologies');
  assert(!!consensus.strongestLens, `Identified strongest lens: ${consensus.strongestLens.name}`);
  assert(!!consensus.weakestLens, `Identified weakest lens: ${consensus.weakestLens.name}`);
  assert(consensus.executiveSummary.businessQuality !== undefined, 'Generated Executive Summary Matrix');
  assert(consensus.investmentThesis.whyAttractive.length >= 2, 'Formulated Why Attractive thesis points');
  assert(consensus.investmentThesis.whatCouldInvalidateThesis.length >= 2, 'Formulated Invalidation Criteria');
  assert(consensus.investmentThesis.whatInvestorsShouldMonitor.length >= 2, 'Formulated Key Monitoring Indicators');
  assert(consensus.disclaimer.includes('DISCLAIMER'), 'Includes educational non-financial-advice disclaimer');

  // 10. DATABASE PERSISTENCE VERIFICATION
  console.log('\n10. Testing Database Persistence of Lens Scores...');
  const cachedScores = await prisma.investmentLensScore.findMany({
    where: { ticker: 'BBCA' },
  });
  assert(cachedScores.length === 6, `Persisted all 6 lens scores to database (Found: ${cachedScores.length})`);

  console.log('\n=============================================================');
  console.log(`AI INVESTMENT LENS TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runInvestmentLensTests()
  .catch((e) => {
    console.error('Fatal error running AI Investment Lens tests:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
