import { RiskData, RiskLevel, RiskScoreResult } from '@/types/intelligence';

export class RiskService {
  /**
   * Calculates comprehensive multi-factor risk profile.
   * Score 0-100: Higher score denotes LOWER risk (safer asset).
   */
  public evaluate(data: Partial<RiskData>): RiskScoreResult {
    const vol = data.volatility30D ?? 25.0; // annualized volatility %
    const mdd = Math.abs(data.maxDrawdown1Y ?? 15.0); // max drawdown %
    const turnover = data.liquidityDailyTurnover ?? 20_000_000_000; // daily IDR turnover
    const der = data.debtToEquity ?? 1.0;
    const beta = data.beta ?? 1.0;

    // 1. Volatility & Beta Score (30%)
    let volScore = 50;
    if (vol < 18 && beta < 0.9) volScore = 90;
    else if (vol < 25 && beta <= 1.1) volScore = 75;
    else if (vol < 35) volScore = 50;
    else volScore = 25;

    // 2. Drawdown Resistance Score (25%)
    let ddScore = 50;
    if (mdd < 10) ddScore = 95;
    else if (mdd < 20) ddScore = 78;
    else if (mdd < 35) ddScore = 50;
    else ddScore = 20;

    // 3. Liquidity Safety Score (25%) - Big cap liquidity is safer
    let liqScore = 50;
    if (turnover > 50_000_000_000) liqScore = 95;
    else if (turnover > 10_000_000_000) liqScore = 80;
    else if (turnover > 2_000_000_000) liqScore = 60;
    else liqScore = 30;

    // 4. Financial Solvency & Leverage Risk (20%)
    let solScore = 50;
    if (der < 0.5) solScore = 95;
    else if (der < 1.2) solScore = 80;
    else if (der < 2.5) solScore = 55;
    else solScore = 30;

    const rawScore = Math.round(
      volScore * 0.30 +
      ddScore * 0.25 +
      liqScore * 0.25 +
      solScore * 0.20
    );
    const score = Math.max(0, Math.min(100, rawScore));

    let riskLevel: RiskLevel = 'MEDIUM';
    if (score >= 80) riskLevel = 'LOW';
    else if (score >= 60) riskLevel = 'MEDIUM';
    else if (score >= 40) riskLevel = 'HIGH';
    else riskLevel = 'VERY_HIGH';

    const confidence = 90;

    const normalizedData: RiskData = {
      volatility30D: vol,
      maxDrawdown1Y: mdd,
      liquidityDailyTurnover: turnover,
      debtToEquity: der,
      beta,
      eventRisk: data.eventRisk || 'LOW',
      concentrationRisk: data.concentrationRisk || 'LOW',
    };

    let summary = 'Profil risiko tergolong moderat dengan volatilitas dan likuiditas seimbang.';
    if (riskLevel === 'LOW') {
      summary = 'Profil risiko rendah (Defensive / High Liquidity) dengan neraca sangat sehat.';
    } else if (riskLevel === 'HIGH' || riskLevel === 'VERY_HIGH') {
      summary = 'Tingkat risiko tinggi; pergerakan harga memiliki volatilitas tinggi atau leverage substansial.';
    }

    return {
      score,
      confidence,
      riskLevel,
      metrics: normalizedData,
      summary,
    };
  }
}

export const riskService = new RiskService();
