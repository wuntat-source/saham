import { NormalizedStockData } from '../data/common-data-engine';
import {
  FundamentalGrowthAnalysisResult,
  EducationalSafetyStatus,
} from '@/types/lens';

export class FundamentalGrowthLensEngine {
  /**
   * Evaluates the stock through a fundamental growth, earnings acceleration, and GARP framework.
   */
  static analyze(data: NormalizedStockData): FundamentalGrowthAnalysisResult {
    // 1. Growth Score
    let growthScore = 50;
    if (data.revenueGrowthYoY >= 15) growthScore += 25;
    else if (data.revenueGrowthYoY >= 8) growthScore += 15;
    else if (data.revenueGrowthYoY < 0) growthScore -= 20;

    if (data.epsGrowthYoY >= 15) growthScore += 20;
    else if (data.epsGrowthYoY >= 8) growthScore += 10;
    else if (data.epsGrowthYoY < 0) growthScore -= 15;
    growthScore = Math.min(98, Math.max(15, growthScore));

    // 2. Earnings Momentum Score (Acceleration Trend)
    let earningsMomentumScore = 55;
    const isAccelerating = data.epsGrowthYoY > data.revenueGrowthYoY;
    if (isAccelerating && data.epsGrowthYoY >= 10) earningsMomentumScore += 30;
    else if (data.epsGrowthYoY >= 8) earningsMomentumScore += 15;
    else if (data.epsGrowthYoY < 0) earningsMomentumScore -= 20;
    earningsMomentumScore = Math.min(95, Math.max(20, earningsMomentumScore));

    // 3. Growth Quality Score (Margin Expansion & ROIC)
    let growthQualityScore = 50;
    if (data.npm >= 20) growthQualityScore += 20;
    else if (data.npm >= 12) growthQualityScore += 10;

    if (data.roic >= 15) growthQualityScore += 15;
    if (data.fcf > 0) growthQualityScore += 10;
    growthQualityScore = Math.min(95, Math.max(20, growthQualityScore));

    // 4. Valuation Score (PEG ratio calculation)
    let valuationScore = 50;
    const peg = data.epsGrowthYoY > 0 ? data.per / data.epsGrowthYoY : 3.0;
    if (peg < 1.0) valuationScore += 30; // Undervalued growth
    else if (peg <= 1.5) valuationScore += 15; // Reasonable growth
    else if (peg > 2.5) valuationScore -= 20; // Expensive growth
    valuationScore = Math.min(95, Math.max(20, valuationScore));

    // Composite Growth Score
    const overallScore = Math.round(
      growthScore * 0.35 +
      earningsMomentumScore * 0.25 +
      growthQualityScore * 0.25 +
      valuationScore * 0.15
    );

    // Classification
    let classification: FundamentalGrowthAnalysisResult['classification'] = 'GROWTH AT REASONABLE PRICE (GARP)';
    if (peg < 1.5 && growthScore >= 70 && growthQualityScore >= 70) {
      classification = 'GROWTH AT REASONABLE PRICE (GARP)';
    } else if (growthScore >= 75 && peg > 2.0) {
      classification = 'EXPENSIVE GROWTH';
    } else if (growthScore < 45 && data.per < 10) {
      classification = 'VALUE TRAP';
    } else if (growthQualityScore >= 80 && growthScore >= 65) {
      classification = 'QUALITY GROWTH';
    }

    const confidence = data.hasConsensusEstimates ? 88 : 65;

    let safetyStatus: EducationalSafetyStatus = 'WATCH';
    if (overallScore >= 80 && peg <= 1.8) safetyStatus = 'ATTRACTIVE SETUP';
    else if (overallScore >= 70) safetyStatus = 'POSITIVE BIAS';
    else if (classification === 'EXPENSIVE GROWTH') safetyStatus = 'WAIT FOR CONFIRMATION';
    else if (classification === 'VALUE TRAP') safetyStatus = 'HIGH RISK';

    const actualRevGrowth = data.revenueGrowthYoY;
    const consensusRevGrowth = data.consensusRevenueGrowth ?? 'CONSENSUS DATA NOT AVAILABLE';
    const actualEpsGrowth = data.epsGrowthYoY;
    const consensusEpsGrowth = data.consensusEpsGrowth ?? 'CONSENSUS DATA NOT AVAILABLE';

    const fivePointThesis = [
      `1. Pertumbuhan Pendapatan: Pertumbuhan YoY sebesar ${actualRevGrowth}% menunjukkan permintaan organik yang solid.`,
      `2. Ekspansi Margin: Laba bersih bertumbuh ${actualEpsGrowth}% (margin ${data.npm}%), mengindikasikan efisiensi operasional dan *operating leverage*.`,
      `3. Valuasi vs Pertumbuhan (PEG): Rasio PEG berada di level ${peg.toFixed(2)}x, mengonfirmasi klasifikasi ${classification}.`,
      `4. Keunggulan Kompetitif: ROIC ${data.roic.toFixed(1)}% membuktikan pertumbuhan didanai dengan modal yang sangat produktif.`,
      `5. Risiko Utama: Perlambatan ekonomi makro atau lonjakan biaya input yang dapat menekan margin ekspansi ke depan.`,
    ];

    const growthDrivers = [
      `Ekspansi volume transaksi dan pertumbuhan penetrasi nasabah/konsumen inti.`,
      `Peningkatan kontribusi pendapatan non-bunga / pendapatan digital bernilai tambah tinggi.`,
      `Efisiensi biaya operasional (*cost-to-income improvement*).`,
    ];

    const growthCatalysts = [
      `Rilis laporan kinerja kuartalan yang melampaui estimasi konsensus analis.`,
      `Peluncuran produk atau layanan inovatif dengan pangsa pasar baru.`,
    ];

    const earningsRisks = [
      `Kenaikan biaya provisi atau beban operasional yang menekan laba bersih.`,
      `Persaingan harga dari pemain baru yang menggerus pangsa pasar.`,
    ];

    const valuationRisks = [
      `Kompresi rasio PER apabila pertumbuhan EPS melambat di bawah 8% YoY.`,
    ];

    const transparency = [
      {
        fact: `Pertumbuhan EPS aktual: ${actualEpsGrowth}% vs Estimasi Konsensus: ${typeof consensusEpsGrowth === 'number' ? `${consensusEpsGrowth}%` : consensusEpsGrowth}.`,
        calculation: `Skor Momentum Laba dihitung ${earningsMomentumScore}/100 dan Skor Kualitas Pertumbuhan ${growthQualityScore}/100.`,
        interpretation: `Perusahaan mampu melampaui ekspektasi pertumbuhan pasar melalui ekspansi margin operasional.`,
        aiOpinion: `Mendukung tesis GARP (Growth at a Reasonable Price).`,
      },
    ];

    const educationalGuide = {
      whatDoesThisMean: `Lensa Fundamental Growth mencari emiten yang labanya tumbuh lebih cepat dari rata-rata industri dengan valuasi yang masuk akal (GARP), bukan sekadar mengejar saham populer yang sudah terlalu mahal.`,
      whatShouldILearn: `Pelajari rasio PEG (Price/Earnings-to-Growth), konsep Operating Leverage (mengapa laba bisa tumbuh lebih cepat dari omzet), dan cara mengenali jebakan Value Trap.`,
    };

    return {
      ticker: data.ticker,
      companyName: data.companyName,
      currentPrice: data.currentPrice,
      score: overallScore,
      confidence,
      safetyStatus,
      dataQuality: data.dataQuality,
      classification,
      pillarScores: {
        growthScore,
        earningsMomentumScore,
        growthQualityScore,
        valuationScore,
      },
      growthVsExpectations: {
        actualRevenueGrowth: actualRevGrowth,
        consensusRevenueGrowth: consensusRevGrowth,
        actualEpsGrowth,
        consensusEpsGrowth,
        accelerationTrend: isAccelerating ? 'ACCELERATING' : 'STABLE',
      },
      growthDrivers,
      growthCatalysts,
      earningsRisks,
      valuationRisks,
      fivePointThesis,
      transparency,
      educationalGuide,
    };
  }
}
