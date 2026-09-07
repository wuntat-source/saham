import { ValuationData, ValuationScoreResult, ValuationStatus } from '@/types/intelligence';

export class ValuationService {
  /**
   * Evaluates relative valuation against sector averages and intrinsic ratios.
   * Produces deterministic score (0-100) and classification (UNDERVALUED, FAIR, OVERVALUED).
   */
  public evaluate(data: Partial<ValuationData>, sector = 'General'): ValuationScoreResult {
    const sectorAvgPe = data.sectorAvgPe || 15.0;
    const sectorAvgPbv = data.sectorAvgPbv || 2.0;

    let availableCount = 0;
    if (data.pe !== undefined && data.pe !== null) availableCount++;
    if (data.pbv !== undefined && data.pbv !== null) availableCount++;
    if (data.dividendYield !== undefined && data.dividendYield !== null) availableCount++;
    if (data.fcfYield !== undefined && data.fcfYield !== null) availableCount++;

    const confidence = Math.max(30, Math.min(100, 40 + availableCount * 15));

    // 1. P/E Score (35%)
    let peScore = 50;
    let peRating = 'FAIR';
    const pe = data.pe;
    if (pe !== null && pe !== undefined) {
      if (pe < 0) {
        peScore = 20; // loss-making
        peRating = 'LOSS_MAKING';
      } else {
        const peRatioToSector = pe / sectorAvgPe;
        if (peRatioToSector < 0.6) {
          peScore = 95;
          peRating = 'DEEPLY_UNDERVALUED';
        } else if (peRatioToSector < 0.85) {
          peScore = 82;
          peRating = 'UNDERVALUED';
        } else if (peRatioToSector <= 1.2) {
          peScore = 60;
          peRating = 'FAIR';
        } else if (peRatioToSector <= 1.6) {
          peScore = 40;
          peRating = 'PREMIUM';
        } else {
          peScore = 20;
          peRating = 'OVERVALUED';
        }
      }
    }

    // 2. PBV Score (25%)
    let pbvScore = 50;
    let pbvRating = 'FAIR';
    const pbv = data.pbv;
    if (pbv !== null && pbv !== undefined) {
      const pbvRatioToSector = pbv / sectorAvgPbv;
      if (pbvRatioToSector < 0.65) {
        pbvScore = 90;
        pbvRating = 'ATTRACTIVE';
      } else if (pbvRatioToSector <= 1.15) {
        pbvScore = 65;
        pbvRating = 'FAIR';
      } else {
        pbvScore = 35;
        pbvRating = 'EXPENSIVE';
      }
    }

    // 3. Dividend Yield Score (20%)
    let divScore = 50;
    let dividendRating = 'MODERATE';
    const divYield = data.dividendYield ?? 0;
    if (divYield > 7.0) {
      divScore = 98;
      dividendRating = 'HIGH_YIELD';
    } else if (divYield >= 4.0) {
      divScore = 80;
      dividendRating = 'ABOVE_AVERAGE';
    } else if (divYield >= 1.5) {
      divScore = 60;
      dividendRating = 'MODERATE';
    } else {
      divScore = 40;
      dividendRating = 'LOW_OR_NONE';
    }

    // 4. Free Cash Flow Yield / EV/EBITDA (20%)
    let fcfScore = 50;
    let fcfRating = 'NEUTRAL';
    const fcfYield = data.fcfYield ?? 0;
    if (fcfYield > 8.0) {
      fcfScore = 95;
      fcfRating = 'STRONG_FCF';
    } else if (fcfYield > 4.0) {
      fcfScore = 75;
      fcfRating = 'HEALTHY_FCF';
    } else if (fcfYield > 0) {
      fcfScore = 55;
      fcfRating = 'POSITIVE_FCF';
    } else {
      fcfScore = 30;
      fcfRating = 'NEGATIVE_FCF';
    }

    // Total Score (0-100)
    const rawScore = Math.round(
      peScore * 0.35 +
      pbvScore * 0.25 +
      divScore * 0.20 +
      fcfScore * 0.20
    );
    const score = Math.max(0, Math.min(100, rawScore));

    let status: ValuationStatus = 'FAIR';
    if (score >= 75) status = 'UNDERVALUED';
    else if (score <= 45) status = 'OVERVALUED';

    const normalizedData: ValuationData = {
      period: data.period || 'TTM-2024',
      pe: data.pe ?? null,
      forwardPe: data.forwardPe ?? null,
      pbv: data.pbv ?? null,
      evEbitda: data.evEbitda ?? null,
      psr: data.psr ?? null,
      peg: data.peg ?? null,
      dividendYield: data.dividendYield ?? null,
      fcfYield: data.fcfYield ?? null,
      sectorAvgPe,
      sectorAvgPbv,
      dataAsOf: data.dataAsOf || new Date().toISOString(),
      source: data.source || 'IDX Market Data',
    };

    let summary = 'Valuasi berada di level wajar sejalan dengan rata-rata sektor.';
    if (status === 'UNDERVALUED') {
      summary = `Valuasi saham terdiskon (P/E ${data.pe ?? 'N/A'}x vs Sektor ${sectorAvgPe}x), memberikan margin of safety menarik.`;
    } else if (status === 'OVERVALUED') {
      summary = `Valuasi saham diperdagangkan pada valuasi premium/tinggi (P/E ${data.pe ?? 'N/A'}x vs Sektor ${sectorAvgPe}x).`;
    }

    return {
      score,
      confidence,
      status,
      metrics: normalizedData,
      breakdown: {
        peRating,
        pbvRating,
        dividendRating,
        fcfRating,
      },
      summary,
    };
  }
}

export const valuationService = new ValuationService();
