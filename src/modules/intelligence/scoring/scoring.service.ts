import {
  FundamentalScoreResult,
  TechnicalScoreResult,
  ValuationScoreResult,
  SmartMoneyScoreResult,
  SentimentScoreResult,
  RiskScoreResult,
  PillarWeights,
  StockIntelligenceOverview,
} from '@/types/intelligence';

export const DEFAULT_WEIGHTS: PillarWeights = {
  fundamental: 0.20,
  technical: 0.20,
  valuation: 0.15,
  smartMoney: 0.10,
  sentiment: 0.10,
  risk: 0.15,
  dataQuality: 0.05,
  marketRegime: 0.05,
};

export class ScoringService {
  private weights: PillarWeights = { ...DEFAULT_WEIGHTS };

  public getWeights(): PillarWeights {
    return { ...this.weights };
  }

  /**
   * Computes weighted AI Overall Score, Confidence, and Data Quality.
   */
  public computeOverall(params: {
    ticker: string;
    companyName: string;
    sector: string;
    industry: string;
    marketCap: number;
    currentPrice: number;
    changePercent: number;
    fundamental: FundamentalScoreResult;
    technical: TechnicalScoreResult;
    valuation: ValuationScoreResult;
    smartMoney: SmartMoneyScoreResult;
    sentiment: SentimentScoreResult;
    risk: RiskScoreResult;
    marketRegimeScore?: number;
  }): StockIntelligenceOverview {
    const {
      ticker,
      companyName,
      sector,
      industry,
      marketCap,
      currentPrice,
      changePercent,
      fundamental,
      technical,
      valuation,
      smartMoney,
      sentiment,
      risk,
    } = params;

    const marketRegime = params.marketRegimeScore ?? 75.0; // IHSG / macroeconomic condition benchmark

    // 1. Calculate Data Quality Score (0-100) based on metrics completeness
    const missingCount = fundamental.missingFields.length + (smartMoney.metrics.dataAvailable ? 0 : 2);
    const dataQualityScore = Math.max(30, Math.min(100, 100 - missingCount * 8));

    // 2. Compute Weighted Overall Score (0-100)
    const rawOverall =
      fundamental.score * this.weights.fundamental +
      technical.score * this.weights.technical +
      valuation.score * this.weights.valuation +
      smartMoney.score * this.weights.smartMoney +
      sentiment.score * this.weights.sentiment +
      risk.score * this.weights.risk +
      dataQualityScore * this.weights.dataQuality +
      marketRegime * this.weights.marketRegime;

    const overallScore = Math.max(0, Math.min(100, Math.round(rawOverall)));

    // 3. Compute Composite Confidence Score (0-100)
    const rawConfidence =
      fundamental.confidence * 0.25 +
      technical.confidence * 0.25 +
      valuation.confidence * 0.20 +
      smartMoney.confidence * 0.15 +
      sentiment.confidence * 0.15;

    const confidenceScore = Math.max(0, Math.min(100, Math.round(rawConfidence)));

    // 4. Identify Strongest & Weakest Pillars
    const pillars = [
      { name: 'Fundamental', score: fundamental.score },
      { name: 'Teknikal', score: technical.score },
      { name: 'Valuasi', score: valuation.score },
      { name: 'Smart Money', score: smartMoney.score },
      { name: 'Sentimen', score: sentiment.score },
      { name: 'Profil Risiko (Safety)', score: risk.score },
    ];

    pillars.sort((a, b) => b.score - a.score);
    const strongestPillar = `${pillars[0].name} (${pillars[0].score}/100)`;
    const weakestPillar = `${pillars[pillars.length - 1].name} (${pillars[pillars.length - 1].score}/100)`;

    // 5. Generate concise catalyst & main risk
    let catalyst = 'Pertumbuhan laba stabil & ekspansi pangsa pasar';
    if (technical.signal === 'UPTREND' || technical.signal === 'BREAKOUT') {
      catalyst = 'Momentum beli kuat disertai breakout tren dan arus modal positif';
    } else if (valuation.status === 'UNDERVALUED') {
      catalyst = 'Margin of safety tinggi dengan valuasi diskon terhadap industri';
    }

    let mainRisk = 'Tekanan makroekonomi atau pelemahan daya beli';
    if (risk.riskLevel === 'HIGH' || risk.riskLevel === 'VERY_HIGH') {
      mainRisk = 'Volatilitas harga tinggi & potensi fluktuasi jangka pendek';
    } else if (technical.signal === 'DOWNTREND' || technical.signal === 'BREAKDOWN') {
      mainRisk = 'Tekanan jual teknikal di bawah rata-rata pergerakan utama';
    }

    return {
      ticker,
      companyName,
      sector,
      industry,
      marketCap,
      currentPrice,
      changePercent,
      overallScore,
      confidenceScore,
      dataQualityScore,
      marketRegimeScore: marketRegime,
      weights: this.getWeights(),
      scores: {
        fundamental,
        technical,
        valuation,
        smartMoney,
        sentiment,
        risk,
      },
      catalyst,
      mainRisk,
      strongestPillar,
      weakestPillar,
      calculatedAt: new Date().toISOString(),
      engineVersion: 'v2.1.0-ai',
    };
  }
}

export const scoringService = new ScoringService();
