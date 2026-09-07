'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  ArrowRight,
  TrendingUp,
  Award,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function BacktestsHistoryPage() {
  const [backtests, setBacktests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBacktests();
  }, []);

  const loadBacktests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backtests');
      if (res.ok) {
        const data = await res.json();
        setBacktests(data.backtests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl backdrop-blur">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" />
              Historical Backtest Log
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Riwayat Simulasi &amp; Backtesting
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Daftar pengujian strategi pada data historis BEI lengkap dengan metrik imbal hasil, drawdown puncak, dan evaluasi AI.
          </p>
        </div>

        <Link
          href="/quant-lab/strategies/new"
          className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-xs font-bold rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition"
        >
          <Play className="w-4 h-4" />
          <span>Simulasi Baru</span>
        </Link>
      </div>

      {/* Backtest List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          Hasil Uji Historis ({backtests.length})
        </h2>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Memuat riwayat backtest...</div>
        ) : backtests.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-3">
            <p>Belum ada simulasi backtest yang tercatat.</p>
            <Link
              href="/quant-lab/strategies/new"
              className="inline-block text-xs font-bold text-indigo-400 hover:underline"
            >
              Mulai Uji Strategi Pertama Anda &rarr;
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-4">Nama Strategi</th>
                  <th className="py-3 px-4">Periode Uji</th>
                  <th className="py-3 px-4">Total Return</th>
                  <th className="py-3 px-4">CAGR</th>
                  <th className="py-3 px-4">Win Rate</th>
                  <th className="py-3 px-4">Max DD</th>
                  <th className="py-3 px-4">Sharpe</th>
                  <th className="py-3 px-4">Trades</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {backtests.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <Link href={`/quant-lab/backtests/${b.id}`} className="hover:text-indigo-400 transition">
                        {b.strategyName}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {b.startDate} s/d {b.endDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={b.totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {b.totalReturn >= 0 ? '+' : ''}{b.totalReturn}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {b.cagr}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {b.winRate}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-rose-400 font-bold">
                      -{b.maxDrawdown}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-indigo-400 font-bold">
                      {b.sharpeRatio}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {b.totalTrades}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/quant-lab/backtests/${b.id}`}
                        className="text-indigo-400 hover:text-indigo-300 font-bold text-xs"
                      >
                        Laporan Detail &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
