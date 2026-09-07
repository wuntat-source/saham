import { prisma } from '@/lib/prisma';
import { StudentSkillsMatrix } from '@/types/learning';

export class SkillsService {
  /**
   * Evaluates student's 9 skill dimensions and calculates multi-factor Learning Score (0-100).
   * Strictly does NOT use ROI as the primary learning score.
   */
  public async getStudentSkills(userId: string): Promise<StudentSkillsMatrix> {
    let skill = await prisma.studentSkill.findUnique({
      where: { user_id: userId },
    });

    const journals = await prisma.tradingJournal.findMany({
      where: { user_id: userId },
      include: { reviews: true },
    });

    const journalCount = journals.length;
    const reviewedJournals = journals.filter((j) => j.reviews.length > 0);
    const reviewedCount = reviewedJournals.length;

    let journalDiscipline = Math.min(95, 50 + journalCount * 10);
    let riskManagementScore = 75;
    let analysisQuality = 70;
    let decisionScore = 72;

    if (reviewedCount > 0) {
      const avgRisk = reviewedJournals.reduce((acc, j) => acc + (j.reviews[0]?.risk_management || 75), 0) / reviewedCount;
      const avgDecision = reviewedJournals.reduce((acc, j) => acc + (j.reviews[0]?.decision_quality || 70), 0) / reviewedCount;
      riskManagementScore = Math.min(100, Math.max(0, Math.round(avgRisk)));
      decisionScore = Math.min(100, Math.max(0, Math.round(avgDecision)));
    }

    const fundamentalScore = skill?.fundamental_score ?? 68;
    const technicalScore = skill?.technical_score ?? 65;
    const valuationScore = skill?.valuation_score ?? 62;
    const portfolioScore = skill?.portfolio_score ?? 74;
    const psychologyScore = skill?.psychology_score ?? 70;
    const literacyScore = skill?.literacy_score ?? 80;
    const researchScore = skill?.research_score ?? 72;

    // Composite Analysis Quality (Average of Fundamental, Technical, Valuation)
    analysisQuality = Math.round((fundamentalScore + technicalScore + valuationScore) / 3);

    // Multi-Factor Pedagogical Learning Score:
    // Analysis Quality (25%), Risk Management (20%), Research Quality (15%),
    // Journal Discipline (15%), Decision Consistency (15%), Learning Progress (10%) = 100%
    const learningProgressWeight = 75;
    const rawLearningScore = Math.round(
      analysisQuality * 0.25 +
      riskManagementScore * 0.20 +
      researchScore * 0.15 +
      journalDiscipline * 0.15 +
      decisionScore * 0.15 +
      learningProgressWeight * 0.10
    );

    const learningScore = Math.max(10, Math.min(99, rawLearningScore));

    if (!skill) {
      skill = await prisma.studentSkill.create({
        data: {
          user_id: userId,
          fundamental_score: fundamentalScore,
          technical_score: technicalScore,
          valuation_score: valuationScore,
          risk_management_score: riskManagementScore,
          portfolio_score: portfolioScore,
          psychology_score: psychologyScore,
          literacy_score: literacyScore,
          research_score: researchScore,
          decision_score: decisionScore,
          learning_score: learningScore,
        },
      });
    } else {
      skill = await prisma.studentSkill.update({
        where: { user_id: userId },
        data: {
          risk_management_score: riskManagementScore,
          decision_score: decisionScore,
          learning_score: learningScore,
        },
      });
    }

    return {
      fundamentalScore: skill.fundamental_score,
      technicalScore: skill.technical_score,
      valuationScore: skill.valuation_score,
      riskManagementScore: skill.risk_management_score,
      portfolioScore: skill.portfolio_score,
      psychologyScore: skill.psychology_score,
      literacyScore: skill.literacy_score,
      researchScore: skill.research_score,
      decisionScore: skill.decision_score,
      learningScore: skill.learning_score,
      updatedAt: skill.updated_at.toISOString(),
    };
  }
}

export const skillsService = new SkillsService();
