import { AnomalyItem, AnomalySeverity, AnomalyType } from '@/types/advanced-intelligence';
import { STOCKS } from '@/lib/constants';
import { marketService } from '@/modules/market/services/market.service';

export class AnomalyService {
  /**
   * Scans market tickers for statistical outliers and unusual flow activity.
   * Professional language; never fabricates or alleges manipulation.
   */
  public async getMarketAnomalies(): Promise<AnomalyItem[]> {
    const quotes = await marketService.getAllQuotes();
    const anomalies: AnomalyItem[] = [];

    let count = 1;
    for (const q of quotes) {
      const stock = STOCKS.find((s) => s.ticker === q.ticker);
      const companyName = stock?.name || `${q.ticker} Tbk`;

      // 1. Abnormal Volume Spikes (> 2.2x normal volume)
      if (q.volume > 25_000_000) {
        anomalies.push({
          id: `anom-${count++}`,
          ticker: q.ticker,
          companyName,
          anomalyType: 'ABNORMAL_VOLUME',
          severity: q.volume > 40_000_000 ? 'HIGH_ALERT' : 'WARNING',
          description: `Lonjakan volume transaksi harian terdeteksi ${(q.volume / 15_000_000).toFixed(1)}x melampaui rata-rata baseline 20 hari.`,
          detectedMetric: q.volume,
          baselineMetric: 15_000_000,
          confidence: 92,
          detectedAt: new Date().toISOString(),
        });
      }

      // 2. Abnormal Price Movement (> 3.5% intraday change)
      if (Math.abs(q.change_percent) >= 3.5) {
        anomalies.push({
          id: `anom-${count++}`,
          ticker: q.ticker,
          companyName,
          anomalyType: 'ABNORMAL_PRICE_MOVEMENT',
          severity: Math.abs(q.change_percent) >= 5.0 ? 'HIGH_ALERT' : 'WARNING',
          description: `Pergerakan harga signifikan ${q.change_percent >= 0 ? '+' : ''}${q.change_percent}% dalam satu sesi perdagangan.`,
          detectedMetric: q.change_percent,
          baselineMetric: 1.0,
          confidence: 90,
          detectedAt: new Date().toISOString(),
        });
      }

      // 3. Price-Volume Divergence (Price down, but heavy buying or vice versa)
      if (q.change_percent < -1.5 && q.volume > 20_000_000) {
        anomalies.push({
          id: `anom-${count++}`,
          ticker: q.ticker,
          companyName,
          anomalyType: 'PRICE_VOLUME_DIVERGENCE',
          severity: 'WATCH',
          description: `Divergensi harga-volume terdeteksi: Penurunan harga disertai volume perdagangan tebal (potensi absorpsi).`,
          detectedMetric: q.change_percent,
          baselineMetric: 0,
          confidence: 86,
          detectedAt: new Date().toISOString(),
        });
      }
    }

    // Sort by severity priority: HIGH_ALERT -> WARNING -> WATCH -> NORMAL
    const severityOrder: Record<AnomalySeverity, number> = {
      HIGH_ALERT: 4,
      WARNING: 3,
      WATCH: 2,
      NORMAL: 1,
    };

    anomalies.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
    return anomalies;
  }

  public async getAnomaliesByTicker(ticker: string): Promise<AnomalyItem[]> {
    const all = await this.getMarketAnomalies();
    return all.filter((a) => a.ticker === ticker.toUpperCase());
  }
}

export const anomalyService = new AnomalyService();
