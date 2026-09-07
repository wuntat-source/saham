import { StudentLearningSegment, StudentSegmentProfile } from '@/types/classroom';

export interface StudentBehavioralInput {
  tradeCount?: number;
  tradesCount?: number;
  journalCount?: number;
  journalsCount?: number;
  stopLossCompliancePct?: number;
  avgHoldingDays?: number;
  avgHoldDurationDays?: number;
  fundamentalScore?: number;
  technicalScore?: number;
  maxDrawdown?: number;
  learningScore?: number;
  roi?: number;
}

export class StudentSegmenter {
  /**
   * Classifies student learning behavior into strictly educational, non-clinical profiles.
   */
  public static classify(input: StudentBehavioralInput): StudentSegmentProfile {
    const trades = input.tradesCount ?? input.tradeCount ?? 0;
    const journals = input.journalsCount ?? input.journalCount ?? 0;
    const stopLoss = input.stopLossCompliancePct ?? 80;
    const maxDd = input.maxDrawdown ?? 0;
    const fundScore = input.fundamentalScore ?? 60;
    const techScore = input.technicalScore ?? 60;
    const learning = input.learningScore ?? 50;
    const holdingDays = input.avgHoldingDays ?? input.avgHoldDurationDays ?? 3;

    // 1. BEGINNER: Very few trades
    if (trades <= 2) {
      return {
        segment: 'BEGINNER',
        label: 'Market Apprentice',
        badgeColor: 'text-slate-300 bg-slate-800 border-slate-700',
        description: 'Siswa sedang dalam tahap awal eksplorasi konsep dasar pasar modal dan mekanisme transaksi simulasi.',
        pedagogicalAdvice: 'Bimbing siswa menyelesaikan Level 1–2 pada Learning Path dan menulis jurnal pertama.',
      };
    }

    // 2. OVERTRADER: High trade count with low journal compliance
    if (trades > 15 && journals / Math.max(1, trades) < 0.4) {
      return {
        segment: 'OVERTRADER',
        label: 'High-Frequency Explorer',
        badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        description: 'Siswa sangat aktif mengeksekusi order virtual namun frekuensi pencatatan tesis jurnal masih tertinggal.',
        pedagogicalAdvice: 'Dorong siswa untuk memperlambat tempo dan mewajibkan penulisan pre-trade thesis sebelum entry.',
      };
    }

    // 3. RISK_TAKER: High drawdown or low stop-loss compliance
    if (stopLoss < 50 || maxDd > 20) {
      return {
        segment: 'RISK_TAKER',
        label: 'Aggressive Momentum Seeker',
        badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        description: 'Siswa cenderung mengambil risiko besar dan kerap mengabaikan batas proteksi Stop Loss.',
        pedagogicalAdvice: 'Berikan latihan studi kasus drawdown dan penggunaan kalkulator position sizing.',
      };
    }

    // 4. CONSERVATIVE: Very high stop-loss compliance, low trade frequency, low drawdown, moderate learning score
    if (stopLoss >= 85 && maxDd < 6 && trades <= 6 && learning < 75) {
      return {
        segment: 'CONSERVATIVE',
        label: 'Prudent Capital Preserver',
        badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        description: 'Siswa sangat berhati-hati dalam mengeksekusi posisi dengan proteksi modal yang sangat ketat.',
        pedagogicalAdvice: 'Dorong siswa untuk lebih percaya diri mengidentifikasi peluang pasar dengan diversifikasi terukur.',
      };
    }

    // 5. ANALYST: Patient holding duration & high learning score / deep analysis
    if ((fundScore >= 75 && techScore >= 70) || (holdingDays >= 8 && learning >= 70)) {
      return {
        segment: 'ANALYST',
        label: 'Methodical Equity Analyst',
        badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        description: 'Siswa memiliki landasan riset fundamental dan teknikal yang kuat dengan catatan analisis terstruktur.',
        pedagogicalAdvice: 'Tantang siswa dengan proyek analisis sektoral komparatif atau skenario valuasi kompleks.',
      };
    }

    // 6. CONSISTENT_LEARNER: Balanced high score, steady activity, high journal rate
    if (learning >= 70 && journals / Math.max(1, trades) >= 0.7) {
      return {
        segment: 'CONSISTENT_LEARNER',
        label: 'Disciplined Growth Learner',
        badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        description: 'Siswa menunjukkan kemajuan belajar stabil, disiplin jurnal konsisten, dan pemahaman risiko yang sehat.',
        pedagogicalAdvice: 'Pertahankan ritme belajar dan arahkan siswa menuju modul riset kuantitatif di Quant Lab.',
      };
    }

    // 7. TRADER: Active trading with short holding / momentum
    if (trades >= 5) {
      return {
        segment: 'TRADER',
        label: 'Technical Swing Trader',
        badgeColor: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
        description: 'Siswa berfokus pada dinamika grafik harga, tren moving average, dan pola breakout teknikal.',
        pedagogicalAdvice: 'Perkuat pemahaman rasio fundamental agar analisa teknikal memiliki konfirmasi kualitas bisnis.',
      };
    }

    // Default: BEGINNER
    return {
      segment: 'BEGINNER',
      label: 'Market Apprentice',
      badgeColor: 'text-slate-300 bg-slate-800 border-slate-700',
      description: 'Siswa sedang dalam tahap awal eksplorasi konsep dasar pasar modal dan mekanisme transaksi simulasi.',
      pedagogicalAdvice: 'Bimbing siswa menyelesaikan Level 1–2 pada Learning Path dan menulis jurnal pertama.',
    };
  }

  public classify(input: StudentBehavioralInput): StudentSegmentProfile {
    return StudentSegmenter.classify(input);
  }
}

export const studentSegmenter = new StudentSegmenter();
