'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ChallengeItem } from '@/types/learning';
import {
  GraduationCap,
  PlusCircle,
  Trophy,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function TeacherChallengesPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'PORTFOLIO' | 'FUNDAMENTAL' | 'TECHNICAL' | 'RISK' | 'RESEARCH'>('RISK');
  const [description, setDescription] = useState('');
  const [rewardXp, setRewardXp] = useState('250');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) {
      loadChallenges();
    }
  }, [user]);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teacher/assignments');
      if (res.ok) {
        const data = await res.json();
        setChallenges(data.challenges || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setCreating(true);

    try {
      const res = await fetch('/api/teacher/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type,
          description,
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          rewardXp: parseInt(rewardXp, 10) || 250,
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        setTitle('');
        setDescription('');
        setRewardXp('250');
        loadChallenges();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-2xl">
        <GraduationCap className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Akses Khusus Guru</h2>
        <p className="text-sm text-slate-400">
          Halaman tantangan ini dikhususkan untuk akun Guru / Pengajar Ekonomi.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl backdrop-blur">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              Classroom Gamification Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Manajemen Tantangan & Gamifikasi Siswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Dorong antusiasme dan disiplin siswa melalui tantangan berhadiah XP: Zero Stop Loss Violation, 100% Journal Compliance, atau Portofolio Multi-Sektor.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-2xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Tantangan Baru</span>
          </button>
        </div>
      </div>

      {/* Challenge List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Daftar Tantangan Aktif ({challenges.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Memuat data tantangan...</div>
        ) : challenges.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">Belum Ada Tantangan</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Buat tantangan kompetitif pertama untuk memacu semangat belajar siswa di kelas simulasi.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((c) => (
              <div
                key={c.id}
                className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      +{c.rewardXp} XP
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-slate-950 px-2 py-0.5 rounded uppercase">
                      Tipe: {c.type}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{c.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3">
                      {c.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Tantangan Aktif
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-amber-400" />
              Buat Tantangan Simulasi Baru
            </h3>
            <p className="text-xs text-slate-400">
              Siswa yang menyelesaikan kriteria tantangan ini akan otomatis memperoleh poin XP dan kenaikan level.
            </p>

            <form onSubmit={handleCreateChallenge} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Judul Tantangan</label>
                <input
                  type="text"
                  placeholder="Contoh: Zero Cutloss Violation - 5 Trades"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tipe Tantangan</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-amber-400 focus:outline-none focus:border-amber-500"
                >
                  <option value="RISK">RISK (Disiplin Stop Loss & Drawdown Rendah)</option>
                  <option value="PORTFOLIO">PORTFOLIO (Diversifikasi Minimal 4 Sektor)</option>
                  <option value="FUNDAMENTAL">FUNDAMENTAL (Penyusunan Tesis Finansial LQ45)</option>
                  <option value="TECHNICAL">TECHNICAL (Breakout & Momentum Trend Following)</option>
                  <option value="RESEARCH">RESEARCH (Analisis Sentimen & Kalender Katalis)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Deskripsi Tantangan</label>
                <textarea
                  placeholder="Jelaskan aturan tantangan (contoh: Lakukan 5 transaksi berurutan dengan selalu menetapkan dan mematuhi batas cut loss)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reward XP</label>
                <input
                  type="number"
                  value={rewardXp}
                  onChange={(e) => setRewardXp(e.target.value)}
                  min={50}
                  max={1000}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition disabled:opacity-50"
                >
                  {creating ? 'Menyimpan...' : 'Terbitkan Tantangan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
