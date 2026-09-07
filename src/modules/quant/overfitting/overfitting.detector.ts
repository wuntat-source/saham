import { StrategyRules, WalkForwardSplit } from '@/types/quant';

export interface OverfittingAnalysis {
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  score: number; // 0-100 (higher means higher risk of overfitting)
  reasons: string[];
  recommendations: string[];
}

export class OverfittingDetector {
  /**
   * Analyzes strategy parameters, trade sample size, and walk-forward stability.
   */
  public analyze(
    rules: StrategyRules,
    totalTrades: number,
    winRate: number,
    walkForwardSplits?: WalkForwardSplit[]
  ): OverfittingAnalysis {
    const reasons: string[] = [];
    const recommendations: string[] = [];
    let riskScore = 15; // baseline low risk

    // 1. Parameter / Condition Complexity Check
    const conditionCount = rules.entryRules?.conditions?.length || 0;
    if (conditionCount >= 5) {
      riskScore += 35;
      reasons.push(
        `Strategi menggunakan ${conditionCount} kondisi aturan entry sekaligus (Kompleksitas Tinggi). Semakin banyak parameter yang diatur kaku, semakin tinggi risiko curve-fitting terhadap noise data masa lalu.`
      );
      recommendations.push('Sederhanakan aturan entry menjadi 2–3 kondisi inti yang memiliki landasan ekonomi kuat.');
    } else if (conditionCount >= 3) {
      riskScore += 15;
      reasons.push(`Strategi memiliki ${conditionCount} kondisi aturan entry (Kompleksitas Menengah).`);
    }

    // 2. Trade Sample Size Check
    if (totalTrades < 10) {
      riskScore += 30;
      reasons.push(
        `Jumlah sampel perdagangan sangat sedikit (${totalTrades} transaksi). Hasil metrik tidak signifikan secara statistik.`
      );
      recommendations.push('Perluas periode backtest (minimal 2–3 tahun) atau perluas semesta saham (Universe) untuk mendapatkan minimal 30+ sampel transaksi.');
    } else if (totalTrades < 20) {
      riskScore += 15;
      reasons.push(`Jumlah sampel transaksi masih terbatas (${totalTrades} trades).`);
    }

    // 3. Unusually High Win Rate Check (> 85%)
    if (winRate > 85 && totalTrades >= 10) {
      riskScore += 25;
      reasons.push(
        `Tingkat kemenangan (Win Rate ${winRate}%) tergolong sangat tinggi dan tidak wajar untuk strategi pasar modal riil, mengindikasikan kemungkinan optimasi berlebihan terhadap data masa lalu.`
      );
      recommendations.push('Uji kembali strategi pada periode pasar bearish ekstrem untuk melihat ketahanan terhadap *tail risk*.');
    }

    // 4. Walk-Forward / Out-of-Sample Degradation Check
    if (walkForwardSplits && walkForwardSplits.length >= 2) {
      const inSample = walkForwardSplits.find((s) => s.period === 'IN_SAMPLE_TRAINING');
      const outOfSample = walkForwardSplits.find((s) => s.period === 'OUT_OF_SAMPLE_TEST');

      if (inSample && outOfSample) {
        const returnDiff = inSample.totalReturn - outOfSample.totalReturn;
        if (inSample.totalReturn > 20 && outOfSample.totalReturn < 0) {
          riskScore += 40;
          reasons.push(
            `Degradasi performa tajam: Return In-Sample ${inSample.totalReturn}% anjlok menjadi ${outOfSample.totalReturn}% pada periode Out-of-Sample Test.`
          );
          recommendations.push('Strategi gagal dalam validasi data baru. Lakukan evaluasi ulang logika strategi dari dasar.');
        } else if (returnDiff > 25) {
          riskScore += 20;
          reasons.push(`Terdapat penurunan performa yang cukup besar pada periode pengujian Out-of-Sample.`);
        }
      }
    }

    riskScore = Math.min(100, Math.max(0, riskScore));

    let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (riskScore >= 75) riskLevel = 'CRITICAL';
    else if (riskScore >= 50) riskLevel = 'HIGH';
    else if (riskScore >= 30) riskLevel = 'MODERATE';

    if (recommendations.length === 0) {
      recommendations.push('Strategi menunjukkan kestabilan parameter yang baik pada pengujian data sampel.');
    }

    return {
      riskLevel,
      score: riskScore,
      reasons,
      recommendations,
    };
  }
}

export const overfittingDetector = new OverfittingDetector();
