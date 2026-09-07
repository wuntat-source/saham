'use client';

import React, { useEffect, useState } from 'react';
import { ScenarioAnalysisResult } from '@/types/advanced-intelligence';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  CheckCircle2,
  PieChart,
} from 'lucide-react';

interface StockScenarioTabProps {
  ticker: string;
}

export default function StockScenarioTab({ ticker }: StockScenarioTabProps) {
  const [data, setData] = useState<ScenarioAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchScenarios = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/stocks/${ticker}/scenarios`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setData(json);
        }
      } catch (e) {
        console.error('Failed to load scenarios:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchScenarios();
    return () => {
      isMounted = false;
    };
  }, [ticker]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
        <p className="text-xs text-slate-400 font-mono">
          Menghitung matriks skenario probabilistik (Bull / Base / Bear) untuk {ticker}...
        </p>
      </div>
    );
  }

  if (!data) return null;

  const scenarios = [
    {
      caseData: data.scenarios.bull,
      title: 'BULL CASE (Skenario Optimis)',
      icon: TrendingUp,
      color: 'emerald',
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      caseData: data.scenarios.base,
      title: 'BASE CASE (Skenario Dasar / Netral)',
      icon: Activity,
      color: 'sky',
      border: 'border-sky-500/30',
      badge: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    },
    {
      caseData: data.scenarios.bear,
      title: 'BEAR CASE (Skenario Pesimis / Koreksi)',
      icon: TrendingDown,
      color: 'rose',
      border: 'border-rose-500/30',
      badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Scenario Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
            Probabilistic Scenario Engine
          </span>
          <h3 className="text-lg font-black text-white">
            Matriks Proyeksi Skenario Saham {ticker}
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Total probabilitas tertimbang tepat 100% dengan kondisi invalidasi yang terdefinisi jelas.
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Expected Value Price</span>
            <span className="text-emerald-400 font-black text-sm">
              Rp{data.expectedValuePrice.toLocaleString('id-ID')}
            </span>
          </div>
          <span className="text-slate-700">•</span>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Total Probabilitas</span>
            <span className="text-slate-300 font-bold text-sm">
              {data.probabilitySumCheck}%
            </span>
          </div>
        </div>
      </div>

      {/* 3 Scenario Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 font-sans">
        {scenarios.map(({ caseData, title, icon: Icon, badge, border }) => (
          <div
            key={caseData.type}
            className={`bg-slate-900 border ${border} rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg ${badge}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white text-xs font-mono">
                    {caseData.type} CASE
                  </span>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${badge}`}>
                  Probabilitas: {caseData.probability}%
                </span>
              </div>

              {/* Target Price Range */}
              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 text-xs font-mono">
                <div className="text-[10px] text-slate-500 uppercase">Target Rentang Harga</div>
                <div className="text-white font-bold text-sm mt-0.5 flex items-center justify-between">
                  <span>
                    Rp{caseData.targetRange.low.toLocaleString('id-ID')} – Rp{caseData.targetRange.high.toLocaleString('id-ID')}
                  </span>
                  <span
                    className={
                      caseData.targetRange.upsidePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }
                  >
                    {caseData.targetRange.upsidePct >= 0 ? '+' : ''}
                    {caseData.targetRange.upsidePct}%
                  </span>
                </div>
              </div>

              {/* Assumptions */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                  Asumsi Kunci:
                </span>
                {caseData.assumptions.map((asm, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-start space-x-1.5">
                    <span className="text-slate-500 font-bold">•</span>
                    <span>{asm}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Invalidation Condition */}
            <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
              <span className="font-bold text-amber-400 block font-mono text-[10px] uppercase mb-0.5">
                Kondisi Invalidasi:
              </span>
              {caseData.invalidationCondition}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
