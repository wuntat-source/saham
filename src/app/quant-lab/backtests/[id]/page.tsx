'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { BacktestReport } from '@/types/quant';
import {
  Binary,
  TrendingUp,
  Award,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Layers,
  Sparkles,
  GitCompare,
  BarChart3,
  Calendar,
  DollarSign,
  Sliders,
  ChevronRight,
} from 'lucide-react';

export default function BacktestReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [report, setReport] = useState<BacktestReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoverPoint, setHoverPoint] = useState<any | null>(null);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/backtests/${id}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data.report);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-slate-500">
        Memuat laporan performa backtesting...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Laporan Backtest Tidak Ditemukan</h2>
        <p className="text-xs text-slate-400">ID backtest mungkin salah atau telah dihapus.</p>
        <Link
          href="/quant-lab/backtests"
          className="inline-block px-5 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl"
        >
          Kembali ke Riwayat
        </Link>
      </div>
    );
  }

  // Calculate SVG curve coordinates
  const curve = report.equityCurve || [];
  const maxEquity = Math.max(...curve.map((p) => Math.max(p.portfolioEquity, p.benchmarkEquity)), report.initialCapital * 1.05);
  const minEquity = Math.min(...curve.map((p) => Math.min(p.portfolioEquity, p.benchmarkEquity)), report.initialCapital * 0.95);
  const rangeEquity = Math.max(1, maxEquity - minEquity);

  const svgWidth = 800;
  const svgHeight = 220;

  const pointsPortfolio = curve.map((p, idx) => {
    const x = (idx / Math.max(1, curve.length - 1)) * svgWidth;
    const y = svgHeight - ((p.portfolioEquity - minEquity) / rangeEquity) * (svgHeight - 20) - 10;
    return `${x},${y}`;
  }).join(' ');

  const pointsBenchmark = curve.map((p, idx) => {
    const x = (idx / Math.max(1, curve.length - 1)) * svgWidth;
    const y = svgHeight - ((p.benchmarkEquity - minEquity) / rangeEquity) * (svgHeight - 20) - 10;
    return `${x},${y}`;
  }).join(' ');

  const overfittingRisk = report.aiReview?.overfittingRisk || 'LOW';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl backdrop-blur">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest flex items-center gap-1.5">
              <Binary className="w-3.5 h-3.5" />
              Quantitative Performance Report
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-mono text-slate-400">ID: {report.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {report.strategyName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Periode Pengujian: <span className="font-mono text-white">{report.startDate}</span> s/d <span className="font-mono text-white">{report.endDate}</span> • Modal Awal: <span className="font-mono text-emerald-400">Rp{report.initialCapital.toLocaleString('id-ID')}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/quant-lab/strategies/new?templateId=${report.strategyId}`}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl border border-slate-700 flex items-center gap-2 transition"
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Klon Parameter</span>
          </Link>
          <Link
            href="/quant-lab/compare"
            className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-xs font-bold rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition"
          >
            <GitCompare className="w-4 h-4" />
            <span>Bandingkan</span>
          </Link>
        </div>
      </div>

      {/* Overfitting Warning Banner */}
      {overfittingRisk !== 'LOW' && (
        <div
          className={`p-5 rounded-3xl border flex items-start gap-4 ${
            overfittingRisk === 'CRITICAL' || overfittingRisk === 'HIGH'
              ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
              : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
          }`}
        >
          <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span>Peringatan Risiko Overfitting / Curve-Fitting</span>
              <span className="px-2 py-0.5 rounded bg-slate-950 text-[10px] font-mono uppercase">
                Status: {overfittingRisk} RISK
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">
              {report.aiReview?.overfittingReason ||
                'Strategi ini menggunakan terlalu banyak kondisi parameter atau mengalami penurunan performa signifikan pada periode Out-of-Sample. Hasil backtest masa lalu belum tentu dapat direproduksi di masa depan.'}
            </p>
          </div>
        </div>
      )}

      {/* Top Quantitative Performance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Return</div>
          <div className={`text-xl font-black font-mono ${report.totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {report.totalReturn >= 0 ? '+' : ''}{report.totalReturn}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Rp{report.finalEquity.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">CAGR</div>
          <div className="text-xl font-black font-mono text-white">
            {report.cagr}%
          </div>
          <div className="text-[10px] text-slate-500">Imbal Hasil Tahunan</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Win Rate</div>
          <div className="text-xl font-black font-mono text-teal-400">
            {report.winRate}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {report.winningTrades}W / {report.losingTrades}L
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Max Drawdown</div>
          <div className="text-xl font-black font-mono text-rose-400">
            -{report.maxDrawdown}%
          </div>
          <div className="text-[10px] text-slate-500">Penurunan Puncak</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Sharpe Ratio</div>
          <div className="text-xl font-black font-mono text-indigo-400">
            {report.sharpeRatio}
          </div>
          <div className="text-[10px] text-slate-500">Sortino: {report.sortinoRatio}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Profit Factor</div>
          <div className="text-xl font-black font-mono text-amber-400">
            {report.profitFactor}
          </div>
          <div className="text-[10px] text-slate-500">{report.totalTrades} Transaksi</div>
        </div>
      </div>

      {/* Interactive Equity Curve Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Kurva Pertumbuhan Ekuitas (Portfolio vs Benchmark IHSG)
            </h2>
            <p className="text-xs text-slate-400">
              Perkembangan nilai portofolio historis setelah dipotong biaya transaksi (Beli 0.15%, Jual 0.25%) dan slippage.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-0.5 bg-emerald-400 rounded-full" />
              <span>Portofolio Strategi</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-0.5 bg-slate-500 rounded-full stroke-dasharray" />
              <span>Benchmark Pasar</span>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="relative w-full overflow-hidden bg-slate-950 border border-slate-800 rounded-2xl p-4">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-56 overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Grid horizontal lines */}
            <line x1="0" y1={svgHeight * 0.25} x2={svgWidth} y2={svgHeight * 0.25} stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="0" y1={svgHeight * 0.5} x2={svgWidth} y2={svgHeight * 0.5} stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="0" y1={svgHeight * 0.75} x2={svgWidth} y2={svgHeight * 0.75} stroke="#1e293b" strokeDasharray="3 3" />

            {/* Benchmark line */}
            <polyline
              fill="none"
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              points={pointsBenchmark}
            />

            {/* Strategy Equity line */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              points={pointsPortfolio}
            />
          </svg>

          {/* Bottom Time Scale */}
          <div className="flex justify-between text-[10px] text-slate-500 pt-2 font-mono border-t border-slate-900">
            <span>{curve[0]?.date}</span>
            <span>{curve[Math.floor(curve.length / 2)]?.date}</span>
            <span>{curve[curve.length - 1]?.date}</span>
          </div>
        </div>
      </div>

      {/* Walk-Forward Out-of-Sample Validation Splits */}
      {report.walkForwardSplits && report.walkForwardSplits.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Uji Stabilitas Walk-Forward (In-Sample vs Out-of-Sample)
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Metode ilmiah untuk mendeteksi *curve fitting*: data dibagi menjadi In-Sample (Pelatihan) dan Out-of-Sample (Pengujian pada data buta).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {report.walkForwardSplits.map((split, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border space-y-3 ${
                  split.period === 'OUT_OF_SAMPLE_TEST'
                    ? 'bg-indigo-950/20 border-indigo-500/30'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{split.label}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {split.tradeCount} Trades
                  </span>
                </div>

                <div className="text-[10px] text-slate-500 font-mono">
                  {split.startDate} s/d {split.endDate}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">Return</div>
                    <div className={`text-xs font-bold font-mono ${split.totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {split.totalReturn >= 0 ? '+' : ''}{split.totalReturn}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">Win Rate</div>
                    <div className="text-xs font-bold font-mono text-white">{split.winRate}%</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 uppercase">Max DD</div>
                    <div className="text-xs font-bold font-mono text-rose-400">-{split.maxDrawdown}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Qualitative Strategy Review */}
      {report.aiReview && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Strategy Review &amp; Diagnosis</h2>
              <p className="text-xs text-slate-400">
                Evaluasi kualitatif dan saran peningkatan tanpa memodifikasi parameter secara otomatis.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Kekuatan Strategi</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2">
                {report.aiReview.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Area Perhatian &amp; Kelemahan</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2">
                {report.aiReview.weaknesses.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Market Dependency Insight */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Ketergantungan Rezim Pasar (Market Dependency)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {report.aiReview.marketDependency}
            </p>
          </div>

          {/* Suggested Improvements */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              Rekomendasi Peningkatan Pedagogis
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.aiReview.suggestedImprovements.map((imp, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  {imp}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trade Log Execution Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Catatan Eksekusi Perdagangan ({report.trades.length} Trades)
          </h2>
          <span className="text-[10px] text-slate-500 font-mono">1 Lot = 100 Lembar Saham</span>
        </div>

        {report.trades.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Tidak ada transaksi yang terpicu pada periode pengujian ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-4">Emiten</th>
                  <th className="py-3 px-4">Tgl Masuk</th>
                  <th className="py-3 px-4">Harga Masuk</th>
                  <th className="py-3 px-4">Tgl Keluar</th>
                  <th className="py-3 px-4">Harga Keluar</th>
                  <th className="py-3 px-4">Ukuran (Lot)</th>
                  <th className="py-3 px-4">Biaya Fee</th>
                  <th className="py-3 px-4">Net PnL</th>
                  <th className="py-3 px-4">Return %</th>
                  <th className="py-3 px-4 text-right">Alasan Keluar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {report.trades.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 font-mono text-[11px]">
                    <td className="py-3 px-4 font-bold text-white">{t.ticker}</td>
                    <td className="py-3 px-4 text-slate-400">{t.entryDate}</td>
                    <td className="py-3 px-4 text-slate-300">Rp{t.entryPrice.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4 text-slate-400">{t.exitDate}</td>
                    <td className="py-3 px-4 text-slate-300">Rp{t.exitPrice.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4 text-slate-300">{t.lots} lot</td>
                    <td className="py-3 px-4 text-slate-500">Rp{t.fees.toLocaleString('id-ID')}</td>
                    <td className={`py-3 px-4 font-bold ${t.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.netPnl >= 0 ? '+' : ''}Rp{t.netPnl.toLocaleString('id-ID')}
                    </td>
                    <td className={`py-3 px-4 font-bold ${t.returnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.returnPct >= 0 ? '+' : ''}{t.returnPct}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          t.exitReason === 'TAKE_PROFIT'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : t.exitReason === 'STOP_LOSS'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {t.exitReason}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
