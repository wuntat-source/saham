'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  PieChart,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  School,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react';
import QuickSellModal from '@/components/QuickSellModal';
import { PortfolioHealthResult } from '@/types/advanced-intelligence';

interface Holding {
  stockCode: string;
  companyName: string;
  sector: string;
  lots: number;
  totalShares: number;
  avgBuyPrice: number;
  currentPrice: number;
  marketValue: number;
  costBasis: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  change24hPct: number;
}

export default function PortfolioPage() {
  const { user } = useAuth();
  const [data, setData] = useState<{
    cash: number;
    stockValue: number;
    totalEquity: number;
    initialBalance: number;
    totalReturnPct: number;
    totalFloatingPnl: number;
    totalFloatingPnlPct: number;
    holdings: Holding[];
    classInfo: any;
  } | null>(null);

  const [analytics, setAnalytics] = useState<PortfolioHealthResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellingStock, setSellingStock] = useState<Holding | null>(null);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch('/api/portfolio/me');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }

      const aRes = await fetch('/api/portfolio/analytics');
      if (aRes.ok) {
        const aJson = await aRes.json();
        setAnalytics(aJson);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 10000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4 max-w-lg mx-auto my-12">
        <PieChart className="w-12 h-12 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Portofolio Saham</h2>
        <p className="text-xs text-slate-400">
          Silakan masuk dengan akun siswa atau guru untuk melihat ringkasan portofolio Anda.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
        >
          Masuk ke Akun
        </Link>
      </div>
    );
  }

  const initialBal = data?.initialBalance || 100_000_000;
  const totalEq = data?.totalEquity || 100_000_000;
  const returnPct = data?.totalReturnPct || 0;
  const floatingPnl = data?.totalFloatingPnl || 0;
  const floatingPnlPct = data?.totalFloatingPnlPct || 0;

  return (
    <div className="space-y-6">
      {/* Header with Classroom badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <PieChart className="w-6 h-6 text-emerald-400" />
            Portofolio & Ringkasan Aset
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Valuasi terkini dari seluruh kepemilikan saham dan saldo kas virtual Anda.
          </p>
        </div>

        {data?.classInfo && (
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-2xl">
            <School className="w-4 h-4 text-emerald-400" />
            <div className="text-xs">
              <span className="text-slate-400">Kelas: </span>
              <span className="font-bold text-white">{data.classInfo.class_name}</span>
            </div>
          </div>
        )}
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Equity */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
            Total Ekuitas (Total Equity)
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white">
            Rp{totalEq.toLocaleString('id-ID')}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800">
            <span className="text-slate-500">Return vs Modal Awal:</span>
            <span
              className={`font-mono font-bold inline-flex items-center gap-0.5 ${
                returnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {returnPct >= 0 ? '+' : ''}
              {returnPct}%
            </span>
          </div>
        </div>

        {/* Cash Balance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
            Saldo Kas Tersedia
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
            Rp{(data?.cash ?? 100000000).toLocaleString('id-ID')}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800">
            <span className="text-slate-500">Daya Beli (Buying Power):</span>
            <span className="font-mono text-slate-300 font-semibold">100% Kas Riil</span>
          </div>
        </div>

        {/* Floating Gain/Loss */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
            Floating P&L (Saham Aktif)
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black font-mono ${
              floatingPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {floatingPnl >= 0 ? '+' : ''}Rp{floatingPnl.toLocaleString('id-ID')}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800">
            <span className="text-slate-500">Persentase Floating:</span>
            <span
              className={`font-mono font-bold ${
                floatingPnlPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {floatingPnlPct >= 0 ? '+' : ''}
              {floatingPnlPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Phase 3: Portfolio Health & Diversification Intelligence */}
      {analytics && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                  AI Portfolio Health Engine
                </span>
                <h3 className="text-lg font-black text-white">
                  Kesehatan & Diversifikasi Portofolio
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-3 font-mono text-xs">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase block">Health Score</span>
                <span className="text-emerald-400 font-black text-xl">
                  {analytics.healthScore}
                  <span className="text-xs font-normal text-slate-500">/100</span>
                </span>
              </div>
              <div className="text-right pl-3 border-l border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Diversifikasi</span>
                <span className="text-slate-200 font-bold text-sm">
                  {analytics.diversificationScore}/100
                </span>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 font-mono text-xs">
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Rasio Kas (Cash Buffer)</span>
              <span className="text-white font-bold text-sm mt-0.5 block">{analytics.cashRatioPct}%</span>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Sektor Terdiversifikasi</span>
              <span className="text-slate-200 font-bold text-sm mt-0.5 block">
                {analytics.sectorConcentration.length} Sektor
              </span>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Herfindahl Index (HHI)</span>
              <span className="text-slate-200 font-bold text-sm mt-0.5 block">
                {analytics.herfindahlIndex} ({analytics.herfindahlIndex < 0.3 ? 'Merata' : 'Terkonsentrasi'})
              </span>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Estimasi Volatilitas</span>
              <span className="text-teal-400 font-bold text-sm mt-0.5 block">
                {analytics.portfolioVolatilityPct}%
              </span>
            </div>
          </div>

          {/* AI Optimization Suggestions */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-2 font-sans text-xs">
            <span className="font-bold text-amber-400 font-mono text-[10px] uppercase block">
              💡 Rekomendasi Optimasi Portofolio AI:
            </span>
            <div className="space-y-1 text-slate-300">
              {analytics.optimizationSuggestions.map((sug, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{sug}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Holdings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Daftar Aset Saham Aktif ({data?.holdings?.length || 0})
          </h2>
          <button
            onClick={fetchPortfolio}
            title="Refresh Portofolio"
            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {data?.holdings && data.holdings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                  <th className="py-3 px-3">Emiten</th>
                  <th className="py-3 px-3">Jumlah Lot</th>
                  <th className="py-3 px-3">Harga Beli Rata-Rata</th>
                  <th className="py-3 px-3">Harga Terkini</th>
                  <th className="py-3 px-3">Nilai Pasar</th>
                  <th className="py-3 px-3">Gain / Loss (Rp)</th>
                  <th className="py-3 px-3">Gain / Loss (%)</th>
                  <th className="py-3 px-3 text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.holdings.map((h) => (
                  <tr key={h.stockCode} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3">
                      <Link
                        href={`/trade/${h.stockCode}`}
                        className="flex items-center space-x-2 group"
                      >
                        <span className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                          {h.stockCode}
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
                      </Link>
                      <span className="text-[10px] text-slate-400 font-sans block truncate max-w-[150px]">
                        {h.companyName}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-white font-bold">
                      {h.lots} Lot
                      <span className="text-[10px] text-slate-500 block font-normal">
                        {h.totalShares.toLocaleString('id-ID')} lembar
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      Rp{h.avgBuyPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      Rp{h.currentPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-200">
                      Rp{h.marketValue.toLocaleString('id-ID')}
                    </td>
                    <td
                      className={`py-3 px-3 font-bold ${
                        h.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {h.unrealizedPnl >= 0 ? '+' : ''}Rp{h.unrealizedPnl.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded ${
                          h.unrealizedPnlPct >= 0
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {h.unrealizedPnlPct >= 0 ? '+' : ''}
                        {h.unrealizedPnlPct}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-2 font-sans">
                        <button
                          onClick={() => setSellingStock(h)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all"
                        >
                          Jual
                        </button>
                        <Link
                          href={`/trade/${h.stockCode}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                        >
                          Trade
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 space-y-3">
            <PieChart className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="text-slate-400 text-xs">
              Belum ada saham dalam portofolio Anda.
            </div>
            <Link
              href="/trade/BBCA"
              className="inline-block px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
            >
              Mulai Beli Saham IDX
            </Link>
          </div>
        )}
      </div>

      {/* Quick Sell Modal */}
      {sellingStock && (
        <QuickSellModal
          stock={{
            stockCode: sellingStock.stockCode,
            companyName: sellingStock.companyName,
            lots: sellingStock.lots,
            avgBuyPrice: sellingStock.avgBuyPrice,
            currentPrice: sellingStock.currentPrice,
          }}
          onClose={() => setSellingStock(null)}
          onSuccess={() => {
            fetchPortfolio();
          }}
        />
      )}
    </div>
  );
}
