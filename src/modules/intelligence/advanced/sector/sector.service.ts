import { STOCKS } from '@/lib/constants';
import { SectorHierarchyDrilldown, SectorPerformance } from '@/types/advanced-intelligence';
import { marketService } from '@/modules/market/services/market.service';
import { marketRegimeService } from '../regime/regime.service';

export class SectorService {
  /**
   * Evaluates all sectors and computes performance, momentum, and valuation metrics.
   */
  public async getSectorsOverview(): Promise<SectorHierarchyDrilldown> {
    const quotes = await marketService.getAllQuotes();
    const regime = await marketRegimeService.getMarketRegime();

    // Group stocks by sector
    const sectorMap = new Map<string, typeof STOCKS>();
    for (const stock of STOCKS) {
      const existing = sectorMap.get(stock.sector) || [];
      existing.push(stock);
      sectorMap.set(stock.sector, existing);
    }

    const sectors: SectorPerformance[] = [];

    for (const [sectorName, stocks] of sectorMap.entries()) {
      let totalChange1D = 0;
      let totalMarketCap = 0;
      const peValues: number[] = [];

      let bestStock = stocks[0];
      let bestStockChange = -999;

      for (const stock of stocks) {
        const quote = quotes.find((q) => q.ticker === stock.ticker);
        const change = quote ? quote.change_percent : 0;
        totalChange1D += change;
        if (stock.peRatio > 0) peValues.push(stock.peRatio);

        const capNum = typeof stock.marketCap === 'string' ? parseFloat(stock.marketCap.replace(/[^0-9.]/g, '')) : 50;
        totalMarketCap += capNum;

        if (change > bestStockChange) {
          bestStockChange = change;
          bestStock = stock;
        }
      }

      const count = stocks.length;
      const avgChange1D = Number((totalChange1D / count).toFixed(2));
      const medianPe = peValues.length > 0 ? Number((peValues.reduce((a, b) => a + b, 0) / peValues.length).toFixed(1)) : 15.0;

      // Deterministic synthetic historical multi-timeframe metrics
      const performance1W = Number((avgChange1D * 1.8 + (sectorName.length % 3) * 0.4).toFixed(2));
      const performance1M = Number((avgChange1D * 3.5 + 1.2).toFixed(2));
      const performanceYTD = Number((avgChange1D * 8.2 + 4.5).toFixed(2));
      const momentumScore = Math.max(30, Math.min(95, Math.round(55 + avgChange1D * 12)));
      const relativeStrengthScore = Math.max(30, Math.min(95, Math.round(50 + (avgChange1D - regime.ihsgChangePct) * 15)));

      sectors.push({
        sector: sectorName,
        performance1D: avgChange1D,
        performance1W,
        performance1M,
        performanceYTD,
        momentumScore,
        relativeStrengthScore,
        medianPe,
        medianPbv: Number((medianPe / 7.5).toFixed(2)),
        earningsGrowthYoY: Number((8.5 + (sectorName.length % 5) * 1.2).toFixed(1)),
        stockCount: count,
        marketCapTrillion: totalMarketCap,
        topStock: {
          ticker: bestStock.ticker,
          companyName: bestStock.name,
          score: momentumScore,
          changePct: bestStockChange > -999 ? bestStockChange : avgChange1D,
        },
      });
    }

    // Sort by 1D performance descending
    sectors.sort((a, b) => b.performance1D - a.performance1D);

    return {
      market: {
        name: 'Indeks Harga Saham Gabungan (IHSG)',
        status: regime.regime,
        score: regime.score,
      },
      sectors,
      timestamp: new Date().toISOString(),
    };
  }
}

export const sectorService = new SectorService();
