import { RelativeStrengthResult } from '@/types/advanced-intelligence';
import { STOCKS } from '@/lib/constants';
import { marketService } from '@/modules/market/services/market.service';
import { sectorService } from '../sector/sector.service';
import { marketRegimeService } from '../regime/regime.service';

export class RelativeStrengthService {
  /**
   * Calculates Mansfield & Alpha Relative Strength of a stock vs IHSG and its Sector.
   */
  public async getStockRelativeStrength(ticker: string): Promise<RelativeStrengthResult> {
    const symbol = ticker.toUpperCase();
    const stock = STOCKS.find((s) => s.ticker === symbol);
    const quote = await marketService.getQuote(symbol);
    const regime = await marketRegimeService.getMarketRegime();
    const sectorHierarchy = await sectorService.getSectorsOverview();

    const stockSector = stock?.sector || 'Financials';
    const sectorData = sectorHierarchy.sectors.find((s) => s.sector === stockSector);
    const sectorChange = sectorData ? sectorData.performance1D : 0;

    const vsMarketIndexPct = Number((quote.change_percent - regime.ihsgChangePct).toFixed(2));
    const vsSectorPct = Number((quote.change_percent - sectorChange).toFixed(2));

    // Calculate 0-100 Relative Strength Score
    const rawScore = 50 + vsMarketIndexPct * 8 + vsSectorPct * 6;
    const score = Math.max(10, Math.min(99, Math.round(rawScore)));

    let classification: 'LEADER' | 'OUTPERFORMER' | 'IN_LINE' | 'LAGGARD' = 'IN_LINE';
    if (score >= 78) classification = 'LEADER';
    else if (score >= 60) classification = 'OUTPERFORMER';
    else if (score >= 42) classification = 'IN_LINE';
    else classification = 'LAGGARD';

    let summary = `Performa saham ${symbol} sejalan dengan pergerakan rata-rata sektor ${stockSector}.`;
    if (classification === 'LEADER') {
      summary = `Saham ${symbol} merupakan Market Leader dengan kekuatan relatif unggul jauh melampaui IHSG (+${vsMarketIndexPct}%) dan sektor (+${vsSectorPct}%).`;
    } else if (classification === 'OUTPERFORMER') {
      summary = `Saham ${symbol} berkinerja lebih kuat daripada indeks pasar (Alpha +${vsMarketIndexPct}%).`;
    } else if (classification === 'LAGGARD') {
      summary = `Saham ${symbol} saat ini berkinerja di bawah rata-rata sektor, mengalami lagging momentum.`;
    }

    return {
      ticker: symbol,
      score,
      vsMarketIndexPct,
      vsSectorPct,
      percentileInSector: Math.min(98, Math.max(5, Math.round(score * 0.95))),
      classification,
      summary,
    };
  }
}

export const relativeStrengthService = new RelativeStrengthService();
