import {
  OHLCV,
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateATR,
  calculateStochastic,
  calculateADX,
  calculateOBV,
} from './indicators';
import { TechnicalIndicators, TechnicalScoreResult, TrendSignal } from '@/types/intelligence';

export class TechnicalService {
  /**
   * Evaluates technical price action, trend alignment, momentum, and volatility.
   * Generates deterministic technical score (0-100) and actionable signal.
   */
  public evaluate(candles: OHLCV[]): TechnicalScoreResult {
    if (!candles || candles.length === 0) {
      return {
        score: 50,
        confidence: 30,
        signal: 'SIDEWAYS',
        indicators: {
          price: 0,
          sma20: null,
          sma50: null,
          sma100: null,
          sma200: null,
          ema20: null,
          rsi: null,
          macd: { line: null, signal: null, histogram: null },
          stochastic: { k: null, d: null },
          adx: null,
          atr: null,
          bollingerBands: { upper: null, middle: null, lower: null },
          obv: null,
        },
        breakdown: {
          trendScore: 50,
          momentumScore: 50,
          volatilityScore: 50,
          volumeScore: 50,
        },
        summary: 'Data candlestick belum mencukupi.',
      };
    }

    const closes = candles.map((c) => c.close);
    const latestCandle = candles[candles.length - 1];
    const price = latestCandle.close;

    const sma20 = calculateSMA(closes, 20);
    const sma50 = calculateSMA(closes, 50);
    const sma100 = calculateSMA(closes, 100);
    const sma200 = calculateSMA(closes, Math.min(200, closes.length));
    const ema20 = calculateEMA(closes, 20);
    const rsi = calculateRSI(closes, 14) ?? 50;
    const macd = calculateMACD(closes, 12, 26, 9);
    const stochastic = calculateStochastic(candles, 14, 3);
    const adx = calculateADX(candles, 14) ?? 25;
    const atr = calculateATR(candles, 14);
    const bb = calculateBollingerBands(closes, 20, 2);
    const obv = calculateOBV(candles);

    // Confidence depends on historical length (ideal is > 60 bars)
    const confidence = Math.min(100, Math.max(40, Math.round((candles.length / 80) * 100)));

    // 1. Trend Analysis (40%)
    let trendScore = 50;
    let signal: TrendSignal = 'SIDEWAYS';

    const aboveSMA20 = sma20 ? price >= sma20 : true;
    const aboveSMA50 = sma50 ? price >= sma50 : true;
    const aboveSMA200 = sma200 ? price >= sma200 : true;
    const sma20AboveSMA50 = sma20 && sma50 ? sma20 >= sma50 : true;

    // Detect Breakout / Breakdown
    if (bb.upper && price > bb.upper && (macd.histogram ?? 0) > 0) {
      signal = 'BREAKOUT';
      trendScore = 92;
    } else if (bb.lower && price < bb.lower && (macd.histogram ?? 0) < 0) {
      signal = 'BREAKDOWN';
      trendScore = 20;
    } else if (aboveSMA20 && aboveSMA50 && sma20AboveSMA50) {
      signal = 'UPTREND';
      trendScore = aboveSMA200 ? 88 : 75;
    } else if (!aboveSMA20 && !aboveSMA50 && !sma20AboveSMA50) {
      signal = 'DOWNTREND';
      trendScore = !aboveSMA200 ? 25 : 38;
    } else {
      signal = 'SIDEWAYS';
      trendScore = 52;
    }

    // 2. Momentum Analysis (30%) - RSI & MACD
    let momentumScore = 50;
    let rsiComponent = 50;
    if (rsi >= 50 && rsi <= 68) rsiComponent = 85; // healthy bullish momentum
    else if (rsi > 68 && rsi <= 78) rsiComponent = 70; // bullish but near overbought
    else if (rsi > 78) rsiComponent = 45; // overbought risk
    else if (rsi >= 35 && rsi < 50) rsiComponent = 55; // mild weakness
    else if (rsi < 35 && rsi >= 22) rsiComponent = 40; // oversold bounce candidate
    else rsiComponent = 25; // severely oversold

    let macdComponent = 50;
    if ((macd.histogram ?? 0) > 0 && (macd.line ?? 0) > (macd.signal ?? 0)) {
      macdComponent = 85;
    } else if ((macd.histogram ?? 0) < 0) {
      macdComponent = 35;
    }
    momentumScore = Math.round(rsiComponent * 0.5 + macdComponent * 0.5);

    // 3. Volatility & Channel (15%) - Bollinger & ADX
    let volatilityScore = 60;
    if (adx > 25) {
      volatilityScore = signal === 'UPTREND' || signal === 'BREAKOUT' ? 85 : 40;
    } else {
      volatilityScore = 55; // low trend strength
    }

    // 4. Volume Confirmation (15%)
    let volumeScore = 55;
    const recentCandles = candles.slice(-5);
    const avgRecentVol = recentCandles.reduce((a, b) => a + b.volume, 0) / recentCandles.length;
    const prevCandles = candles.slice(-20, -5);
    const avgPrevVol = prevCandles.length > 0 ? prevCandles.reduce((a, b) => a + b.volume, 0) / prevCandles.length : avgRecentVol;

    if (latestCandle.close > latestCandle.open && latestCandle.volume > avgPrevVol * 1.2) {
      volumeScore = 85; // bullish volume confirmation
    } else if (latestCandle.close < latestCandle.open && latestCandle.volume > avgPrevVol * 1.2) {
      volumeScore = 30; // bearish volume distribution
    }

    // Weighted Overall Technical Score
    const rawScore = Math.round(
      trendScore * 0.40 +
      momentumScore * 0.30 +
      volatilityScore * 0.15 +
      volumeScore * 0.15
    );
    const score = Math.max(0, Math.min(100, rawScore));

    const indicators: TechnicalIndicators = {
      price,
      sma20,
      sma50,
      sma100,
      sma200,
      ema20,
      rsi,
      macd,
      stochastic,
      adx,
      atr,
      bollingerBands: bb,
      obv,
    };

    let summary = 'Struktur harga bergerak sideways dalam rentang konsolidasi.';
    if (signal === 'UPTREND') summary = `Tren bullish terkonfirmasi di atas SMA20 & SMA50 dengan momentum RSI ${rsi}.`;
    else if (signal === 'BREAKOUT') summary = 'Harga menembus Upper Bollinger Band disertai ekspansi volume beli.';
    else if (signal === 'DOWNTREND') summary = 'Tren bearish di bawah rata-rata pergerakan utama, waspadai tekanan jual.';
    else if (signal === 'BREAKDOWN') summary = 'Harga menembus Lower Bollinger Band, risiko pelemahan lanjutan.';

    return {
      score,
      confidence,
      signal,
      indicators,
      breakdown: {
        trendScore,
        momentumScore,
        volatilityScore,
        volumeScore,
      },
      summary,
    };
  }
}

export const technicalService = new TechnicalService();
