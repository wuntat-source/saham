import { FundamentalData, FundamentalScoreResult } from '@/types/intelligence';

export class FundamentalService {
  /**
   * Calculates deterministic fundamental score (0-100) and confidence.
   * Handles missing values gracefully with 'N/A' and confidence deductions.
   */
  public evaluate(data: Partial<FundamentalData>): FundamentalScoreResult {
    const missingFields: string[] = [];

    // Check availability of key fields
    if (data.revenue === undefined || data.revenue === null) missingFields.push('revenue');
    if (data.netProfit === undefined || data.netProfit === null) missingFields.push('netProfit');
    if (data.roe === undefined || data.roe === null) missingFields.push('roe');
    if (data.operatingCashFlow === undefined || data.operatingCashFlow === null) missingFields.push('operatingCashFlow');
    if (data.debtToEquity === undefined || data.debtToEquity === null) missingFields.push('debtToEquity');
    if (data.epsGrowth === undefined || data.epsGrowth === null) missingFields.push('epsGrowth');

    // Baseline confidence: 100 - (12 points per missing metric)
    const confidence = Math.max(20, Math.min(100, 100 - missingFields.length * 12));

    // 1. Profitability (25 pts): Net Margin & Operating Margin
    let profitabilityScore = 50;
    const netMargin = data.netMargin ?? (data.revenue && data.netProfit ? (data.netProfit / data.revenue) * 100 : null);
    if (netMargin !== null) {
      if (netMargin > 20) profitabilityScore = 95;
      else if (netMargin > 12) profitabilityScore = 80;
      else if (netMargin > 5) profitabilityScore = 65;
      else if (netMargin > 0) profitabilityScore = 50;
      else profitabilityScore = 20;
    }

    // 2. Growth (20 pts): Revenue Growth & EPS Growth
    let growthScore = 50;
    const revGrowth = data.revenueGrowth ?? 0;
    const epsGrowth = data.epsGrowth ?? 0;
    const avgGrowth = (revGrowth + epsGrowth) / 2;
    if (avgGrowth > 20) growthScore = 95;
    else if (avgGrowth > 10) growthScore = 80;
    else if (avgGrowth > 3) growthScore = 65;
    else if (avgGrowth >= 0) growthScore = 50;
    else growthScore = 25;

    // 3. Leverage / Financial Health (15 pts): Debt to Equity & Cash
    let leverageScore = 50;
    const der = data.debtToEquity ?? (data.debt && data.cash ? data.debt / Math.max(1, data.cash) : null);
    if (der !== null) {
      if (der < 0.5) leverageScore = 95;
      else if (der < 1.0) leverageScore = 80;
      else if (der < 2.0) leverageScore = 60;
      else if (der < 3.5) leverageScore = 40;
      else leverageScore = 20;
    }

    // 4. Cash Flow Quality (15 pts): Free Cash Flow & Operating Cash Flow
    let cashFlowScore = 50;
    if (data.operatingCashFlow !== null && data.operatingCashFlow !== undefined) {
      if (data.operatingCashFlow > 0 && (data.freeCashFlow ?? 0) > 0) {
        cashFlowScore = 90;
      } else if (data.operatingCashFlow > 0) {
        cashFlowScore = 70;
      } else {
        cashFlowScore = 30;
      }
    }

    // 5. Return on Capital (15 pts): ROE / ROIC
    let returnOnCapitalScore = 50;
    const roe = data.roe ?? 0;
    if (roe > 20) returnOnCapitalScore = 95;
    else if (roe > 14) returnOnCapitalScore = 82;
    else if (roe > 8) returnOnCapitalScore = 65;
    else if (roe > 0) returnOnCapitalScore = 45;
    else returnOnCapitalScore = 15;

    // 6. Earnings Quality (10 pts): OCF / Net Profit ratio
    let earningsQualityScore = 60;
    if (data.operatingCashFlow && data.netProfit && data.netProfit > 0) {
      const ocfRatio = data.operatingCashFlow / data.netProfit;
      if (ocfRatio > 1.0) earningsQualityScore = 90;
      else if (ocfRatio > 0.7) earningsQualityScore = 75;
      else earningsQualityScore = 45;
    }

    // Weighted Fundamental Score calculation (0-100)
    const overallScore = Math.round(
      profitabilityScore * 0.25 +
      growthScore * 0.20 +
      leverageScore * 0.15 +
      cashFlowScore * 0.15 +
      returnOnCapitalScore * 0.15 +
      earningsQualityScore * 0.10
    );

    const clampedScore = Math.max(0, Math.min(100, overallScore));

    const normalizedMetrics: FundamentalData = {
      period: data.period || 'FY2024',
      revenue: data.revenue ?? null,
      revenueGrowth: data.revenueGrowth ?? null,
      grossProfit: data.grossProfit ?? null,
      operatingProfit: data.operatingProfit ?? null,
      netProfit: data.netProfit ?? null,
      eps: data.eps ?? null,
      epsGrowth: data.epsGrowth ?? null,
      roe: data.roe ?? null,
      roa: data.roa ?? null,
      roic: data.roic ?? null,
      debt: data.debt ?? null,
      cash: data.cash ?? null,
      freeCashFlow: data.freeCashFlow ?? null,
      operatingCashFlow: data.operatingCashFlow ?? null,
      debtToEquity: data.debtToEquity ?? null,
      netMargin: netMargin !== null ? Number(netMargin.toFixed(2)) : null,
      operatingMargin: data.operatingMargin ?? null,
      dataAsOf: data.dataAsOf || new Date().toISOString(),
      source: data.source || 'IDX Financial Report',
    };

    let summary = 'Kinerja fundamental stabil.';
    if (clampedScore >= 80) summary = 'Kinerja fundamental sangat kokoh, profitabilitas tinggi & neraca sehat.';
    else if (clampedScore >= 65) summary = 'Fundamental solid dengan pertumbuhan stabil dan solvabilitas terjaga.';
    else if (clampedScore <= 40) summary = 'Fundamental di bawah rata-rata industri, waspadai tekanan margin atau liabilitas.';

    return {
      score: clampedScore,
      confidence,
      metrics: normalizedMetrics,
      breakdown: {
        profitability: profitabilityScore,
        growth: growthScore,
        leverage: leverageScore,
        cashFlow: cashFlowScore,
        returnOnCapital: returnOnCapitalScore,
        earningsQuality: earningsQualityScore,
      },
      summary,
      missingFields,
    };
  }
}

export const fundamentalService = new FundamentalService();
