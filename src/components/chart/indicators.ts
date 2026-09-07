import { CandleData } from '@/lib/market';

export interface IndicatorData {
  ma9: (number | null)[];
  ma20: (number | null)[];
  ema50: (number | null)[];
  sma200: (number | null)[];
  bollinger: {
    upper: (number | null)[];
    middle: (number | null)[];
    lower: (number | null)[];
  };
  rsi: (number | null)[];
  macd: {
    macdLine: (number | null)[];
    signalLine: (number | null)[];
    histogram: (number | null)[];
  };
}

export function calculateIndicators(candles: CandleData[]): IndicatorData {
  const closes = candles.map((c) => c.close);
  const n = closes.length;

  // 1. Simple Moving Averages
  const calculateSMA = (period: number): (number | null)[] => {
    const result: (number | null)[] = [];
    for (let i = 0; i < n; i++) {
      if (i < period - 1) {
        result.push(null);
      } else {
        const sum = closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        result.push(sum / period);
      }
    }
    return result;
  };

  // 2. Exponential Moving Average (EMA)
  const calculateEMA = (period: number): (number | null)[] => {
    const result: (number | null)[] = [];
    const multiplier = 2 / (period + 1);

    for (let i = 0; i < n; i++) {
      if (i < period - 1) {
        result.push(null);
      } else if (i === period - 1) {
        const sum = closes.slice(0, period).reduce((a, b) => a + b, 0);
        result.push(sum / period);
      } else {
        const prevEMA = result[i - 1]!;
        const currentEMA = (closes[i] - prevEMA) * multiplier + prevEMA;
        result.push(currentEMA);
      }
    }
    return result;
  };

  // 3. Bollinger Bands (20, 2)
  const calculateBollinger = (period: number = 20, multiplier: number = 2) => {
    const upper: (number | null)[] = [];
    const middle: (number | null)[] = [];
    const lower: (number | null)[] = [];

    for (let i = 0; i < n; i++) {
      if (i < period - 1) {
        upper.push(null);
        middle.push(null);
        lower.push(null);
      } else {
        const slice = closes.slice(i - period + 1, i + 1);
        const mean = slice.reduce((a, b) => a + b, 0) / period;
        const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
        const stdDev = Math.sqrt(variance);

        middle.push(mean);
        upper.push(mean + multiplier * stdDev);
        lower.push(mean - multiplier * stdDev);
      }
    }
    return { upper, middle, lower };
  };

  // 4. RSI (Relative Strength Index, period = 14)
  const calculateRSI = (period: number = 14): (number | null)[] => {
    const rsi: (number | null)[] = [];
    if (n <= period) {
      return Array(n).fill(null);
    }

    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < n; i++) {
      const diff = closes[i] - closes[i - 1];
      gains.push(diff > 0 ? diff : 0);
      losses.push(diff < 0 ? -diff : 0);
    }

    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = 0; i < period; i++) {
      rsi.push(null);
    }

    const rs0 = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + rs0));

    for (let i = period + 1; i < n; i++) {
      const currentGain = gains[i - 1];
      const currentLoss = losses[i - 1];

      avgGain = (avgGain * (period - 1) + currentGain) / period;
      avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - 100 / (1 + rs));
      }
    }

    return rsi;
  };

  // 5. MACD (12, 26, 9)
  const calculateMACD = () => {
    const ema12 = calculateEMA(12);
    const ema26 = calculateEMA(26);
    const macdLine: (number | null)[] = [];

    for (let i = 0; i < n; i++) {
      if (ema12[i] !== null && ema26[i] !== null) {
        macdLine.push(ema12[i]! - ema26[i]!);
      } else {
        macdLine.push(null);
      }
    }

    // Signal Line (9 EMA of MACD Line)
    const validMacdIndices = macdLine.map((val, idx) => ({ val, idx })).filter((x) => x.val !== null);
    const signalLine: (number | null)[] = Array(n).fill(null);
    const histogram: (number | null)[] = Array(n).fill(null);

    if (validMacdIndices.length >= 9) {
      const macdValues = validMacdIndices.map((x) => x.val!);
      const signalEmaValues: number[] = [];
      const multiplier = 2 / (9 + 1);

      for (let i = 0; i < macdValues.length; i++) {
        if (i < 8) {
          signalEmaValues.push(0);
        } else if (i === 8) {
          const sum = macdValues.slice(0, 9).reduce((a, b) => a + b, 0);
          const initial = sum / 9;
          signalEmaValues.push(initial);
          const origIdx = validMacdIndices[i].idx;
          signalLine[origIdx] = initial;
          histogram[origIdx] = macdValues[i] - initial;
        } else {
          const prev = signalEmaValues[i - 1];
          const curr = (macdValues[i] - prev) * multiplier + prev;
          signalEmaValues.push(curr);
          const origIdx = validMacdIndices[i].idx;
          signalLine[origIdx] = curr;
          histogram[origIdx] = macdValues[i] - curr;
        }
      }
    }

    return { macdLine, signalLine, histogram };
  };

  return {
    ma9: calculateSMA(9),
    ma20: calculateSMA(20),
    ema50: calculateEMA(50),
    sma200: calculateSMA(Math.min(200, Math.floor(n * 0.9))),
    bollinger: calculateBollinger(20, 2),
    rsi: calculateRSI(14),
    macd: calculateMACD(),
  };
}
