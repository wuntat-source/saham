'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Layers,
  BarChart3,
  ArrowLeft,
  Search,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Brain,
  Building2,
  Landmark,
  Globe,
  Briefcase,
  Zap,
  Info,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { LensConsensusResult } from '@/types/lens';

function CompareContent() {
  const searchParams = useSearchParams();
  const initialTicker = searchParams.get('ticker') || 'BBCA';

  const [ticker, setTicker] = useState(initialTicker.toUpperCase());
  const [searchInput, setSearchInput] = useState('');
  const [data, setData] = useState<LensConsensusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConsensus = async (symbol: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/investment-lens/${symbol}/consensus`);
      if (res.ok) {
        const json = await res.json();
        setData(json.consensus);
      } else {
        setError('Gagal memuat konsensus lensa.');
      }
    } catch (e: any) {
      setError(e.message || 'Error fetching consensus data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsensus(ticker);
  }, [ticker]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setTicker(searchInput.trim().toUpperCase());
      setSearchInput('');
    }
  };

  const getSafetyBadge = (status: string) => {
    switch (status) {
      case 'ATTRACTIVE SETUP':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'POSITIVE BIAS':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      case 'HIGH RISK':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'WAIT FOR CONFIRMATION':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getLensIcon = (type: string) => {
    switch (type) {
      case 'INSTITUTIONAL':
        return <Building2 className="w-4 h-4 text-indigo-400" />;
      case 'LONG_TERM_QUALITY':
        return <Landmark className="w-4 h-4 text-emerald-400" />;
      case 'FUNDAMENTAL_GROWTH':
        return <TrendingUp className="w-4 h-4 text-cyan-400" />;
      case 'MACRO_CATALYST':
        return <Globe className="w-4 h-4 text-amber-400" />;
      case 'EARNINGS_EXPECTATIONS':
        return <Briefcase className="w-4 h-4 text-purple-400" />;
      case 'QUALITY_COMPOUNDER':
        return <Zap className="w-4 h-4 text-teal-400" />;
      default:
        return <Layers className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 pb-16">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/investment-lens"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Hub AI Investment Lens
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ketik ticker (e.g. BBRI)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 w-44"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Bandingkan
          </button>
        </form>
      </div>

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <BarChart3 className="w-3.5 h-3.5" />
                6-Lens Consensus Engine
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-400">Komparasi & Deteksi Perbedaan Pandangan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Sintesis Konsensus 6 Lensa Investasi ({ticker})
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              Memadukan pandangan institusional, kualitas jangka panjang, momentum pertumbuhan, sensitivitas makro, ekspektasi laba kuartalan, dan mesin compounder 5 tahun.
            </p>
          </div>

          {data && (
            <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-5 rounded-3xl">
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Lens Consensus</span>
                <span className="text-3xl font-black font-mono text-indigo-400">
                  {data.consensusScore}/100
                </span>
              </div>
              <div className="border-l border-slate-800 pl-4 text-right">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Confidence</span>
                <span className="text-sm font-bold font-mono text-slate-300">{data.consensusConfidence}%</span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider block mt-1 ${getSafetyBadge(
                    data.safetyStatus
                  )}`}
                >
                  {data.safetyStatus}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error || !data ? (
        <div className="text-center py-16 text-slate-500 text-xs">{error || 'Data tidak ditemukan.'}</div>
      ) : (
        <div className="space-y-8">
          {/* 6 Lenses Visual Score Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Distribusi Skor 6 Lensa Investasi</h3>
                <p className="text-xs text-slate-400">Peringkat pandangan analitis dari masing-masing metodologi</p>
              </div>
              <span className="text-xs font-mono text-slate-500">Equal Weight (16.67% per Lensa)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.scores.map((s) => (
                <Link
                  key={s.slug}
                  href={`/investment-lens/${s.slug}?ticker=${ticker}`}
                  className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/40 transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getLensIcon(s.lensType)}
                      <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {s.name.split('/')[0]}
                      </span>
                    </div>
                    <span className="text-lg font-black font-mono text-indigo-400">{s.score}/100</span>
                  </div>

                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        s.score >= 80 ? 'bg-emerald-400' : s.score >= 65 ? 'bg-indigo-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, s.score))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span className="capitalize">{s.safetyStatus}</span>
                    <span className="text-indigo-400 group-hover:underline flex items-center gap-0.5">
                      Detail <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Disagreement Detector Alert */}
          {data.disagreements && data.disagreements.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
                <ShieldAlert className="w-5 h-5" />
                <span>Deteksi Perbedaan Pandangan Antar Lensa (Lens Disagreement Detector)</span>
              </div>

              <div className="space-y-3">
                {data.disagreements.map((dis, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/20 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white">{dis.lensA} ({dis.scoreA})</span>
                        <span className="text-slate-500">vs</span>
                        <span className="font-bold text-white">{dis.lensB} ({dis.scoreB})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                        Divergensi: {dis.divergence} Pts
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-sans">{dis.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Executive Summary Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              AI Investment Lens Summary Matrix
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 font-mono text-center">
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase block">Business Quality</span>
                <span className="text-xs font-bold text-emerald-400 mt-1 block">
                  {data.executiveSummary.businessQuality}
                </span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase block">Growth</span>
                <span className="text-xs font-bold text-indigo-400 mt-1 block">
                  {data.executiveSummary.growth}
                </span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase block">Valuation</span>
                <span className="text-xs font-bold text-cyan-400 mt-1 block">
                  {data.executiveSummary.valuation}
                </span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase block">Risk Profile</span>
                <span className="text-xs font-bold text-amber-400 mt-1 block">
                  {data.executiveSummary.risk}
                </span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase block">Catalyst Bias</span>
                <span className="text-xs font-bold text-teal-400 mt-1 block">
                  {data.executiveSummary.catalyst}
                </span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase block">Long-Term</span>
                <span className="text-xs font-bold text-emerald-400 mt-1 block">
                  {data.executiveSummary.longTermQuality}
                </span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase block">Compounder</span>
                <span className="text-xs font-bold text-purple-400 mt-1 block">
                  {data.executiveSummary.compounderPotential}
                </span>
              </div>
            </div>
          </div>

          {/* Unified AI Investment Thesis (5-Point Framework) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-800 pb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-base font-bold text-white">Unified AI Investment Thesis (5-Pillar Framework)</h3>
                <p className="text-xs text-slate-400">Sintesis terstruktur dari evaluasi seluruh metodologi</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Why Attractive */}
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Mengapa Saham Ini Menarik (Why Attractive)
                </span>
                <ul className="space-y-1.5 text-slate-300">
                  {data.investmentThesis.whyAttractive.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Why May Disappoint */}
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                <span className="font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Faktor yang Berpotensi Mengecewakan (Why Disappoint)
                </span>
                <ul className="space-y-1.5 text-slate-300">
                  {data.investmentThesis.whyMayDisappoint.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What Market May Be Missing */}
              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
                <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Peluang yang Mungkin Terlewatkan Pasar (What Market Misses)
                </span>
                <ul className="space-y-1.5 text-slate-300">
                  {data.investmentThesis.whatMarketMayBeMissing.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What Could Invalidate Thesis */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Kondisi Pembatal Tesis (What Could Invalidate)
                </span>
                <ul className="space-y-1.5 text-slate-300">
                  {data.investmentThesis.whatCouldInvalidateThesis.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* What Investors Should Monitor */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <span className="font-bold text-indigo-300 block">Indikator Kunci yang Wajib Dipantau Siswa:</span>
              <ul className="space-y-1 text-slate-300">
                {data.investmentThesis.whatInvestorsShouldMonitor.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-indigo-400">→</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-800">
              {data.disclaimer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LensComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
