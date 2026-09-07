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
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <ArrowUpRight className="w-4 h-4" />
            <span>Top Gainers Hari Ini</span>
          </div>
          <div className="space-y-2">
            {data?.topGainers.map((s) => (
              <Link
                key={s.ticker}
                href={`/stock/${s.ticker}`}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 transition-colors"
              >
                <div>
                  <span className="font-mono font-bold text-white text-xs block">{s.ticker}</span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[120px] block">{s.name}</span>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs text-slate-200">Rp{s.price.toLocaleString('id-ID')}</div>
                  <div className="text-[11px] font-bold text-emerald-400">+{s.change_percent}%</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <ArrowDownRight className="w-4 h-4" />
            <span>Top Losers Hari Ini</span>
          </div>
          <div className="space-y-2">
            {data?.topLosers.map((s) => (
              <Link
                key={s.ticker}
                href={`/stock/${s.ticker}`}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 transition-colors"
              >
                <div>
                  <span className="font-mono font-bold text-white text-xs block">{s.ticker}</span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[120px] block">{s.name}</span>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs text-slate-200">Rp{s.price.toLocaleString('id-ID')}</div>
                  <div className="text-[11px] font-bold text-rose-400">{s.change_percent}%</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Highest Volume */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Flame className="w-4 h-4" />
            <span>Volume Teraktif</span>
          </div>
          <div className="space-y-2">
            {data?.highestVolume.map((s) => (
              <Link
                key={s.ticker}
                href={`/stock/${s.ticker}`}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 transition-colors"
              >
                <div>
                  <span className="font-mono font-bold text-white text-xs block">{s.ticker}</span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[120px] block">{s.name}</span>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs text-slate-200">Rp{s.price.toLocaleString('id-ID')}</div>
                  <div className="text-[10px] text-slate-400">{(s.volume / 1000000).toFixed(1)}M lembar</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Search & Filter Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari emiten atau ticker (e.g. BBCA, Telkom)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 capitalize"
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
              <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
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
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredQuotes.map((s) => (
                <tr key={s.ticker} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-white text-sm">
                    <Link href={`/stock/${s.ticker}`} className="hover:text-emerald-400 transition-colors">
                      {s.ticker}
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-medium">{s.name}</td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{s.sector}</td>
                  <td className="py-3 px-3 font-mono font-bold text-white">
                    Rp{s.price.toLocaleString('id-ID')}
                  </td>
                  <td
                    className={`py-3 px-3 font-mono ${
                      s.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {s.change >= 0 ? '+' : ''}Rp{s.change.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span
                      className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded ${
                        s.change_percent >= 0
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {s.change_percent >= 0 ? '+' : ''}
                      {s.change_percent}%
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    {s.volume.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-right font-sans">
                    <Link
                      href={`/stock/${s.ticker}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
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
