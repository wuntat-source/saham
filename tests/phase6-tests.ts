/**
 * EDU TRADE X V2 — PHASE 6 TEST SUITE
 * Classroom Intelligence, School Learning Platform, Segmentation, AI Evaluator, Learning Path & Governance
 */

import { StudentSegmenter } from '../src/modules/classroom/segmentation/student-segmenter';
import { CommonMistakesEngine } from '../src/modules/classroom/mistakes/common-mistakes.engine';
import { CategoryLeaderboardService } from '../src/modules/classroom/leaderboard/category-leaderboard.service';
import { AIAssignmentEvaluator } from '../src/modules/classroom/assignments/ai-evaluator.service';
import { LearningPathService, CURRICULUM_STAGES } from '../src/modules/classroom/path/learning-path.service';
import { AuditService } from '../src/modules/classroom/governance/audit.service';
import { ClassroomIntelligenceService } from '../src/modules/classroom/intelligence/classroom-intelligence.service';
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

async function runPhase6Tests() {
  console.log('\n=============================================================');
  console.log('--- STARTING PHASE 6 TEST SUITE (Classroom Intelligence) ---');
  console.log('=============================================================\n');

  // 1. STUDENT SEGMENTATION TESTS
  console.log('1. Testing Student Learning Segmentation Engine...');

  const beginner = StudentSegmenter.classify({ tradesCount: 1, journalsCount: 0, learningScore: 40, roi: 0, maxDrawdown: 0, stopLossCompliancePct: 50, avgHoldDurationDays: 1 });
  assert(beginner.segment === 'BEGINNER', 'Correctly classifies BEGINNER for low trade count');

  const overtrader = StudentSegmenter.classify({ tradesCount: 45, journalsCount: 5, learningScore: 50, roi: -5, maxDrawdown: 10, stopLossCompliancePct: 60, avgHoldDurationDays: 0.5 });
  assert(overtrader.segment === 'OVERTRADER', 'Correctly classifies OVERTRADER for high trade frequency & low journal count');

  const riskTaker = StudentSegmenter.classify({ tradesCount: 10, journalsCount: 5, learningScore: 50, roi: -25, maxDrawdown: 25, stopLossCompliancePct: 40, avgHoldDurationDays: 2 });
  assert(riskTaker.segment === 'RISK_TAKER', 'Correctly classifies RISK_TAKER for high drawdown & low stop loss compliance');

  const consistent = StudentSegmenter.classify({ tradesCount: 15, journalsCount: 14, learningScore: 85, roi: 5, maxDrawdown: 5, stopLossCompliancePct: 90, avgHoldDurationDays: 4 });
  assert(consistent.segment === 'CONSISTENT_LEARNER', 'Correctly classifies CONSISTENT_LEARNER for high journal compliance');

  const analyst = StudentSegmenter.classify({ tradesCount: 8, journalsCount: 8, learningScore: 80, roi: 8, maxDrawdown: 6, stopLossCompliancePct: 85, avgHoldDurationDays: 10 });
  assert(analyst.segment === 'ANALYST', 'Correctly classifies ANALYST for patient holding and high learning score');

  const conservative = StudentSegmenter.classify({ tradesCount: 5, journalsCount: 4, learningScore: 60, roi: 2, maxDrawdown: 3, stopLossCompliancePct: 95, avgHoldDurationDays: 8 });
  assert(conservative.segment === 'CONSERVATIVE', 'Correctly classifies CONSERVATIVE for low drawdown & low trade frequency');

  const trader = StudentSegmenter.classify({ tradesCount: 16, journalsCount: 8, learningScore: 65, roi: 12, maxDrawdown: 8, stopLossCompliancePct: 75, avgHoldDurationDays: 1.5 });
  assert(trader.segment === 'TRADER', 'Correctly classifies TRADER for short holding & positive momentum');

  // 2. COMMON MISTAKES ENGINE TESTS
  console.log('\n2. Testing Common Learning Mistakes Detection Engine...');

  const sampleClass = [
    { studentId: 's1', studentName: 'Budi', tradesCount: 10, journalsCount: 1, maxDrawdown: 5, stopLossCompliancePct: 80, maxSinglePositionPct: 20, regimeMismatchesCount: 0 },
    { studentId: 's2', studentName: 'Siti', tradesCount: 12, journalsCount: 2, maxDrawdown: 22, stopLossCompliancePct: 45, maxSinglePositionPct: 45, regimeMismatchesCount: 2 },
    { studentId: 's3', studentName: 'Agus', tradesCount: 8, journalsCount: 2, maxDrawdown: 25, stopLossCompliancePct: 50, maxSinglePositionPct: 50, regimeMismatchesCount: 3 },
  ];

  const mistakes = CommonMistakesEngine.detectCommonMistakes(sampleClass);
  assert(mistakes.length >= 3, 'Detects multiple classroom-level learning mistakes');

  const noThesisMistake = mistakes.find(m => m.id === 'MISTAKE_NO_THESIS');
  assert(!!noThesisMistake && noThesisMistake.affectedStudentCount === 3, 'Accurately flags lack of pre-trade thesis');

  const stopLossMistake = mistakes.find(m => m.id === 'MISTAKE_NO_STOP_LOSS');
  assert(!!stopLossMistake && stopLossMistake.affectedStudentCount === 2, 'Accurately flags poor stop loss compliance');

  const concentrationMistake = mistakes.find(m => m.id === 'MISTAKE_OVERCONCENTRATION');
  assert(!!concentrationMistake && concentrationMistake.affectedStudentCount === 2, 'Accurately flags single-position overconcentration');

  // 3. SEMANTIC AI ASSIGNMENT EVALUATOR TESTS
  console.log('\n3. Testing Semantic AI Assignment Grader...');

  const highQualitySubmission = `
    Analisis Fundamental dan Valuasi BBCA (PT Bank Central Asia Tbk)
    Berdasarkan laporan keuangan Q3 2025, BBCA membukukan ROE sebesar 22.4% dengan NIM stabil di level 5.6%.
    Rasio NPL gross sangat sehat di 1.8% dengan coverage ratio mencapai 280%.
    Dari sisi valuasi, PBV saat ini berada di level 4.2x (sedikit di atas rata-rata historis 5 tahun), namun justified oleh pertumbuhan laba bersih 14% YoY.
    Analisis Risiko: Risiko penurunan suku bunga BI yang dapat menekan NIM serta perlambatan kredit UMKM.
    Saran Stop Loss: Rp9.400 dengan invalidation level di bawah MA50. Target price Rp11.200 (Risk/Reward 1:2.5).
  `;

  const evalHigh = AIAssignmentEvaluator.evaluateSubmission({
    assignmentPrompt: 'Lakukan analisis komprehensif saham perbankan meliputi fundamental, valuasi, risiko, dan money management.',
    submissionContent: highQualitySubmission,
  });

  assert(evalHigh.score >= 75, `High quality submission receives high score (Got: ${evalHigh.score})`);
  assert(evalHigh.researchQuality >= 70, `High research quality detected (Got: ${evalHigh.researchQuality})`);
  assert(evalHigh.riskAwareness >= 70, `Risk awareness and stop loss recognized (Got: ${evalHigh.riskAwareness})`);
  assert(evalHigh.strengths.length >= 2, 'Generated structured pedagogical strengths');
  assert(typeof evalHigh.improvement === 'string', 'Generated actionable teacher improvement guidance');

  const weakSubmission = 'Beli BBCA karena harganya mau naik besok. Sahamnya bagus.';
  const evalWeak = AIAssignmentEvaluator.evaluateSubmission({
    assignmentPrompt: 'Lakukan analisis komprehensif saham perbankan meliputi fundamental, valuasi, risiko, dan money management.',
    submissionContent: weakSubmission,
  });

  assert(evalWeak.score < 50, `Weak submission receives low score (Got: ${evalWeak.score})`);
  assert(evalWeak.weaknesses.length >= 2, 'Identified clear analytical gaps in weak submission');

  // 4. 7-STAGE PROGRESSIVE LEARNING PATH TESTS
  console.log('\n4. Testing 7-Stage Progressive Learning Path Service...');

  assert(CURRICULUM_STAGES.length === 7, 'Curriculum consists of 7 comprehensive stages');

  const beginnerProgress = LearningPathService.getProgress(100);
  assert(beginnerProgress[0].unlocked === true, 'Stage 1 (Market Basics) unlocked by default for beginners');
  assert(beginnerProgress[1].unlocked === false, 'Stage 2 (Fundamental) locked for XP < 150');

  const intermediateProgress = LearningPathService.getProgress(950);
  assert(intermediateProgress[0].completed === true, 'Stage 1 completed');
  assert(intermediateProgress[4].unlocked === true, 'Stage 5 (Macro Regime) unlocked with 950 XP');
  assert(intermediateProgress[5].unlocked === false, 'Stage 6 (Risk Management) locked with 950 XP');

  const activeStage = LearningPathService.getCurrentActiveStage(950);
  assert(activeStage.level === 5, 'Correctly identifies active current learning stage (Stage 5)');

  // 5. AUDIT LOGGING & AI GOVERNANCE TESTS
  console.log('\n5. Testing Audit Logging & AI Governance Telemetry...');

  const auditRes = await AuditService.logAction({
    action: 'TEST_ACTION',
    entity: 'UnitTest',
    entityId: 'test-123',
    newValue: JSON.stringify({ status: 'ok' }),
  });
  assert(auditRes !== null, 'Successfully created audit log entry in database');

  const aiLogRes = await AuditService.logAIOperation({
    engineType: 'ASSIGNMENT_EVAL',
    promptVersion: 'v2.1',
    modelVersion: 'gemini-2.5-flash',
    inputTokens: 150,
    outputTokens: 200,
    latencyMs: 340,
  });
  assert(aiLogRes !== null, 'Successfully created AI governance telemetry log');

  const telemetry = await AuditService.getAITelemetry();
  assert(telemetry.totalCalls >= 1, 'Aggregated total AI calls correctly');
  assert(telemetry.totalTokens >= 350, 'Aggregated total token consumption');
  assert(typeof telemetry.avgLatencyMs === 'number', 'Calculated average inference latency');

  // 6. MULTI-CATEGORY LEADERBOARD SERVICE TESTS
  console.log('\n6. Testing Multi-Category Leaderboard Engine...');

  const leaderboards = await CategoryLeaderboardService.getMultiCategoryLeaderboards();
  assert(leaderboards.length === 6, 'Generated all 6 pedagogical ranking categories');
  assert(leaderboards.some(l => l.category === 'OVERALL_CHAMPION'), 'Contains Overall Champion leaderboard');
  assert(leaderboards.some(l => l.category === 'BEST_ANALYST'), 'Contains Best Analyst leaderboard');
  assert(leaderboards.some(l => l.category === 'BEST_RISK_MANAGER'), 'Contains Best Risk Manager leaderboard');
  assert(leaderboards.some(l => l.category === 'BEST_LEARNER'), 'Contains Best Learner leaderboard');
  assert(leaderboards.some(l => l.category === 'MOST_CONSISTENT'), 'Contains Most Consistent leaderboard');
  assert(leaderboards.some(l => l.category === 'BEST_RESEARCHER'), 'Contains Best Researcher leaderboard');

  // 7. CSV REPORT GENERATION TESTS
  console.log('\n7. Testing CSV Export Generator...');

  const mockStudents: any[] = [
    {
      studentId: 's1',
      studentName: 'Budi Santoso',
      email: 'budi@school.edu',
      segment: { segment: 'ANALYST' },
      learningScore: 88,
      skills: { fundamental: 90, technical: 85, valuation: 80, riskManagement: 85, discipline: 95 },
      wallet: { roi: 12.5 },
      riskMetrics: { maxDrawdown: 4.2, tradesCount: 15 },
      journalMetrics: { complianceRate: 93 },
    },
  ];

  const csv = ClassroomIntelligenceService.generateCSVReport(mockStudents);
  assert(csv.includes('Student Name,Email,Segment'), 'CSV contains correct header row');
  assert(csv.includes('"Budi Santoso","budi@school.edu","ANALYST",88'), 'CSV contains student record');

  console.log('\n=============================================================');
  console.log(`PHASE 6 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase6Tests()
  .catch((e) => {
    console.error('Fatal error running Phase 6 tests:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
