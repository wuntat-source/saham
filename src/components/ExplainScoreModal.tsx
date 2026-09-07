'use client';

import React from 'react';
import { ExplainScoreResponse } from '@/types/intelligence';
import {
  Sparkles,
  X,
  Database,
  Calculator,
  Compass,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface ExplainScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ExplainScoreResponse | null;
  loading: boolean;
}

export default function ExplainScoreModal({
  isOpen,
  onClose,
  data,
  loading,
}: ExplainScoreModalProps) {
  if (!isOpen) return null;

  const pillarTitles: Record<string, string> = {
    overall: 'AI Composite Score',
    fundamental: 'Analisis Fundamental',
    technical: 'Analisis Teknikal',
    valuation: 'Analisis Valuasi & Margin of Safety',
    smartMoney: 'Smart Money / Flow Analysis',
    sentiment: 'Analisis Sentimen Pasar & Media',
    risk: 'Profil Risiko & Ketahanan Portofolio',
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 60) return 'text-teal-400 bg-teal-500/10 border-teal-500/30';
    if (score >= 45) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
            <p className="text-xs text-slate-400 font-mono">
              Menghubungkan engine analisis deterministik & AI reasoning...
            </p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pr-8">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs">
                    {data.ticker}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Explainable AI Engine
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mt-1">
                  {pillarTitles[data.pillar] || data.pillar}
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <div
                  className={`px-3.5 py-1.5 rounded-2xl border font-mono font-black text-lg flex items-center gap-1.5 ${getScoreColor(
                    data.score
                  )}`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{data.score}</span>
                  <span className="text-xs font-normal text-slate-400">/100</span>
                </div>
              </div>
            </div>

            {/* Confidence & Quality Badge */}
            <div className="flex items-center space-x-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 text-xs font-mono">
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Confidence: {data.confidence}%</span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="text-slate-400">
                Transparan & Tanpa Halusinasi Angka
              </div>
            </div>

            {/* 3-Step Structure Pipeline */}
            <div className="space-y-4 font-sans">
              {/* Step 1: DATA / EVIDENCE */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 font-mono">
                  <Database className="w-4 h-4 text-sky-400" />
                  1. Bukti Data Terverifikasi (Data & Metrics)
                </h4>
                <div className="space-y-1.5 text-xs text-slate-300 font-mono pl-6">
                  {data.evidence.map((ev, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <span className="text-sky-400 font-bold">•</span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: CALCULATION */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 font-mono">
                  <Calculator className="w-4 h-4 text-emerald-400" />
                  2. Logika Perhitungan (Calculation Formula)
                </h4>
                <p className="text-xs text-slate-300 pl-6 leading-relaxed">
                  {data.calculation}
                </p>
              </div>

              {/* Step 3: INTERPRETATION */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 font-mono">
                  <Compass className="w-4 h-4 text-amber-400" />
                  3. Interpretasi Strategis (AI Strategic Takeaway)
                </h4>
                <p className="text-xs text-slate-200 pl-6 leading-relaxed font-medium">
                  {data.interpretation}
                </p>
              </div>

              {/* Step 4: RISK FACTORS */}
              {data.riskFactors && data.riskFactors.length > 0 && (
                <div className="bg-rose-950/20 p-4 rounded-2xl border border-rose-900/30 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2 font-mono">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Faktor Risiko yang Perlu Diwaspadai
                  </h4>
                  <div className="space-y-1.5 text-xs text-rose-200/90 pl-6">
                    {data.riskFactors.map((rf, i) => (
                      <div key={i} className="flex items-start space-x-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{rf}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
              <div>Engine: v2.1.0-ai-deterministic</div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                Tutup Penjelasan
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
