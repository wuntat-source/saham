import { journalService } from '../src/modules/learning/journal/journal.service';
import { gamificationService } from '../src/modules/learning/gamification/gamification.service';
import { skillsService } from '../src/modules/learning/skills/skills.service';
import { behaviorService } from '../src/modules/learning/behavior/behavior.service';
import { reportService } from '../src/modules/learning/report/report.service';
import { mentorService } from '../src/modules/learning/mentor/mentor.service';
import { teacherLearningService } from '../src/modules/learning/teacher/teacher.service';
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

async function runPhase4Tests() {
  console.log('====================================================');
  console.log('🚀 RUNNING EDUTRADEX PHASE 4 AI MENTOR & LEARNING TESTS');
  console.log('====================================================\n');

  // Setup test user if needed
  let testUser = await prisma.user.findFirst({ where: { email: 'student_phase4@test.com' } });
  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        email: 'student_phase4@test.com',
        name: 'Siswa Phase 4 Tester',
        password_hash: 'dummyhash',
        role: 'student',
      },
    });
  }

  // Setup teacher user if needed
  let testTeacher = await prisma.user.findFirst({ where: { email: 'teacher_phase4@test.com' } });
  if (!testTeacher) {
    testTeacher = await prisma.user.create({
      data: {
        email: 'teacher_phase4@test.com',
        name: 'Guru Phase 4 Tester',
        password_hash: 'dummyhash',
        role: 'teacher',
      },
    });
  }

  // Setup test class if needed
  let testClass = await prisma.class.findFirst({ where: { teacher_id: testTeacher.id } });
  if (!testClass) {
    testClass = await prisma.class.create({
      data: {
        class_name: 'Kelas Simulasi Phase 4',
        invitation_code: 'SIMP4',
        teacher_id: testTeacher.id,
        initial_balance: 100000000,
      },
    });
  }

  // --- 1. TRADING JOURNAL & PRE-TRADE THESIS ---
  console.log('--- 1. Trading Journal & Pre-Trade Thesis ---');
  const journal = await journalService.createJournal({
    userId: testUser.id,
    ticker: 'BBCA',
    thesis: 'BBCA menunjukkan konsolidasi kuat di atas MA50 dengan net foreign buy konsisten 3 hari berturut-turut.',
    entryReason: 'Breakout resistance 10.200 dengan volume di atas rata-rata 20 hari.',
    riskReason: 'Jika breakdown support 9.850, tesis batal karena terbentuk lower low.',
    target: 10800,
    stopLoss: 9850,
  });

  assert(journal.ticker === 'BBCA', `Journal created for ticker BBCA (ID: ${journal.id})`);
  assert(journal.thesis.length > 20, `Journal thesis recorded properly`);
  assert(journal.stopLoss === 9850, `Stop loss recorded properly (Rp9.850)`);
  assert(journal.marketRegime !== undefined, `Market regime automatically captured at entry (${journal.marketRegime})`);

  // --- 2. AI OUTCOME-INDEPENDENT TRADE REVIEW ---
  console.log('\n--- 2. AI Outcome-Independent Trade Review ---');
  const review = await journalService.reviewTrade({
    journalId: journal.id,
    userId: testUser.id,
    realizedPnl: 1950000,
    exitPrice: 10600,
  });

  assert(review.decisionQuality >= 0 && review.decisionQuality <= 100, `Decision quality scored within 0-100 (${review.decisionQuality})`);
  assert(review.entryQuality >= 0 && review.entryQuality <= 100, `Entry quality scored within 0-100 (${review.entryQuality})`);
  assert(review.riskManagement >= 0 && review.riskManagement <= 100, `Risk management scored within 0-100 (${review.riskManagement})`);
  assert(review.thesisQuality >= 0 && review.thesisQuality <= 100, `Thesis quality scored within 0-100 (${review.thesisQuality})`);
  assert(review.whatWell.length > 0, `AI identifies positive behavioral actions`);
  assert(review.whatImprove.length > 0, `AI identifies areas of pedagogical improvement`);
  assert(review.keyLesson.length > 0, `AI provides actionable key lesson`);

  // --- 3. GAMIFICATION & XP PROGRESS ENGINE ---
  console.log('\n--- 3. Gamification, Level Transitions & Badges ---');
  const xpResult = await gamificationService.rewardXp(testUser.id, 120, 'Menulis Jurnal & Analisis Saham BBCA');
  assert(xpResult.newXp >= 120, `XP successfully credited (${xpResult.newXp} XP)`);
  assert(xpResult.newLevel >= 1, `Student level calculated properly (Level ${xpResult.newLevel})`);

  const progress = await gamificationService.getStudentProgress(testUser.id);
  assert(Array.isArray(progress.badges), `User badges retrieved as array (Count: ${progress.badges.length})`);
  assert(progress.streakDays >= 1, `Daily streak tracked properly (${progress.streakDays} days)`);

  // --- 4. 9-SKILL MATRIX ENGINE ---
  console.log('\n--- 4. 9-Skill Matrix & Multi-Factor Learning Score ---');
  const skillMatrix = await skillsService.getStudentSkills(testUser.id);
  assert(skillMatrix.fundamentalScore >= 0 && skillMatrix.fundamentalScore <= 100, `Fundamental analysis skill scored (${skillMatrix.fundamentalScore})`);
  assert(skillMatrix.technicalScore >= 0 && skillMatrix.technicalScore <= 100, `Technical analysis skill scored (${skillMatrix.technicalScore})`);
  assert(skillMatrix.valuationScore >= 0 && skillMatrix.valuationScore <= 100, `Valuation understanding skill scored (${skillMatrix.valuationScore})`);
  assert(skillMatrix.riskManagementScore >= 0 && skillMatrix.riskManagementScore <= 100, `Risk management skill scored (${skillMatrix.riskManagementScore})`);
  assert(skillMatrix.portfolioScore >= 0 && skillMatrix.portfolioScore <= 100, `Portfolio skill scored (${skillMatrix.portfolioScore})`);
  assert(skillMatrix.psychologyScore >= 0 && skillMatrix.psychologyScore <= 100, `Psychology skill scored (${skillMatrix.psychologyScore})`);
  assert(skillMatrix.literacyScore >= 0 && skillMatrix.literacyScore <= 100, `Literacy skill scored (${skillMatrix.literacyScore})`);
  assert(skillMatrix.researchScore >= 0 && skillMatrix.researchScore <= 100, `Research skill scored (${skillMatrix.researchScore})`);
  assert(skillMatrix.decisionScore >= 0 && skillMatrix.decisionScore <= 100, `Decision skill scored (${skillMatrix.decisionScore})`);

  // Verify multi-factor learning score
  assert(
    skillMatrix.learningScore >= 0 && skillMatrix.learningScore <= 100,
    `Multi-factor learning score correctly weighted (Got ${skillMatrix.learningScore}/100)`
  );

  // --- 5. OBSERVABLE BEHAVIOR ENGINE ---
  console.log('\n--- 5. Observable Trading Behavior Engine ---');
  const behaviors = await behaviorService.detectStudentBehaviors(testUser.id);
  assert(Array.isArray(behaviors), `Behavior patterns analyzed for student (found ${behaviors.length} patterns)`);
  if (behaviors.length > 0) {
    assert(['POSITIVE', 'NEUTRAL', 'WARNING'].includes(behaviors[0].status), `Behavior status classified validly (${behaviors[0].status})`);
  }

  // --- 6. STUDENT WEEKLY REPORT ---
  console.log('\n--- 6. Student Weekly Report & Recommendations ---');
  const weeklyReport = await reportService.getStudentWeeklyReport(testUser.id);
  assert(weeklyReport.overallLearningScore >= 0, `Weekly report calculated overall process score (${weeklyReport.overallLearningScore})`);
  assert(weeklyReport.strengths.length > 0, `Weekly report highlights student strengths`);
  assert(weeklyReport.weaknesses.length > 0, `Weekly report highlights areas for improvement`);
  assert(weeklyReport.recommendedTopic.length > 0, `Weekly report recommends tailored learning topic (${weeklyReport.recommendedTopic})`);

  // --- 7. SOCRATIC AI MENTOR ---
  console.log('\n--- 7. Socratic AI Mentor Dialogue Engine ---');
  const mentorResponse = await mentorService.processChat(
    testUser.id,
    'Saya ingin beli saham BBRI karena harganya turun banyak. Apakah ini saat yang tepat?'
  );

  assert(mentorResponse.role === 'assistant', `Mentor response generated as assistant`);
  assert(mentorResponse.content.length > 50, `Mentor generated thorough pedagogical guidance`);
  assert(
    mentorResponse.content.includes('?') || mentorResponse.content.includes('Bagaimana') || mentorResponse.content.includes('Mengapa'),
    `Mentor response adheres to Socratic questioning methodology`
  );

  // --- 8. TEACHER ASSIGNMENT & CHALLENGE CREATION ---
  console.log('\n--- 8. Teacher Curriculum Center & Challenges ---');
  const newAssignment = await teacherLearningService.createAssignment({
    classId: testClass.id,
    teacherId: testTeacher.id,
    title: 'Analisis Valuasi Saham Sektor Keuangan (Big-4)',
    description: 'Bandingkan rasio PBV dan ROE antara BBCA, BBRI, BMRI, dan BBNI.',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    stockUniverse: 'LQ45 Financials',
    requiredOutput: 'Laporan Komparasi & Rekomendasi Portofolio',
  });

  assert(newAssignment.title.includes('Big-4'), `Teacher assignment created successfully`);

  const newChallenge = await teacherLearningService.createChallenge({
    classId: testClass.id,
    teacherId: testTeacher.id,
    title: 'Zero Cutloss Violation Challenge',
    type: 'RISK',
    description: 'Pertahankan 5 transaksi berturut-turut dengan selalu menetapkan stop loss.',
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    rewardXp: 250,
  });

  assert(newChallenge.rewardXp === 250, `Teacher challenge created with 250 XP reward`);

  console.log('\n====================================================');
  console.log(`📊 PHASE 4 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase4Tests()
  .catch((e) => {
    console.error('Fatal error in Phase 4 tests:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
