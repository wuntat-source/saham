'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Building2,
  Landmark,
  TrendingUp,
  Globe,
  Briefcase,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Sparkles,
  ChevronRight,
  Brain,
  ShieldAlert,
} from 'lucide-react';
import { LensConsensusResult } from '@/types/lens';

export default function StockInvestmentLensTab({ ticker }: { ticker: string }) {
  const [data, setData] = useState<LensConsensusResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/investment-lens/${ticker}/consensus`);
        if (res.ok) {
          const json = await res.json();
          setData(json.consensus);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [ticker]);

  const getLensIcon = (type: string) => {
    switch (type) {
      case 'INSTITUTIONAL':
        return <Building2 className="w-5 h-5 text-indigo-400" />;
      case 'LONG_TERM_QUALITY':
        return <Landmark className="w-5 h-5 text-emerald-400" />;
      case 'FUNDAMENTAL_GROWTH':
        return <TrendingUp className="w-5 h-5 text-cyan-400" />;
      case 'MACRO_CATALYST':
        return <Globe className="w-5 h-5 text-amber-400" />;
      case 'EARNINGS_EXPECTATIONS':
        return <Briefcase className="w-5 h-5 text-purple-400" />;
      case 'QUALITY_COMPOUNDER':
        return <Zap className="w-5 h-5 text-teal-400" />;
      default:
        return <Layers className="w-5 h-5 text-indigo-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-slate-900 border border-slate-800 rounded-3xl">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Top Banner: Consensus Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                AI Investment Lens
              </span>
              <span className="text-xs text-slate-400 font-mono">6 Metodologi Riset Finansial</span>
            </div>
            <h3 className="text-xl font-black text-white">
              Evaluasi Multiperspektif {ticker}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Consensus Score</span>
              <span className="text-2xl font-black font-mono text-indigo-400">
                {data.consensusScore}/100
              </span>
            </div>
            <Link
              href={`/investment-lens/compare?ticker=${ticker}`}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
            >
              <span>Bandingkan Radar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Lens Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.scores.map((s) => (
          <div
            key={s.slug}
            className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 p-5 rounded-2xl flex flex-col justify-between space-y-3 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getLensIcon(s.lensType)}
                  <span className="text-xs font-bold text-white">{s.name.split('/')[0]}</span>
                </div>
                <span className="text-base font-black font-mono text-indigo-400">{s.score}/100</span>
              </div>

              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    s.score >= 80 ? 'bg-emerald-400' : s.score >= 65 ? 'bg-indigo-400' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, s.score))}%` }}
                />
              </div>

              <span className="text-[10px] text-slate-400 font-mono block capitalize">
                Status: {s.safetyStatus}
              </span>
            </div>

            <Link
              href={`/investment-lens/${s.slug}?ticker=${ticker}`}
              className="pt-2 border-t border-slate-800 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center justify-between"
            >
              <span>View Analysis</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>

      {/* Disagreements Alert (If Any) */}
      {data.disagreements.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <ShieldAlert className="w-4 h-4" />
            <span>Perbedaan Pandangan Antar Lensa:</span>
          </div>
          <p className="text-slate-300">{data.disagreements[0].explanation}</p>
        </div>
      )}

      {/* Executive Summary Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 font-mono text-center">
        <span className="text-[10px] text-slate-500 uppercase block mb-3 font-sans font-bold">
          AI Investment Lens Summary
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
          <div className="bg-slate-950 p-2 rounded-xl">
            <span className="text-[9px] text-slate-500 block">Quality</span>
            <span className="font-bold text-emerald-400 mt-0.5 block">{data.executiveSummary.businessQuality}</span>
          </div>
          <div className="bg-slate-950 p-2 rounded-xl">
            <span className="text-[9px] text-slate-500 block">Growth</span>
            <span className="font-bold text-indigo-400 mt-0.5 block">{data.executiveSummary.growth}</span>
          </div>
          <div className="bg-slate-950 p-2 rounded-xl">
            <span className="text-[9px] text-slate-500 block">Valuation</span>
            <span className="font-bold text-cyan-400 mt-0.5 block">{data.executiveSummary.valuation}</span>
          </div>
          <div className="bg-slate-950 p-2 rounded-xl">
            <span className="text-[9px] text-slate-500 block">Risk</span>
            <span className="font-bold text-amber-400 mt-0.5 block">{data.executiveSummary.risk}</span>
          </div>
          <div className="bg-slate-950 p-2 rounded-xl">
            <span className="text-[9px] text-slate-500 block">Catalyst</span>
            <span className="font-bold text-teal-400 mt-0.5 block">{data.executiveSummary.catalyst}</span>
          </div>
          <div className="bg-slate-950 p-2 rounded-xl">
            <span className="text-[9px] text-slate-500 block">Long-Term</span>
            <span className="font-bold text-emerald-400 mt-0.5 block">{data.executiveSummary.longTermQuality}</span>
          </div>
          <div className="bg-slate-950 p-2 rounded-xl">
            <span className="text-[9px] text-slate-500 block">Compounder</span>
            <span className="font-bold text-purple-400 mt-0.5 block">{data.executiveSummary.compounderPotential}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
