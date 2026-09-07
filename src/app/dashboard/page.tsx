'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Wallet,
  PieChart,
  TrendingUp,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Briefcase,
  History,
  Clock,
  ArrowRight,
  School,
  Sparkles,
} from 'lucide-react';
import { PortfolioSummary } from '@/types/portfolio';
import { StockQuote } from '@/types/market';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [marketMovers, setMarketMovers] = useState<StockQuote[]>([]);
  const [classRank, setClassRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch Portfolio
      const pRes = await fetch('/api/portfolio/me');
      if (pRes.ok) {
        const pData = await pRes.json();
        setPortfolio(pData);
      }

      // 2. Fetch Recent Trades
      const tRes = await fetch('/api/trade/history?limit=5');
      if (tRes.ok) {
        const tData = await tRes.json();
        setRecentTrades(tData.transactions || []);
      }

      // 3. Fetch Market Quotes
      const mRes = await fetch('/api/market/quotes');
      if (mRes.ok) {
        const mData = await mRes.json();
        const quotes: StockQuote[] = mData.quotes || [];
        setMarketMovers(quotes.slice(0, 4));
      }

      // 4. Fetch Class Rank if enrolled
      const enrolledClass = user.enrolledClasses?.[0]?.class;
      if (enrolledClass) {
        const lRes = await fetch(`/api/classes/${enrolledClass.id}/leaderboard`);
        if (lRes.ok) {
          const lData = await lRes.json();
          const me = lData.leaderboard?.find((s: any) => s.student_id === user.id || s.studentId === user.id);
          if (me) setClassRank(me.rank);
        }
      }
    } catch (e) {
      console.error('Error fetching student dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  if (!user) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4 max-w-lg mx-auto my-12">
        <PieChart className="w-12 h-12 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Dashboard Siswa</h2>
        <p className="text-xs text-slate-400">
          Silakan masuk dengan akun siswa untuk melihat performa portofolio dan peringkat kelas Anda.
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

  const primaryClass = user.enrolledClasses?.[0]?.class;
  const totalEquity = portfolio?.total_equity ?? 100_000_000;
  const cashBalance = portfolio?.cash_balance ?? 100_000_000;
  const unrealizedPnl = portfolio?.unrealized_pnl ?? 0;
  const returnPercent = portfolio?.return_percent ?? 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Classroom Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Briefcase className="w-7 h-7 text-emerald-400" />
            Dashboard Portofolio Siswa
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Selamat datang kembali, <b className="text-white">{user.name}</b>! Pantau aset dan transaksi virtual Anda.
          </p>
        </div>

        {primaryClass && (
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-2xl self-start sm:self-auto">
            <School className="w-4 h-4 text-emerald-400" />
            <div className="text-xs">
              <span className="text-slate-400">Kelas: </span>
              <span className="font-bold text-white">{primaryClass.class_name}</span>
            </div>
            {classRank && (
              <span className="ml-2 bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded text-[10px] font-mono">
                Rank #{classRank}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Equity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
            Total Ekuitas (Equity)
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900">
            Rp{totalEquity.toLocaleString('id-ID')}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Kas + Nilai Pasar Saham
          </div>
        </div>

        {/* Cash Balance */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
            Saldo Kas Virtual
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-700">
            Rp{cashBalance.toLocaleString('id-ID')}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Daya Beli Siap Transaksi
          </div>
        </div>

        {/* Floating P&L */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
            Floating P&L (Saham Aktif)
          </div>
          <div
            className={`text-xl sm:text-2xl font-black font-mono ${
              unrealizedPnl >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {unrealizedPnl >= 0 ? '+' : ''}Rp{unrealizedPnl.toLocaleString('id-ID')}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Keuntungan Belum Direalisasi
          </div>
        </div>

        {/* Total Return ROI */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
            Total Return ROI (%)
          </div>
          <div
            className={`text-xl sm:text-2xl font-black font-mono inline-flex items-center gap-1 ${
              returnPercent >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {returnPercent >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            {returnPercent >= 0 ? '+' : ''}
            {returnPercent}%
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            vs Modal Awal Rp100 Juta
          </div>
        </div>
      </div>

      {/* Grid: Top Holdings & Market Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Holdings (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-600" />
              Kepemilikan Saham Aktif ({portfolio?.holdings?.length || 0})
            </h2>
            <Link
              href="/portfolio"
              className="text-xs text-emerald-700 hover:text-emerald-600 font-bold flex items-center gap-1"
            >
              <span>Lihat Detail</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {portfolio?.holdings && portfolio.holdings.length > 0 ? (
            <div className="space-y-2.5">
              {portfolio.holdings.map((h) => {
                const isProfit = (h.unrealized_pnl ?? (h as any).unrealizedPnl ?? 0) >= 0;
                return (
                  <div
                    key={h.stock_code || (h as any).stockCode}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {h.stock_code || (h as any).stockCode}
                        </span>
                        <span className="text-[10px] text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded font-mono font-semibold">
                          {h.lots} Lot
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block truncate max-w-[160px] font-medium">
                        {h.name || (h as any).companyName}
                      </span>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-slate-900">
                        Rp{(h.market_value || (h as any).marketValue || 0).toLocaleString('id-ID')}
                      </div>
                      <div
                        className={`text-[11px] font-bold ${
                          isProfit ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isProfit ? '+' : ''}Rp
                        {(h.unrealized_pnl ?? (h as any).unrealizedPnl ?? 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs font-medium">
              Belum ada saham yang Anda miliki saat ini.{' '}
              <Link href="/market" className="text-emerald-700 font-bold hover:underline block mt-1">
                Jelajahi Pasar & Beli Saham
              </Link>
            </div>
          )}
        </div>

        {/* Market Movers & Quick Action (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                Pergerakan Pasar Terkini
              </h2>
              <Link
                href="/market"
                className="text-xs text-slate-500 hover:text-slate-900 font-bold flex items-center gap-1"
              >
                <span>Semua</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {marketMovers.map((q) => (
                <Link
                  key={q.ticker}
                  href={`/stock/${q.ticker}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono font-bold text-slate-900 text-xs">{q.ticker}</span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[110px] font-medium">{q.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-slate-900">Rp{q.price.toLocaleString('id-ID')}</div>
                    <div
                      className={`text-[10px] font-bold ${
                        q.change >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {q.change >= 0 ? '+' : ''}
                      {q.change_percent}%
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Trade CTA Card */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Mulai Trading Virtual</h3>
              <p className="text-[11px] text-slate-600 font-medium">Eksekusi order beli & jual dengan data harga riil.</p>
            </div>
            <Link
              href="/market"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-emerald-600/20"
            >
              Buka Pasar
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Trades Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            Histori Transaksi Terakhir
          </h2>
          <Link
            href="/trade-history"
            className="text-xs text-emerald-700 hover:text-emerald-600 font-bold flex items-center gap-1"
          >
            <span>Lihat Semua Transaksi</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentTrades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] uppercase text-slate-500 font-bold">
                  <th className="py-2.5 px-3">Tipe</th>
                  <th className="py-2.5 px-3">Ticker</th>
                  <th className="py-2.5 px-3">Jumlah Lot</th>
                  <th className="py-2.5 px-3">Harga Eksekusi</th>
                  <th className="py-2.5 px-3">Fee Broker</th>
                  <th className="py-2.5 px-3">Total Penyelesaian</th>
                  <th className="py-2.5 px-3">Realized P&L</th>
                  <th className="py-2.5 px-3">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTrades.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.type === 'BUY'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-900 font-bold">{t.stock_code}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-semibold">{t.lot_quantity} Lot</td>
                    <td className="py-2.5 px-3 text-slate-700">Rp{t.price.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-slate-500">Rp{t.broker_fee.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-slate-900 font-bold">
                      Rp{t.total_settlement.toLocaleString('id-ID')}
                    </td>
                    <td
                      className={`py-2.5 px-3 font-bold ${
                        t.realized_pnl >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {t.type === 'SELL'
                        ? `${t.realized_pnl >= 0 ? '+' : ''}Rp${t.realized_pnl.toLocaleString('id-ID')}`
                        : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {new Date(t.executed_at).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 text-xs font-medium">
            Belum ada transaksi perdagangan.
          </div>
        )}
      </div>
    </div>
  );
}
