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
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-1">
            Total Ekuitas (Total Equity)
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
            Rp{totalEq.toLocaleString('id-ID')}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500 font-medium">Return vs Modal Awal:</span>
            <span
              className={`font-mono font-bold inline-flex items-center gap-0.5 ${
                returnPct >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {returnPct >= 0 ? '+' : ''}
              {returnPct}%
            </span>
          </div>
        </div>

        {/* Cash Balance */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-1">
            Saldo Kas Tersedia
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700">
            Rp{(data?.cash ?? 100000000).toLocaleString('id-ID')}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500 font-medium">Daya Beli (Buying Power):</span>
            <span className="font-mono text-slate-700 font-semibold">100% Kas Riil</span>
          </div>
        </div>

        {/* Floating Gain/Loss */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-1">
            Floating P&L (Saham Aktif)
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black font-mono ${
              floatingPnl >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {floatingPnl >= 0 ? '+' : ''}Rp{floatingPnl.toLocaleString('id-ID')}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500 font-medium">Persentase Floating:</span>
            <span
              className={`font-mono font-bold ${
                floatingPnlPct >= 0 ? 'text-emerald-700' : 'text-rose-700'
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
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                  AI Portfolio Health Engine
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Kesehatan & Diversifikasi Portofolio
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-3 font-mono text-xs">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Health Score</span>
                <span className="text-emerald-700 font-black text-xl">
                  {analytics.healthScore}
                  <span className="text-xs font-normal text-slate-500">/100</span>
                </span>
              </div>
              <div className="text-right pl-3 border-l border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Diversifikasi</span>
                <span className="text-slate-800 font-bold text-sm">
                  {analytics.diversificationScore}/100
                </span>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 font-mono text-xs">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Rasio Kas (Cash Buffer)</span>
              <span className="text-slate-900 font-bold text-sm mt-0.5 block">{analytics.cashRatioPct}%</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Sektor Terdiversifikasi</span>
              <span className="text-slate-800 font-bold text-sm mt-0.5 block">
                {analytics.sectorConcentration.length} Sektor
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Herfindahl Index (HHI)</span>
              <span className="text-slate-800 font-bold text-sm mt-0.5 block">
                {analytics.herfindahlIndex} ({analytics.herfindahlIndex < 0.3 ? 'Merata' : 'Terkonsentrasi'})
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Estimasi Volatilitas</span>
              <span className="text-teal-700 font-bold text-sm mt-0.5 block">
                {analytics.portfolioVolatilityPct}%
              </span>
            </div>
          </div>

          {/* AI Optimization Suggestions */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 font-sans text-xs">
            <span className="font-bold text-amber-700 font-mono text-[10px] uppercase block">
              💡 Rekomendasi Optimasi Portofolio AI:
            </span>
            <div className="space-y-1 text-slate-700">
              {analytics.optimizationSuggestions.map((sug, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span>{sug}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Holdings Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Daftar Aset Saham Aktif ({data?.holdings?.length || 0})
          </h2>
          <button
            onClick={fetchPortfolio}
            title="Refresh Portofolio"
            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {data?.holdings && data.holdings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] uppercase text-slate-500 font-bold">
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
              <tbody className="divide-y divide-slate-100">
                {data.holdings.map((h) => (
                  <tr key={h.stockCode} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <Link
                        href={`/trade/${h.stockCode}`}
                        className="flex items-center space-x-2 group"
                      >
                        <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {h.stockCode}
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-700" />
                      </Link>
                      <span className="text-[10px] text-slate-500 font-sans block truncate max-w-[150px] font-medium">
                        {h.companyName}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-900 font-bold">
                      {h.lots} Lot
                      <span className="text-[10px] text-slate-500 block font-normal">
                        {h.totalShares.toLocaleString('id-ID')} lembar
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      Rp{h.avgBuyPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      Rp{h.currentPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      Rp{h.marketValue.toLocaleString('id-ID')}
                    </td>
                    <td
                      className={`py-3 px-3 font-bold ${
                        h.unrealizedPnl >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {h.unrealizedPnl >= 0 ? '+' : ''}Rp{h.unrealizedPnl.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded ${
                          h.unrealizedPnlPct >= 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
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
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
                        >
                          Jual
                        </button>
                        <Link
                          href={`/trade/${h.stockCode}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-all"
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
            <PieChart className="w-12 h-12 text-slate-400 mx-auto" />
            <div className="text-slate-500 text-xs font-medium">
              Belum ada saham dalam portofolio Anda.
            </div>
            <Link
              href="/trade/BBCA"
              className="inline-block px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
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
