import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShieldCheck,
  Trophy,
  Users,
  BarChart2,
  ArrowRight,
  Layers,
  Award,
  Wallet,
  CheckCircle,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { STOCKS } from '@/lib/constants';

export default function HomePage() {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Real-time Virtual Stock Market for Schools</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Belajar Investasi Saham Riil.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
              Tanpa Risiko Finansial.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            EduTradeX mensimulasikan mekanisme perdagangan Bursa Efek Indonesia (IDX) secara presisi.
            Dapatkan modal virtual <b>Rp100.000.000</b>, analisis grafik harga <i>real-time</i>, order book
            dummy, serta bersaing di peringkat portofolio kelas Anda.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/market"
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center space-x-2 transition-all hover:scale-105"
            >
              <BarChart2 className="w-4 h-4 font-black" />
              <span>Jelajahi Pasar Saham</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-sm border border-emerald-500/30 flex items-center space-x-2 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Dashboard Siswa</span>
            </Link>

            <Link
              href="/classroom/leaderboard"
              className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 flex items-center space-x-2 transition-colors"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Leaderboard Kelas</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80 text-xs">
            <div>
              <div className="text-slate-400">Modal Awal Siswa</div>
              <div className="text-base font-bold font-mono text-emerald-400">Rp100 Juta</div>
            </div>
            <div>
              <div className="text-slate-400">Satuan Transaksi</div>
              <div className="text-base font-bold font-mono text-white">1 Lot = 100 Lembar</div>
            </div>
            <div>
              <div className="text-slate-400">Broker Fee Beli / Jual</div>
              <div className="text-base font-bold font-mono text-slate-200">0.15% / 0.25%</div>
            </div>
            <div>
              <div className="text-slate-400">Metrik Peringkat</div>
              <div className="text-base font-bold font-mono text-amber-300">Total Equity (ROI %)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top IDX Stock Tickers Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
              Saham Unggulan Bursa Efek Indonesia (IDX)
            </h2>
            <p className="text-xs text-slate-400">
              Pilih emiten untuk melihat grafik interaktif dan melakukan transaksi jual/beli.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {STOCKS.map((stock) => (
            <Link
              key={stock.ticker}
              href={`/stock/${stock.ticker}`}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 transition-all duration-200 group flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-lg font-black text-white group-hover:text-emerald-400 transition-colors">
                    {stock.ticker}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">
                    {stock.sector}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-slate-300 line-clamp-1 mb-1">
                  {stock.name}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                  {stock.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">Harga Dasar</div>
                  <div className="text-sm font-bold font-mono text-emerald-400">
                    Rp{stock.basePrice.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">P/E Ratio</div>
                  <div className="text-xs font-mono font-semibold text-slate-300">
                    {stock.peRatio}x
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Feature Highlights: Student & Teacher Flows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Feature Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Untuk Siswa & Peserta Didik</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Praktik langsung teori pasar modal tanpa risiko kehilangan uang riil. Kuasai manajemen
            risiko, analisis teknikal candlestick, dan alokasi portofolio.
          </p>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Eksekusi instan order Buy & Sell dengan fee broker akurat</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Live Order Book depth chart (5 level Bid & Offer)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Real-time floating ROI % dan peringkat kelas live</span>
            </li>
          </ul>
        </div>

        {/* Teacher Feature Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
            <Users className="w-6 h-6 text-teal-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Untuk Guru Ekonomi & PKWU</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Kelola kompetisi pasar modal kelas dengan kode undangan unik. Pantau portofolio, histori
            transaksi siswa secara langsung, dan ekspor nilai ke CSV.
          </p>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Buat kelas baru & tentukan saldo modal awal per kelas</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Monitoring live transaksi & aset tiap siswa</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Ekspor rekap performa portofolio lengkap dalam format CSV</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
