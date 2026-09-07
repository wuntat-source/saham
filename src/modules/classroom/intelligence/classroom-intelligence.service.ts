import { prisma } from '@/lib/prisma';
import {
  ClassroomAnalyticsSummary,
  StudentAnalyticsDetail,
  StudentLearningSegment,
} from '@/types/classroom';
import { StudentSegmenter } from '../segmentation/student-segmenter';
import { CommonMistakesEngine } from '../mistakes/common-mistakes.engine';

export class ClassroomIntelligenceService {
  /**
   * Summarize classroom performance, learning scores, segment distribution, and common mistakes
   */
  static async getClassroomAnalytics(classId: string): Promise<ClassroomAnalyticsSummary | null> {
    const classEntity = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        members: {
          include: {
            student: {
              include: {
                wallet: true,
                transactions: true,
              },
            },
          },
        },
      },
    });

    if (!classEntity) return null;

    const studentMemberships = classEntity.members;
    const studentCount = studentMemberships.length;

    if (studentCount === 0) {
      return {
        classId: classEntity.id,
        className: classEntity.class_name,
        invitationCode: classEntity.invitation_code,
        studentCount: 0,
        avgLearningScore: 0,
        avgAnalysisScore: 0,
        avgRiskScore: 0,
        avgRoi: 0,
        avgDrawdown: 0,
        journalComplianceRate: 0,
        assignmentCompletionRate: 0,
        skillDistribution: {
          fundamental: 50,
          technical: 50,
          valuation: 50,
          smartMoney: 50,
          riskManagement: 50,
          sentiment: 50,
          discipline: 50,
          portfolio: 50,
          quantitative: 50,
        },
        segmentDistribution: {
          ANALYST: 0,
          TRADER: 0,
          RISK_TAKER: 0,
          CONSERVATIVE: 0,
          OVERTRADER: 0,
          BEGINNER: 0,
          CONSISTENT_LEARNER: 0,
        },
        commonMistakes: [],
        studentsAtRisk: [],
      };
    }

    let totalLearningScore = 0;
    let totalAnalysisScore = 0;
    let totalRiskScore = 0;
    let totalRoi = 0;
    let totalDrawdown = 0;
    let totalJournalCompliance = 0;
    let totalAssignmentCompliance = 0;

    const skillSums = {
      fundamental: 0,
      technical: 0,
      valuation: 0,
      smartMoney: 0,
      riskManagement: 0,
      sentiment: 0,
      discipline: 0,
      portfolio: 0,
      quantitative: 0,
    };

    const segmentDistribution: Record<StudentLearningSegment, number> = {
      ANALYST: 0,
      TRADER: 0,
      RISK_TAKER: 0,
      CONSERVATIVE: 0,
      OVERTRADER: 0,
      BEGINNER: 0,
      CONSISTENT_LEARNER: 0,
    };

    const studentProfilesForMistakes: any[] = [];
    const studentsAtRisk: ClassroomAnalyticsSummary['studentsAtRisk'] = [];

    const studentIds = studentMemberships.map((m) => m.student_id);
    const [allJournals, allSubmissions, allSkills, totalAssignmentsCount] = await Promise.all([
      prisma.tradingJournal.findMany({ where: { user_id: { in: studentIds } } }),
      prisma.assignmentSubmission.findMany({ where: { student_id: { in: studentIds } } }),
      prisma.studentSkill.findMany({ where: { user_id: { in: studentIds } } }),
      prisma.assignment.count({ where: { class_id: classId } }),
    ]);

    for (const membership of studentMemberships) {
      const user = membership.student;
      const tradesCount = user.transactions.length;
      const userJournals = allJournals.filter((j) => j.user_id === user.id);
      const userSubmissions = allSubmissions.filter((s) => s.student_id === user.id);
      const journalsCount = userJournals.length;
      const submissionsCount = userSubmissions.length;

      // Metrics calculation
      const initialCash = classEntity.initial_balance || 100000000;
      const currentCash = user.wallet?.cash_balance ?? initialCash;
      const totalEquity = currentCash;
      const roi = ((totalEquity - initialCash) / initialCash) * 100;
      const maxDrawdown = roi < 0 ? Math.abs(roi) : 0;

      const journalComplianceRate =
        tradesCount > 0 ? Math.min(100, Math.round((journalsCount / tradesCount) * 100)) : 100;
      const assignmentCompletionRate =
        totalAssignmentsCount > 0
          ? Math.min(100, Math.round((submissionsCount / totalAssignmentsCount) * 100))
          : 100;

      const userSkill = allSkills.find((s) => s.user_id === user.id) || {
        fundamental_score: 50,
        technical_score: 50,
        valuation_score: 50,
        risk_management_score: 50,
        portfolio_score: 50,
        psychology_score: 50,
        literacy_score: 50,
        research_score: 50,
        decision_score: 50,
        learning_score: 50,
      };

      const analysisScore = Math.round(
        (userSkill.fundamental_score + userSkill.technical_score + userSkill.valuation_score) / 3
      );
      const riskScore = userSkill.risk_management_score;
      const learningScore =
        userSkill.learning_score ||
        Math.round(
          analysisScore * 0.25 +
            riskScore * 0.2 +
            userSkill.research_score * 0.15 +
            journalComplianceRate * 0.15 +
            assignmentCompletionRate * 0.15 +
            userSkill.psychology_score * 0.1
        );

      // Segment classification
      const segmentProfile = StudentSegmenter.classify({
        tradesCount,
        journalsCount,
        learningScore,
        roi,
        maxDrawdown,
        stopLossCompliancePct: riskScore,
        avgHoldDurationDays: 5,
      });

      segmentDistribution[segmentProfile.segment] += 1;

      // Aggregates
      totalLearningScore += learningScore;
      totalAnalysisScore += analysisScore;
      totalRiskScore += riskScore;
      totalRoi += roi;
      totalDrawdown += maxDrawdown;
      totalJournalCompliance += journalComplianceRate;
      totalAssignmentCompliance += assignmentCompletionRate;

      skillSums.fundamental += userSkill.fundamental_score;
      skillSums.technical += userSkill.technical_score;
      skillSums.valuation += userSkill.valuation_score;
      skillSums.smartMoney += userSkill.research_score;
      skillSums.riskManagement += userSkill.risk_management_score;
      skillSums.sentiment += userSkill.literacy_score;
      skillSums.discipline += userSkill.psychology_score;
      skillSums.portfolio += userSkill.portfolio_score;
      skillSums.quantitative += userSkill.decision_score;

      studentProfilesForMistakes.push({
        studentId: user.id,
        studentName: user.name,
        tradesCount,
        journalsCount,
        maxDrawdown,
        stopLossCompliancePct: riskScore,
        maxSinglePositionPct: 25,
        regimeMismatchesCount: 0,
      });

      // At-risk student detection
      if (maxDrawdown > 20) {
        studentsAtRisk.push({
          studentId: user.id,
          studentName: user.name,
          reason: `High Drawdown (${maxDrawdown.toFixed(1)}%). Position sizing needs remediation.`,
          severity: 'WARNING',
        });
      } else if (journalComplianceRate < 40 && tradesCount > 3) {
        studentsAtRisk.push({
          studentId: user.id,
          studentName: user.name,
          reason: `Low Journal Compliance (${journalComplianceRate}%). Trading without thesis documentation.`,
          severity: 'CAUTION',
        });
      }
    }

    const commonMistakes = CommonMistakesEngine.detectCommonMistakes(studentProfilesForMistakes);

    return {
      classId: classEntity.id,
      className: classEntity.class_name,
      invitationCode: classEntity.invitation_code,
      studentCount,
      avgLearningScore: Math.round(totalLearningScore / studentCount),
      avgAnalysisScore: Math.round(totalAnalysisScore / studentCount),
      avgRiskScore: Math.round(totalRiskScore / studentCount),
      avgRoi: Number((totalRoi / studentCount).toFixed(2)),
      avgDrawdown: Number((totalDrawdown / studentCount).toFixed(2)),
      journalComplianceRate: Math.round(totalJournalCompliance / studentCount),
      assignmentCompletionRate: Math.round(totalAssignmentCompliance / studentCount),
      skillDistribution: {
        fundamental: Math.round(skillSums.fundamental / studentCount),
        technical: Math.round(skillSums.technical / studentCount),
        valuation: Math.round(skillSums.valuation / studentCount),
        smartMoney: Math.round(skillSums.smartMoney / studentCount),
        riskManagement: Math.round(skillSums.riskManagement / studentCount),
        sentiment: Math.round(skillSums.sentiment / studentCount),
        discipline: Math.round(skillSums.discipline / studentCount),
        portfolio: Math.round(skillSums.portfolio / studentCount),
        quantitative: Math.round(skillSums.quantitative / studentCount),
      },
      segmentDistribution,
      commonMistakes,
      studentsAtRisk,
    };
  }

  /**
   * Fetch deep-dive individual student analytics
   */
  static async getStudentAnalytics(studentId: string): Promise<StudentAnalyticsDetail | null> {
    const user = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        wallet: true,
        transactions: true,
      },
    });

    if (!user) return null;

    const [journals, submissions, skills] = await Promise.all([
      prisma.tradingJournal.findMany({ where: { user_id: studentId } }),
      prisma.assignmentSubmission.findMany({
        where: { student_id: studentId },
        include: { assignment: true },
      }),
      prisma.studentSkill.findFirst({ where: { user_id: studentId } }),
    ]);

    const tradesCount = user.transactions.length;
    const journalsCount = journals.length;
    const initialCash = 100000000;
    const cashBalance = user.wallet?.cash_balance ?? initialCash;
    const totalEquity = cashBalance;
    const roi = ((totalEquity - initialCash) / initialCash) * 100;
    const maxDrawdown = roi < 0 ? Math.abs(roi) : 0;
    const stopLossCompliancePct = 85;

    const userSkill = skills || {
      fundamental_score: 65,
      technical_score: 60,
      valuation_score: 55,
      risk_management_score: 70,
      portfolio_score: 65,
      psychology_score: 75,
      literacy_score: 60,
      research_score: 60,
      decision_score: 50,
      learning_score: 65,
    };

    const learningScore = userSkill.learning_score;

    const segment = StudentSegmenter.classify({
      tradesCount,
      journalsCount,
      learningScore,
      roi,
      maxDrawdown,
      stopLossCompliancePct,
      avgHoldDurationDays: 5,
    });

    const journalComplianceRate =
      tradesCount > 0 ? Math.min(100, Math.round((journalsCount / tradesCount) * 100)) : 100;

    const formattedAssignments = submissions.map((sub) => ({
      assignmentId: sub.assignment_id,
      title: sub.assignment.title,
      submitted: true,
      grade: sub.grade,
      aiScore: sub.ai_score,
      submittedAt: sub.submitted_at.toISOString(),
    }));

    return {
      studentId: user.id,
      studentName: user.name,
      email: user.email,
      segment,
      learningScore,
      skills: {
        fundamental: userSkill.fundamental_score,
        technical: userSkill.technical_score,
        valuation: userSkill.valuation_score,
        smartMoney: userSkill.research_score,
        riskManagement: userSkill.risk_management_score,
        sentiment: userSkill.literacy_score,
        discipline: userSkill.psychology_score,
        portfolio: userSkill.portfolio_score,
        quantitative: userSkill.decision_score,
      },
      wallet: {
        cashBalance,
        totalEquity,
        roi: Number(roi.toFixed(2)),
      },
      riskMetrics: {
        stopLossCompliancePct,
        maxDrawdown: Number(maxDrawdown.toFixed(2)),
        tradesCount,
      },
      journalMetrics: {
        written: journalsCount,
        reviewed: journalsCount,
        complianceRate: journalComplianceRate,
      },
      assignments: formattedAssignments,
      aiFeedback: {
        strengths: [
          'High discipline in documenting trade thesis before execution',
          'Good adherence to stop-loss levels and risk-reward calculation',
        ],
        weaknesses: [
          'Needs deeper valuation multi-factor models (DCF vs PER relative checks)',
          'Avoid trading against dominant BEARISH macro regimes',
        ],
        teacherIntervention: `Recommended pedagogical action: Assign Stage 5 Macro & Stage 7 Quantitative Strategy modules to strengthen analytical depth.`,
      },
    };
  }

  /**
   * Generate CSV export format for teacher gradebook & classroom report
   */
  static generateCSVReport(students: StudentAnalyticsDetail[]): string {
    const headers = [
      'Student Name',
      'Email',
      'Segment',
      'Learning Score',
      'Fundamental',
      'Technical',
      'Valuation',
      'Risk Management',
      'Discipline',
      'ROI (%)',
      'Max Drawdown (%)',
      'Trades Count',
      'Journal Compliance (%)',
    ];

    const rows = students.map((s) => [
      `"${s.studentName}"`,
      `"${s.email}"`,
      `"${s.segment.segment}"`,
      s.learningScore,
      s.skills.fundamental,
      s.skills.technical,
      s.skills.valuation,
      s.skills.riskManagement,
      s.skills.discipline,
      s.wallet.roi,
      s.riskMetrics.maxDrawdown,
      s.riskMetrics.tradesCount,
      s.journalMetrics.complianceRate,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
