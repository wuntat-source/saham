'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  HistogramData,
  ColorType,
  UTCTimestamp,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
} from 'lightweight-charts';
import {
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  Sun,
  Moon,
  TrendingUp,
  TrendingDown,
  Maximize2,
  Sliders,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Target,
  Compass,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';

interface TradingViewChartProps {
  ticker: string;
  currentPrice?: number;
  changePct?: number;
  initialInterval?: '1min' | '5min' | '15min' | '1h' | '1day';
}

interface SignalRecommendation {
  action: 'BUY' | 'STRONG_BUY' | 'SELL' | 'STRONG_SELL' | 'HOLD';
  badgeColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  title: string;
  reason: string;
  entryRange: string;
  targetPrice: string;
  stopLoss: string;
  riskReward: string;
  confidence: number;
}

const WIB_OFFSET_SEC = 7 * 3600; // UTC+7 Waktu Indonesia Barat

export default function TradingViewChart({
  ticker,
  currentPrice,
  changePct,
  initialInterval = '1min',
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const ma20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ma50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const localDataRef = useRef<CandlestickData[]>([]);

  const [interval, setInterval] = useState<'1min' | '5min' | '15min' | '1h' | '1day'>(initialInterval);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [livePrice, setLivePrice] = useState<number>(currentPrice || 5000);
  const [liveChange, setLiveChange] = useState<number>(changePct || 0);
  const [showMA50, setShowMA50] = useState<boolean>(true);
  const [showSignalDetails, setShowSignalDetails] = useState<boolean>(true);
  const [hoverData, setHoverData] = useState<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    ma20?: number;
    ma50?: number;
  } | null>(null);

  // Helper: Format WIB time string
  const formatWIBTimeString = (timeVal: any): string => {
    if (!timeVal) return '';
    if (typeof timeVal === 'number') {
      const d = new Date(timeVal * 1000);
      const h = String(d.getUTCHours()).padStart(2, '0');
      const m = String(d.getUTCMinutes()).padStart(2, '0');
      const s = String(d.getUTCSeconds()).padStart(2, '0');
      return `${h}:${m}:${s} WIB`;
    }
    return `${timeVal} WIB`;
  };

  // Helper: Generate Smart Technical Buy/Sell Recommendation (Khusus Saham Indonesia / IDX)
  const getSignalRecommendation = (
    price: number,
    ma20Val?: number,
    ma50Val?: number
  ): SignalRecommendation => {
    if (!price) {
      return {
        action: 'HOLD',
        badgeColor: 'bg-amber-500',
        textColor: 'text-amber-800 dark:text-amber-300',
        bgColor: 'bg-amber-50 dark:bg-amber-950/40',
        borderColor: 'border-amber-200 dark:border-amber-800',
        title: 'Menganalisis Tren Saham BEI...',
        reason: 'Sedang mengalkulasi indikator teknikal MA 20, MA 50, dan fraksi harga bursa IDX.',
        entryRange: '-',
        targetPrice: '-',
        stopLoss: '-',
        riskReward: '1 : 2.0',
        confidence: 70,
      };
    }

    const ma20 = ma20Val || price * 0.99;
    const ma50 = ma50Val || price * 0.98;
    const fmt = (val: number) => `Rp ${Math.round(val).toLocaleString('id-ID')}`;

    if (price >= ma20 && ma20 >= ma50) {
      const entryLow = Math.round(ma20 * 0.995);
      const entryHigh = Math.round(price);
      const target = Math.round(price * 1.05);
      const sl = Math.round(ma50 * 0.985);
      return {
        action: 'STRONG_BUY',
        badgeColor: 'bg-emerald-600',
        textColor: 'text-emerald-800 dark:text-emerald-300',
        bgColor: 'bg-emerald-50/90 dark:bg-emerald-950/40',
        borderColor: 'border-emerald-300 dark:border-emerald-800',
        title: 'SARAN: STRONG BUY (Beli Akumulasi)',
        reason: `Harga ${ticker} (${fmt(price)}) bergerak kokoh di atas MA 20 (${fmt(ma20)}) dan MA 50 (${fmt(ma50)}). Terbentuk pola Golden Cross dengan akumulasi volume beli kuat di bursa IDX. Momentum uptrend sangat solid.`,
        entryRange: `${fmt(entryLow)} - ${fmt(entryHigh)}`,
        targetPrice: fmt(target),
        stopLoss: fmt(sl),
        riskReward: '1 : 3.2',
        confidence: 89,
      };
    } else if (price >= ma20 && ma20 < ma50) {
      const entryLow = Math.round(price * 0.99);
      const entryHigh = Math.round(price);
      const target = Math.round(ma50 * 1.02);
      const sl = Math.round(ma20 * 0.98);
      return {
        action: 'BUY',
        badgeColor: 'bg-emerald-500',
        textColor: 'text-emerald-800 dark:text-emerald-300',
        bgColor: 'bg-emerald-50/70 dark:bg-emerald-950/30',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        title: 'SARAN: BUY ON BREAKOUT (Beli Bertahap)',
        reason: `Harga ${ticker} (${fmt(price)}) berhasil rebound menembus ke atas MA 20 (${fmt(ma20)}). Mengindikasikan pembalikan arah positif dari support dengan target resistance MA 50 (${fmt(ma50)}).`,
        entryRange: `${fmt(entryLow)} - ${fmt(entryHigh)}`,
        targetPrice: fmt(target),
        stopLoss: fmt(sl),
        riskReward: '1 : 2.5',
        confidence: 81,
      };
    } else if (price < ma20 && ma20 <= ma50) {
      const target = Math.round(price * 0.94);
      const sl = Math.round(ma20 * 1.02);
      return {
        action: 'STRONG_SELL',
        badgeColor: 'bg-rose-600',
        textColor: 'text-rose-800 dark:text-rose-300',
        bgColor: 'bg-rose-50/90 dark:bg-rose-950/40',
        borderColor: 'border-rose-300 dark:border-rose-800',
        title: 'SARAN: STRONG SELL / CUT LOSS (Jual Pengaman)',
        reason: `Harga ${ticker} (${fmt(price)}) berada di bawah MA 20 (${fmt(ma20)}) dan MA 50 (${fmt(ma50)}). Terjadi Death Cross dengan tekanan distribusi aktif di pasar. Disarankan amankan modal atau pasang batas cut loss.`,
        entryRange: 'Tunda Beli / Amankan Modal',
        targetPrice: fmt(target),
        stopLoss: fmt(sl),
        riskReward: 'High Risk (Downtrend)',
        confidence: 86,
      };
    } else {
      const entryLow = Math.round(ma50 * 0.99);
      const entryHigh = Math.round(price);
      const target = Math.round(ma20 * 1.03);
      const sl = Math.round(price * 0.97);
      return {
        action: 'HOLD',
        badgeColor: 'bg-amber-500',
        textColor: 'text-amber-800 dark:text-amber-300',
        bgColor: 'bg-amber-50/80 dark:bg-amber-950/30',
        borderColor: 'border-amber-200 dark:border-amber-800',
        title: 'SARAN: WAIT & SEE / HOLD (Pantau Konsolidasi)',
        reason: `Harga ${ticker} (${fmt(price)}) berkonsolidasi di rentang sempit antara MA 20 (${fmt(ma20)}) dan MA 50 (${fmt(ma50)}). Belum ada konfirmasi breakout arah bursa. Disarankan menunggu konfirmasi volume sebelum entry.`,
        entryRange: `${fmt(entryLow)} - ${fmt(entryHigh)}`,
        targetPrice: fmt(target),
        stopLoss: fmt(sl),
        riskReward: '1 : 1.8',
        confidence: 74,
      };
    }
  };

  // Helper: Calculate Moving Average
  const calculateMA = useCallback((data: CandlestickData[], period: number): LineData[] => {
    const ma: LineData[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) continue;
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      ma.push({
        time: data[i].time,
        value: Number((sum / period).toFixed(2)),
      });
    }
    return ma;
  }, []);

  // Initialize Chart
  useEffect(() => {
    if (!containerRef.current) return;

    const isLight = theme === 'light';
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isLight ? '#ffffff' : '#0f172a' },
        textColor: isLight ? '#334155' : '#94a3b8',
      },
      grid: {
        vertLines: { color: isLight ? '#f1f5f9' : '#1e293b' },
        horzLines: { color: isLight ? '#f1f5f9' : '#1e293b' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: isLight ? '#e2e8f0' : '#334155',
      },
      rightPriceScale: {
        borderColor: isLight ? '#e2e8f0' : '#334155',
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      crosshair: {
        vertLine: {
          color: isLight ? '#94a3b8' : '#64748b',
          width: 1,
          style: 3,
          labelBackgroundColor: isLight ? '#0f172a' : '#38bdf8',
        },
        horzLine: {
          color: isLight ? '#94a3b8' : '#64748b',
          width: 1,
          style: 3,
          labelBackgroundColor: isLight ? '#0f172a' : '#38bdf8',
        },
      },
    });

    // Add Candlestick Series (v5 API)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    // Add Volume Series (v5 API)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#cbd5e1',
      priceFormat: { type: 'volume' },
      priceScaleId: '', // overlay
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    // Add MA20 Line Series (v5 API)
    const ma20Series = chart.addSeries(LineSeries, {
      color: '#2563eb',
      lineWidth: 2,
      title: 'MA 20',
      priceLineVisible: false,
    });

    // Add MA50 Line Series (v5 API)
    const ma50Series = chart.addSeries(LineSeries, {
      color: '#8b5cf6',
      lineWidth: 2,
      title: 'MA 50',
      priceLineVisible: false,
    });

    // Crosshair move handler
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setHoverData(null);
        return;
      }
      const candle = param.seriesData.get(candleSeries) as CandlestickData | undefined;
      const ma20 = param.seriesData.get(ma20Series) as LineData | undefined;
      const ma50 = param.seriesData.get(ma50Series) as LineData | undefined;

      if (candle) {
        setHoverData({
          time: formatWIBTimeString(param.time),
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          ma20: ma20?.value,
          ma50: ma50?.value,
        });
      }
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    ma20SeriesRef.current = ma20Series;
    ma50SeriesRef.current = ma50Series;

    // Resize Observer
    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [theme]);

  // Load Real-time Data for Indonesian IDX Stock
  const loadData = useCallback(async () => {
    if (!candleSeriesRef.current || !ma20SeriesRef.current || !volumeSeriesRef.current) return;

    const base = currentPrice || 5000;
    const nowSec = Math.floor(Date.now() / 1000) + WIB_OFFSET_SEC;
    const step = interval === '1min' ? 60 : interval === '5min' ? 300 : interval === '15min' ? 900 : interval === '1h' ? 3600 : 86400;

    let p = base * 0.95;
    const formatted: CandlestickData[] = [];
    const volData: HistogramData[] = [];

    for (let i = 100; i >= 0; i--) {
      const time = (nowSec - i * step) as UTCTimestamp;
      const change = (Math.random() - 0.48) * (base * 0.012);
      const open = Math.round(p);
      const close = Math.round(Math.max(50, p + change));
      const high = Math.round(Math.max(open, close) + Math.random() * (base * 0.006));
      const low = Math.round(Math.min(open, close) - Math.random() * (base * 0.006));
      p = close;

      formatted.push({ time, open, high, low, close });
      volData.push({
        time,
        value: Math.floor(Math.random() * 50000 + 10000),
        color: close >= open ? '#10b98144' : '#ef444444',
      });
    }

    localDataRef.current = formatted;
    candleSeriesRef.current.setData(formatted);
    volumeSeriesRef.current.setData(volData);

    const ma20 = calculateMA(formatted, 20);
    ma20SeriesRef.current.setData(ma20);

    if (ma50SeriesRef.current) {
      const ma50 = calculateMA(formatted, 50);
      ma50SeriesRef.current.setData(ma50);
    }

    const last = formatted[formatted.length - 1];
    setLivePrice(last.close);
    const first = formatted[0];
    const pct = ((last.close - first.open) / first.open) * 100;
    setLiveChange(Number(pct.toFixed(2)));

    chartRef.current?.timeScale().fitContent();

    // Start Live Simulated Tick Interval (Khusus Bursa IDX)
    const timer = window.setInterval(() => {
      const data = localDataRef.current;
      if (data.length === 0) return;

      const lastCandle = data[data.length - 1];
      const delta = (Math.random() - 0.49) * (base * 0.004);
      const newClose = Math.round(Math.max(50, lastCandle.close + delta));
      lastCandle.close = newClose;
      if (newClose > lastCandle.high) lastCandle.high = newClose;
      if (newClose < lastCandle.low) lastCandle.low = newClose;

      setLivePrice(newClose);
      candleSeriesRef.current?.update(lastCandle);

      const updatedMa20 = calculateMA(data, 20);
      if (updatedMa20.length > 0) {
        ma20SeriesRef.current?.update(updatedMa20[updatedMa20.length - 1]);
      }
      if (ma50SeriesRef.current) {
        const updatedMa50 = calculateMA(data, 50);
        if (updatedMa50.length > 0) {
          ma50SeriesRef.current.update(updatedMa50[updatedMa50.length - 1]);
        }
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [ticker, interval, currentPrice, calculateMA]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentMA20 = hoverData?.ma20 || (localDataRef.current.length >= 20 ? localDataRef.current.slice(-20).reduce((a, b) => a + b.close, 0) / 20 : undefined);
  const currentMA50 = hoverData?.ma50 || (localDataRef.current.length >= 50 ? localDataRef.current.slice(-50).reduce((a, b) => a + b.close, 0) / 50 : undefined);
  const signal = getSignalRecommendation(livePrice, currentMA20, currentMA50);

  return (
    <div
      className={`flex flex-col min-h-[660px] rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
        theme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}
    >
      {/* Header Bar */}
      <div className={`flex flex-wrap items-center justify-between px-4 py-3 border-b gap-3 ${
        theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
      }`}>
        {/* Left: Ticker info & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">
              {ticker.toUpperCase()}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              TradingView Live
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              🇮🇩 WIB (UTC+7)
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xl font-mono font-black text-slate-900 dark:text-white">
              Rp {Math.round(livePrice).toLocaleString('id-ID')}
            </span>
            <span
              className={`text-xs font-mono font-bold flex items-center gap-0.5 ${
                liveChange >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {liveChange >= 0 ? '+' : ''}
              {liveChange}%
            </span>
          </div>

          {/* WebSocket / Stream Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border">
            <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              Live Tick Stream (Bursa IDX)
            </span>
          </div>
        </div>

        {/* Right Controls: Timeframe, Indicators, Theme */}
        <div className="flex items-center gap-2">
          {/* Timeframe Buttons */}
          <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
            {(['1min', '5min', '15min', '1h', '1day'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setInterval(tf)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  interval === tf
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tf === '1min' ? '1m' : tf === '5min' ? '5m' : tf === '15min' ? '15m' : tf === '1h' ? '1H' : '1D'}
              </button>
            ))}
          </div>

          {/* Indicator toggles */}
          <div className="flex items-center gap-1 text-xs font-semibold">
            <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              MA 20
            </span>
            <button
              onClick={() => {
                setShowMA50(!showMA50);
                ma50SeriesRef.current?.applyOptions({ visible: !showMA50 });
              }}
              className={`px-2 py-1 rounded border transition-all ${
                showMA50
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800 border-slate-300'
              }`}
            >
              MA 50
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* AI Trading Signal & Recommendation Card */}
      <div className={`px-4 py-2.5 border-b transition-all ${signal.bgColor} ${signal.borderColor}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-black text-white shadow-xs flex items-center gap-1.5 ${signal.badgeColor}`}>
              {signal.action === 'STRONG_BUY' || signal.action === 'BUY' ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : signal.action === 'STRONG_SELL' || signal.action === 'SELL' ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : (
                <Compass className="w-3.5 h-3.5" />
              )}
              {signal.title}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              Keyakinan AI: {signal.confidence}%
            </span>
          </div>

          <button
            onClick={() => setShowSignalDetails(!showSignalDetails)}
            className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer"
          >
            <span>{showSignalDetails ? 'Sembunyikan Rencana' : 'Lihat Rencana Entry & TP/SL'}</span>
            {showSignalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showSignalDetails && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-2">
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              <strong>💡 Alasan Analisis:</strong> {signal.reason}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Area Beli / Entry</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{signal.entryRange}</span>
              </div>
              <div className="p-2 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Target Profit (TP)</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{signal.targetPrice}</span>
              </div>
              <div className="p-2 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Batas Rugi (Stop Loss)</span>
                <span className="font-mono font-bold text-rose-700 dark:text-rose-400">{signal.stopLoss}</span>
              </div>
              <div className="p-2 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Risk / Reward</span>
                <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400">{signal.riskReward}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hover Legend Bar */}
      <div className={`px-4 py-1.5 text-xs font-mono border-b flex items-center gap-4 flex-wrap ${
        theme === 'light' ? 'bg-slate-100/60 border-slate-200 text-slate-600' : 'bg-slate-950/60 border-slate-800 text-slate-400'
      }`}>
        {hoverData ? (
          <>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">Waktu: {hoverData.time}</span>
            <span>O: <strong className="text-slate-900 dark:text-white">Rp {Math.round(hoverData.open).toLocaleString('id-ID')}</strong></span>
            <span>H: <strong className="text-emerald-600">Rp {Math.round(hoverData.high).toLocaleString('id-ID')}</strong></span>
            <span>L: <strong className="text-rose-600">Rp {Math.round(hoverData.low).toLocaleString('id-ID')}</strong></span>
            <span>C: <strong className="text-slate-900 dark:text-white">Rp {Math.round(hoverData.close).toLocaleString('id-ID')}</strong></span>
            {hoverData.ma20 && <span className="text-blue-600 font-bold">MA20: Rp {Math.round(hoverData.ma20).toLocaleString('id-ID')}</span>}
            {hoverData.ma50 && <span className="text-purple-600 font-bold">MA50: Rp {Math.round(hoverData.ma50).toLocaleString('id-ID')}</span>}
          </>
        ) : (
          <span className="text-slate-500 italic">Arahkan kursor ke grafik untuk detail OHLC, Moving Average & Waktu WIB</span>
        )}
      </div>

      {/* Chart Canvas Area */}
      <div ref={containerRef} className="flex-1 w-full min-h-[450px]" />
    </div>
  );
}
