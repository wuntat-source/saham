'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  BarChart2,
  Zap,
  Flame,
  Filter,
  Building2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { STOCKS } from '@/lib/constants';

const SECTOR_CATEGORIES = [
  { id: 'all', label: 'Semua Sektor' },
  { id: 'Financials', label: '🏦 Financials' },
  { id: 'Energy', label: '⚡ Energy' },
  { id: 'Consumer Non-Cyclicals', label: '🛒 Consumer Non-Cyclicals' },
  { id: 'Consumer Cyclicals', label: '🏬 Consumer Cyclicals' },
  { id: 'Basic Materials', label: '⛏️ Basic Materials' },
  { id: 'Technology', label: '💻 Technology' },
  { id: 'Healthcare', label: '🏥 Healthcare' },
  { id: 'Infrastructure', label: '📡 Infrastructure' },
  { id: 'Properties & Real Estate', label: '🏢 Real Estate' },
  { id: 'Transportation & Logistics', label: '🚚 Transportation' },
  { id: 'Industrials', label: '🏭 Industrials' },
];

const POPULAR_TICKERS = ['BBCA', 'BBRI', 'BMRI', 'TLKM', 'ASII', 'GOTO', 'AMMN', 'ADRO', 'ICBP', 'ANTM'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [sortBy, setSortBy] = useState<'ticker' | 'price' | 'peRatio'>('ticker');

  const filteredStocks = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = STOCKS.filter((stock) => {
      const matchesQuery =
        !q ||
        stock.ticker.toLowerCase().includes(q) ||
        stock.name.toLowerCase().includes(q) ||
        stock.sector.toLowerCase().includes(q) ||
        stock.description.toLowerCase().includes(q);

      const matchesSector =
        selectedSector === 'all' ||
        stock.sector.toLowerCase().includes(selectedSector.toLowerCase());

      return matchesQuery && matchesSector;
    });

    if (sortBy === 'price') {
      result = [...result].sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortBy === 'peRatio') {
      result = [...result].sort((a, b) => a.peRatio - b.peRatio);
    } else {
      result = [...result].sort((a, b) => a.ticker.localeCompare(b.ticker));
    }

    return result;
  }, [query, selectedSector, sortBy]);

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Search className="w-3.5 h-3.5" />
            <span>Pusat Pencarian Saham IDX</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Cari & Analisis Seluruh Saham Indonesia
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Temukan emiten berdasarkan kode ticker, nama perusahaan, sektor industri, atau rasio valuasi fundamental.
          </p>

          {/* Search Input Box */}
          <div className="pt-3">
            <div className="relative max-w-2xl">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Ketik kode ticker atau nama perusahaan (misal: BBCA, Bank Mandiri, Antam, Telkom)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium shadow-lg border-2 border-transparent focus:border-emerald-500 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3.5 top-3.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-lg font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Popular shortcuts */}
          <div className="flex items-center gap-2 pt-2 flex-wrap text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Sering Dicari:
            </span>
            {POPULAR_TICKERS.map((ticker) => (
              <button
                key={ticker}
                onClick={() => setQuery(ticker)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-emerald-600 text-slate-200 hover:text-white border border-slate-700 font-mono font-bold text-xs transition-colors"
              >
                {ticker}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Sector Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {SECTOR_CATEGORIES.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSelectedSector(sec.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSector === sec.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500 font-medium">Urutkan:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="ticker">Kode Saham (A-Z)</option>
            <option value="price">Harga Tertinggi</option>
            <option value="peRatio">P/E Ratio Terendah</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1 font-medium">
        <div>
          Menampilkan <span className="font-bold text-slate-900">{filteredStocks.length}</span> emiten saham
          {selectedSector !== 'all' && ` pada sektor ${selectedSector}`}
          {query && ` yang cocok dengan "${query}"`}
        </div>
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStocks.map((stock) => (
          <div
            key={stock.ticker}
            className="bg-white border border-slate-200 hover:border-emerald-400 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              {/* Header: Badge & Sector */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-mono font-black text-sm group-hover:bg-emerald-600 transition-colors shadow-xs">
                    {stock.ticker}
                  </div>
                  <div>
                    <h3 className="font-mono font-black text-slate-900 text-base flex items-center gap-1.5">
                      {stock.ticker}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 inline-block">
                      {stock.sector}
                    </span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-base font-black text-slate-900">
                    Rp{stock.basePrice.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold">
                    Cap: {stock.marketCap}
                  </div>
                </div>
              </div>

              {/* Company Name & Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{stock.name}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {stock.description}
                </p>
              </div>

              {/* Fundamental Metrics Pill */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-2xl p-2.5 border border-slate-100 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">P/E Ratio:</span>
                  <span className="font-bold text-slate-800">{stock.peRatio}x</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Kode Yahoo:</span>
                  <span className="font-bold text-slate-800">{stock.yahooSymbol}</span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center gap-2">
              <Link
                href={`/stock/${stock.ticker}`}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold text-center transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Chart & Detail</span>
              </Link>
              <Link
                href={`/trade/${stock.ticker}`}
                className="py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                title="Beli/Jual Saham Ini"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Trade</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
