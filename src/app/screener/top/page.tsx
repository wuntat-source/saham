'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ScreenerItem } from '@/types/intelligence';
import {
  Trophy,
  Sparkles,
  Flame,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  DollarSign,
  PieChart,
  Activity,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

export default function Top10Page() {
  const [top10, setTop10] = useState<ScreenerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTop10 = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/screener/top');
        if (res.ok) {
          const data = await res.json();
          setTop10(data.top10 || []);
        }
      } catch (e) {
        console.error('Failed to load Top 10:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTop10();
  }, []);

  const getRankBadgeStyle = (rank: number) => {
    if (rank === 1) {
      return 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/50';
    }
    if (rank === 2) {
      return 'bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-950 font-black shadow-lg shadow-slate-300/20';
    }
    if (rank === 3) {
      return 'bg-gradient-to-tr from-amber-700 to-amber-500 text-white font-black shadow-lg shadow-amber-700/20';
    }
    return 'bg-slate-800 text-slate-300 border border-slate-700';
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center gap-1.5 border border-amber-500/30">
              <Trophy className="w-3.5 h-3.5" />
              TOP 10 EDUTRADEX AI PICKS
            </span>
            <span className="text-xs text-slate-400 font-medium font-mono">
              Daily AI Ranking Update
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            10 Saham Terbaik Bursa Efek Indonesia
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
            Peringkat 10 emiten teratas hasil agregasi cerdas 6 pilar deterministik. Dilengkapi analisis penyebab ranking, pilar terkuat/terlemah, katalis pendorong, serta faktor risiko utama.
          </p>
        </div>

        <Link
          href="/screener"
          className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all"
        >
          <span>Buka Full Screener</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent" />
          <p className="text-xs text-slate-400 font-mono">
            Menghitung kalkulasi multi-pilar & menyusun Top 10 emiten...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {top10.map((item) => (
            <div
              key={item.ticker}
              className={`bg-slate-900 border rounded-3xl p-5 sm:p-6 shadow-xl transition-all duration-200 hover:border-slate-700 ${
                item.rank === 1
                  ? 'border-amber-500/40 bg-gradient-to-r from-slate-900 via-amber-950/10 to-slate-900'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                {/* Left: Rank & Ticker */}
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-mono text-base ${getRankBadgeStyle(
                      item.rank
                    )}`}
                  >
                    #{item.rank}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/stock/${item.ticker}`}
                        className="text-xl font-black text-white hover:text-emerald-400 transition-colors font-mono"
                      >
                        {item.ticker}
                      </Link>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-semibold">
                        {item.sector}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-medium font-sans">
                      {item.companyName}
                    </div>
                  </div>
                </div>

                {/* Right: Scores & Trade Button */}
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold">
                      AI Score
                    </div>
                    <div className="text-xl font-black font-mono text-emerald-400">
                      {item.overallScore}
                      <span className="text-xs font-normal text-slate-500">/100</span>
                    </div>
                  </div>

                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold">
                      Confidence
                    </div>
                    <div className="text-sm font-bold font-mono text-slate-300">
                      {item.confidenceScore}%
                    </div>
                  </div>

                  <Link
                    href={`/stock/${item.ticker}`}
                    className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-sans transition-all shadow-md shadow-emerald-500/20 flex items-center space-x-1"
                  >
                    <span>Analisis & Trade</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Middle Breakdown: 5 Essential Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4 text-xs font-sans">
                {/* Why ranked here */}
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    💡 Mengapa Berada di Peringkat Ini?
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Kombinasi skor solid ({item.overallScore}/100) ditopang profitabilitas stabil dan momentum teknikal {item.signal}.
                  </p>
                </div>

                {/* Strongest & Weakest Pillar */}
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                    ⚖️ Pilar Terkuat & Terlemah
                  </span>
                  <div className="text-[11px] space-y-0.5">
                    <div className="text-emerald-400">
                      <span className="text-slate-400">Terkuat:</span> {item.strongestPillar}
                    </div>
                    <div className="text-amber-400">
                      <span className="text-slate-400">Terlemah:</span> {item.weakestPillar}
                    </div>
                  </div>
                </div>

                {/* Main Catalyst */}
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    Katalis Utama
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {item.catalyst || 'Pertumbuhan kinerja laba dan posisi neraca yang solid.'}
                  </p>
                </div>

                {/* Main Risk */}
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-rose-400 font-mono flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Risiko Utama
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {item.mainRisk || 'Risiko dinamika pasar modal menyeluruh.'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
