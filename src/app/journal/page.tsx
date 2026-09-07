'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { TradingJournalItem } from '@/types/learning';
import {
  BookOpen,
  Sparkles,
  PlusCircle,
  ShieldCheck,
  Target,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export default function JournalPage() {
  const { user } = useAuth();
  const [journals, setJournals] = useState<TradingJournalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [ticker, setTicker] = useState('BBCA');
  const [thesis, setThesis] = useState('');
  const [entryReason, setEntryReason] = useState('');
  const [target, setTarget] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/journal');
      if (res.ok) {
        const json = await res.json();
        setJournals(json.journals || []);
      }
    } catch (e) {
      console.error('Failed to load journals:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchJournals();
  }, [user]);

  const handleCreateJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker,
          thesis,
          entryReason,
          target: target ? parseFloat(target) : undefined,
          stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
        }),
      });
      if (res.ok) {
        setModalOpen(false);
        setThesis('');
        setEntryReason('');
        setTarget('');
        setStopLoss('');
        fetchJournals();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFormLoading(false);
    }
  };

  const handleReviewTrade = async (journalId: string) => {
    try {
      const res = await fetch(`/api/journal/${journalId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ realizedPnl: 1850000 }),
      });
      if (res.ok) {
        fetchJournals();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4 max-w-lg mx-auto my-12">
        <BookOpen className="w-12 h-12 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Trading Journal</h2>
        <p className="text-xs text-slate-400">Silakan login untuk mendokumentasikan jurnal transaksi Anda.</p>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
        >
          Masuk Sekarang
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center gap-1.5 border border-emerald-500/30">
              <BookOpen className="w-3.5 h-3.5" />
              PEDAGOGICAL TRADING JOURNAL
            </span>
            <span className="text-xs text-slate-400 font-medium">Disiplin Proses & Evaluasi AI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Jurnal Transaksi & Tesis Analisis
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
            Membangun kebiasaan trader profesional: rumuskan tesis sebelum membeli, pasang batas Stop Loss disiplin, dan lakukan evaluasi AI Trade Review tanpa bias hasil semata.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-sans shadow-lg shadow-emerald-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tulis Jurnal Baru (+50 XP)</span>
        </button>
      </div>

      {/* Journal List */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
          <p className="text-xs text-slate-400 font-mono">Memuat catatan jurnal belajar Anda...</p>
        </div>
      ) : journals.length > 0 ? (
        <div className="space-y-5">
          {journals.map((j) => (
            <div
              key={j.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4"
            >
              {/* Journal Top Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-mono font-black text-emerald-400 text-base">
                    {j.ticker.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-mono font-black text-lg text-white">{j.ticker}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 font-mono text-[10px] border border-slate-800">
                        Rezim: {j.marketRegime || 'SIDEWAYS'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Dibuat pada: {new Date(j.createdAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 font-mono text-xs">
                  {j.target && (
                    <div className="bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-800 text-emerald-400 font-bold">
                      Target: Rp{j.target.toLocaleString('id-ID')}
                    </div>
                  )}
                  {j.stopLoss && (
                    <div className="bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-800 text-rose-400 font-bold">
                      Stop Loss: Rp{j.stopLoss.toLocaleString('id-ID')}
                    </div>
                  )}
                  {!j.review && (
                    <button
                      onClick={() => handleReviewTrade(j.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-sans font-bold transition-all flex items-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Jalankan AI Review (+75 XP)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Tesis & Reason */}
              <div className="space-y-2 font-sans text-xs">
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                    Tesis Analisis:
                  </span>
                  <p className="text-slate-200 bg-slate-950/50 p-3 rounded-2xl border border-slate-850 leading-relaxed">
                    {j.thesis}
                  </p>
                </div>
                {j.entryReason && (
                  <p className="text-slate-400 italic">
                    <span className="font-semibold text-slate-300">Pemicu Entry: </span>
                    {j.entryReason}
                  </p>
                )}
              </div>

              {/* AI Trade Review Panel (If Reviewed) */}
              {j.review && (
                <div className="mt-4 pt-4 border-t border-slate-800/80 bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-emerald-500/20 space-y-4 font-sans">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      HASIL EVALUASI AI TRADE REVIEW
                    </span>
                    <div className="flex items-center space-x-2 font-mono text-xs">
                      <span className="text-slate-400">Kualitas Keputusan:</span>
                      <span className="font-bold text-emerald-400">{j.review.decisionQuality}/100</span>
                      <span className="text-slate-700">•</span>
                      <span className="text-slate-400">Risk Management:</span>
                      <span className="font-bold text-teal-400">{j.review.riskManagement}/100</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                      <span className="font-bold text-emerald-400 font-mono text-[10px] uppercase block">
                        ✅ Apa yang Sudah Bagus:
                      </span>
                      <p className="text-slate-300 leading-relaxed">{j.review.whatWell}</p>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                      <span className="font-bold text-amber-400 font-mono text-[10px] uppercase block">
                        🎯 Area Pengembangan Diri:
                      </span>
                      <p className="text-slate-300 leading-relaxed">{j.review.whatImprove}</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/80 text-xs">
                    <span className="font-bold text-sky-400 font-mono text-[10px] uppercase block mb-0.5">
                      💡 Pelajaran Utama (Key Lesson):
                    </span>
                    <p className="text-slate-200 italic leading-relaxed">{j.review.keyLesson}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Belum Ada Catatan Jurnal</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Mulailah menulis tesis pertama Anda sebelum melakukan order untuk membiasakan analisa berbasis data.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
          >
            Tulis Jurnal Pertama (+50 XP)
          </button>
        </div>
      )}

      {/* Modal: Write New Journal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono block">
                Pre-Trade Journal Entry
              </span>
              <h3 className="text-lg font-black text-white">Tuliskan Tesis Analisis Saham</h3>
              <p className="text-xs text-slate-400 font-sans">
                Jawab pertanyaan: <i>&quot;Mengapa saya mengambil keputusan transaksi ini?&quot;</i>
              </p>
            </div>

            <form onSubmit={handleCreateJournal} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kode Saham (Ticker)</label>
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  required
                  placeholder="Contoh: BBCA"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono uppercase text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tesis Transaksi & Bukti Data (Fundamental / Teknikal)
                </label>
                <textarea
                  rows={3}
                  value={thesis}
                  onChange={(e) => setThesis(e.target.value)}
                  required
                  placeholder="Contoh: Kinerja ROE 23% sangat kuat, valuasi P/E terdiskon vs historis, dan harga menguji support EMA20..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-slate-300 font-sans font-semibold mb-1">Target Profit (Rp)</label>
                  <input
                    type="number"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="Contoh: 11200"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-sans font-semibold mb-1">Stop Loss (Rp)</label>
                  <input
                    type="number"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    placeholder="Contoh: 9400"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-rose-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {formLoading ? 'Menyimpan...' : 'Simpan Jurnal (+50 XP)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
