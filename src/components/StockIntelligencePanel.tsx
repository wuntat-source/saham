'use client';

import React, { useEffect, useState } from 'react';
import {
  StockIntelligenceOverview,
  ExplainScoreResponse,
} from '@/types/intelligence';
import ExplainScoreModal from './ExplainScoreModal';
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  PieChart,
  Activity,
  ShieldCheck,
  Zap,
  Info,
  ChevronRight,
  Flame,
  AlertCircle,
} from 'lucide-react';

interface StockIntelligencePanelProps {
  ticker: string;
}

export default function StockIntelligencePanel({
  ticker,
}: StockIntelligencePanelProps) {
  const [data, setData] = useState<StockIntelligenceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [explanationData, setExplanationData] = useState<ExplainScoreResponse | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchIntelligence = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/stocks/${ticker}/intelligence`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setData(json.intelligence);
        }
      } catch (e) {
        console.error('Failed to load stock intelligence:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchIntelligence();
    return () => {
      isMounted = false;
    };
  }, [ticker]);

  const handleOpenExplain = async (pillar: string) => {
    setSelectedPillar(pillar);
    setModalOpen(true);
    setModalLoading(true);
    try {
      const res = await fetch('/api/ai/explain-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, pillar }),
      });
      if (res.ok) {
        const json = await res.json();
        setExplanationData(json);
      }
    } catch (e) {
      console.error('Failed to fetch AI explanation:', e);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
        <p className="text-xs text-slate-400 font-mono">
          Menganalisis 6 pilar kecerdasan AI untuk {ticker}...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center text-xs text-slate-400">
        Data kecerdasan AI belum dapat dimuat saat ini.
      </div>
    );
  }

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 65) return 'text-teal-400 border-teal-500/30 bg-teal-500/10';
    if (score >= 45) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getPillarStatus = (pillarKey: string) => {
    switch (pillarKey) {
      case 'technical':
        return data.scores.technical.signal;
      case 'valuation':
        return data.scores.valuation.status;
      case 'smartMoney':
        return data.scores.smartMoney.status;
      case 'risk':
        return `RISK: ${data.scores.risk.riskLevel}`;
      case 'sentiment':
        return data.scores.sentiment.sentimentLabel;
      case 'fundamental':
        return data.scores.fundamental.score >= 70 ? 'STRONG ROE' : 'MODERATE';
      default:
        return 'ACTIVE';
    }
  };

  const pillars = [
    {
      key: 'fundamental',
      name: 'Fundamental',
      icon: DollarSign,
      score: data.scores.fundamental.score,
      desc: data.scores.fundamental.summary,
      weight: '20%',
    },
    {
      key: 'technical',
      name: 'Teknikal',
      icon: TrendingUp,
      score: data.scores.technical.score,
      desc: data.scores.technical.summary,
      weight: '20%',
    },
    {
      key: 'valuation',
      name: 'Valuasi',
      icon: PieChart,
      score: data.scores.valuation.score,
      desc: data.scores.valuation.summary,
      weight: '15%',
    },
    {
      key: 'smartMoney',
      name: 'Smart Money / Flow',
      icon: Zap,
      score: data.scores.smartMoney.score,
      desc: data.scores.smartMoney.summary,
      weight: '10%',
    },
    {
      key: 'sentiment',
      name: 'Sentimen Media',
      icon: Activity,
      score: data.scores.sentiment.score,
      desc: data.scores.sentiment.summary,
      weight: '10%',
    },
    {
      key: 'risk',
      name: 'Profil Risiko (Safety)',
      icon: ShieldCheck,
      score: data.scores.risk.score,
      desc: data.scores.risk.summary,
      weight: '15%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Composite AI Score */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center gap-1.5 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                AI INTELLIGENCE ENGINE V2
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Confidence: {data.confidenceScore}% • Quality: {data.dataQualityScore}%
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">
              Evaluasi Kecerdasan Saham {data.ticker}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Analisis multi-pilar deterministik mencakup Fundamental, Indikator Teknikal, Valuasi Komparatif, Arus Modal Institusi, dan Risiko.
            </p>
          </div>

          {/* Master Score Dial Button */}
          <button
            onClick={() => handleOpenExplain('overall')}
            className="group flex items-center space-x-4 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-2xl transition-all shadow-inner"
          >
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">
                AI Composite Score
              </div>
              <div className="text-xs text-emerald-400 font-semibold flex items-center justify-end gap-1">
                <span>Klik untuk Penjelasan</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            <div
              className={`w-16 h-16 rounded-2xl border-2 font-mono font-black text-2xl flex items-center justify-center shadow-lg ${getScoreColorClass(
                data.overallScore
              )}`}
            >
              {data.overallScore}
            </div>
          </button>
        </div>

        {/* Catalyst & Risk Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-800/80 font-mono text-xs">
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-start space-x-2.5">
            <Flame className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Katalis Pendorong Utama
              </span>
              <span className="text-slate-200 font-sans text-xs">
                {data.catalyst || 'Pertumbuhan fundamental positif'}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Faktor Risiko Kunci
              </span>
              <span className="text-slate-200 font-sans text-xs">
                {data.mainRisk || 'Volatilitas pasar modal'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Interactive Score Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          const statusText = getPillarStatus(pillar.key);
          return (
            <div
              key={pillar.key}
              onClick={() => handleOpenExplain(pillar.key)}
              className="group bg-slate-900 hover:bg-slate-850/80 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-xl cursor-pointer transition-all duration-200 flex flex-col justify-between hover:scale-[1.01]"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/40 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {pillar.name}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Bobot: {pillar.weight}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-xl border font-mono font-bold text-sm ${getScoreColorClass(
                      pillar.score
                    )}`}
                  >
                    {pillar.score}
                    <span className="text-[10px] font-normal text-slate-500">/100</span>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-mono text-[10px] font-semibold border border-slate-800">
                    {statusText}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-2">
                  {pillar.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                <span>Lihat Bukti & Penjelasan AI</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanation Modal */}
      <ExplainScoreModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={explanationData}
        loading={modalLoading}
      />
    </div>
  );
}
