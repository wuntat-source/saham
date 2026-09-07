'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StrategyItem, StrategyComparisonItem } from '@/types/quant';
import {
  GitCompare,
  TrendingUp,
  Award,
  ShieldCheck,
  Binary,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function StrategyComparisonPage() {
  const [strategies, setStrategies] = useState<StrategyItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparisons, setComparisons] = useState<StrategyComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    loadStrategies();
  }, []);

  const loadStrategies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/strategies');
      if (res.ok) {
        const data = await res.json();
        const strats: StrategyItem[] = data.strategies || [];
        setStrategies(strats);
        if (strats.length >= 2) {
          const initial = strats.slice(0, 3).map((s) => s.id);
          setSelectedIds(initial);
          runComparison(initial);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev; // keep at least 1
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 4) return prev; // max 4
        return [...prev, id];
      }
    });
  };

  const runComparison = async (ids?: string[]) => {
    const targetIds = ids || selectedIds;
    if (targetIds.length === 0) return;
    setComparing(true);

    try {
      const res = await fetch('/api/backtests/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategyIds: targetIds }),
      });

      if (res.ok) {
        const data = await res.json();
        setComparisons(data.comparison || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setComparing(false);
    }
  };

  const lineColors = ['#10b981', '#6366f1', '#f59e0b', '#ec4899'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl backdrop-blur">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest flex items-center gap-1.5">
              <GitCompare className="w-3.5 h-3.5" />
              Strategy Benchmark Matrix
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Pembanding Performa Multi-Strategi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Pilih 2 hingga 4 strategi kuantitatif untuk diuji secara berdampingan pada rentang waktu historis yang identik.
          </p>
        </div>

        <button
          onClick={() => runComparison()}
          disabled={comparing || selectedIds.length < 2}
          className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition"
        >
          {comparing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
          <span>{comparing ? 'Membandingkan...' : 'Bandingkan Terpilih'}</span>
        </button>
      </div>

      {/* Strategy Selection Cards */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          Pilih Strategi untuk Dibandingkan ({selectedIds.length}/4 Terpilih):
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {strategies.map((strat) => {
            const isSelected = selectedIds.includes(strat.id);
            return (
              <button
                key={strat.id}
                onClick={() => toggleSelect(strat.id)}
                className={`p-4 rounded-2xl border text-left transition ${
                  isSelected
                    ? 'bg-indigo-950/30 border-indigo-500/60 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate max-w-[200px]">
                    {strat.name}
                  </span>
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                      isSelected
                        ? 'bg-indigo-500 border-indigo-500 text-slate-950 font-bold'
                        : 'border-slate-700'
                    }`}
                  >
                    {isSelected ? '✓' : ''}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{strat.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Results */}
      {comparisons.length > 0 && (
        <div className="space-y-6">
          {/* Comparison Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              Matriks Metrik Kuantitatif
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4">Nama Model</th>
                    <th className="py-3 px-4">Total Return</th>
                    <th className="py-3 px-4">CAGR</th>
                    <th className="py-3 px-4">Win Rate</th>
                    <th className="py-3 px-4">Max Drawdown</th>
                    <th className="py-3 px-4">Sharpe Ratio</th>
                    <th className="py-3 px-4">Sortino Ratio</th>
                    <th className="py-3 px-4">Profit Factor</th>
                    <th className="py-3 px-4">Consistency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                  {comparisons.map((c, idx) => (
                    <tr key={c.strategyId} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-sans font-bold text-white flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: lineColors[idx % lineColors.length] }}
                        />
                        <span>{c.strategyName}</span>
                      </td>
                      <td className={`py-3.5 px-4 font-bold ${c.totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {c.totalReturn >= 0 ? '+' : ''}{c.totalReturn}%
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">{c.cagr}%</td>
                      <td className="py-3.5 px-4 text-teal-400 font-bold">{c.winRate}%</td>
                      <td className="py-3.5 px-4 text-rose-400 font-bold">-{c.maxDrawdown}%</td>
                      <td className="py-3.5 px-4 text-indigo-400 font-bold">{c.sharpeRatio}</td>
                      <td className="py-3.5 px-4 text-slate-300">{c.sortinoRatio}</td>
                      <td className="py-3.5 px-4 text-amber-400">{c.profitFactor}</td>
                      <td className="py-3.5 px-4 text-emerald-400 font-bold">
                        {c.consistencyScore} / 100
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overlaid Equity Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Perbandingan Kurva Ekuitas Relatif
              </h2>

              <div className="flex flex-wrap gap-4 text-xs">
                {comparisons.map((c, idx) => (
                  <div key={c.strategyId} className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <span
                      className="w-3 h-1 rounded-full"
                      style={{ backgroundColor: lineColors[idx % lineColors.length] }}
                    />
                    <span>{c.strategyName}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative w-full overflow-hidden bg-slate-950 border border-slate-800 rounded-2xl p-4">
              <svg viewBox="0 0 800 200" className="w-full h-48 overflow-visible" preserveAspectRatio="none">
                <line x1="0" y1="50" x2="800" y2="50" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="800" y2="100" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="0" y1="150" x2="800" y2="150" stroke="#1e293b" strokeDasharray="3 3" />

                {comparisons.map((c, sIdx) => {
                  const maxEq = Math.max(...comparisons.flatMap((comp) => comp.equityCurve.map((e) => e.equity)), 105000000);
                  const minEq = Math.min(...comparisons.flatMap((comp) => comp.equityCurve.map((e) => e.equity)), 95000000);
                  const range = Math.max(1, maxEq - minEq);

                  const pts = c.equityCurve.map((pt, pIdx) => {
                    const x = (pIdx / Math.max(1, c.equityCurve.length - 1)) * 800;
                    const y = 200 - ((pt.equity - minEq) / range) * 180 - 10;
                    return `${x},${y}`;
                  }).join(' ');

                  return (
                    <polyline
                      key={c.strategyId}
                      fill="none"
                      stroke={lineColors[sIdx % lineColors.length]}
                      strokeWidth="2.5"
                      points={pts}
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
