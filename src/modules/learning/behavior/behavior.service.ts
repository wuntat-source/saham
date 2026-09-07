import { prisma } from '@/lib/prisma';
import { BehaviorPatternItem, ObservableBehavior } from '@/types/learning';

export class BehaviorService {
  /**
   * Identifies observable trading behaviors from student transaction & journal history.
   * Strictly educational and non-clinical.
   */
  public async detectStudentBehaviors(userId: string): Promise<BehaviorPatternItem[]> {
    const [transactions, journals, portfolios] = await Promise.all([
      prisma.transaction.findMany({
        where: { user_id: userId },
        orderBy: { executed_at: 'desc' },
      }),
      prisma.tradingJournal.findMany({
        where: { user_id: userId },
      }),
      prisma.portfolio.findMany({
        where: { user_id: userId, total_shares: { gt: 0 } },
      }),
    ]);

    const patterns: BehaviorPatternItem[] = [];

    // 1. GOOD RISK DISCIPLINE (Positive)
    const journalsWithSL = journals.filter((j) => j.stop_loss !== null);
    if (journalsWithSL.length >= 2 || (journals.length > 0 && journalsWithSL.length / journals.length >= 0.7)) {
      patterns.push({
        type: 'GOOD_RISK_DISCIPLINE',
        name: 'Disiplin Proteksi Risiko',
        status: 'POSITIVE',
        description: 'Anda secara konsisten mendefinisikan batas toleransi Stop Loss pada sebagian besar rencana trading virtual.',
        recommendation: 'Pertahankan disiplin ini untuk melindungi modal virtual dari fluktuasi pasar yang tidak terduga.',
        frequency: journalsWithSL.length,
      });
    }

    // 2. CONSISTENT PROCESS (Positive)
    if (journals.length >= 3) {
      patterns.push({
        type: 'CONSISTENT_PROCESS',
        name: 'Konsistensi Dokumentasi Tesis',
        status: 'POSITIVE',
        description: 'Anda memiliki kebiasaan baik mencatat alasan dan dasar analisis sebelum mengeksekusi order.',
        recommendation: 'Lanjutkan evaluasi post-trade review secara berkala untuk mengekstrak pembelajaran jangka panjang.',
        frequency: journals.length,
      });
    }

    // 3. LACK OF THESIS (Warning)
    const tradeCount = transactions.length;
    const journalCount = journals.length;
    if (tradeCount > 3 && journalCount < tradeCount * 0.4) {
      patterns.push({
        type: 'LACK_OF_THESIS',
        name: 'Transaksi Tanpa Tesis Tertulis',
        status: 'WARNING',
        description: `Terdapat ${tradeCount - journalCount} transaksi yang dieksekusi tanpa pencatatan jurnal tesis terlebih dahulu.`,
        recommendation: 'Biasakan menuliskan minimal 1-2 kalimat alasan analisis (Fundamental / Teknikal) sebelum menekan tombol Beli.',
        frequency: tradeCount - journalCount,
      });
    }

    // 4. OVERTRADING (Warning)
    if (tradeCount >= 10) {
      patterns.push({
        type: 'OVERTRADING',
        name: 'Frekuensi Transaksi Tinggi (Overtrading)',
        status: 'WARNING',
        description: 'Frekuensi transaksi dalam simulator cukup tinggi, berpotensi memicu biaya broker berlebih dan kelelahan analisa.',
        recommendation: 'Fokus pada 2-3 setup saham dengan kualitas skor AI terbaik (A-grade setups) daripada mengejar setiap pergerakan harga.',
        frequency: tradeCount,
      });
    }

    // 5. POOR DIVERSIFICATION / CONCENTRATION (Warning)
    if (portfolios.length === 1 && tradeCount >= 2) {
      patterns.push({
        type: 'CONCENTRATION',
        name: 'Konsentrasi Saham Tunggal',
        status: 'WARNING',
        description: 'Seluruh modal saham teralokasi hanya pada 1 emiten, menimbulkan risiko konsentrasi.',
        recommendation: 'Lakukan diversifikasi ke minimal 3 saham dari sektor yang berbeda untuk menyebarkan risiko.',
        frequency: 1,
      });
    }

    // Fallback if no specific patterns found yet
    if (patterns.length === 0) {
      patterns.push({
        type: 'CONSISTENT_PROCESS',
        name: 'Fase Adaptasi & Pembelajaran Awal',
        status: 'NEUTRAL',
        description: 'Aktivitas trading Anda masih berada pada tahap awal eksplorasi simulator.',
        recommendation: 'Mulai buat jurnal trading pertama Anda saat melakukan pembelian saham.',
        frequency: 1,
      });
    }

    return patterns;
  }
}

export const behaviorService = new BehaviorService();
