import { NormalizedStockData } from '../data/common-data-engine';
import {
  QualityCompounderAnalysisResult,
  EducationalSafetyStatus,
  FiveYearShareholderReturnModel,
} from '@/types/lens';

export class QualityCompounderLensEngine {
  /**
   * Evaluates the stock through a Quality Compounder framework and 5-Year Shareholder Return Model.
   */
  static analyze(data: NormalizedStockData): QualityCompounderAnalysisResult {
    // 1. Pillar Calculations
    let roicQuality = 50;
    if (data.roic >= 18) roicQuality += 35;
    else if (data.roic >= 12) roicQuality += 20;
    else if (data.roic < 8) roicQuality -= 20;
    roicQuality = Math.min(98, Math.max(20, roicQuality));

    let reinvestmentQuality = 50;
    const reinvestmentRate = Math.min(85, Math.max(20, Math.round(100 - data.dividendYield * 10)));
    if (reinvestmentRate >= 50 && data.roic >= 15) reinvestmentQuality += 30;
    else if (reinvestmentRate >= 40) reinvestmentQuality += 15;
    reinvestmentQuality = Math.min(95, Math.max(20, reinvestmentQuality));

    let moatScore = 55;
    if (data.roe >= 20 && data.npm >= 20) moatScore += 35;
    else if (data.roe >= 15) moatScore += 20;
    moatScore = Math.min(98, Math.max(25, moatScore));

    let growthDurability = 55;
    if (data.revenueGrowthYoY >= 10 && data.fcf > 0) growthDurability += 30;
    else if (data.revenueGrowthYoY >= 6) growthDurability += 15;
    growthDurability = Math.min(95, Math.max(25, growthDurability));

    let valuationScore = 50;
    if (data.per <= data.historicalPerAvg5Y) valuationScore += 20;
    else if (data.per > data.historicalPerAvg5Y * 1.3) valuationScore -= 15;
    valuationScore = Math.min(95, Math.max(20, valuationScore));

    // Overall Compounder Score
    const compounderScore = Math.round(
      roicQuality * 0.30 +
      moatScore * 0.25 +
      growthDurability * 0.20 +
      reinvestmentQuality * 0.15 +
      valuationScore * 0.10
    );

    // Classification
    let compounderClassification: QualityCompounderAnalysisResult['compounderClassification'] = 'MATURE BUSINESS';
    const isCyclical = data.sector === 'Energy' || data.sector === 'Basic Materials';

    if (roicQuality >= 75 && moatScore >= 75 && !isCyclical) {
      compounderClassification = 'POTENTIAL COMPOUNDER';
    } else if (isCyclical) {
      compounderClassification = 'CYCLICAL';
    } else if (compounderScore < 50 && data.per < 10) {
      compounderClassification = 'VALUE TRAP';
    } else {
      compounderClassification = 'MATURE BUSINESS';
    }

    // 5-Year Shareholder Return Model
    // Return = Earnings Growth + Dividend Yield +/- Multiple Expansion
    const fundamentalReturn = Number((data.epsGrowthYoY * 0.85).toFixed(1));
    const dividendReturn = Number(data.dividendYield.toFixed(1));
    const multipleChange = Number((((data.historicalPerAvg5Y - data.per) / 5) * 0.5).toFixed(1));
    const totalReturnAnnualized = Number((fundamentalReturn + dividendReturn + multipleChange).toFixed(1));

    const fiveYearReturnModel: FiveYearShareholderReturnModel = {
      fundamentalReturnPctAnnualized: fundamentalReturn,
      dividendReturnPctAnnualized: dividendReturn,
      valuationMultipleChangePctAnnualized: multipleChange,
      totalEstimatedShareholderReturnAnnualized: totalReturnAnnualized,
      scenarios: {
        bear: Number((totalReturnAnnualized * 0.5).toFixed(1)),
        base: totalReturnAnnualized,
        bull: Number((totalReturnAnnualized * 1.45).toFixed(1)),
      },
    };

    const confidence = data.dataQuality === 'HIGH' ? 90 : 75;

    let safetyStatus: EducationalSafetyStatus = 'WATCH';
    if (compounderScore >= 80 && compounderClassification === 'POTENTIAL COMPOUNDER') {
      safetyStatus = 'ATTRACTIVE SETUP';
    } else if (compounderScore >= 70) {
      safetyStatus = 'POSITIVE BIAS';
    } else if (compounderClassification === 'VALUE TRAP') {
      safetyStatus = 'HIGH RISK';
    }

    const compoundingEngines = {
      revenueCagr: Number(data.revenueGrowthYoY.toFixed(1)),
      epsCagr: Number(data.epsGrowthYoY.toFixed(1)),
      roic: Number(data.roic.toFixed(1)),
      reinvestmentRatePct: reinvestmentRate,
      pricingPowerRating: data.npm >= 25 ? ('STRONG' as const) : ('MODERATE' as const),
      sourceOfCompoundingExplanation:
        compounderClassification === 'POTENTIAL COMPOUNDER'
          ? `Mesin compounding didorong oleh ROIC tinggi (${data.roic.toFixed(1)}%) + Reinvestment Rate (${reinvestmentRate}%) yang memungkinkan laba ditahan terus menghasilkan nilai tambah majemuk tanpa dilusi utang.`
          : `Compounding terbatas karena karakteristik siklis komoditas atau kejenuhan pasar domestik.`,
    };

    const thesis = `Analisis Quality Compounder mengidentifikasi ${data.ticker} sebagai ${compounderClassification}. Dengan modalitas ROIC ${data.roic.toFixed(1)}% dan dividen yield ${data.dividendYield}%, model 5 tahun memproyeksikan potensi imbal hasil tahunan (Shareholder Return) sebesar ~${totalReturnAnnualized}% per tahun pada skenario dasar.`;

    const transparency = [
      {
        fact: `Model Return 5 Tahun: Pertumbuhan Fundamental (${fundamentalReturn}%) + Dividen (${dividendReturn}%) + Penyesuaian Multiple (${multipleChange}%).`,
        calculation: `Skor Compounder ${compounderScore}/100 dan ROIC Quality ${roicQuality}/100.`,
        interpretation: `Imbal hasil saham jangka panjang sangat ditentukan oleh laju pertumbuhan laba riil dan kemampuan reinvestasi modal.`,
        aiOpinion: `Pilihan ideal bagi investor akumulasi jangka panjang bergaya Compounder Growth.`,
      },
    ];

    const educationalGuide = {
      whatDoesThisMean: `Sebuah 'Compounder' adalah perusahaan istimewa yang mampu menginvestasikan kembali labanya ke dalam bisnis dengan tingkat pengembalian yang sangat tinggi (ROIC tinggi) selama bertahun-tahun tanpa penurunan profitabilitas.`,
      whatShouldILearn: `Pelajari rumus pengembalian pemegang saham 5 tahun: Return = Pertumbuhan Laba + Dividen Yield +/- Perubahan Valuasi (P/E Multiple), serta hukum bunga berbunga (Compounding Interest) pada investasi saham.`,
    };

    return {
      ticker: data.ticker,
      companyName: data.companyName,
      currentPrice: data.currentPrice,
      score: compounderScore,
      confidence,
      safetyStatus,
      dataQuality: data.dataQuality,
      compounderClassification,
      pillarScores: {
        compounderScore,
        roicQuality,
        reinvestmentQuality,
        moatScore,
        growthDurability,
        valuationScore,
      },
      compoundingEngines,
      fiveYearReturnModel,
      thesis,
      transparency,
      educationalGuide,
    };
  }
}
