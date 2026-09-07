'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SectorHierarchyDrilldown } from '@/types/advanced-intelligence';
import {
  Layers,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

export default function SectorPage() {
  const [data, setData] = useState<SectorHierarchyDrilldown | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | 'YTD'>('1D');

  const fetchSectors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sectors');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to load sectors:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
  }, []);

  const getPerformanceValue = (sec: any) => {
    switch (timeframe) {
      case '1W':
        return sec.performance1W;
      case '1M':
        return sec.performance1M;
      case 'YTD':
        return sec.performanceYTD;
      default:
        return sec.performance1D;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center gap-1.5 border border-emerald-500/30">
              <Layers className="w-3.5 h-3.5" />
              SECTOR INTELLIGENCE & HIERARCHY
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Struktur Pasar BEI / IDX
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Peta Sektor & Rotasi Industri
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
            Analisis rotasi sektoral multi-timeframe, valuasi kelipatan P/E & PBV sektor, momentum relatif terhadap IHSG, dan emiten pemimpin (Market Leaders).
          </p>
        </div>

        {/* Market Benchmark Badge */}
        {data && (
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-right">
            <span className="text-[10px] text-slate-500 uppercase block">Status IHSG (Market)</span>
            <span className="text-white font-black text-sm">{data.market.status}</span>
            <span className="text-emerald-400 block mt-0.5">Skor Pasar: {data.market.score}/100</span>
          </div>
        )}
      </div>

      {/* Timeframe Filter Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-lg font-mono text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-sans px-2">Rentang Waktu:</span>
          {(['1D', '1W', '1M', 'YTD'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                timeframe === tf
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <button
          onClick={fetchSectors}
          className="flex items-center space-x-1.5 text-slate-400 hover:text-white px-3 py-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Sector Cards Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
          <p className="text-xs text-slate-400 font-mono">
            Menganalisis performa rotasi dan valuasi sektoral...
          </p>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.sectors.map((sec) => {
            const perf = getPerformanceValue(sec);
            return (
              <div
                key={sec.sector}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-xl transition-all duration-200 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-white text-base">{sec.sector}</h3>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {sec.stockCount} Emiten Terdaftar • Rp{sec.marketCapTrillion.toFixed(0)} T
                      </span>
                    </div>

                    <div
                      className={`px-3 py-1 rounded-xl font-mono font-bold text-xs flex items-center gap-0.5 border ${
                        perf >= 0
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {perf >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {perf >= 0 ? '+' : ''}
                      {perf}%
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 my-3 text-xs font-mono">
                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-[10px] text-slate-500 block">Median P/E</span>
                      <span className="text-slate-200 font-bold">{sec.medianPe}x</span>
                    </div>
                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-[10px] text-slate-500 block">Momentum</span>
                      <span className="text-emerald-400 font-bold">{sec.momentumScore}/100</span>
                    </div>
                    <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-850">
                      <span className="text-[10px] text-slate-500 block">RS vs IHSG</span>
                      <span className="text-teal-400 font-bold">{sec.relativeStrengthScore}/100</span>
                    </div>
                  </div>
                </div>

                {/* Top Stock in Sector */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                      Market Leader
                    </span>
                    <Link
                      href={`/stock/${sec.topStock.ticker}`}
                      className="font-bold text-emerald-400 hover:underline font-mono text-sm inline-flex items-center gap-1"
                    >
                      <span>{sec.topStock.ticker}</span>
                      <span className="text-[11px] text-slate-400 font-sans font-normal">
                        ({sec.topStock.changePct >= 0 ? '+' : ''}{sec.topStock.changePct}%)
                      </span>
                    </Link>
                  </div>

                  <Link
                    href={`/screener?sector=${encodeURIComponent(sec.sector)}`}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
