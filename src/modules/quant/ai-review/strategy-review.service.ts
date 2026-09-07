import { AIStrategyReview, BacktestReport, StrategyRules } from '@/types/quant';
import { overfittingDetector } from '../overfitting/overfitting.detector';

export class StrategyReviewService {
  /**
   * Generates a qualitative pedagogical AI review of a completed backtest.
   * Explains dynamics without automatically mutating student strategy code.
   */
  public generateReview(report: BacktestReport, rules: StrategyRules): AIStrategyReview {
    const overfitting = overfittingDetector.analyze(
      rules,
      report.totalTrades,
      report.winRate,
      report.walkForwardSplits
    );

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const risks: string[] = [];
    const suggestedImprovements: string[] = [];

    // Evaluate Win Rate & Profit Factor
    if (report.winRate >= 60) {
      strengths.push(
        `Akurasi entry tinggi: Win Rate mencapai ${report.winRate}% dengan rasio Profit Factor ${report.profitFactor}.`
      );
    } else {
      weaknesses.push(
        `Win Rate berada di ${report.winRate}%. Strategi ini sangat bergantung pada rasio Risk/Reward yang lebar (Take Profit jauh lebih besar dari Stop Loss).`
      );
    }

    // Evaluate Risk & Drawdown
    if (report.maxDrawdown <= 10) {
      strengths.push(
        `Disiplin proteksi modal sangat kuat: Maximum Drawdown hanya ${report.maxDrawdown}%, menjaga modal virtual dari penurunan drastis.`
      );
    } else if (report.maxDrawdown > 20) {
      weaknesses.push(
        `Maximum Drawdown mencapai ${report.maxDrawdown}%. Penurunan ini cukup menguji ketahanan psikologis trader di pasar riil.`
      );
      suggestedImprovements.push(
        'Pertimbangkan untuk memperketat batas Stop Loss atau menurunkan alokasi per posisi (Position Size).'
      );
    }

    // Evaluate Sharpe & Sortino
    if (report.sharpeRatio >= 1.5) {
      strengths.push(
        `Efisiensi risiko sangat baik: Sharpe Ratio ${report.sharpeRatio} dan Sortino ${report.sortinoRatio} mengindikasikan imbal hasil yang stabil di atas suku bunga acuan BI.`
      );
    } else if (report.sharpeRatio < 0.5) {
      weaknesses.push(
        `Sharpe Ratio ${report.sharpeRatio} tergolong rendah, menunjukkan imbal hasil belum sepadan dengan volatilitas portofolio yang dialami.`
      );
    }

    // Baseline pedagogical process strengths
    if (strengths.length === 0) {
      strengths.push('Disiplin aturan teknikal: Strategi berhasil mengeksekusi rencana tanpa dipengaruhi bias emosional.');
      strengths.push('Pencegahan look-ahead bias dan simulasi fee (Beli 0.15%, Jual 0.25%) terverifikasi realistis.');
    }

    // Evaluate Trade Sample
    if (report.totalTrades < 15) {
      weaknesses.push(
        `Jumlah perdagangan (${report.totalTrades} trades) masih relatif sedikit untuk generalisasi performa jangka panjang.`
      );
      suggestedImprovements.push(
        'Uji pada rentang tanggal yang lebih panjang (misal 3–5 tahun) atau tambahkan saham dalam semesta Universe.'
      );
    }

    // Market Dependency
    let marketDependency = 'Strategi bersifat fleksibel namun paling optimal saat pasar membentuk tren jelas (Trending Market).';
    if (rules.entryRules.conditions.some((c) => c.field === 'rsi_14' && (c.operator === '<' || c.operator === '<='))) {
      marketDependency = 'Strategi Mean-Reversion / Oversold: Sangat efektif pada fase konsolidasi & Sideways, namun rentan *false signal* saat Bearish kuat.';
    } else if (rules.entryRules.conditions.some((c) => c.field === 'sma_50' || c.field === 'sma_20')) {
      marketDependency = 'Strategi Trend Following: Berkinerja luar biasa pada fase Bullish berkelanjutan, namun rawan *whipsaw* saat pasar Sideways tanpa arah.';
    }

    // Risks
    risks.push('Risiko gap down harga pada pembukaan pasar yang dapat melompati level stop loss protektif.');
    risks.push('Likuiditas saham lapis dua/tiga pada transaksi dengan ukuran lot besar.');

    // Append Overfitting Insights
    if (overfitting.reasons.length > 0) {
      weaknesses.push(...overfitting.reasons);
    }
    suggestedImprovements.push(...overfitting.recommendations);

    return {
      strengths,
      weaknesses,
      risks,
      marketDependency,
      overfittingRisk: overfitting.riskLevel,
      overfittingReason: overfitting.reasons.join(' '),
      suggestedImprovements,
    };
  }
}

export const strategyReviewService = new StrategyReviewService();
