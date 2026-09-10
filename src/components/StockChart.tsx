'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CandleData } from '@/lib/market';
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  RefreshCw,
  CandlestickChart,
  LineChart as LineChartIcon,
  Sun,
  Moon,
  Layers,
} from 'lucide-react';
import {
  ChartBounds,
  ChartPoint,
  ChartTheme,
  ChartType,
  DrawingElement,
  IndicatorConfig,
  ToolType,
} from './chart/types';
import { calculateIndicators, IndicatorData } from './chart/indicators';
import {
  dataToScreen,
  renderDrawings,
  screenToData,
} from './chart/drawing-engine';
import ChartDrawingToolbar from './chart/ChartDrawingToolbar';
import ChartIndicatorMenu from './chart/ChartIndicatorMenu';
import TradingViewChart from './TradingViewChart';

interface StockChartProps {
  ticker: string;
  currentPrice: number;
  changePct: number;
}

export default function StockChart({ ticker, currentPrice, changePct }: StockChartProps) {
  const [engineMode, setEngineMode] = useState<'tradingview' | 'pro_draw'>('tradingview');
  const [range, setRange] = useState<'1m' | '15m' | '1h' | '1D' | '1W' | '1M'>('15m');
  const [chartType, setChartType] = useState<ChartType>('candles');
  const [theme, setTheme] = useState<ChartTheme>('light'); // Default to light theme as requested
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);

  // Drawing Tools State
  const [activeTool, setActiveTool] = useState<ToolType>('cursor');
  const [currentColor, setCurrentColor] = useState('#059669');
  const [lineWidth, setLineWidth] = useState(2);
  const [drawings, setDrawings] = useState<DrawingElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hideDrawings, setHideDrawings] = useState(false);
  const [activePreview, setActivePreview] = useState<DrawingElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tempPoints, setTempPoints] = useState<ChartPoint[]>([]);

  // Text Prompt Modal State
  const [textModal, setTextModal] = useState<{ isOpen: boolean; point: ChartPoint | null; text: string }>({
    isOpen: false,
    point: null,
    text: '',
  });

  // Indicators State
  const [indicators, setIndicators] = useState<IndicatorConfig>({
    ma9: true,
    ma20: false,
    ema50: false,
    sma200: false,
    bollinger: false,
    rsi: true,
    macd: false,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load Saved Drawings & Theme from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`edutradex_drawings_${ticker}`);
      if (saved) setDrawings(JSON.parse(saved));
      else setDrawings([]);

      const savedTheme = localStorage.getItem('edutradex_chart_theme') as ChartTheme;
      if (savedTheme) setTheme(savedTheme);
    } catch {
      setDrawings([]);
    }
  }, [ticker]);

  // Save Drawings to LocalStorage
  const saveDrawings = useCallback(
    (newDrawings: DrawingElement[]) => {
      setDrawings(newDrawings);
      try {
        localStorage.setItem(`edutradex_drawings_${ticker}`, JSON.stringify(newDrawings));
      } catch (e) {
        console.error('Failed to save drawings:', e);
      }
    },
    [ticker]
  );

  const toggleTheme = () => {
    const nextTheme: ChartTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      localStorage.setItem('edutradex_chart_theme', nextTheme);
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const apiRange = range === '1m' || range === '15m' || range === '1h' ? '1D' : range;
      const res = await fetch(`/api/market/history/${ticker}?range=${apiRange}`);
      if (res.ok) {
        const data = await res.json();
        let fetchedCandles: CandleData[] = data.candles || [];

        if (range === '15m' && fetchedCandles.length > 0) {
          fetchedCandles = fetchedCandles.map((c, i) => ({
            ...c,
            time: `15m-${i + 1}`,
          }));
        }
        setCandles(fetchedCandles);
      }
    } catch (e) {
      console.error('Error fetching history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [ticker, range]);

  // Canvas Candlestick & Drawing Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI setup
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const isLight = theme === 'light';

    // Clear Canvas with Background
    ctx.fillStyle = isLight ? '#ffffff' : '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Layout configuration
    const hasSubChart = indicators.rsi || indicators.macd;
    const padding = { top: 25, right: 65, bottom: 30, left: 10 };
    const availableHeight = height - padding.top - padding.bottom;

    const mainChartHeight = hasSubChart ? availableHeight * 0.58 : availableHeight * 0.76;
    const volumeHeight = hasSubChart ? availableHeight * 0.14 : availableHeight * 0.20;
    const subChartHeight = hasSubChart ? availableHeight * 0.24 : 0;

    const volumeTop = padding.top + mainChartHeight + 8;
    const subChartTop = volumeTop + volumeHeight + 12;

    // Price Bounds
    let minPrice = Math.min(...candles.map((c) => c.low));
    let maxPrice = Math.max(...candles.map((c) => c.high));
    const priceRange = maxPrice - minPrice || 1;
    minPrice -= priceRange * 0.04;
    maxPrice += priceRange * 0.04;

    const bounds: ChartBounds = {
      minPrice,
      maxPrice,
      chartWidth: width - padding.left - padding.right,
      chartHeight: mainChartHeight,
      paddingTop: padding.top,
      paddingLeft: padding.left,
      candleCount: candles.length,
      theme,
    };

    // Calculate Indicators
    const indicatorData: IndicatorData = calculateIndicators(candles);

    // 1. Draw Grid Lines & Price Labels
    ctx.strokeStyle = isLight ? '#f1f5f9' : '#1e293b';
    ctx.lineWidth = 1;
    ctx.font = 'bold 9.5px monospace';
    ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
    ctx.textAlign = 'left';

    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const y = padding.top + (mainChartHeight / gridSteps) * i;
      const price = maxPrice - (i / gridSteps) * (maxPrice - minPrice);

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + bounds.chartWidth, y);
      ctx.stroke();

      ctx.fillText(Math.round(price).toLocaleString('id-ID'), padding.left + bounds.chartWidth + 6, y + 3.5);
    }

    const candleCount = candles.length;
    const stepX = bounds.chartWidth / candleCount;
    const candleWidth = Math.max(3.5, stepX * 0.65);
    const maxVolume = Math.max(...candles.map((c) => c.volume)) || 1;

    // 2. Bollinger Bands Fill & Lines
    if (indicators.bollinger) {
      ctx.save();
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < candleCount; i++) {
        const u = indicatorData.bollinger.upper[i];
        if (u !== null) {
          const pt = dataToScreen({ index: i, time: '', price: u }, bounds);
          if (!started) {
            ctx.moveTo(pt.x, pt.y);
            started = true;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
      }
      for (let i = candleCount - 1; i >= 0; i--) {
        const l = indicatorData.bollinger.lower[i];
        if (l !== null) {
          const pt = dataToScreen({ index: i, time: '', price: l }, bounds);
          ctx.lineTo(pt.x, pt.y);
        }
      }
      ctx.closePath();
      ctx.fillStyle = isLight ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.12)';
      ctx.fill();

      // Upper & Lower borders
      ctx.strokeStyle = isLight ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    // 3. Draw Candlesticks / Line / Bars & Volume
    const bullColor = isLight ? '#089981' : '#10b981'; // TradingView Light Emerald vs Dark
    const bearColor = isLight ? '#f23645' : '#f43f5e'; // TradingView Light Crimson vs Dark

    candles.forEach((c, i) => {
      const x = padding.left + i * stepX + stepX / 2;
      const isGreen = c.close >= c.open;

      const openY = padding.top + ((maxPrice - c.open) / (maxPrice - minPrice)) * mainChartHeight;
      const closeY = padding.top + ((maxPrice - c.close) / (maxPrice - minPrice)) * mainChartHeight;
      const highY = padding.top + ((maxPrice - c.high) / (maxPrice - minPrice)) * mainChartHeight;
      const lowY = padding.top + ((maxPrice - c.low) / (maxPrice - minPrice)) * mainChartHeight;

      const color = isGreen ? bullColor : bearColor;

      if (chartType === 'candles') {
        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Body
        ctx.fillStyle = color;
        const bodyY = Math.min(openY, closeY);
        const bodyHeight = Math.max(2, Math.abs(openY - closeY));
        ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight);
      } else if (chartType === 'bars') {
        // OHLC Bar
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        // Open tick left
        ctx.moveTo(x - candleWidth / 2, openY);
        ctx.lineTo(x, openY);
        // Close tick right
        ctx.moveTo(x, closeY);
        ctx.lineTo(x + candleWidth / 2, closeY);
        ctx.stroke();
      }

      // Volume Bar
      const vHeight = (c.volume / maxVolume) * volumeHeight;
      const vY = volumeTop + volumeHeight - vHeight;
      ctx.fillStyle = isGreen
        ? isLight ? 'rgba(8, 153, 129, 0.25)' : 'rgba(16, 185, 129, 0.28)'
        : isLight ? 'rgba(242, 54, 69, 0.25)' : 'rgba(244, 63, 94, 0.28)';
      ctx.fillRect(x - candleWidth / 2, vY, candleWidth, vHeight);

      // Time labels
      if (i % Math.ceil(candleCount / 6) === 0 || i === candleCount - 1) {
        ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText(c.time, x, height - 10);
      }
    });

    // Line Chart Path
    if (chartType === 'line') {
      ctx.save();
      ctx.strokeStyle = isLight ? '#0284c7' : '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      candles.forEach((c, i) => {
        const x = padding.left + i * stepX + stepX / 2;
        const closeY = padding.top + ((maxPrice - c.close) / (maxPrice - minPrice)) * mainChartHeight;
        if (i === 0) ctx.moveTo(x, closeY);
        else ctx.lineTo(x, closeY);
      });
      ctx.stroke();
      ctx.restore();
    }

    // 4. Moving Averages Overlay
    const drawLineIndicator = (values: (number | null)[], strokeColor: string, lineW: number = 1.5) => {
      ctx.save();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineW;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < candleCount; i++) {
        const val = values[i];
        if (val !== null) {
          const pt = dataToScreen({ index: i, time: '', price: val }, bounds);
          if (!started) {
            ctx.moveTo(pt.x, pt.y);
            started = true;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
      }
      ctx.stroke();
      ctx.restore();
    };

    if (indicators.ma9) drawLineIndicator(indicatorData.ma9, isLight ? '#0284c7' : '#22d3ee', 1.5); // Cyan/Blue MA 9
    if (indicators.ma20) drawLineIndicator(indicatorData.ma20, isLight ? '#d97706' : '#fbbf24', 1.5); // Amber MA 20
    if (indicators.ema50) drawLineIndicator(indicatorData.ema50, isLight ? '#7c3aed' : '#c084fc', 1.5); // Purple EMA 50
    if (indicators.sma200) drawLineIndicator(indicatorData.sma200, isLight ? '#dc2626' : '#f43f5e', 2); // Red SMA 200

    // 5. Sub-Chart Panel (RSI or MACD)
    if (hasSubChart) {
      // Sub-chart box background
      ctx.strokeStyle = isLight ? '#e2e8f0' : '#1e293b';
      ctx.strokeRect(padding.left, subChartTop, bounds.chartWidth, subChartHeight);

      if (indicators.rsi) {
        // RSI (14)
        const rsi70Y = subChartTop + subChartHeight * 0.3;
        const rsi30Y = subChartTop + subChartHeight * 0.7;

        // 70 / 30 reference lines
        ctx.strokeStyle = isLight ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.4)';
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(padding.left, rsi70Y);
        ctx.lineTo(padding.left + bounds.chartWidth, rsi70Y);
        ctx.stroke();

        ctx.strokeStyle = isLight ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.4)';
        ctx.beginPath();
        ctx.moveTo(padding.left, rsi30Y);
        ctx.lineTo(padding.left + bounds.chartWidth, rsi30Y);
        ctx.stroke();
        ctx.setLineDash([]);

        // RSI Labels
        ctx.fillStyle = isLight ? '#7c3aed' : '#a855f7';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('RSI (14)', padding.left + 6, subChartTop + 12);
        ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
        ctx.fillText('70', padding.left + bounds.chartWidth + 6, rsi70Y + 3);
        ctx.fillText('30', padding.left + bounds.chartWidth + 6, rsi30Y + 3);

        // RSI Curve
        ctx.strokeStyle = isLight ? '#7c3aed' : '#c084fc';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        let rsiStarted = false;
        for (let i = 0; i < candleCount; i++) {
          const rsiVal = indicatorData.rsi[i];
          if (rsiVal !== null) {
            const x = padding.left + i * stepX + stepX / 2;
            const y = subChartTop + ((100 - rsiVal) / 100) * subChartHeight;
            if (!rsiStarted) {
              ctx.moveTo(x, y);
              rsiStarted = true;
            } else {
              ctx.lineTo(x, y);
            }
          }
        }
        ctx.stroke();
      } else if (indicators.macd) {
        // MACD Panel
        ctx.fillStyle = isLight ? '#089981' : '#10b981';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('MACD (12, 26, 9)', padding.left + 6, subChartTop + 12);

        const midY = subChartTop + subChartHeight / 2;
        ctx.strokeStyle = isLight ? '#cbd5e1' : '#334155';
        ctx.beginPath();
        ctx.moveTo(padding.left, midY);
        ctx.lineTo(padding.left + bounds.chartWidth, midY);
        ctx.stroke();

        for (let i = 0; i < candleCount; i++) {
          const hist = indicatorData.macd.histogram[i];
          if (hist !== null) {
            const x = padding.left + i * stepX + stepX / 2;
            const h = Math.max(1, Math.min(subChartHeight * 0.4, Math.abs(hist) * 2));
            ctx.fillStyle = hist >= 0 ? bullColor : bearColor;
            if (hist >= 0) {
              ctx.fillRect(x - candleWidth / 3, midY - h, candleWidth * 0.65, h);
            } else {
              ctx.fillRect(x - candleWidth / 3, midY, candleWidth * 0.65, h);
            }
          }
        }
      }
    }

    // 6. Render Student Drawing Annotations
    if (!hideDrawings) {
      renderDrawings(ctx, drawings, bounds, selectedId, activePreview);
    }
  }, [candles, chartType, indicators, drawings, selectedId, activePreview, hideDrawings, theme]);

  // Mouse / Canvas Drawing Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'cursor' || candles.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const bounds: ChartBounds = {
      minPrice: Math.min(...candles.map((c) => c.low)),
      maxPrice: Math.max(...candles.map((c) => c.high)),
      chartWidth: rect.width - 75,
      chartHeight: (rect.height - 55) * (indicators.rsi || indicators.macd ? 0.58 : 0.76),
      paddingTop: 25,
      paddingLeft: 10,
      candleCount: candles.length,
      theme,
    };

    const times = candles.map((c) => c.time);
    const startPoint = screenToData(x, y, bounds, times);

    if (activeTool === 'horizontal') {
      const newElem: DrawingElement = {
        id: `h_${Date.now()}`,
        type: 'horizontal',
        points: [startPoint],
        color: currentColor,
        lineWidth,
      };
      saveDrawings([...drawings, newElem]);
      setSelectedId(newElem.id);
      setActiveTool('cursor');
      return;
    }

    if (activeTool === 'text') {
      setTextModal({
        isOpen: true,
        point: startPoint,
        text: '',
      });
      return;
    }

    setIsDrawing(true);
    setTempPoints([startPoint]);
    setActivePreview({
      id: `temp_${Date.now()}`,
      type: activeTool,
      points: [startPoint, startPoint],
      color: currentColor,
      lineWidth,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const bounds: ChartBounds = {
      minPrice: Math.min(...candles.map((c) => c.low)),
      maxPrice: Math.max(...candles.map((c) => c.high)),
      chartWidth: rect.width - 75,
      chartHeight: (rect.height - 55) * (indicators.rsi || indicators.macd ? 0.58 : 0.76),
      paddingTop: 25,
      paddingLeft: 10,
      candleCount: candles.length,
      theme,
    };

    const times = candles.map((c) => c.time);
    const currentPoint = screenToData(x, y, bounds, times);

    if (currentPoint.index >= 0 && currentPoint.index < candles.length) {
      setHoveredCandle(candles[currentPoint.index]);
    }

    if (!isDrawing) return;

    if (activeTool === 'brush') {
      const nextPoints = [...tempPoints, currentPoint];
      setTempPoints(nextPoints);
      setActivePreview({
        id: `temp_${Date.now()}`,
        type: 'brush',
        points: nextPoints,
        color: currentColor,
        lineWidth,
      });
    } else {
      setActivePreview({
        id: `temp_${Date.now()}`,
        type: activeTool,
        points: [tempPoints[0], currentPoint],
        color: currentColor,
        lineWidth,
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !activePreview) return;
    setIsDrawing(false);

    if (activePreview.points.length >= 2) {
      const finalElem: DrawingElement = {
        ...activePreview,
        id: `draw_${Date.now()}`,
      };
      saveDrawings([...drawings, finalElem]);
      setSelectedId(finalElem.id);
    }

    setActivePreview(null);
    setTempPoints([]);
    setActiveTool('cursor');
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          saveDrawings(drawings.filter((d) => d.id !== selectedId));
          setSelectedId(null);
        }
      } else if (e.key === 'Escape') {
        setActiveTool('cursor');
        setActivePreview(null);
        setIsDrawing(false);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (drawings.length > 0) {
          saveDrawings(drawings.slice(0, -1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawings, selectedId, saveDrawings]);

  const activeCandle = hoveredCandle || (candles.length > 0 ? candles[candles.length - 1] : null);
  const isLight = theme === 'light';

  return (
    <div className="flex flex-col gap-3">
      {/* Top Engine Switcher Pill */}
      <div className={`flex flex-wrap items-center justify-between border p-1.5 rounded-2xl shadow-xs transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setEngineMode('tradingview')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              engineMode === 'tradingview'
                ? 'bg-emerald-600 text-white shadow-xs'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            TradingView Live (TwelveData WS)
          </button>
          <button
            onClick={() => setEngineMode('pro_draw')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              engineMode === 'pro_draw'
                ? 'bg-indigo-600 text-white shadow-xs'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Pro Studio Drawing Tools
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono pr-2 hidden sm:block">
          {engineMode === 'tradingview' ? '● Real-time Stream & Indicators' : '● Interactive Drawing Engine'}
        </div>
      </div>

      {engineMode === 'tradingview' ? (
        <TradingViewChart ticker={ticker} currentPrice={currentPrice} changePct={changePct} />
      ) : (
        <div
          className={`border rounded-2xl flex flex-col shadow-xl overflow-hidden relative transition-colors ${
            isLight
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}
        >
          {/* Top Header Controls Bar */}
          <div
            className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 sm:p-4 border-b transition-colors ${
              isLight
                ? 'bg-slate-50/80 border-slate-200'
                : 'bg-slate-950/40 border-slate-800'
            }`}
          >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <h2 className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {ticker}
            </h2>
            <span
              className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                changePct >= 0
                  ? isLight
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : isLight
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {changePct >= 0 ? '+' : ''}
              {changePct}%
            </span>
          </div>

          {/* OHLC Bar Legend */}
          {activeCandle && (
            <div
              className={`flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-mono px-2.5 py-1 rounded-lg border transition-colors ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-600 shadow-xs'
                  : 'bg-slate-900/80 border-slate-800/80 text-slate-400'
              }`}
            >
              <span>
                O: <b className={isLight ? 'text-slate-900' : 'text-slate-200'}>{activeCandle.open.toLocaleString('id-ID')}</b>
              </span>
              <span>
                H: <b className={isLight ? 'text-emerald-700' : 'text-emerald-400'}>{activeCandle.high.toLocaleString('id-ID')}</b>
              </span>
              <span>
                L: <b className={isLight ? 'text-rose-700' : 'text-rose-400'}>{activeCandle.low.toLocaleString('id-ID')}</b>
              </span>
              <span>
                C: <b className={isLight ? 'text-slate-950 font-black' : 'text-white font-bold'}>{activeCandle.close.toLocaleString('id-ID')}</b>
              </span>
              <span className={`hidden xl:inline ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                Vol: {activeCandle.volume.toLocaleString('id-ID')}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls (Timeframes, Chart Type, Indicator Menu, Theme Toggle) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Selector */}
          <div
            className={`flex items-center space-x-1 p-1 rounded-xl border transition-colors ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}
          >
            {(['1m', '15m', '1h', '1D', '1W', '1M'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setRange(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  range === t
                    ? isLight
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div
            className={`flex items-center space-x-0.5 p-1 rounded-xl border transition-colors ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}
          >
            <button
              onClick={() => setChartType('candles')}
              title="Candlestick Chart"
              className={`p-1.5 rounded-lg transition-colors ${
                chartType === 'candles'
                  ? isLight
                    ? 'bg-slate-200 text-emerald-700 font-bold'
                    : 'bg-slate-800 text-emerald-400 font-bold'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CandlestickChart className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('line')}
              title="Line Chart"
              className={`p-1.5 rounded-lg transition-colors ${
                chartType === 'line'
                  ? isLight
                    ? 'bg-slate-200 text-emerald-700 font-bold'
                    : 'bg-slate-800 text-emerald-400 font-bold'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('bars')}
              title="OHLC Bar Chart"
              className={`p-1.5 rounded-lg transition-colors ${
                chartType === 'bars'
                  ? isLight
                    ? 'bg-slate-200 text-emerald-700 font-bold'
                    : 'bg-slate-800 text-emerald-400 font-bold'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Indicator Menu Dropdown */}
          <ChartIndicatorMenu indicators={indicators} setIndicators={setIndicators} theme={theme} />

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            title={isLight ? 'Ganti ke Tema Gelap (Dark Mode)' : 'Ganti ke Tema Terang (Light Mode)'}
            className={`p-2 rounded-xl border transition-colors ${
              isLight
                ? 'bg-white border-slate-200 text-amber-600 hover:bg-slate-100'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-800'
            }`}
          >
            {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>

          {/* Refresh Data */}
          <button
            onClick={fetchHistory}
            title="Refresh Data"
            className={`p-2 rounded-xl border transition-colors ${
              isLight
                ? 'bg-white border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-slate-100'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Chart Body: Left Drawing Toolbar + Interactive Canvas */}
      <div className="relative flex flex-1 w-full min-h-[380px] sm:min-h-[440px]">
        {/* TradingView-Style Left Drawing Toolbar */}
        <ChartDrawingToolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          currentColor={currentColor}
          setCurrentColor={setCurrentColor}
          lineWidth={lineWidth}
          setLineWidth={setLineWidth}
          onUndo={() => {
            if (drawings.length > 0) saveDrawings(drawings.slice(0, -1));
          }}
          onClearAll={() => {
            if (confirm(`Hapus seluruh ${drawings.length} coretan analisis pada grafik ${ticker}?`)) {
              saveDrawings([]);
              setSelectedId(null);
            }
          }}
          onDeleteSelected={() => {
            if (selectedId) {
              saveDrawings(drawings.filter((d) => d.id !== selectedId));
              setSelectedId(null);
            }
          }}
          selectedId={selectedId}
          drawingsCount={drawings.length}
          hideDrawings={hideDrawings}
          setHideDrawings={setHideDrawings}
          theme={theme}
        />

        {/* Canvas Area */}
        <div className="relative flex-1 w-full h-[380px] sm:h-[440px]">
          {loading && candles.length === 0 ? (
            <div
              className={`absolute inset-0 flex items-center justify-center backdrop-blur-xs z-10 ${
                isLight ? 'bg-white/60' : 'bg-slate-900/50'
              }`}
            >
              <div className="flex items-center space-x-2 text-emerald-600 text-xs font-medium">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Memuat Data Grafik & Analisis...</span>
              </div>
            </div>
          ) : null}

          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setHoveredCandle(null)}
          />
        </div>
      </div>

      {/* Footer Info & Active Tools Bar */}
      <div
        className={`flex flex-wrap items-center justify-between text-[11px] px-4 py-2 border-t gap-2 transition-colors ${
          isLight
            ? 'bg-slate-50 border-slate-200 text-slate-600'
            : 'bg-slate-950/60 border-slate-800 text-slate-400'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            Mode Alat: <b className="text-emerald-600 uppercase">{activeTool}</b>
          </span>
          <span className={isLight ? 'text-slate-300' : 'text-slate-600'}>|</span>
          <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
            {drawings.length} Anotasi Disimpan
          </span>
        </div>

        <div className={`flex items-center gap-4 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
          <span className="hidden sm:inline">Tip: Tekan Esc untuk reset alat, Delete untuk hapus garis</span>
          <span>Harga: IDR (Rupiah)</span>
        </div>
      </div>

      {/* Modal Text Annotation */}
      {textModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div
            className={`border rounded-2xl p-5 w-full max-w-sm shadow-2xl flex flex-col gap-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
            }`}
          >
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Tambah Catatan Anotasi Grafik
            </h3>
            <input
              type="text"
              autoFocus
              placeholder="Contoh: Breakout Resistance, Area Beli, Target..."
              value={textModal.text}
              onChange={(e) => setTextModal({ ...textModal, text: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && textModal.text.trim() && textModal.point) {
                  const newElem: DrawingElement = {
                    id: `txt_${Date.now()}`,
                    type: 'text',
                    points: [textModal.point],
                    color: currentColor,
                    lineWidth: 1,
                    text: textModal.text.trim(),
                  };
                  saveDrawings([...drawings, newElem]);
                  setTextModal({ isOpen: false, point: null, text: '' });
                  setActiveTool('cursor');
                }
              }}
              className={`border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
              }`}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setTextModal({ isOpen: false, point: null, text: '' })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (textModal.text.trim() && textModal.point) {
                    const newElem: DrawingElement = {
                      id: `txt_${Date.now()}`,
                      type: 'text',
                      points: [textModal.point],
                      color: currentColor,
                      lineWidth: 1,
                      text: textModal.text.trim(),
                    };
                    saveDrawings([...drawings, newElem]);
                    setTextModal({ isOpen: false, point: null, text: '' });
                    setActiveTool('cursor');
                  }
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
}
