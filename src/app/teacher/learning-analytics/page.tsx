'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  GraduationCap,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  Award,
  BookOpen,
  PieChart,
  TrendingUp,
  Sparkles,
  Users,
  Target,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function TeacherLearningAnalyticsPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadClasses();
    }
  }, [user]);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/classes');
      if (res.ok) {
        const data = await res.json();
        const cls = data.classes || [];
        setClasses(cls);
        if (cls.length > 0) {
          setSelectedClassId(cls[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-2xl">
        <GraduationCap className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Akses Khusus Guru</h2>
        <p className="text-sm text-slate-400">
          Halaman analitik pembelajaran ini dikhususkan untuk akun Guru / Pengajar.
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

  // Selected class
  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const members = currentClass?.members || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl backdrop-blur">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              Classroom Learning Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Analisis Kompetensi & Disiplin Kelas
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Pantau perkembangan 9 dimensi kecakapan siswa, kedisiplinan pencatatan jurnal, dan deteksi dini perilaku transaksi berisiko tinggi.
          </p>
        </div>

        {/* Class Selector */}
        {classes.length > 0 && (
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
            <label className="text-xs text-slate-400 font-medium">Pilih Kelas:</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs font-bold text-emerald-400 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.class_name} ({c.invitation_code})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Rata-rata Skor Belajar</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">82.4</span>
            <span className="text-xs text-slate-400 font-medium">/ 100 (Proses)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Kombinasi analisis (25%), risiko (20%), riset, dan jurnal.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Kepatuhan Jurnal (Compliance)</span>
            <BookOpen className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">88%</span>
            <span className="text-xs text-emerald-400 font-medium">Tinggi</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Siswa menulis alasan tesis sebelum melakukan transaksi beli.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Kepatuhan Stop Loss</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-400">91%</span>
            <span className="text-xs text-slate-400 font-medium">Disiplin</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Rasio transaksi dengan batas risiko terdefinisi jelas.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Peringatan Risiko Perilaku</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">2</span>
            <span className="text-xs text-slate-400 font-medium">Siswa Perlu Perhatian</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Deteksi kecenderungan overtrading / konsentrasi portofolio.
          </p>
        </div>
      </div>

      {/* Class 9-Skill Matrix Radar / Distribution */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Distribusi 9 Kompetensi Kelas</h2>
              <p className="text-xs text-slate-400">
                Peta kekuatan dan kelemahan pemahaman konsep pasar modal di kelas {currentClass?.class_name || 'Simulasi'}.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-200">1. Analisis Fundamental</div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: '82%' }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Rata-rata Kelas: 82/100</span>
              <span className="text-emerald-400 font-bold">Baik</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-200">2. Analisis Teknikal</div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: '78%' }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Rata-rata Kelas: 78/100</span>
              <span className="text-emerald-400 font-bold">Baik</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-200">3. Pemahaman Valuasi</div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: '64%' }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Rata-rata Kelas: 64/100</span>
              <span className="text-amber-400 font-bold">Perlu Latihan</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-200">4. Smart Money & Flow</div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: '75%' }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Rata-rata Kelas: 75/100</span>
              <span className="text-emerald-400 font-bold">Baik</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-200">5. Manajemen Risiko</div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: '89%' }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Rata-rata Kelas: 89/100</span>
              <span className="text-emerald-400 font-bold">Sangat Baik</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-200">6. Kedisiplinan Jurnal</div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: '85%' }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Rata-rata Kelas: 85/100</span>
              <span className="text-emerald-400 font-bold">Sangat Baik</span>
            </div>
          </div>
        </div>
      </div>

      {/* Student Process Ranking Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          Peringkat Pembelajaran & Kepatuhan Siswa
        </h2>
        <p className="text-xs text-slate-400">
          Peringkat ini memprioritaskan kualitas proses, kelengkapan catatan jurnal, dan kepatuhan batas risiko dibandingkan sekadar hasil profit.
        </p>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Memuat data siswa...</div>
        ) : members.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
            Belum ada siswa yang bergabung di kelas ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Learning Score (Proses)</th>
                  <th className="py-3 px-4">Jurnal Ditulis</th>
                  <th className="py-3 px-4">Status Risiko</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {members.map((m: any, idx: number) => (
                  <tr key={m.id || idx} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        {m.student?.name?.[0] || 'S'}
                      </div>
                      <span>{m.student?.name || 'Siswa'}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      85 / 100
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      12 Catatan
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Disiplin
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/profile/skills`}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                      >
                        Lihat Profil
                      </Link>
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
