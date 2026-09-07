export interface OHLCV {
  date?: string;
  time?: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Calculates Simple Moving Average (SMA)
 */
export function calculateSMA(data: number[], period: number): number | null {
  if (data.length < period || period <= 0) return null;
  const slice = data.slice(data.length - period);
  const sum = slice.reduce((acc, val) => acc + val, 0);
  return Number((sum / period).toFixed(2));
}

/**
 * Calculates Exponential Moving Average (EMA)
 */
export function calculateEMA(data: number[], period: number): number | null {
  if (data.length < period || period <= 0) return null;
  const k = 2 / (period + 1);
  let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
  }
  return Number(ema.toFixed(2));
}

/**
 * Calculates RSI (Relative Strength Index, default 14 period)
 */
export function calculateRSI(closes: number[], period: number = 14): number | null {
  if (closes.length <= period) return null;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(diff)) / period;
    }
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);
  return Number(rsi.toFixed(2));
}

/**
 * Calculates MACD (12, 26, 9)
 */
export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { line: number | null; signal: number | null; histogram: number | null } {
  if (closes.length < slowPeriod + signalPeriod) {
    return { line: null, signal: null, histogram: null };
  }

  const kFast = 2 / (fastPeriod + 1);
  const kSlow = 2 / (slowPeriod + 1);

  let emaFast = closes.slice(0, fastPeriod).reduce((a, b) => a + b, 0) / fastPeriod;
  let emaSlow = closes.slice(0, slowPeriod).reduce((a, b) => a + b, 0) / slowPeriod;

  const macdHistory: number[] = [];

  // Align EMAs
  for (let i = 0; i < closes.length; i++) {
    if (i >= fastPeriod) {
      emaFast = closes[i] * kFast + emaFast * (1 - kFast);
    }
    if (i >= slowPeriod) {
      emaSlow = closes[i] * kSlow + emaSlow * (1 - kSlow);
      macdHistory.push(emaFast - emaSlow);
    }
  }

  if (macdHistory.length < signalPeriod) {
    return { line: null, signal: null, histogram: null };
  }

  const macdLine = macdHistory[macdHistory.length - 1];
  const signalLine = calculateEMA(macdHistory, signalPeriod);
  const histogram = signalLine !== null ? macdLine - signalLine : null;

  return {
    line: Number(macdLine.toFixed(2)),
    signal: signalLine !== null ? Number(signalLine.toFixed(2)) : null,
    histogram: histogram !== null ? Number(histogram.toFixed(2)) : null,
  };
}

/**
 * Calculates Bollinger Bands (default 20 period, 2 std dev)
 */
export function calculateBollingerBands(
  closes: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): { upper: number | null; middle: number | null; lower: number | null } {
  if (closes.length < period) {
    return { upper: null, middle: null, lower: null };
  }

  const sma = calculateSMA(closes, period);
  if (sma === null) return { upper: null, middle: null, lower: null };

  const slice = closes.slice(closes.length - period);
  const variance = slice.reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  return {
    upper: Number((sma + stdDevMultiplier * stdDev).toFixed(2)),
    middle: Number(sma.toFixed(2)),
    lower: Number((sma - stdDevMultiplier * stdDev).toFixed(2)),
  };
}

/**
 * Calculates Average True Range (ATR, default 14 period)
 */
export function calculateATR(data: OHLCV[], period: number = 14): number | null {
  if (data.length < period + 1) return null;

  const trValues: number[] = [];
  for (let i = 1; i < data.length; i++) {
    const current = data[i];
    const prev = data[i - 1];
    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - prev.close),
      Math.abs(current.low - prev.close)
    );
    trValues.push(tr);
  }

  return calculateSMA(trValues, period);
}

/**
 * Calculates Stochastic Oscillator (%K and %D)
 */
export function calculateStochastic(
  data: OHLCV[],
  periodK: number = 14,
  periodD: number = 3
): { k: number | null; d: number | null } {
  if (data.length < periodK + periodD) {
    return { k: null, d: null };
  }

  const kValues: number[] = [];
  for (let i = periodK; i <= data.length; i++) {
    const window = data.slice(i - periodK, i);
    const highestHigh = Math.max(...window.map((d) => d.high));
    const lowestLow = Math.min(...window.map((d) => d.low));
    const currentClose = window[window.length - 1].close;

    const k = highestHigh === lowestLow ? 50 : ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    kValues.push(k);
  }

  const latestK = kValues[kValues.length - 1];
  const d = calculateSMA(kValues, periodD);

  return {
    k: Number(latestK.toFixed(2)),
    d: d !== null ? Number(d.toFixed(2)) : null,
  };
}

/**
 * Calculates ADX (Average Directional Index, period 14)
 */
export function calculateADX(data: OHLCV[], period: number = 14): number | null {
  if (data.length < period * 2) return 25.0; // fallback reasonable default

  let plusDM = 0;
  let minusDM = 0;
  let trSum = 0;

  for (let i = 1; i < data.length; i++) {
    const highDiff = data[i].high - data[i - 1].high;
    const lowDiff = data[i - 1].low - data[i].low;

    plusDM += highDiff > lowDiff && highDiff > 0 ? highDiff : 0;
    minusDM += lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0;

    const tr = Math.max(
      data[i].high - data[i].low,
      Math.abs(data[i].high - data[i - 1].close),
      Math.abs(data[i].low - data[i - 1].close)
    );
    trSum += tr;
  }

  if (trSum === 0) return 20.0;
  const plusDI = (plusDM / trSum) * 100;
  const minusDI = (minusDM / trSum) * 100;
  const diSum = plusDI + minusDI;
  const dx = diSum === 0 ? 0 : (Math.abs(plusDI - minusDI) / diSum) * 100;

  return Number(Math.min(100, Math.max(0, dx)).toFixed(2));
}

/**
 * Calculates On-Balance Volume (OBV)
 */
export function calculateOBV(data: OHLCV[]): number {
  if (data.length === 0) return 0;
  let obv = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i].close > data[i - 1].close) {
      obv += data[i].volume;
    } else if (data[i].close < data[i - 1].close) {
      obv -= data[i].volume;
    }
  }
  return obv;
}
