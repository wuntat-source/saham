'use client';

import React, { useState } from 'react';
import { ChartTheme, IndicatorConfig } from './types';
import { Activity, Check, ChevronDown, Sparkles } from 'lucide-react';

interface ChartIndicatorMenuProps {
  indicators: IndicatorConfig;
  setIndicators: React.Dispatch<React.SetStateAction<IndicatorConfig>>;
  theme: ChartTheme;
}

export default function ChartIndicatorMenu({
  indicators,
  setIndicators,
  theme,
}: ChartIndicatorMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isLight = theme === 'light';

  const toggleIndicator = (key: keyof IndicatorConfig) => {
    setIndicators((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const activeCount = Object.values(indicators).filter(Boolean).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
          activeCount > 0
            ? isLight
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-xs'
            : isLight
            ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Activity className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
        <span>Indikator</span>
        {activeCount > 0 && (
          <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black ${
            isLight ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-slate-950'
          }`}>
            {activeCount}
          </span>
        )}
        <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 sm:left-0 top-full mt-2 w-64 backdrop-blur-xl border rounded-2xl p-3 shadow-2xl z-50 flex flex-col gap-2 ${
            isLight
              ? 'bg-white/95 border-slate-200 text-slate-800'
              : 'bg-slate-900/95 border-slate-700 text-white'
          }`}
        >
          <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Indikator Teknikal
            </span>
            <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Pilih untuk aktifkan</span>
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <span className={`text-[10px] font-semibold mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Overlay Grafik Utama</span>

            <button
              onClick={() => toggleIndicator('ma9')}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                indicators.ma9
                  ? isLight
                    ? 'bg-cyan-50 text-cyan-800 font-bold border border-cyan-200'
                    : 'bg-emerald-500/20 text-emerald-300 font-bold'
                  : isLight
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                <span>MA 9 (Moving Average 9)</span>
              </div>
              {indicators.ma9 && <Check className="w-3.5 h-3.5 text-cyan-600 font-bold" />}
            </button>

            <button
              onClick={() => toggleIndicator('ma20')}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                indicators.ma20
                  ? isLight
                    ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200'
                    : 'bg-emerald-500/20 text-emerald-300 font-bold'
                  : isLight
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>MA 20 (Moving Average 20)</span>
              </div>
              {indicators.ma20 && <Check className="w-3.5 h-3.5 text-amber-600 font-bold" />}
            </button>

            <button
              onClick={() => toggleIndicator('ema50')}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                indicators.ema50
                  ? isLight
                    ? 'bg-purple-50 text-purple-800 font-bold border border-purple-200'
                    : 'bg-emerald-500/20 text-emerald-300 font-bold'
                  : isLight
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span>EMA 50 (Exponential MA 50)</span>
              </div>
              {indicators.ema50 && <Check className="w-3.5 h-3.5 text-purple-600 font-bold" />}
            </button>

            <button
              onClick={() => toggleIndicator('sma200')}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                indicators.sma200
                  ? isLight
                    ? 'bg-rose-50 text-rose-800 font-bold border border-rose-200'
                    : 'bg-emerald-500/20 text-emerald-300 font-bold'
                  : isLight
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>SMA 200 (Long-Term Trend)</span>
              </div>
              {indicators.sma200 && <Check className="w-3.5 h-3.5 text-rose-600 font-bold" />}
            </button>

            <button
              onClick={() => toggleIndicator('bollinger')}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                indicators.bollinger
                  ? isLight
                    ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200'
                    : 'bg-emerald-500/20 text-emerald-300 font-bold'
                  : isLight
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>Bollinger Bands (20, 2)</span>
              </div>
              {indicators.bollinger && <Check className="w-3.5 h-3.5 text-blue-600 font-bold" />}
            </button>

            <div className={`w-full h-[1px] my-1 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />

            <span className={`text-[10px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Sub-Panel Indikator Bawah</span>

            <button
              onClick={() => toggleIndicator('rsi')}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                indicators.rsi
                  ? isLight
                    ? 'bg-purple-50 text-purple-800 font-bold border border-purple-200'
                    : 'bg-emerald-500/20 text-emerald-300 font-bold'
                  : isLight
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                <span>RSI 14 (Overbought/Oversold)</span>
              </div>
              {indicators.rsi && <Check className="w-3.5 h-3.5 text-purple-600 font-bold" />}
            </button>

            <button
              onClick={() => toggleIndicator('macd')}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                indicators.macd
                  ? isLight
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                    : 'bg-emerald-500/20 text-emerald-300 font-bold'
                  : isLight
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>MACD (12, 26, 9)</span>
              </div>
              {indicators.macd && <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
