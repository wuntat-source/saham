import { NormalizedStockData } from '../data/common-data-engine';
import {
  InstitutionalAnalysisResult,
  EducationalSafetyStatus,
  CaseScenario,
} from '@/types/lens';

export class InstitutionalLensEngine {
  /**
   * Evaluates the stock from an institutional, risk-adjusted portfolio allocation perspective.
   */
  static analyze(data: NormalizedStockData): InstitutionalAnalysisResult {
    // 1. Business Quality Score (ROE, ROIC, NPM, Current Ratio)
    let businessQuality = 50;
    if (data.roe >= 20) businessQuality += 20;
    else if (data.roe >= 15) businessQuality += 12;
    else if (data.roe < 10) businessQuality -= 15;

    if (data.roic >= 15) businessQuality += 15;
    else if (data.roic >= 10) businessQuality += 8;

    if (data.npm >= 20) businessQuality += 10;
    else if (data.npm >= 12) businessQuality += 5;

    if (data.der <= 1.0) businessQuality += 5;
    else if (data.der > 2.5 && data.sector !== 'Financials') businessQuality -= 15;

    businessQuality = Math.min(98, Math.max(20, businessQuality));

    // 2. Growth Score (Revenue & Net Income Growth)
    let growthScore = 50;
    if (data.revenueGrowthYoY >= 15) growthScore += 25;
    else if (data.revenueGrowthYoY >= 8) growthScore += 15;
    else if (data.revenueGrowthYoY < 0) growthScore -= 20;

    if (data.epsGrowthYoY >= 15) growthScore += 20;
    else if (data.epsGrowthYoY >= 8) growthScore += 10;
    else if (data.epsGrowthYoY < 0) growthScore -= 15;

    growthScore = Math.min(98, Math.max(15, growthScore));

    // 3. Valuation Score (PER & PBV vs Historical averages & DCF)
    let valuationScore = 50;
    const peDiscount = ((data.historicalPerAvg5Y - data.per) / Math.max(1, data.historicalPerAvg5Y)) * 100;
    if (peDiscount > 15) valuationScore += 25;
    else if (peDiscount > 0) valuationScore += 12;
    else if (peDiscount < -20) valuationScore -= 20;

    if (data.dcfFairValue > data.currentPrice) {
      valuationScore += 15;
    } else {
      valuationScore -= 10;
    }
    valuationScore = Math.min(95, Math.max(20, valuationScore));

    // 4. Risk Score (Higher score = lower risk / higher safety)
    let riskScore = 60;
    if (data.beta < 1.0) riskScore += 15;
    else if (data.beta > 1.3) riskScore -= 15;

    if (data.der < 1.0 || data.sector === 'Financials') riskScore += 15;
    if (data.fcf > 0) riskScore += 10;
    riskScore = Math.min(95, Math.max(25, riskScore));

    // 5. Catalyst Score
    let catalystScore = Math.min(95, Math.max(30, 50 + data.upcomingCatalystsCount * 12 + (data.sentimentScore > 70 ? 10 : 0)));

    // Overall Institutional Composite Score
    const overallScore = Math.round(
      businessQuality * 0.30 +
      growthScore * 0.25 +
      valuationScore * 0.20 +
      riskScore * 0.15 +
      catalystScore * 0.10
    );

    // Confidence calculation based on data availability
    const confidence = data.dataQuality === 'HIGH' ? 90 : data.dataQuality === 'MEDIUM' ? 75 : 55;

    // Safety status
    let safetyStatus: EducationalSafetyStatus = 'WATCH';
    if (overallScore >= 80 && riskScore >= 65) safetyStatus = 'ATTRACTIVE SETUP';
    else if (overallScore >= 70) safetyStatus = 'POSITIVE BIAS';
    else if (riskScore < 45 || overallScore < 50) safetyStatus = 'HIGH RISK';
    else if (overallScore < 60) safetyStatus = 'WAIT FOR CONFIRMATION';

    // Downside Risk calculation
    const downsideRiskPct = Number((data.beta * 12.5).toFixed(1));
    const expectedReturnAnnualized = Number((((data.dcfFairValue - data.currentPrice) / data.currentPrice) * 100).toFixed(1));

    // Scenarios (Bull, Base, Bear)
    const baseFairValue = Math.round(data.dcfFairValue);
    const bullFairValue = Math.round(data.dcfFairValue * 1.20);
    const bearFairValue = Math.round(data.currentPrice * (1 - downsideRiskPct / 100));

    const scenarios: CaseScenario[] = [
      {
        name: 'Bull Case',
        probabilityPct: 25,
        fairValue: bullFairValue,
        impliedUpsidePct: Number((((bullFairValue - data.currentPrice) / data.currentPrice) * 100).toFixed(1)),
        description: 'Revenue growth sustains above 15% with accelerated NIM/margin expansion and strong foreign inflows.',
      },
      {
        name: 'Base Case',
        probabilityPct: 55,
        fairValue: baseFairValue,
        impliedUpsidePct: Number((((baseFairValue - data.currentPrice) / data.currentPrice) * 100).toFixed(1)),
        description: 'Company grows in line with nominal GDP (8–12%) with stable dividend payout and ROE stability.',
      },
      {
        name: 'Bear Case',
        probabilityPct: 20,
        fairValue: bearFairValue,
        impliedUpsidePct: Number((((bearFairValue - data.currentPrice) / data.currentPrice) * 100).toFixed(1)),
        description: 'Macro headwinds, interest rate compression, or sector credit deterioration trigger multiple de-rating.',
      },
    ];

    const keyRisks = [
      `Macro Sensitivity: Sensitive to BI-Rate shifts and domestic consumption momentum.`,
      `Valuation De-rating: If EPS growth slows below ${Math.max(5, Math.round(data.epsGrowthYoY * 0.5))}%, PER multiple may compress.`,
      `Capital Intensity & Regulatory Shifts in the ${data.sector} sector.`,
    ];

    const keyCatalysts = [
      `Upcoming quarterly financial earnings disclosure with potential margin surprise.`,
      `Dividend distribution announcement (Estimated Yield: ${data.dividendYield}%).`,
      `Institutional rebalancing and foreign fund inflows into Tier-1 IDX index constituents.`,
    ];

    const thesis = `${data.ticker} presents an institutional-grade profile characterized by high capital productivity (ROE: ${data.roe}%, ROIC: ${data.roic.toFixed(1)}%) and a stable cash flow engine. While valuation is trading near historical fair levels, its strong balance sheet provides a defensive buffer against systemic volatility.`;

    const transparency = [
      {
        fact: `ROE saat ini berada di level ${data.roe}% dan ROIC di ${data.roic.toFixed(1)}%.`,
        calculation: `Kualitas bisnis dihitung sebesar ${businessQuality}/100 berdasarkan efisiensi modal dan margin laba bersih (${data.npm}%).`,
        interpretation: `Perusahaan memiliki keunggulan kompetitif yang kuat dalam menghasilkan return di atas biaya modal.`,
        aiOpinion: `Mendukung alokasi jangka menengah hingga panjang untuk portofolio berorientasi kualitas (Institutional Core).`,
      },
      {
        fact: `Rasio PER ${data.per}x dibandingkan rata-rata historis 5 tahun (${data.historicalPerAvg5Y.toFixed(1)}x).`,
        calculation: `Skor valuasi ${valuationScore}/100 dengan estimasi DCF Fair Value Rp${baseFairValue.toLocaleString('id-ID')}.`,
        interpretation: `Harga saham saat ini mencerminkan valuasi wajar dengan margin of safety yang moderat.`,
        aiOpinion: `Entry bertahap (dollar-cost averaging) disarankan pada area support teknikal.`,
      },
    ];

    const educationalGuide = {
      whatDoesThisMean: `Lensa Institutional menganalisis saham menggunakan standar investor institusi (Dana Pensiun, Asset Management): mengutamakan kualitas neraca, ROE/ROIC tinggi, dan proteksi risiko kerugian (Risk-Adjusted Return) daripada spekulasi jangka pendek.`,
      whatShouldILearn: `Pelajari konsep ROIC (Return on Invested Capital), Free Cash Flow Yield, dan Risk/Reward Ratio agar memahami mengapa institusi lebih memilih emiten dengan margin of safety yang jelas.`,
    };

    return {
      ticker: data.ticker,
      companyName: data.companyName,
      currentPrice: data.currentPrice,
      score: overallScore,
      confidence,
      safetyStatus,
      dataQuality: data.dataQuality,
      pillarScores: {
        businessQuality,
        growthScore,
        valuationScore,
        riskScore,
        catalystScore,
      },
      metrics: {
        roe: data.roe,
        roic: Number(data.roic.toFixed(1)),
        npm: data.npm,
        der: data.der,
        fcfYield: data.fcfYield,
        per: data.per,
        pbv: data.pbv,
        beta: data.beta,
      },
      scenarios,
      expectedReturnAnnualized,
      downsideRiskPct,
      keyRisks,
      keyCatalysts,
      thesis,
      transparency,
      educationalGuide,
    };
  }
}
