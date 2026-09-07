import { CommonDataEngine } from '../data/common-data-engine';
import { InstitutionalLensEngine } from '../lenses/institutional-lens.engine';
import { LongTermQualityLensEngine } from '../lenses/long-term-quality-lens.engine';
import { FundamentalGrowthLensEngine } from '../lenses/fundamental-growth-lens.engine';
import { MacroCatalystLensEngine } from '../lenses/macro-catalyst-lens.engine';
import { EarningsExpectationsLensEngine } from '../lenses/earnings-expectations-lens.engine';
import { QualityCompounderLensEngine } from '../lenses/quality-compounder-lens.engine';
import {
  LensConsensusResult,
  LensScoreSummary,
  LensDisagreementItem,
  EducationalSafetyStatus,
} from '@/types/lens';
import { prisma } from '@/lib/prisma';

export class ConsensusLensEngine {
  /**
   * Runs all six lenses on a stock, calculates weighted consensus, detects methodology disagreements,
   * synthesizes a 5-point investment thesis, and persists to database.
   */
  static async evaluateStock(
    ticker: string,
    customWeights?: Partial<Record<string, number>>
  ): Promise<{
    consensus: LensConsensusResult;
    institutional: any;
    longTerm: any;
    growth: any;
    macro: any;
    earnings: any;
    compounder: any;
  }> {
    const data = await CommonDataEngine.getNormalizedData(ticker);

    // 1. Run all 6 independent lens calculations
    const institutional = InstitutionalLensEngine.analyze(data);
    const longTerm = LongTermQualityLensEngine.analyze(data);
    const growth = FundamentalGrowthLensEngine.analyze(data);
    const macro = MacroCatalystLensEngine.analyze(data);
    const earnings = EarningsExpectationsLensEngine.analyze(data);
    const compounder = QualityCompounderLensEngine.analyze(data);

    // 2. Build Score Summaries & Weights
    const defaultWeight = 100 / 6; // ~16.67%
    const scores: LensScoreSummary[] = [
      {
        lensType: 'INSTITUTIONAL',
        slug: 'institutional',
        name: 'Institutional / Risk-Adjusted',
        score: institutional.score,
        confidence: institutional.confidence,
        safetyStatus: institutional.safetyStatus,
        weightPct: customWeights?.['institutional'] ?? defaultWeight,
      },
      {
        lensType: 'LONG_TERM_QUALITY',
        slug: 'long-term',
        name: 'Long-Term Quality & Valuation',
        score: longTerm.score,
        confidence: longTerm.confidence,
        safetyStatus: longTerm.safetyStatus,
        weightPct: customWeights?.['long-term'] ?? defaultWeight,
      },
      {
        lensType: 'FUNDAMENTAL_GROWTH',
        slug: 'growth',
        name: 'Fundamental Growth',
        score: growth.score,
        confidence: growth.confidence,
        safetyStatus: growth.safetyStatus,
        weightPct: customWeights?.['growth'] ?? defaultWeight,
      },
      {
        lensType: 'MACRO_CATALYST',
        slug: 'macro',
        name: 'Macro + Fundamental + Catalyst',
        score: macro.score,
        confidence: macro.confidence,
        safetyStatus: macro.safetyStatus,
        weightPct: customWeights?.['macro'] ?? defaultWeight,
      },
      {
        lensType: 'EARNINGS_EXPECTATIONS',
        slug: 'earnings',
        name: 'Earnings & Market Expectations',
        score: earnings.score,
        confidence: earnings.confidence,
        safetyStatus: earnings.safetyStatus,
        weightPct: customWeights?.['earnings'] ?? defaultWeight,
      },
      {
        lensType: 'QUALITY_COMPOUNDER',
        slug: 'compounder',
        name: 'Quality Compounder',
        score: compounder.score,
        confidence: compounder.confidence,
        safetyStatus: compounder.safetyStatus,
        weightPct: customWeights?.['compounder'] ?? defaultWeight,
      },
    ];

    // 3. Weighted Consensus Calculation
    let weightedScoreSum = 0;
    let weightedConfidenceSum = 0;
    let totalWeight = 0;

    for (const s of scores) {
      weightedScoreSum += s.score * s.weightPct;
      weightedConfidenceSum += s.confidence * s.weightPct;
      totalWeight += s.weightPct;
    }

    const consensusScore = Math.round(weightedScoreSum / totalWeight);
    const consensusConfidence = Math.round(weightedConfidenceSum / totalWeight);

    // 4. Strongest and Weakest Lens
    const sortedScores = [...scores].sort((a, b) => b.score - a.score);
    const strongestLens = sortedScores[0];
    const weakestLens = sortedScores[sortedScores.length - 1];

    // 5. Disagreement Detection Engine
    const disagreements: LensDisagreementItem[] = [];

    // Check Quality vs Valuation divergence
    if (longTerm.pillarScores.businessQuality >= 80 && institutional.pillarScores.valuationScore < 55) {
      disagreements.push({
        lensA: 'Long-Term Quality',
        scoreA: longTerm.pillarScores.businessQuality,
        lensB: 'Valuation Lens',
        scoreB: institutional.pillarScores.valuationScore,
        divergence: longTerm.pillarScores.businessQuality - institutional.pillarScores.valuationScore,
        explanation: 'Kualitas bisnis dan profitabilitas sangat prima, namun kelipatan valuasi saat ini sudah memperhitungkan sebagian besar ekspektasi masa depan (Fair-to-Premium pricing).',
      });
    }

    // Check Growth vs Macro/Technical divergence
    if (growth.score >= 80 && macro.score < 60) {
      disagreements.push({
        lensA: 'Fundamental Growth',
        scoreA: growth.score,
        lensB: 'Macro & Catalyst',
        scoreB: macro.score,
        divergence: growth.score - macro.score,
        explanation: 'Prospek pertumbuhan laba organik sangat kuat, namun kondisi rezim makroekonomi (suku bunga / kurs valas) memberikan hambatan sementara.',
      });
    }

    // Check Compounder vs Earnings Short-Term Divergence
    if (compounder.score >= 80 && earnings.score < 65) {
      disagreements.push({
        lensA: 'Quality Compounder',
        scoreA: compounder.score,
        lensB: 'Earnings Expectations',
        scoreB: earnings.score,
        divergence: compounder.score - earnings.score,
        explanation: 'Karakteristik compounding 5 tahun sangat kokoh, namun ekspektasi pasar kuartal jangka pendek menuntut realisasi laba tanpa margin of error.',
      });
    }

    // Fallback if divergence between max and min is wide (> 18 pts)
    if (disagreements.length === 0 && strongestLens.score - weakestLens.score > 18) {
      disagreements.push({
        lensA: strongestLens.name,
        scoreA: strongestLens.score,
        lensB: weakestLens.name,
        scoreB: weakestLens.score,
        divergence: strongestLens.score - weakestLens.score,
        explanation: `${strongestLens.name} memberikan indikasi sangat positif (${strongestLens.score}), sementara ${weakestLens.name} menuntut kehati-hatian (${weakestLens.score}). Evaluasi horizon investasi Anda sebelum mengambil keputusan.`,
      });
    }

    // 6. Educational Safety Status
    let safetyStatus: EducationalSafetyStatus = 'WATCH';
    if (consensusScore >= 82) safetyStatus = 'ATTRACTIVE SETUP';
    else if (consensusScore >= 72) safetyStatus = 'POSITIVE BIAS';
    else if (consensusScore < 50) safetyStatus = 'UNATTRACTIVE';
    else if (disagreements.length > 1) safetyStatus = 'WAIT FOR CONFIRMATION';

    // 7. Executive Summary Matrix
    const executiveSummary = {
      businessQuality: (longTerm.pillarScores.businessQuality >= 75 ? 'STRONG' : 'MODERATE') as 'STRONG' | 'MODERATE' | 'WEAK',
      growth: (growth.pillarScores.growthScore >= 75 ? 'STRONG' : 'MODERATE') as 'STRONG' | 'MODERATE' | 'WEAK',
      valuation: (longTerm.valuationStatus === 'UNDERVALUED' ? 'CHEAP' : longTerm.valuationStatus === 'OVERVALUED' ? 'EXPENSIVE' : 'FAIR') as 'CHEAP' | 'FAIR' | 'EXPENSIVE',
      risk: (institutional.pillarScores.riskScore >= 70 ? 'LOW' : 'MEDIUM') as 'LOW' | 'MEDIUM' | 'HIGH',
      catalyst: (macro.score >= 70 ? 'POSITIVE' : 'NEUTRAL') as 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE',
      longTermQuality: (longTerm.score >= 75 ? 'STRONG' : 'MODERATE') as 'STRONG' | 'MODERATE' | 'WEAK',
      compounderPotential: (compounder.compounderClassification === 'POTENTIAL COMPOUNDER' ? 'HIGH' : 'MODERATE') as 'HIGH' | 'MODERATE' | 'LOW',
    };

    // 8. 5-Point Unified AI Investment Thesis
    const investmentThesis = {
      whyAttractive: [
        `Tingkat pengembalian modal tinggi (ROE ${data.roe}%, ROIC ${data.roic.toFixed(1)}%) dengan parit ekonomi (moat) yang teruji.`,
        `Pertumbuhan laba bersih ${data.epsGrowthYoY}% YoY melampaui konsensus pasar didukung efisiensi biaya.`,
        `Model Pengembalian Pemegang Saham 5 Tahun memproyeksikan potensi return tahunan ~${compounder.fiveYearReturnModel.totalEstimatedShareholderReturnAnnualized}% (Earnings + Dividend ${data.dividendYield}%).`,
      ],
      whyMayDisappoint: [
        `Jika valuasi terde-rating akibat perlambatan pertumbuhan EPS di bawah ekspektasi pasar.`,
        `Sensitivitas terhadap pergerakan suku bunga acuan BI dan dinamika likuiditas perbankan nasional.`,
      ],
      whatMarketMayBeMissing: [
        `Potensi ekspansi margin dari digitalisasi dan optimalisasi struktur biaya operasional yang belum sepenuhnya terpriced-in.`,
        `Daya tahan arus kas bebas (Free Cash Flow Yield ${data.fcfYield}%) yang memberikan fleksibilitas pembagian dividen lebih tinggi.`,
      ],
      whatCouldInvalidateThesis: [
        `Penyusutan tajam Net Profit Margin di bawah 15% atau lonjakan rasio NPL/kredit macet.`,
        `Perubahan kebijakan regulasi sektoral yang membatasi penetapan harga produk (*pricing power*).`,
      ],
      whatInvestorsShouldMonitor: [
        `Rilis laporan keuangan kuartalan berikutnya (apakah mencapai skenario BEAT konsensus).`,
        `Arah arus dana investor institusi asing (Foreign Net Flow) di saham lapis satu BEI.`,
      ],
    };

    const consensus: LensConsensusResult = {
      ticker: data.ticker,
      companyName: data.companyName,
      currentPrice: data.currentPrice,
      consensusScore,
      consensusConfidence,
      safetyStatus,
      calculatedAt: new Date().toISOString(),
      dataAsOf: data.dataAsOf,
      scores,
      strongestLens,
      weakestLens,
      disagreements,
      executiveSummary,
      investmentThesis,
      disclaimer:
        'DISCLAIMER: Analisis AI Investment Lens adalah simulasi edukasi analitis untuk pembelajaran pasar modal dan BUKAN merupakan ajakan beli/jual atau rekomendasi investasi finansial resmi.',
    };

    // 9. Persist to DB asynchronously for caching/audit
    try {
      for (const s of scores) {
        await prisma.investmentLensScore.upsert({
          where: {
            ticker_lens_type: {
              ticker: data.ticker,
              lens_type: s.lensType,
            },
          },
          update: {
            score: s.score,
            confidence: s.confidence,
            data_quality: data.dataQuality,
            calculated_at: new Date(),
          },
          create: {
            ticker: data.ticker,
            lens_type: s.lensType,
            score: s.score,
            confidence: s.confidence,
            data_quality: data.dataQuality,
          },
        });
      }
    } catch (e) {
      console.error('Failed to cache investment lens scores in DB:', e);
    }

    return {
      consensus,
      institutional,
      longTerm,
      growth,
      macro,
      earnings,
      compounder,
    };
  }
}
