'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { StrategyItem } from '@/types/quant';
import {
  Binary,
  PlusCircle,
  Play,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Target,
  Sliders,
} from 'lucide-react';

export default function StrategiesDirectoryPage() {
  const [strategies, setStrategies] = useState<StrategyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStrategies();
  }, []);

  const loadStrategies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/strategies');
      if (res.ok) {
        const data = await res.json();
        setStrategies(data.strategies || []);
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
              <Layers className="w-3.5 h-3.5" />
              Strategy Directory
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Direktori Strategi Kuantitatif
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Daftar aturan sistematis yang telah dibuat. Klik &quot;Jalankan Backtest&quot; untuk menguji performa di data historis atau buat variasi strategi baru.
          </p>
        </div>

        <Link
          href="/quant-lab/strategies/new"
          className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-xs font-bold rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Strategi Baru</span>
        </Link>
      </div>

      {/* Strategies Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Binary className="w-5 h-5 text-indigo-400" />
            Model Strategi Tersimpan ({strategies.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Memuat strategi...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies.map((strat) => (
              <div
                key={strat.id}
                className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                      Semesta: {strat.universe}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {strat.backtestCount || 0} Backtests
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{strat.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3">
                      {strat.description}
                    </p>
                  </div>

                  {/* Conditions Pills */}
                  <div className="space-y-1.5 pt-2">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                      Kondisi Entry ({strat.rules.entryRules.logicalOperator}):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {strat.rules.entryRules.conditions.map((c, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-emerald-400"
                        >
                          {c.field} {c.operator} {c.value}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Exit Rules Summary */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div className="text-[9px] text-slate-500 uppercase">Stop Loss</div>
                      <div className="text-xs font-bold text-rose-400">-{strat.rules.exitRules.stopLossPct}%</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div className="text-[9px] text-slate-500 uppercase">Take Profit</div>
                      <div className="text-xs font-bold text-emerald-400">+{strat.rules.exitRules.takeProfitPct}%</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div className="text-[9px] text-slate-500 uppercase">Max Pos</div>
                      <div className="text-xs font-bold text-white">{strat.rules.maxPositions}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <Link
                    href={`/quant-lab/strategies/new?templateId=${strat.id}`}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Edit / Clone</span>
                  </Link>
                  <Link
                    href={`/quant-lab/strategies/new?runDirect=${strat.id}`}
                    className="px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition"
                  >
                    <Play className="w-3 h-3" />
                    <span>Jalankan Backtest</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
