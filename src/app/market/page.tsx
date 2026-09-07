'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  BarChart2,
  Layers,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { StockQuote } from '@/types/market';

export default function MarketPage() {
  const [data, setData] = useState<{
    allQuotes: StockQuote[];
    topGainers: StockQuote[];
    topLosers: StockQuote[];
    highestVolume: StockQuote[];
    popularStocks: StockQuote[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');

  const fetchMarket = async () => {
    try {
      const res = await fetch('/api/market/quotes');
      if (res.ok) {
        const json = await res.json();
        const quotes: StockQuote[] = json.quotes || [];

        const sortedGain = [...quotes].sort((a, b) => b.change_percent - a.change_percent);
        const topGainers = sortedGain.filter((q) => q.change_percent > 0).slice(0, 5);
        const topLosers = [...quotes].sort((a, b) => a.change_percent - b.change_percent).slice(0, 5);
        const highestVolume = [...quotes].sort((a, b) => b.volume - a.volume).slice(0, 5);
        const popular = quotes.filter((q) => ['BBCA', 'BBRI', 'BMRI', 'TLKM', 'ASII', 'GOTO'].includes(q.ticker));

        setData({
          allQuotes: quotes,
          topGainers,
          topLosers,
          highestVolume,
          popularStocks: popular,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarket();
    const interval = setInterval(fetchMarket, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredQuotes = data?.allQuotes.filter((q) => {
    const matchSearch = q.ticker.toLowerCase().includes(search.toLowerCase()) || q.name.toLowerCase().includes(search.toLowerCase());
    const matchSector = selectedSector === 'all' || q.sector.toLowerCase() === selectedSector.toLowerCase();
    return matchSearch && matchSector;
  }) || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-emerald-400" />
            Pasar Saham BEI (Market Overview)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Data harga pasar riil emiten Bursa Efek Indonesia dengan pembaruan otomatis.
          </p>
        </div>

        <button
          onClick={fetchMarket}
          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-emerald-400 rounded-xl transition-colors self-start sm:self-auto"
          title="Refresh Data Pasar"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Top 3 Metric Showcase (Gainers, Losers, Most Active) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Top Gainers */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">
            <ArrowUpRight className="w-4 h-4" />
            <span>Top Gainers Hari Ini</span>
          </div>
          <div className="space-y-2">
            {data?.topGainers.map((s) => (
              <Link
                key={s.ticker}
                href={`/stock/${s.ticker}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-200 transition-colors"
              >
                <div>
                  <span className="font-mono font-bold text-slate-900 text-xs block">{s.ticker}</span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[120px] block font-medium">{s.name}</span>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-slate-900">Rp{s.price.toLocaleString('id-ID')}</div>
                  <div className="text-[11px] font-bold text-emerald-700">+{s.change_percent}%</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5 text-xs font-bold text-rose-700 uppercase tracking-wider">
            <ArrowDownRight className="w-4 h-4" />
            <span>Top Losers Hari Ini</span>
          </div>
          <div className="space-y-2">
            {data?.topLosers.map((s) => (
              <Link
                key={s.ticker}
                href={`/stock/${s.ticker}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50/60 border border-slate-200 hover:border-rose-200 transition-colors"
              >
                <div>
                  <span className="font-mono font-bold text-slate-900 text-xs block">{s.ticker}</span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[120px] block font-medium">{s.name}</span>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-slate-900">Rp{s.price.toLocaleString('id-ID')}</div>
                  <div className="text-[11px] font-bold text-rose-700">{s.change_percent}%</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Highest Volume */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
            <Flame className="w-4 h-4 text-amber-600" />
            <span>Volume Teraktif</span>
          </div>
          <div className="space-y-2">
            {data?.highestVolume.map((s) => (
              <Link
                key={s.ticker}
                href={`/stock/${s.ticker}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-200 transition-colors"
              >
                <div>
                  <span className="font-mono font-bold text-slate-900 text-xs block">{s.ticker}</span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[120px] block font-medium">{s.name}</span>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-slate-900">Rp{s.price.toLocaleString('id-ID')}</div>
                  <div className="text-[10px] font-semibold text-slate-600">{(s.volume / 1000000).toFixed(1)}M lembar</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Search & Filter Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari emiten atau ticker (e.g. BBCA, Telkom)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 capitalize"
            >
              <option value="all">Semua Sektor</option>
              <option value="Financials">Financials</option>
              <option value="Energy">Energy</option>
              <option value="Basic Materials">Basic Materials</option>
              <option value="Consumer Non-Cyclicals">Consumer Non-Cyclicals</option>
              <option value="Consumer Cyclicals">Consumer Cyclicals</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Telecommunication">Telecommunication</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Technology">Technology</option>
            </select>
          </div>
        </div>

        {/* Stock List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase text-slate-500 font-bold">
                <th className="py-3 px-3">Ticker</th>
                <th className="py-3 px-3">Nama Perusahaan</th>
                <th className="py-3 px-3">Sektor</th>
                <th className="py-3 px-3">Harga Terakhir</th>
                <th className="py-3 px-3">Perubahan (Rp)</th>
                <th className="py-3 px-3">Perubahan (%)</th>
                <th className="py-3 px-3">Volume</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredQuotes.map((s) => (
                <tr key={s.ticker} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 text-sm">
                    <Link href={`/stock/${s.ticker}`} className="hover:text-emerald-700 transition-colors">
                      {s.ticker}
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-semibold">{s.name}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{s.sector}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    Rp{s.price.toLocaleString('id-ID')}
                  </td>
                  <td
                    className={`py-3 px-3 font-mono font-bold ${
                      s.change >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {s.change >= 0 ? '+' : ''}Rp{s.change.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span
                      className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded ${
                        s.change_percent >= 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {s.change_percent >= 0 ? '+' : ''}
                      {s.change_percent}%
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-slate-700">
                    {s.volume.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-right font-sans">
                    <Link
                      href={`/stock/${s.ticker}`}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs inline-block"
                    >
                      Trade
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
