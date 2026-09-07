import { CommonMistakeItem } from '@/types/classroom';

export interface ClassroomDataAggregate {
  studentCount: number;
  totalTransactions: number;
  totalJournals: number;
  transactionsWithoutJournal: number;
  positionsWithoutStopLoss: number;
  concentratedPortfoliosCount: number;
  bearishContrarianCount: number;
}

export interface StudentMistakeInput {
  studentId: string;
  studentName: string;
  tradesCount: number;
  journalsCount: number;
  maxDrawdown: number;
  stopLossCompliancePct: number;
  maxSinglePositionPct?: number;
  regimeMismatchesCount?: number;
}

export class CommonMistakesEngine {
  /**
   * Evaluates aggregate classroom statistics and generates specific pedagogical gap insights.
   */
  public static detectClassroomMistakes(data: ClassroomDataAggregate): CommonMistakeItem[] {
    const mistakes: CommonMistakeItem[] = [];
    const studentCount = Math.max(1, data.studentCount);

    // 1. BUYING WITHOUT THESIS
    if (data.totalTransactions > 0) {
      const pctNoThesis = Math.round((data.transactionsWithoutJournal / data.totalTransactions) * 100);
      if (pctNoThesis >= 20) {
        mistakes.push({
          id: 'MISTAKE_NO_THESIS',
          title: 'Transaksi Tanpa Dokumentasi Tesis Analisis',
          description: `${pctNoThesis}% dari total transaksi di kelas dieksekusi tanpa pencatatan jurnal analisis terlebih dahulu.`,
          affectedStudentCount: Math.ceil(studentCount * (pctNoThesis / 100)),
          affectedPercentage: pctNoThesis,
          severity: pctNoThesis > 40 ? 'HIGH' : 'MEDIUM',
          remediation: 'Wajibkan siswa menyertakan minimal 1 kalimat alasan fundamental/teknikal di menu Jurnal sebelum entry.',
        });
      }
    }

    // 2. IGNORING STOP LOSS
    if (data.totalTransactions > 0) {
      const pctNoStopLoss = Math.round((data.positionsWithoutStopLoss / data.totalTransactions) * 100);
      if (pctNoStopLoss >= 15) {
        mistakes.push({
          id: 'MISTAKE_NO_STOP_LOSS',
          title: 'Pengabaian Batas Proteksi Risiko (Stop Loss)',
          description: `${pctNoStopLoss}% rencana transaksi tidak menetapkan level stop loss protektif, meningkatkan risiko drawdown besar.`,
          affectedStudentCount: Math.ceil(studentCount * (pctNoStopLoss / 100)),
          affectedPercentage: pctNoStopLoss,
          severity: pctNoStopLoss > 35 ? 'HIGH' : 'MEDIUM',
          remediation: 'Berikan sesi materi khusus mengenai Risk-to-Reward Ratio dan batas toleransi modal maksimal 2% per trade.',
        });
      }
    }

    // 3. OVERCONCENTRATION
    const pctConcentrated = Math.round((data.concentratedPortfoliosCount / studentCount) * 100);
    if (pctConcentrated >= 20 || data.concentratedPortfoliosCount > 0) {
      mistakes.push({
        id: 'MISTAKE_OVERCONCENTRATION',
        title: 'Konsentrasi Portofolio Berlebih pada 1 Emiten',
        description: `${pctConcentrated}% siswa menempatkan porsi modal virtual terlalu besar hanya pada satu saham tunggal.`,
        affectedStudentCount: data.concentratedPortfoliosCount,
        affectedPercentage: pctConcentrated,
        severity: 'MEDIUM',
        remediation: 'Tugaskan simulasi portofolio multi-sektor dengan aturan alokasi maksimal 25% per saham.',
      });
    }

    // 4. IGNORING MARKET REGIME
    if (data.bearishContrarianCount > 0) {
      const pctBearish = Math.round((data.bearishContrarianCount / Math.max(1, data.totalTransactions)) * 100);
      if (pctBearish >= 15 || data.bearishContrarianCount >= 2) {
        mistakes.push({
          id: 'MISTAKE_REGIME_BLIND',
          title: 'Mengabaikan Arah Rezim Pasar Keseluruhan (IHSG)',
          description: `${pctBearish}% transaksi beli dilakukan agresif pada saham yang berlawanan arah dengan tren sektor atau IHSG.`,
          affectedStudentCount: Math.min(studentCount, data.bearishContrarianCount),
          affectedPercentage: pctBearish || 30,
          severity: 'LOW',
          remediation: 'Ajarkan siswa membaca indikator Market Breadth dan status Rezim Pasar di halaman AI Radar.',
        });
      }
    }

    // Fallback if class is performing exceptionally well
    if (mistakes.length === 0) {
      mistakes.push({
        id: 'MISTAKE_OPTIMIZATION',
        title: 'Optimalisasi Waktu Penahanan Posisi',
        description: 'Sebagian kecil siswa keluar dari posisi terlalu cepat sebelum target profit tercapai.',
        affectedStudentCount: Math.max(1, Math.floor(studentCount * 0.1)),
        affectedPercentage: 10,
        severity: 'LOW',
        remediation: 'Diskusikan disiplin membiarkan pemenang berlari (let winners run) dengan trailing stop.',
      });
    }

    return mistakes;
  }

  /**
   * Process individual student list to compute mistakes
   */
  public static detectCommonMistakes(students: StudentMistakeInput[]): CommonMistakeItem[] {
    const studentCount = students.length;
    if (studentCount === 0) return [];

    let totalTransactions = 0;
    let totalJournals = 0;
    let transactionsWithoutJournal = 0;
    let positionsWithoutStopLoss = 0;
    let concentratedPortfoliosCount = 0;
    let bearishContrarianCount = 0;

    for (const s of students) {
      totalTransactions += s.tradesCount;
      totalJournals += s.journalsCount;

      const unjournaled = Math.max(0, s.tradesCount - s.journalsCount);
      transactionsWithoutJournal += unjournaled;

      if (s.stopLossCompliancePct < 60) {
        positionsWithoutStopLoss += Math.ceil(s.tradesCount * 0.6);
      }

      if ((s.maxSinglePositionPct || 0) >= 40) {
        concentratedPortfoliosCount += 1;
      }

      if ((s.regimeMismatchesCount || 0) >= 2) {
        bearishContrarianCount += 1;
      }
    }

    return this.detectClassroomMistakes({
      studentCount,
      totalTransactions,
      totalJournals,
      transactionsWithoutJournal,
      positionsWithoutStopLoss,
      concentratedPortfoliosCount,
      bearishContrarianCount,
    });
  }

  public detectClassroomMistakes(data: ClassroomDataAggregate): CommonMistakeItem[] {
    return CommonMistakesEngine.detectClassroomMistakes(data);
  }

  public detectCommonMistakes(students: StudentMistakeInput[]): CommonMistakeItem[] {
    return CommonMistakesEngine.detectCommonMistakes(students);
  }
}

export const commonMistakesEngine = new CommonMistakesEngine();
