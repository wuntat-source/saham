'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Building2,
  Landmark,
  TrendingUp,
  Globe,
  Briefcase,
  Zap,
  Search,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react';
import { LENS_REGISTRY } from '@/modules/investment-lens/metadata/lens-registry';

export default function InvestmentLensLandingPage() {
  const [selectedTicker, setSelectedTicker] = useState('BBCA');
  const [searchInput, setSearchInput] = useState('');

  const popularStocks = [
    { ticker: 'BBCA', name: 'Bank Central Asia' },
    { ticker: 'BBRI', name: 'Bank Rakyat Indonesia' },
    { ticker: 'TLKM', name: 'Telkom Indonesia' },
    { ticker: 'ASII', name: 'Astra International' },
    { ticker: 'ADRO', name: 'Adaro Energy' },
    { ticker: 'UNVR', name: 'Unilever Indonesia' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSelectedTicker(searchInput.trim().toUpperCase());
      setSearchInput('');
    }
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Building2':
        return <Building2 className="w-6 h-6 text-indigo-400" />;
      case 'Landmark':
        return <Landmark className="w-6 h-6 text-emerald-400" />;
      case 'TrendingUp':
        return <TrendingUp className="w-6 h-6 text-cyan-400" />;
      case 'Globe':
        return <Globe className="w-6 h-6 text-amber-400" />;
      case 'Briefcase':
        return <Briefcase className="w-6 h-6 text-purple-400" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-teal-400" />;
      default:
        return <Layers className="w-6 h-6 text-indigo-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                EduTradeX Multi-Framework Intelligence
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-400">6 Lensa Metodologi Investasi</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              AI Investment Lens
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Menganalisis satu saham yang sama melalui enam metodologi riset investasi profesional. Temukan titik temu (*consensus*), identifikasi perbedaan pandangan antar lensa, dan pelajari bagaimana institusi mengevaluasi nilai bisnis.
            </p>
          </div>

          {/* Compare Button */}
          <Link
            href={`/investment-lens/compare?ticker=${selectedTicker}`}
            className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-xs font-bold rounded-2xl shadow-xl shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Bandingkan 6 Lensa ({selectedTicker})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stock Search & Quick Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Pilih Emiten:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {popularStocks.map((s) => (
              <button
                key={s.ticker}
                onClick={() => setSelectedTicker(s.ticker)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedTicker === s.ticker
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {s.ticker}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <input
              type="text"
              placeholder="Ketik ticker (e.g. BBCA)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white uppercase font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-400"
            />
          </div>
          <button
            type="submit"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-xl transition cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* 6 Methodology Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LENS_REGISTRY.map((lens) => (
          <div
            key={lens.slug}
            className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-6 flex flex-col justify-between space-y-6 transition-all duration-200 group relative overflow-hidden"
          >
            <div className="space-y-4">
              {/* Top Row: Icon & Horizon */}
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {getIcon(lens.iconName)}
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-950 text-slate-400 border border-slate-800 font-semibold">
                  {lens.horizon}
                </span>
              </div>

              {/* Title & Focus */}
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {lens.name}
                </h3>
                <p className="text-xs text-indigo-400/90 font-medium mt-0.5">
                  Fokus: {lens.primaryFocus}
                </p>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 leading-relaxed">
                {lens.description}
              </p>

              {/* Evaluates Key Metrics Checklist */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                  Metrik Utama:
                </span>
                <ul className="space-y-1 text-xs text-slate-300 font-mono">
                  {lens.keyMetrics.map((m, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-indigo-400">•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Action Button */}
            <div className="pt-4 border-t border-slate-800">
              <Link
                href={`${lens.route}?ticker=${selectedTicker}`}
                className="w-full py-2.5 px-4 bg-slate-950 hover:bg-indigo-600 border border-slate-800 hover:border-indigo-500 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer group/btn"
              >
                <span>Analisis {selectedTicker}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Educational Notice */}
      <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold text-slate-300">Prinsip Pembelajaran Transparan: </span>
          Metodologi dalam AI Investment Lens terinspirasi oleh kerangka kerja riset investasi umum dan tidak mewakili proses berpemilik (*proprietary*) dari institusi keuangan mana pun. Semua analisis murni untuk keperluan simulasi pendidikan pasar modal di EduTradeX.
        </p>
      </div>
    </div>
  );
}
