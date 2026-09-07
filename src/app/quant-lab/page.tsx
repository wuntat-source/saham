'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { StrategyItem } from '@/types/quant';
import {
  Binary,
  Play,
  Layers,
  PlusCircle,
  TrendingUp,
  BarChart3,
  Sparkles,
  ShieldCheck,
  Award,
  ArrowRight,
  Clock,
  ChevronRight,
  GitCompare,
  Percent,
} from 'lucide-react';

export default function QuantLabPage() {
  const { user } = useAuth();
  const [strategies, setStrategies] = useState<StrategyItem[]>([]);
  const [backtests, setBacktests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuantData();
  }, []);

  const loadQuantData = async () => {
    setLoading(true);
    try {
      const [stratRes, btRes] = await Promise.all([
        fetch('/api/strategies'),
        fetch('/api/backtests'),
      ]);

      if (stratRes.ok) {
        const sData = await stratRes.json();
        setStrategies(sData.strategies || []);
      }
      if (btRes.ok) {
        const bData = await btRes.json();
        setBacktests(bData.backtests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl backdrop-blur relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-widest flex items-center gap-1.5">
                <Binary className="w-3.5 h-3.5" />
                EduTradeX Quant Lab
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-400">Laboratorium Riset Kuantitatif & Backtest</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Eksperimen Strategi Algoritmik & Pengujian Historis
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Bangun aturan trading sistematis, uji performa di data historis BEI tanpa bias masa depan (*look-ahead bias*), analisa kurva ekuitas, dan dapatkan evaluasi *overfitting* dari AI.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/quant-lab/compare"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl border border-slate-700 flex items-center gap-2 transition"
            >
              <GitCompare className="w-4 h-4 text-indigo-400" />
              <span>Bandingkan Strategi</span>
            </Link>
            <Link
              href="/quant-lab/strategies/new"
              className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-xs font-bold rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Strategi Baru</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-indigo-400 text-xs font-bold">
            <span>Strategi Tersedia</span>
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{strategies.length} Model</div>
          <p className="text-[11px] text-slate-400">Template multi-pilar, trend following, dan mean-reversion.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold">
            <span>Backtest Selesai</span>
            <Play className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{backtests.length} Simulasi</div>
          <p className="text-[11px] text-slate-400">Uji historis dengan simulasi fee (Beli 0.15%, Jual 0.25%).</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-teal-400 text-xs font-bold">
            <span>Anti-Bias Engine</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">Zero Leakage</div>
          <p className="text-[11px] text-slate-400">Eksekusi data sequential bar-by-bar tanpa *look-ahead bias*.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-amber-400 text-xs font-bold">
            <span>Walk-Forward Split</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">In & Out Sample</div>
          <p className="text-[11px] text-slate-400">Deteksi risiko *curve-fitting* & *overfitting* otomatis.</p>
        </div>
      </div>

      {/* Main Content Grid: Strategies & Recent Runs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Strategy Library & Builder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Binary className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Koleksi Strategi Kuantitatif</h2>
                  <p className="text-xs text-slate-400">
                    Pilih strategi untuk melakukan backtest langsung atau sesuaikan parameter di Strategy Builder.
                  </p>
                </div>
              </div>
              <Link
                href="/quant-lab/strategies"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">Memuat koleksi strategi...</div>
            ) : (
              <div className="space-y-3">
                {strategies.slice(0, 3).map((strat) => (
                  <div
                    key={strat.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 transition space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-white">{strat.name}</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">{strat.description}</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {strat.universe}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <div className="flex items-center gap-3">
                        <span>SL: {strat.rules.exitRules.stopLossPct}%</span>
                        <span>TP: {strat.rules.exitRules.takeProfitPct}%</span>
                        <span>Posisi Maks: {strat.rules.maxPositions}</span>
                      </div>
                      <Link
                        href={`/quant-lab/strategies/new?templateId=${strat.id}`}
                        className="px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-bold rounded-lg text-[10px] transition flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>Run Backtest</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Recent Backtest Runs */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Riwayat Backtest Terbaru
              </h3>
              <Link
                href="/quant-lab/backtests"
                className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Semua ({backtests.length})
              </Link>
            </div>

            {backtests.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-400">Belum ada backtest dijalankan.</p>
                <Link
                  href="/quant-lab/strategies/new"
                  className="inline-block text-xs font-bold text-indigo-400 hover:underline"
                >
                  Jalankan Backtest Pertama &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {backtests.slice(0, 4).map((bt) => (
                  <Link
                    key={bt.id}
                    href={`/quant-lab/backtests/${bt.id}`}
                    className="block p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/30 transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate max-w-[150px]">
                        {bt.strategyName}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold ${
                          bt.totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {bt.totalReturn >= 0 ? '+' : ''}{bt.totalReturn}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Win: {bt.winRate}%</span>
                      <span>MDD: {bt.maxDrawdown}%</span>
                      <span>Sharpe: {bt.sharpeRatio}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
