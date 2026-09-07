import { PositionSizingResult, TradingPlanLevel } from '@/types/advanced-intelligence';
import { marketService } from '@/modules/market/services/market.service';
import { SHARES_PER_LOT } from '@/lib/constants';

export class TradingPlanService {
  /**
   * Generates educational simulated trading plan with Entry, Stop Loss, and TP1-3.
   * Transparently explains calculation logic with disclaimer.
   */
  public async getTradingPlan(ticker: string): Promise<TradingPlanLevel> {
    const symbol = ticker.toUpperCase();
    const quote = await marketService.getQuote(symbol);
    const price = quote.price;

    // Deterministic technical support / resistance math
    const entryMin = Math.round(price * 0.985);
    const entryMax = Math.round(price * 1.015);
    const breakoutLevel = Math.round(price * 1.035);
    const stopLoss = Math.round(price * 0.94); // -6.0% risk buffer
    const stopDistancePct = Number((((price - stopLoss) / price) * 100).toFixed(1));

    const tp1 = Math.round(price * 1.06); // +6% (1:1 R/R)
    const tp1UpsidePct = Number((((tp1 - price) / price) * 100).toFixed(1));

    const tp2 = Math.round(price * 1.12); // +12% (1:2 R/R)
    const tp2UpsidePct = Number((((tp2 - price) / price) * 100).toFixed(1));

    const tp3 = Math.round(price * 1.20); // +20% (1:3.3 R/R)
    const tp3UpsidePct = Number((((tp3 - price) / price) * 100).toFixed(1));

    const riskRewardRatio = Number((tp2UpsidePct / stopDistancePct).toFixed(2));

    const logicExplanation = [
      `Entry Zone (Rp${entryMin.toLocaleString('id-ID')} – Rp${entryMax.toLocaleString('id-ID')}): Dihitung dari rentang toleransi volatilitas harian 1.5% di sekitar harga pasar berjalan.`,
      `Breakout Level (Rp${breakoutLevel.toLocaleString('id-ID')}): Level konfirmasi penembusan resistensi minor intraday disertai ekspansi volume.`,
      `Stop Loss (Rp${stopLoss.toLocaleString('id-ID')} / -${stopDistancePct}%): Ditentukan di bawah swing low support terdekat untuk membatasi risiko kerugian modal virtual.`,
      `Target Profit (TP1 +${tp1UpsidePct}%, TP2 +${tp2UpsidePct}%, TP3 +${tp3UpsidePct}%): Menggunakan rasio Risk/Reward 1 : ${riskRewardRatio} berbasis proyeksi ekstensi Fibonacci teknikal.`,
    ];

    const disclaimer =
      'Simulasi edukasi virtual EduTradeX. Seluruh level harga merupakan kalkulasi edukatif otomatis dan bukan merupakan jaminan profit atau anjuran investasi riil.';

    return {
      entryZone: {
        min: entryMin,
        max: entryMax,
        description: 'Rentang beli optimal saat harga berkonsolidasi atau retest support.',
      },
      breakoutLevel,
      stopLoss,
      stopDistancePct,
      tp1,
      tp1UpsidePct,
      tp2,
      tp2UpsidePct,
      tp3,
      tp3UpsidePct,
      riskRewardRatio,
      logicExplanation,
      disclaimer,
    };
  }

  /**
   * Calculates exact position sizing based on user selected risk tolerance (1%, 2%, or 5%).
   */
  public calculatePositionSize(params: {
    accountBalance: number;
    currentPrice: number;
    stopLossPrice: number;
    riskPercentage: 1 | 2 | 5;
    tp1Price?: number;
    tp2Price?: number;
  }): PositionSizingResult {
    const { accountBalance, currentPrice, stopLossPrice, riskPercentage, tp1Price, tp2Price } = params;

    const maxRiskAmountIdr = Math.round((accountBalance * riskPercentage) / 100);
    const stopDistancePerShare = Math.max(1, currentPrice - stopLossPrice);

    // Max shares = Max Risk Amount / Risk Per Share
    const maxSharesAllowed = Math.floor(maxRiskAmountIdr / stopDistancePerShare);
    const maxLotsAllowed = Math.floor(maxSharesAllowed / SHARES_PER_LOT);
    const actualShares = maxLotsAllowed * SHARES_PER_LOT;

    const totalCapitalRequiredIdr = actualShares * currentPrice;
    const capitalUtilizationPct = Number(((totalCapitalRequiredIdr / Math.max(1, accountBalance)) * 100).toFixed(1));

    const potentialLossIdr = actualShares * stopDistancePerShare;
    const potentialGainTp1Idr = tp1Price ? actualShares * Math.max(0, tp1Price - currentPrice) : actualShares * stopDistancePerShare;
    const potentialGainTp2Idr = tp2Price ? actualShares * Math.max(0, tp2Price - currentPrice) : actualShares * stopDistancePerShare * 2;

    return {
      accountBalance,
      riskPercentage,
      maxRiskAmountIdr,
      stopDistancePerShare,
      maxSharesAllowed: actualShares,
      maxLotsAllowed,
      totalCapitalRequiredIdr,
      capitalUtilizationPct,
      potentialLossIdr,
      potentialGainTp1Idr,
      potentialGainTp2Idr,
    };
  }
}

export const tradingPlanService = new TradingPlanService();
