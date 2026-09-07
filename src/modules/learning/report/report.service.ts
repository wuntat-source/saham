import { prisma } from '@/lib/prisma';
import { StudentWeeklyReport } from '@/types/learning';
import { skillsService } from '../skills/skills.service';
import { behaviorService } from '../behavior/behavior.service';
import { gamificationService } from '../gamification/gamification.service';

export class ReportService {
  /**
   * Generates comprehensive personalized weekly learning report for student.
   */
  public async getStudentWeeklyReport(userId: string): Promise<StudentWeeklyReport> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const [skills, behaviors, progress, journals, transactions] = await Promise.all([
      skillsService.getStudentSkills(userId),
      behaviorService.detectStudentBehaviors(userId),
      gamificationService.getStudentProgress(userId),
      prisma.tradingJournal.findMany({ where: { user_id: userId } }),
      prisma.transaction.findMany({ where: { user_id: userId } }),
    ]);

    const tradeCount = transactions.length;
    const journalCount = journals.length;
    const completionRate = tradeCount > 0 ? Math.min(100, Math.round((journalCount / tradeCount) * 100)) : 100;

    // Identify Strengths & Weaknesses based on 9-skill matrix
    const skillList = [
      { name: 'Analisis Fundamental & Laporan Keuangan', score: skills.fundamentalScore },
      { name: 'Analisis Teknikal & Indikator Tren', score: skills.technicalScore },
      { name: 'Valuasi Komparatif & Margin of Safety', score: skills.valuationScore },
      { name: 'Disiplin Manajemen Risiko & Stop Loss', score: skills.riskManagementScore },
      { name: 'Alokasi Portofolio & Diversifikasi Sektor', score: skills.portfolioScore },
      { name: 'Riset Pasar & Analisis Berita', score: skills.researchScore },
    ];

    skillList.sort((a, b) => b.score - a.score);

    const strengths = [
      `${skillList[0].name} (Skor: ${skillList[0].score}/100) — Menunjukkan pemahaman konsep yang solid.`,
      `${skillList[1].name} (Skor: ${skillList[1].score}/100) — Kemampuan aplikasi indikator yang konsisten.`,
    ];

    const weaknesses = [
      `${skillList[skillList.length - 1].name} (Skor: ${skillList[skillList.length - 1].score}/100) — Perlu latihan komparasi lebih lanjut.`,
      `${skillList[skillList.length - 2].name} (Skor: ${skillList[skillList.length - 2].score}/100) — Perkuat pemahaman rasio benchmark.`,
    ];

    let recommendedTopic = 'Manajemen Risiko: Menghitung Risk/Reward Ratio & Stop Loss';
    let recommendedExercise = 'Gunakan Kalkulator Position Sizing untuk membatasi risiko maksimal 2% pada transaksi berikutnya.';

    if (skills.fundamentalScore < skills.technicalScore) {
      recommendedTopic = 'Analisis Fundamental: Membaca Rasio ROE & Net Profit Margin di IDX';
      recommendedExercise = 'Bandingkan rasio P/E dan ROE dari 3 emiten perbankan besar (BBCA, BBRI, BMRI) pada halaman Screener.';
    }

    return {
      studentName: user?.name || 'Siswa EduTradeX',
      reportPeriod: 'Minggu Berjalan',
      overallLearningScore: skills.learningScore,
      strengths,
      weaknesses,
      tradingBehaviors: behaviors,
      learningProgressSummary: {
        tradesExecuted: tradeCount,
        journalsWritten: journalCount,
        journalCompletionRatePct: completionRate,
        completedAssignments: progress.completedAssignments,
        xpEarnedThisWeek: 125,
      },
      recommendedTopic,
      recommendedExercise,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const reportService = new ReportService();
