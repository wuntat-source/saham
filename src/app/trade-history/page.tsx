'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  History,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Calendar,
} from 'lucide-react';

export default function TradeHistoryPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [tickerFilter, setTickerFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      });
      if (tickerFilter) params.append('ticker', tickerFilter.toUpperCase());
      if (typeFilter) params.append('type', typeFilter);

      const res = await fetch(`/api/trade/history?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setTotal(data.total || (data.transactions || []).length);
        setTotalPages(data.totalPages || 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user, page, tickerFilter, typeFilter]);

  if (!user) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4 max-w-lg mx-auto my-12">
        <History className="w-12 h-12 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Histori Transaksi</h2>
        <p className="text-xs text-slate-400">
          Silakan masuk untuk melihat rekapitulasi audit transaksi perdagangan Anda.
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

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <History className="w-7 h-7 text-emerald-400" />
            Histori Transaksi Perdagangan
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit trail seluruh eksekusi order beli dan jual dengan perhitungan fee broker presisi.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-emerald-400 rounded-xl transition-colors self-start sm:self-auto"
          title="Refresh Histori"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter Ticker (e.g. BBCA)..."
              value={tickerFilter}
              onChange={(e) => {
                setTickerFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono uppercase text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">Semua Tipe Order</option>
            <option value="BUY">BUY Saja</option>
            <option value="SELL">SELL Saja</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Total Transaksi: <b className="text-white">{total}</b>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {loading ? (
          <div className="text-center py-16 space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
            <div className="text-xs text-slate-400">Memuat catatan transaksi...</div>
          </div>
        ) : transactions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                    <th className="py-3 px-3">Tanggal & Waktu</th>
                    <th className="py-3 px-3">Ticker</th>
                    <th className="py-3 px-3">Tipe</th>
                    <th className="py-3 px-3">Jumlah Lot</th>
                    <th className="py-3 px-3">Harga Eksekusi</th>
                    <th className="py-3 px-3">Nilai Bruto</th>
                    <th className="py-3 px-3">Fee Broker</th>
                    <th className="py-3 px-3">Total Settlement</th>
                    <th className="py-3 px-3">Realized P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                        {new Date(t.executed_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-white text-sm">
                        <Link href={`/stock/${t.stock_code}`} className="hover:text-emerald-400 transition-colors">
                          {t.stock_code}
                        </Link>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.type === 'BUY'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-white font-bold">{t.lot_quantity} Lot</td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        Rp{t.price.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        Rp{t.total_amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400">
                        Rp{t.broker_fee.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 font-mono text-white font-bold">
                        Rp{t.total_settlement.toLocaleString('id-ID')}
                      </td>
                      <td
                        className={`py-3 px-3 font-mono font-bold ${
                          t.realized_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {t.type === 'SELL'
                          ? `${t.realized_pnl >= 0 ? '+' : ''}Rp${t.realized_pnl.toLocaleString('id-ID')}`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-500 font-mono">
                  Halaman {page} dari {totalPages}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            Tidak ada transaksi yang cocok dengan kriteria filter.
          </div>
        )}
      </div>
    </div>
  );
}
