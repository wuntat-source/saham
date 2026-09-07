import { prisma } from '@/lib/prisma';
import { CategoryLeaderboard } from '@/types/classroom';

export class CategoryLeaderboardService {
  /**
   * Generates rankings across 6 pedagogical dimensions.
   */
  public static async getMultiCategoryLeaderboards(classId?: string): Promise<CategoryLeaderboard[]> {
    let studentIds: string[] = [];
    let students: Array<{ id: string; name: string; email: string }> = [];

    if (classId) {
      const classMembers = await prisma.classMember.findMany({
        where: { class_id: classId },
        include: {
          student: {
            select: { id: true, name: true, email: true },
          },
        },
      });
      studentIds = classMembers.map((m) => m.student_id);
      students = classMembers.map((m) => m.student);
    } else {
      const allStudents = await prisma.user.findMany({
        where: { role: 'student' },
        select: { id: true, name: true, email: true },
        take: 30,
      });
      studentIds = allStudents.map((s) => s.id);
      students = allStudents;
    }

    if (students.length === 0) {
      return [
        {
          category: 'OVERALL_CHAMPION',
          label: 'Overall Learning Champion',
          description: 'Peringkat gabungan mutu penalaran, kepatuhan risiko, disiplin jurnal, dan progres belajar.',
          rankings: [],
        },
        {
          category: 'BEST_ANALYST',
          label: 'Best Equity Analyst',
          description: 'Penguasaan terbaik atas analisis fundamental, indikator teknikal, dan estimasi valuasi wajar.',
          rankings: [],
        },
        {
          category: 'BEST_RISK_MANAGER',
          label: 'Best Risk Manager',
          description: 'Kedisiplinan tertinggi dalam menetapkan Stop Loss protektif dan menjaga modal dari drawdown.',
          rankings: [],
        },
        {
          category: 'BEST_LEARNER',
          label: 'Top Progress Learner',
          description: 'Siswa paling aktif menyelesaikan tugas kurikulum dan mengumpulkan poin pengalaman (XP).',
          rankings: [],
        },
        {
          category: 'MOST_CONSISTENT',
          label: 'Most Consistent Researcher',
          description: 'Konsistensi tertinggi dalam menjaga ritme pencatatan jurnal dan streak riset harian.',
          rankings: [],
        },
        {
          category: 'BEST_RESEARCHER',
          label: 'Best Market Researcher',
          description: 'Kedalaman analisis kalender katalis, laporan laba rugi, dan tren sektoral makroekonomi.',
          rankings: [],
        },
      ];
    }

    // Fetch learning data in parallel
    const [skills, progresses, journals] = await Promise.all([
      prisma.studentSkill.findMany({ where: { user_id: { in: studentIds } } }),
      prisma.learningProgress.findMany({ where: { user_id: { in: studentIds } } }),
      prisma.tradingJournal.findMany({
        where: { user_id: { in: studentIds } },
        include: { reviews: true },
      }),
    ]);

    const studentData = students.map((student) => {
      const skill = skills.find((s) => s.user_id === student.id);
      const prog = progresses.find((p) => p.user_id === student.id);
      const studentJournals = journals.filter((j) => j.user_id === student.id);

      const fundScore = skill?.fundamental_score ?? 70;
      const techScore = skill?.technical_score ?? 68;
      const valScore = skill?.valuation_score ?? 65;
      const riskScore = skill?.risk_management_score ?? 75;
      const researchScore = skill?.learning_score ?? 72;

      const analysisComposite = Math.round((fundScore + techScore + valScore) / 3);
      const journalCount = studentJournals.length;
      const stopLossCount = studentJournals.filter((j) => j.stop_loss !== null).length;
      const slRate = journalCount > 0 ? Math.round((stopLossCount / journalCount) * 100) : 80;
      const riskComposite = Math.round(riskScore * 0.6 + slRate * 0.4);

      const xp = prog?.xp ?? 250;
      const streak = prog?.streak_days ?? 1;

      // Multi-factor Learning Score
      const learningScore = Math.round(
        analysisComposite * 0.25 +
          riskComposite * 0.2 +
          researchScore * 0.15 +
          Math.min(95, 50 + journalCount * 10) * 0.15 +
          75 * 0.15 +
          Math.min(95, 60 + Math.floor(xp / 100) * 5) * 0.1
      );

      return {
        studentId: student.id,
        studentName: student.name,
        learningScore,
        analysisComposite,
        riskComposite,
        xp,
        streak,
        researchScore,
        journalCount,
      };
    });

    // 1. Overall Champion
    const overallRankings = [...studentData]
      .sort((a, b) => b.learningScore - a.learningScore)
      .map((s, idx) => ({
        rank: idx + 1,
        studentId: s.studentId,
        studentName: s.studentName,
        score: s.learningScore,
        metricLabel: `${s.learningScore} / 100 Process Score`,
      }));

    // 2. Best Analyst
    const analystRankings = [...studentData]
      .sort((a, b) => b.analysisComposite - a.analysisComposite)
      .map((s, idx) => ({
        rank: idx + 1,
        studentId: s.studentId,
        studentName: s.studentName,
        score: s.analysisComposite,
        metricLabel: `${s.analysisComposite} / 100 Quality`,
      }));

    // 3. Best Risk Manager
    const riskRankings = [...studentData]
      .sort((a, b) => b.riskComposite - a.riskComposite)
      .map((s, idx) => ({
        rank: idx + 1,
        studentId: s.studentId,
        studentName: s.studentName,
        score: s.riskComposite,
        metricLabel: `${s.riskComposite} / 100 Safety Index`,
      }));

    // 4. Best Learner
    const learnerRankings = [...studentData]
      .sort((a, b) => b.xp - a.xp)
      .map((s, idx) => ({
        rank: idx + 1,
        studentId: s.studentId,
        studentName: s.studentName,
        score: s.xp,
        metricLabel: `${s.xp} XP Earned`,
      }));

    // 5. Most Consistent
    const consistentRankings = [...studentData]
      .sort((a, b) => b.streak * 10 + b.journalCount - (a.streak * 10 + a.journalCount))
      .map((s, idx) => ({
        rank: idx + 1,
        studentId: s.studentId,
        studentName: s.studentName,
        score: s.streak,
        metricLabel: `${s.streak} Days Streak (${s.journalCount} Jurnal)`,
      }));

    // 6. Best Researcher
    const researcherRankings = [...studentData]
      .sort((a, b) => b.researchScore - a.researchScore)
      .map((s, idx) => ({
        rank: idx + 1,
        studentId: s.studentId,
        studentName: s.studentName,
        score: s.researchScore,
        metricLabel: `${s.researchScore} / 100 Research Depth`,
      }));

    return [
      {
        category: 'OVERALL_CHAMPION',
        label: 'Overall Learning Champion',
        description: 'Peringkat gabungan mutu penalaran, kepatuhan risiko, disiplin jurnal, dan progres belajar.',
        rankings: overallRankings,
      },
      {
        category: 'BEST_ANALYST',
        label: 'Best Equity Analyst',
        description: 'Penguasaan terbaik atas analisis fundamental, indikator teknikal, dan estimasi valuasi wajar.',
        rankings: analystRankings,
      },
      {
        category: 'BEST_RISK_MANAGER',
        label: 'Best Risk Manager',
        description: 'Kedisiplinan tertinggi dalam menetapkan Stop Loss protektif dan menjaga modal dari drawdown.',
        rankings: riskRankings,
      },
      {
        category: 'BEST_LEARNER',
        label: 'Top Progress Learner',
        description: 'Siswa paling aktif menyelesaikan tugas kurikulum dan mengumpulkan poin pengalaman (XP).',
        rankings: learnerRankings,
      },
      {
        category: 'MOST_CONSISTENT',
        label: 'Most Consistent Researcher',
        description: 'Konsistensi tertinggi dalam menjaga ritme pencatatan jurnal dan streak riset harian.',
        rankings: consistentRankings,
      },
      {
        category: 'BEST_RESEARCHER',
        label: 'Best Market Researcher',
        description: 'Kedalaman analisis kalender katalis, laporan laba rugi, dan tren sektoral makroekonomi.',
        rankings: researcherRankings,
      },
    ];
  }

  public async getCategoryLeaderboards(classId?: string): Promise<CategoryLeaderboard[]> {
    return CategoryLeaderboardService.getMultiCategoryLeaderboards(classId);
  }
}

export const categoryLeaderboardService = new CategoryLeaderboardService();
