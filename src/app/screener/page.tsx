'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ScreenerItem, TrendSignal, ValuationStatus, RiskLevel } from '@/types/intelligence';
import {
  Sparkles,
  Search,
  SlidersHorizontal,
  Filter,
  ArrowUpDown,
  Trophy,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  DollarSign,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';

export default function ScreenerPage() {
  const router = useRouter();
  const [items, setItems] = useState<ScreenerItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('ALL');
  const [minScore, setMinScore] = useState(0);
  const [signal, setSignal] = useState<string>('ALL');
  const [valuation, setValuation] = useState<string>('ALL');
  const [risk, setRisk] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchScreener = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (sector !== 'ALL') params.append('sector', sector);
      if (minScore > 0) params.append('minScore', minScore.toString());
      if (signal !== 'ALL') params.append('signal', signal);
      if (valuation !== 'ALL') params.append('valuation', valuation);
      if (risk !== 'ALL') params.append('risk', risk);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const res = await fetch(`/api/screener?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      console.error('Failed to fetch screener data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreener();
  }, [search, sector, minScore, signal, valuation, risk, sortBy, sortOrder, page]);

  const sectors = [
    'ALL',
    'Financials',
    'Telecommunication',
    'Technology',
    'Consumer Cyclicals',
    'Consumer Non-Cyclicals',
    'Healthcare',
    'Energy',
    'Basic Materials',
    'Infrastructure',
    'Real Estate',
  ];

  const getScoreBadge = (score: number) => {
    let color = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    if (score >= 80) color = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    else if (score >= 65) color = 'bg-teal-500/20 text-teal-400 border-teal-500/30';
    else if (score >= 45) color = 'bg-amber-500/20 text-amber-400 border-amber-500/30';

    return (
      <span className={`px-2.5 py-1 rounded-xl font-mono font-bold text-xs border ${color}`}>
        {score}
      </span>
    );
  };

  const getSignalBadge = (sig: TrendSignal) => {
    if (sig === 'UPTREND' || sig === 'BREAKOUT') {
      return (
        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
          {sig}
        </span>
      );
    }
    if (sig === 'DOWNTREND' || sig === 'BREAKDOWN') {
      return (
        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold">
          {sig}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono font-bold">
        {sig}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center gap-1.5 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              AI STOCK SCREENER V2
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Analisis Komprehensif BEI / IDX
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Penyaring Saham Pintar Multi-Pilar
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
            Saring dan ranking seluruh emiten terbaik berdasarkan perhitungan deterministik Fundamental, Teknikal, Valuasi, Smart Money Flow, Sentimen, dan Profil Risiko.
          </p>
        </div>

        {/* Top 10 Navigation Shortcut */}
        <Link
          href="/screener/top"
          className="flex items-center space-x-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-5 py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 transition-all font-sans text-xs sm:text-sm group"
        >
          <Trophy className="w-5 h-5 text-slate-950" />
          <span>Lihat Top 10 Saham AI</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Cari Ticker (e.g. BBCA, ADRO)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Sector Filter */}
          <div>
            <select
              value={sector}
              onChange={(e) => {
                setSector(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s === 'ALL' ? 'Semua Sektor Industri' : s}
                </option>
              ))}
            </select>
          </div>

          {/* Technical Signal */}
          <div>
            <select
              value={signal}
              onChange={(e) => {
                setSignal(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Sinyal Teknikal</option>
              <option value="UPTREND">UPTREND (Bullish)</option>
              <option value="BREAKOUT">BREAKOUT (Ekspansi Vol)</option>
              <option value="SIDEWAYS">SIDEWAYS (Konsolidasi)</option>
              <option value="DOWNTREND">DOWNTREND (Bearish)</option>
              <option value="BREAKDOWN">BREAKDOWN</option>
            </select>
          </div>

          {/* Valuation Filter */}
          <div>
            <select
              value={valuation}
              onChange={(e) => {
                setValuation(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Semua Status Valuasi</option>
              <option value="UNDERVALUED">UNDERVALUED (Murah/Diskon)</option>
              <option value="FAIR">FAIR (Wajar)</option>
              <option value="OVERVALUED">OVERVALUED (Premium)</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Row: Min Score & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-xs font-mono">
          <div className="flex items-center space-x-3">
            <span className="text-slate-400 font-sans">Min Skor AI:</span>
            <div className="flex items-center space-x-2">
              {[0, 60, 70, 80].map((sc) => (
                <button
                  key={sc}
                  onClick={() => {
                    setMinScore(sc);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                    minScore === sc
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {sc === 0 ? 'Semua' : `≥ ${sc}`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-sans">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
            >
              <option value="score">AI Overall Score</option>
              <option value="fundamental">Skor Fundamental</option>
              <option value="technical">Skor Teknikal</option>
              <option value="valuation">Skor Valuasi</option>
              <option value="changePercent">Perubahan Harga (%)</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 hover:text-white"
              title="Balik urutan sort"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Screener Results Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div>
            Menampilkan <span className="text-white font-bold">{items.length}</span> dari{' '}
            <span className="text-emerald-400 font-bold">{total}</span> emiten teranalisis
          </div>
          <button
            onClick={() => fetchScreener()}
            className="flex items-center space-x-1 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
            <p className="text-xs text-slate-400 font-mono">
              Memproses kalkulasi deterministik & memfilter emiten...
            </p>
          </div>
        ) : items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60">
                  <th className="py-3 px-4 text-center">Rank</th>
                  <th className="py-3 px-4">Emiten</th>
                  <th className="py-3 px-4">Harga Terakhir</th>
                  <th className="py-3 px-4 text-center">AI Score</th>
                  <th className="py-3 px-4 text-center">Confidence</th>
                  <th className="py-3 px-4 text-center">Fundamental</th>
                  <th className="py-3 px-4 text-center">Teknikal</th>
                  <th className="py-3 px-4 text-center">Valuasi</th>
                  <th className="py-3 px-4 text-center">Smart Money</th>
                  <th className="py-3 px-4 text-center">Sinyal</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {items.map((item) => (
                  <tr
                    key={item.ticker}
                    className="hover:bg-slate-850/60 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/stock/${item.ticker}`)}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-xs ${
                          item.rank === 1
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black'
                            : item.rank === 2
                            ? 'bg-slate-300/20 text-slate-200 border border-slate-300/30'
                            : item.rank === 3
                            ? 'bg-amber-700/20 text-amber-500 border border-amber-700/30'
                            : 'text-slate-500'
                        }`}
                      >
                        {item.rank}
                      </span>
                    </td>

                    {/* Emiten */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-emerald-400 text-xs">
                          {item.ticker.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {item.ticker}
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans truncate max-w-[140px]">
                            {item.companyName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price & Change */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-bold">
                        Rp{item.price.toLocaleString('id-ID')}
                      </div>
                      <div
                        className={`text-[10px] inline-flex items-center gap-0.5 ${
                          item.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {item.changePercent >= 0 ? '+' : ''}
                        {item.changePercent}%
                      </div>
                    </td>

                    {/* AI Score */}
                    <td className="py-3.5 px-4 text-center">
                      {getScoreBadge(item.overallScore)}
                    </td>

                    {/* Confidence */}
                    <td className="py-3.5 px-4 text-center text-slate-400">
                      {item.confidenceScore}%
                    </td>

                    {/* Pillars */}
                    <td className="py-3.5 px-4 text-center text-slate-300">
                      {item.fundamentalScore}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-300">
                      {item.technicalScore}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-300">
                      {item.valuationScore}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-300">
                      {item.smartMoneyScore}
                    </td>

                    {/* Signal */}
                    <td className="py-3.5 px-4 text-center">
                      {getSignalBadge(item.signal)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/stock/${item.ticker}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-sans font-medium transition-colors"
                        >
                          Analisis
                        </Link>
                        <Link
                          href={`/stock/${item.ticker}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] font-sans transition-colors"
                        >
                          Trading
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 text-xs">
            Tidak ada saham yang sesuai dengan filter kriteria yang dipilih.
          </div>
        )}
      </div>
    </div>
  );
}
