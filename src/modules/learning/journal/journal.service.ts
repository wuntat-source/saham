import { prisma } from '@/lib/prisma';
import { TradingJournalItem, TradeReviewItem } from '@/types/learning';
import { marketRegimeService } from '@/modules/intelligence/advanced/regime/regime.service';
import { gamificationService } from '../gamification/gamification.service';

export class JournalService {
  /**
   * Creates a new pre-trade or manual trading journal entry.
   */
  public async createJournal(params: {
    userId: string;
    ticker: string;
    thesis: string;
    entryReason?: string;
    riskReason?: string;
    target?: number;
    stopLoss?: number;
    transactionId?: string;
  }): Promise<TradingJournalItem> {
    const regime = await marketRegimeService.getMarketRegime();

    const journal = await prisma.tradingJournal.create({
      data: {
        user_id: params.userId,
        ticker: params.ticker.toUpperCase(),
        thesis: params.thesis,
        entry_reason: params.entryReason,
        risk_reason: params.riskReason,
        target: params.target,
        stop_loss: params.stopLoss,
        market_regime: regime.regime,
        transaction_id: params.transactionId,
      },
      include: {
        reviews: true,
      },
    });

    // Reward gamification XP for journaling discipline (+50 XP)
    await gamificationService.rewardXp(params.userId, 50, 'Menulis Trading Journal');

    return this.mapJournal(journal);
  }

  /**
   * Generates or records an AI Trade Review for a closed transaction.
   * Evaluates process and risk management without outcome bias.
   */
  public async reviewTrade(params: {
    journalId: string;
    userId: string;
    realizedPnl?: number;
    exitPrice?: number;
  }): Promise<TradeReviewItem> {
    const journal = await prisma.tradingJournal.findUnique({
      where: { id: params.journalId },
    });

    if (!journal) {
      throw new Error('Journal not found');
    }

    const hasStopLoss = journal.stop_loss !== null && journal.stop_loss !== undefined;
    const hasTarget = journal.target !== null && journal.target !== undefined;
    const hasDetailedThesis = journal.thesis.length > 25;
    const isProfitable = (params.realizedPnl ?? 0) >= 0;

    // 1. Process & Decision Quality (Not purely outcome-dependent)
    let decisionQuality = 70;
    let riskManagement = 60;
    let thesisQuality = 65;
    let entryQuality = 75;
    let timing = 70;
    let outcomeScore = isProfitable ? 85 : 55;

    if (hasStopLoss && hasTarget) {
      riskManagement = 95;
      decisionQuality += 15;
    } else if (hasStopLoss) {
      riskManagement = 85;
      decisionQuality += 10;
    } else {
      riskManagement = 35; // Severe penalty for trading without stop loss
      decisionQuality -= 15;
    }

    if (hasDetailedThesis) {
      thesisQuality = 90;
      decisionQuality += 10;
    }

    decisionQuality = Math.max(20, Math.min(100, decisionQuality));

    // Constructive pedagogical takeaways
    let whatWell = 'Anda merumuskan rencana transaksi dengan level harga yang terdefinisi.';
    if (hasStopLoss && hasTarget) {
      whatWell = 'Disiplin risiko yang sangat baik: Anda mendefinisikan batas Stop Loss dan Target Profit sebelum mengeksekusi order virtual.';
    }

    let whatImprove = 'Pastikan rasio Risk to Reward minimal 1 : 1.5 pada setiap peluang perdagangan.';
    if (!hasStopLoss) {
      whatImprove = 'Sangat disarankan selalu menentukan batas Stop Loss protektif untuk mencegah kerugian modal yang tidak terkendali.';
    }

    let whatHappened = isProfitable
      ? `Transaksi ditutup dengan keuntungan virtual +Rp${(params.realizedPnl ?? 0).toLocaleString('id-ID')} sejalan dengan target harga.`
      : `Transaksi mengalami koreksi virtual -Rp${Math.abs(params.realizedPnl ?? 0).toLocaleString('id-ID')}.`;

    let keyLesson = 'Kunci trader konsisten bukanlah selalu benar di setiap transaksi, melainkan membatasi risiko saat salah dan memaksimalkan hasil saat benar.';
    if (!isProfitable && hasStopLoss) {
      keyLesson = 'Kerugian terkontrol adalah biaya bisnis yang wajar dalam trading. Keputusan mengeksekusi Stop Loss adalah bukti kedisiplinan tingkat tinggi.';
    } else if (isProfitable && !hasStopLoss) {
      keyLesson = 'Keuntungan tanpa stop loss sering kali menimbulkan ilusi keamanan. Tetap utamakan proteksi risiko di masa depan.';
    }

    const review = await prisma.tradeReview.create({
      data: {
        journal_id: params.journalId,
        user_id: params.userId,
        decision_quality: decisionQuality,
        entry_quality: entryQuality,
        risk_management: riskManagement,
        timing,
        thesis_quality: thesisQuality,
        outcome_score: outcomeScore,
        what_well: whatWell,
        what_improve: whatImprove,
        what_happened: whatHappened,
        key_lesson: keyLesson,
      },
    });

    // Reward XP for completing trade review (+75 XP)
    await gamificationService.rewardXp(params.userId, 75, 'Menyelesaikan Evaluasi AI Trade Review');

    return {
      id: review.id,
      journalId: review.journal_id,
      userId: review.user_id,
      decisionQuality: review.decision_quality,
      entryQuality: review.entry_quality,
      riskManagement: review.risk_management,
      timing: review.timing,
      thesisQuality: review.thesis_quality,
      outcomeScore: review.outcome_score,
      whatWell: review.what_well,
      whatImprove: review.what_improve,
      whatHappened: review.what_happened,
      keyLesson: review.key_lesson,
      createdAt: review.created_at.toISOString(),
    };
  }

  public async getUserJournals(userId: string): Promise<TradingJournalItem[]> {
    const journals = await prisma.tradingJournal.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: { reviews: true },
    });

    return journals.map((j) => this.mapJournal(j));
  }

  public async getJournalById(id: string): Promise<TradingJournalItem | null> {
    const journal = await prisma.tradingJournal.findUnique({
      where: { id },
      include: { reviews: true },
    });
    return journal ? this.mapJournal(journal) : null;
  }

  private mapJournal(j: any): TradingJournalItem {
    const r = j.reviews?.[0];
    return {
      id: j.id,
      userId: j.user_id,
      transactionId: j.transaction_id,
      ticker: j.ticker,
      thesis: j.thesis,
      entryReason: j.entry_reason,
      riskReason: j.risk_reason,
      target: j.target,
      stopLoss: j.stop_loss,
      marketRegime: j.market_regime,
      createdAt: j.created_at.toISOString(),
      review: r
        ? {
            id: r.id,
            journalId: r.journal_id,
            userId: r.user_id,
            decisionQuality: r.decision_quality,
            entryQuality: r.entry_quality,
            riskManagement: r.risk_management,
            timing: r.timing,
            thesisQuality: r.thesis_quality,
            outcomeScore: r.outcome_score,
            whatWell: r.what_well,
            whatImprove: r.what_improve,
            whatHappened: r.what_happened,
            keyLesson: r.key_lesson,
            createdAt: r.created_at.toISOString(),
          }
        : null,
    };
  }
}

export const journalService = new JournalService();
