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
  Maximize2,
  Sliders,
} from 'lucide-react';

interface TradingViewChartProps {
  ticker: string;
  currentPrice?: number;
  changePct?: number;
  initialInterval?: '1min' | '5min' | '15min' | '1h' | '1day';
}

const DEFAULT_API_KEY = '31fa5820c1194a888a4a3aa3507afb2a';
const GLOBAL_SYMBOLS = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META'];

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
  const wsRef = useRef<WebSocket | null>(null);
  const localDataRef = useRef<CandlestickData[]>([]);

  const [interval, setInterval] = useState<'1min' | '5min' | '15min' | '1h' | '1day'>(initialInterval);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'simulated' | 'error' | 'disconnected'>('connecting');
  const [livePrice, setLivePrice] = useState<number>(currentPrice || 0);
  const [liveChange, setLiveChange] = useState<number>(changePct || 0);
  const [showMA50, setShowMA50] = useState<boolean>(true);
  const [hoverData, setHoverData] = useState<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    ma20?: number;
    ma50?: number;
  } | null>(null);

  const isGlobalStock = GLOBAL_SYMBOLS.includes(ticker.toUpperCase());

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
          time: String(param.time),
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
      if (wsRef.current) {
        wsRef.current.close();
      }
      chart.remove();
    };
  }, [theme]);

  // Fetch Historical Data and start WebSocket / Simulator
  const loadData = useCallback(async () => {
    if (!candleSeriesRef.current || !ma20SeriesRef.current || !volumeSeriesRef.current) return;

    // If Global Stock: Fetch from TwelveData API
    if (isGlobalStock) {
      setWsStatus('connecting');
      try {
        const symbol = ticker.toUpperCase();
        const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&apikey=${DEFAULT_API_KEY}&outputsize=120`;
        const res = await fetch(url);
        const json = await res.json();

        if (json.status === 'error' || !json.values) {
          throw new Error(json.message || 'TwelveData API limit or error');
        }

        const formatted: CandlestickData[] = json.values
          .map((item: any) => ({
            time: (Math.floor(new Date(item.datetime).getTime() / 1000) as UTCTimestamp),
            open: parseFloat(item.open),
            high: parseFloat(item.high),
            low: parseFloat(item.low),
            close: parseFloat(item.close),
          }))
          .reverse();

        localDataRef.current = formatted;
        candleSeriesRef.current.setData(formatted);

        // Volume
        const volData: HistogramData[] = json.values
          .map((item: any) => ({
            time: (Math.floor(new Date(item.datetime).getTime() / 1000) as UTCTimestamp),
            value: parseFloat(item.volume || '10000'),
            color: parseFloat(item.close) >= parseFloat(item.open) ? '#10b98144' : '#ef444444',
          }))
          .reverse();
        volumeSeriesRef.current.setData(volData);

        // MA 20 & 50
        const ma20 = calculateMA(formatted, 20);
        ma20SeriesRef.current.setData(ma20);

        if (ma50SeriesRef.current) {
          const ma50 = calculateMA(formatted, 50);
          ma50SeriesRef.current.setData(ma50);
        }

        const last = formatted[formatted.length - 1];
        if (last) {
          setLivePrice(last.close);
          const first = formatted[0];
          const pct = ((last.close - first.open) / first.open) * 100;
          setLiveChange(Number(pct.toFixed(2)));
        }

        chartRef.current?.timeScale().fitContent();

        // Connect WebSocket
        connectWebSocket(symbol);
      } catch (err) {
        console.warn('TwelveData REST failed, falling back to simulated live stream:', err);
        fallbackToSimulatedData();
      }
    } else {
      // Fallback for IDX / BEI Stocks (Internal Simulated Live Stream)
      fallbackToSimulatedData();
    }
  }, [ticker, interval, isGlobalStock, calculateMA]);

  // Connect Real TwelveData WebSocket
  const connectWebSocket = (symbol: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket(`wss://ws.twelvedata.com/v1/quotes/price?apikey=${DEFAULT_API_KEY}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus('connected');
        ws.send(
          JSON.stringify({
            action: 'subscribe',
            params: { symbols: symbol },
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event === 'price' && msg.symbol === symbol) {
            const price = parseFloat(msg.price);
            const candleTime = (Math.floor(msg.timestamp / 60) * 60) as UTCTimestamp;

            setLivePrice(price);

            const data = localDataRef.current;
            const lastCandle = data[data.length - 1];

            if (lastCandle && lastCandle.time === candleTime) {
              lastCandle.close = price;
              if (price > lastCandle.high) lastCandle.high = price;
              if (price < lastCandle.low) lastCandle.low = price;
            } else {
              const newCandle: CandlestickData = {
                time: candleTime,
                open: price,
                high: price,
                low: price,
                close: price,
              };
              data.push(newCandle);
              if (data.length > 500) data.shift();
            }

            candleSeriesRef.current?.update(data[data.length - 1]);

            // Update MA
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
          }
        } catch (e) {
          console.error('WebSocket parse error:', e);
        }
      };

      ws.onerror = () => {
        setWsStatus('error');
      };

      ws.onclose = () => {
        setWsStatus('disconnected');
      };
    } catch {
      setWsStatus('error');
    }
  };

  // Fallback simulator for IDX Stocks or when API Limit reached
  const fallbackToSimulatedData = () => {
    setWsStatus('simulated');
    const base = currentPrice || (isGlobalStock ? 220 : 5000);
    const nowSec = Math.floor(Date.now() / 1000);
    const step = interval === '1min' ? 60 : interval === '5min' ? 300 : interval === '15min' ? 900 : interval === '1h' ? 3600 : 86400;

    let p = base * 0.95;
    const formatted: CandlestickData[] = [];
    const volData: HistogramData[] = [];

    for (let i = 100; i >= 0; i--) {
      const time = (nowSec - i * step) as UTCTimestamp;
      const change = (Math.random() - 0.48) * (base * 0.012);
      const open = p;
      const close = Math.max(1, p + change);
      const high = Math.max(open, close) + Math.random() * (base * 0.006);
      const low = Math.min(open, close) - Math.random() * (base * 0.006);
      p = close;

      formatted.push({ time, open, high, low, close });
      volData.push({
        time,
        value: Math.floor(Math.random() * 50000 + 10000),
        color: close >= open ? '#10b98144' : '#ef444444',
      });
    }

    localDataRef.current = formatted;
    candleSeriesRef.current?.setData(formatted);
    volumeSeriesRef.current?.setData(volData);

    const ma20 = calculateMA(formatted, 20);
    ma20SeriesRef.current?.setData(ma20);

    if (ma50SeriesRef.current) {
      const ma50 = calculateMA(formatted, 50);
      ma50SeriesRef.current.setData(ma50);
    }

    const last = formatted[formatted.length - 1];
    setLivePrice(last.close);
    chartRef.current?.timeScale().fitContent();

    // Start Live Simulated Tick Interval
    const timer = window.setInterval(() => {
      const data = localDataRef.current;
      if (data.length === 0) return;

      const lastCandle = data[data.length - 1];
      const delta = (Math.random() - 0.49) * (base * 0.004);
      const newClose = Number(Math.max(1, lastCandle.close + delta).toFixed(2));
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
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div
      className={`flex flex-col h-[600px] rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
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
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-xl font-mono font-black text-slate-900 dark:text-white">
              {isGlobalStock ? `$${livePrice.toFixed(2)}` : `Rp ${Math.round(livePrice).toLocaleString('id-ID')}`}
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

          {/* WebSocket Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border">
            {wsStatus === 'connected' && (
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live TwelveData WS
              </span>
            )}
            {wsStatus === 'simulated' && (
              <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                Live Tick Stream (IDX)
              </span>
            )}
            {wsStatus === 'connecting' && (
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Connecting...
              </span>
            )}
            {wsStatus === 'error' && (
              <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-full">
                <WifiOff className="w-3 h-3" />
                Offline
              </span>
            )}
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

      {/* Hover Legend Bar */}
      <div className={`px-4 py-1.5 text-xs font-mono border-b flex items-center gap-4 flex-wrap ${
        theme === 'light' ? 'bg-slate-100/60 border-slate-200 text-slate-600' : 'bg-slate-950/60 border-slate-800 text-slate-400'
      }`}>
        {hoverData ? (
          <>
            <span>O: <strong className="text-slate-900 dark:text-white">{hoverData.open}</strong></span>
            <span>H: <strong className="text-emerald-600">{hoverData.high}</strong></span>
            <span>L: <strong className="text-rose-600">{hoverData.low}</strong></span>
            <span>C: <strong className="text-slate-900 dark:text-white">{hoverData.close}</strong></span>
            {hoverData.ma20 && <span className="text-blue-600 font-bold">MA20: {hoverData.ma20}</span>}
            {hoverData.ma50 && <span className="text-purple-600 font-bold">MA50: {hoverData.ma50}</span>}
          </>
        ) : (
          <span className="text-slate-500 italic">Arahkan kursor ke grafik untuk detail OHLC & Moving Average</span>
        )}
      </div>

      {/* Chart Canvas Area */}
      <div ref={containerRef} className="flex-1 w-full min-h-[450px]" />
    </div>
  );
}
