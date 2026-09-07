'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Layers,
  Building2,
  Landmark,
  TrendingUp,
  Globe,
  Briefcase,
  Zap,
  ArrowLeft,
  Search,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  RefreshCw,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import { LENS_REGISTRY, getLensMetadata } from '@/modules/investment-lens/metadata/lens-registry';

function LensDetailContent({ lensType }: { lensType: string }) {
  const searchParams = useSearchParams();
  const initialTicker = searchParams.get('ticker') || 'BBCA';

  const [ticker, setTicker] = useState(initialTicker.toUpperCase());
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const lensMeta = getLensMetadata(lensType) || LENS_REGISTRY[0];

  const fetchLensData = async (symbol: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/investment-lens/${symbol}/${lensMeta.slug}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      } else {
        setError('Gagal memuat data analisis lensa.');
      }
    } catch (e: any) {
      setError(e.message || 'Error fetching lens data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLensData(ticker);
  }, [ticker, lensType]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 pb-16">
      {/* Top Breadcrumb & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/investment-lens"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Hub AI Investment Lens
        </Link>

        {/* Lens Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {LENS_REGISTRY.map((l) => (
            <Link
              key={l.slug}
              href={`/investment-lens/${l.slug}?ticker=${ticker}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                l.slug === lensMeta.slug
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {l.name.split('/')[0]}
            </Link>
          ))}
        </div>
      </div>

      {/* Header Profile & Stock Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{lensMeta.name}</h1>
              <span className="text-xs bg-slate-950 text-slate-400 border border-slate-800 px-3 py-1 rounded-full font-mono">
                {lensMeta.horizon}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">{lensMeta.description}</p>
          </div>

          {/* Ticker Search */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ganti ticker (e.g. BBRI)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-400 w-44"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Analisis
            </button>
          </form>
        </div>

        {/* Stock Title & Score Badge Strip */}
        {data && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xl font-mono">
                {data.ticker}
              </div>
              <div>
                <h2 className="text-xl font-black text-white">{data.companyName}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400 font-mono">
                    Harga: Rp{data.currentPrice.toLocaleString('id-ID')}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getSafetyBadge(
                      data.safetyStatus
                    )}`}
                  >
                    {data.safetyStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Lens Score</span>
                <span className="text-3xl font-black font-mono text-indigo-400">{data.score}/100</span>
              </div>
              <div className="border-l border-slate-800 pl-4 text-right">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">Confidence</span>
                <span className="text-sm font-bold font-mono text-slate-300">{data.confidence}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error || !data ? (
        <div className="text-center py-16 text-slate-500 text-xs">{error || 'Data tidak ditemukan.'}</div>
      ) : (
        <div className="space-y-8">
          {/* Pillar Scores & Metrics Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pillar Gauges */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Pillar Breakdown
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {Object.entries(data.pillarScores || {}).map(([key, val]: [string, any]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-bold text-white">{val}/100</span>
                    </div>
                    <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, val))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Metrics Table */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Key Valuation & Financial Metrics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
                {Object.entries(data.metrics || {}).map(([key, val]: [string, any]) => (
                  <div key={key} className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl">
                    <span className="text-[10px] text-slate-500 uppercase block truncate">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-base font-bold text-white mt-1 block">
                      {typeof val === 'number' ? val.toLocaleString('id-ID') : val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Thesis Prose */}
              <div className="mt-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed">
                <span className="font-bold text-indigo-300 block mb-1">Metodologi Synthesis:</span>
                {data.thesis}
              </div>
            </div>
          </div>

          {/* Scenarios Section (Bull, Base, Bear) */}
          {data.scenarios && data.scenarios.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-white">Probabilistic Scenario Analysis</h3>
                <p className="text-xs text-slate-400">
                  Estimasi nilai wajar (*Fair Value Range*) dan implikasi return berdasarkan skenario pasar.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                {data.scenarios.map((sc: any) => {
                  const isBull = sc.name.includes('Bull');
                  const isBear = sc.name.includes('Bear');

                  return (
                    <div
                      key={sc.name}
                      className={`p-5 rounded-2xl border space-y-3 ${
                        isBull
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : isBear
                          ? 'bg-rose-950/20 border-rose-500/30'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white uppercase">{sc.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          Peluang {sc.probabilityPct}%
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase">Fair Value</span>
                        <div className="text-xl font-bold text-white">
                          Rp{sc.fairValue.toLocaleString('id-ID')}
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            sc.impliedUpsidePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {sc.impliedUpsidePct >= 0 ? '+' : ''}
                          {sc.impliedUpsidePct}% Implied Upside
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed pt-2 border-t border-slate-800/80">
                        {sc.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5-Year Return Model for Compounder Lens */}
          {data.fiveYearReturnModel && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Zap className="w-5 h-5 text-teal-400" />
                5-Year Shareholder Return Model Decomposition
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-center">
                <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[10px] text-slate-500 uppercase">Fundamental Return</span>
                  <div className="text-xl font-black text-emerald-400 mt-1">
                    +{data.fiveYearReturnModel.fundamentalReturnPctAnnualized}% / thn
                  </div>
                  <span className="text-[10px] text-slate-400">Pertumbuhan Laba Riil</span>
                </div>
                <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[10px] text-slate-500 uppercase">Dividend Return</span>
                  <div className="text-xl font-black text-cyan-400 mt-1">
                    +{data.fiveYearReturnModel.dividendReturnPctAnnualized}% / thn
                  </div>
                  <span className="text-[10px] text-slate-400">Arus Dividen Tunai</span>
                </div>
                <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl">
                  <span className="text-[10px] text-slate-500 uppercase">Multiple Re-rating</span>
                  <div className="text-xl font-black text-indigo-400 mt-1">
                    {data.fiveYearReturnModel.valuationMultipleChangePctAnnualized >= 0 ? '+' : ''}
                    {data.fiveYearReturnModel.valuationMultipleChangePctAnnualized}% / thn
                  </div>
                  <span className="text-[10px] text-slate-400">Ekspansi / Kompresi P/E</span>
                </div>
                <div className="bg-slate-950/70 border border-teal-500/30 p-4 rounded-2xl">
                  <span className="text-[10px] text-teal-400 uppercase font-bold">Total Return Model</span>
                  <div className="text-2xl font-black text-teal-300 mt-1">
                    ~{data.fiveYearReturnModel.totalEstimatedShareholderReturnAnnualized}% / thn
                  </div>
                  <span className="text-[10px] text-slate-400">Estimasi Imbal Hasil Majemuk</span>
                </div>
              </div>
            </div>
          )}

          {/* Transparent FACT vs AI OPINION Breakdown */}
          {data.transparency && data.transparency.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                Data Transparency: Fact vs Calculation vs AI Opinion
              </h3>

              <div className="space-y-4">
                {data.transparency.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl text-xs"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">
                        1. FACT (Data Terverifikasi)
                      </span>
                      <p className="text-slate-300">{item.fact}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 block mb-1">
                        2. CALCULATION (Model Deterministik)
                      </span>
                      <p className="text-slate-300">{item.calculation}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 block mb-1">
                        3. INTERPRETATION (Analisis Finansial)
                      </span>
                      <p className="text-slate-300">{item.interpretation}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold text-amber-400 block mb-1">
                        4. AI OPINION (Perspektif Edukatif)
                      </span>
                      <p className="text-slate-300">{item.aiOpinion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student Educational Mode Callout */}
          {data.educationalGuide && (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                <span>Mode Edukasi Siswa (Student Learning Mode)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-1.5">
                  <span className="font-bold text-indigo-400 block">Apa artinya analisis ini?</span>
                  <p className="text-slate-300 leading-relaxed">{data.educationalGuide.whatDoesThisMean}</p>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-1.5">
                  <span className="font-bold text-emerald-400 block">Apa yang harus saya pelajari?</span>
                  <p className="text-slate-300 leading-relaxed">{data.educationalGuide.whatShouldILearn}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LensDetailPage({ params }: { params: Promise<{ lensType: string }> }) {
  const { lensType } = use(params);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      }
    >
      <LensDetailContent lensType={lensType} />
    </Suspense>
  );
}
