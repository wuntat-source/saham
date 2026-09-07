'use client';

import React, { useEffect, useState } from 'react';
import { DebateResult } from '@/types/advanced-intelligence';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Scale,
  ShieldAlert,
  Flame,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface StockDebateTabProps {
  ticker: string;
}

export default function StockDebateTab({ ticker }: StockDebateTabProps) {
  const [data, setData] = useState<DebateResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDebate = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/ai/debate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticker }),
        });
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setData(json);
        }
      } catch (e) {
        console.error('Failed to load debate:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchDebate();
    return () => {
      isMounted = false;
    };
  }, [ticker]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
        <p className="text-xs text-slate-400 font-mono">
          Menyusun debat 3-Agent AI (Bull Analyst vs Bear Analyst vs AI Judge) untuk {ticker}...
        </p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Top Banner: AI Judge Verdict */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                3-Agent AI Debate Chamber
              </span>
              <h3 className="text-lg font-black text-white">
                Keputusan & Sintesis AI Judge
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span
              className={`px-3 py-1 rounded-xl font-bold border ${
                data.aiJudge.netConviction === 'BULLISH_BIAS'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : data.aiJudge.netConviction === 'BEARISH_BIAS'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}
            >
              {data.aiJudge.netConviction === 'BULLISH_BIAS'
                ? '🐂 BULLISH BIAS'
                : data.aiJudge.netConviction === 'BEARISH_BIAS'
                ? '🐻 BEARISH BIAS'
                : '⚖️ BALANCED NEUTRAL'}
            </span>
            <span className="text-slate-500">Confidence: {data.confidence}%</span>
          </div>
        </div>

        {/* Verdict Details */}
        <div className="mt-4 space-y-3 font-sans">
          <p className="text-sm text-slate-200 font-medium leading-relaxed">
            {data.aiJudge.verdict}
          </p>
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-amber-400 block mb-1">
              💡 Rekomendasi Strategis AI:
            </span>
            {data.aiJudge.balancedTakeaway}
          </div>
        </div>
      </div>

      {/* 2 Analyst Podiums: Bull vs Bear */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
        {/* Bull Analyst */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-base">Bull Analyst</h4>
            </div>

            <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs">
              Conviction: {data.bullAnalyst.convictionScore}/100
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {data.bullAnalyst.thesis}
          </p>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
              Bukti & Argumen Terkuat:
            </span>
            {data.bullAnalyst.keyPoints.map((pt, i) => (
              <div
                key={i}
                className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start space-x-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{pt}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Target Proyeksi Bullish:</span>
            <span className="font-bold text-emerald-400">
              Rp{data.bullAnalyst.targetPrice.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Bear Analyst */}
        <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <TrendingDown className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-base">Bear Analyst</h4>
            </div>

            <div className="px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono font-bold text-xs">
              Risk Conviction: {data.bearAnalyst.convictionScore}/100
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            {data.bearAnalyst.thesis}
          </p>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
              Faktor Risiko & Kerentanan:
            </span>
            {data.bearAnalyst.keyPoints.map((pt, i) => (
              <div
                key={i}
                className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start space-x-2"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>{pt}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Support Penurunan Terdekat:</span>
            <span className="font-bold text-rose-400">
              Rp{data.bearAnalyst.targetPrice.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
