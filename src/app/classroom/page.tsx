'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  School,
  PlusCircle,
  Users,
  Trophy,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  GraduationCap,
  Wallet,
} from 'lucide-react';

export default function ClassroomPage() {
  const { user, refreshUser } = useAuth();
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMsg, setJoinMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Teacher Create Class Form
  const [newClassName, setNewClassName] = useState('');
  const [newInitialBalance, setNewInitialBalance] = useState('100000000');
  const [createLoading, setCreateLoading] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinLoading(true);
    setJoinMsg(null);

    try {
      const res = await fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitation_code: joinCode }),
      });

      const data = await res.json();
      if (res.ok) {
        setJoinMsg({ type: 'success', text: `Selamat! Anda berhasil bergabung ke kelas ${data.class_name}.` });
        await refreshUser();
        setJoinCode('');
      } else {
        setJoinMsg({ type: 'error', text: data.error || 'Gagal bergabung ke kelas.' });
      }
    } catch {
      setJoinMsg({ type: 'error', text: 'Terjadi kesalahan koneksi sistem.' });
    } finally {
      setJoinLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateMsg(null);

    try {
      const res = await fetch('/api/classes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: newClassName,
          initialBalance: parseFloat(newInitialBalance),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCreateMsg({ type: 'success', text: `Kelas ${data.class.class_name} berhasil dibuat dengan kode: ${data.class.invitation_code}` });
        await refreshUser();
        setNewClassName('');
      } else {
        setCreateMsg({ type: 'error', text: data.error || 'Gagal membuat kelas.' });
      }
    } catch {
      setCreateMsg({ type: 'error', text: 'Terjadi kesalahan sistem.' });
    } finally {
      setCreateLoading(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!user) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4 max-w-lg mx-auto my-12">
        <School className="w-12 h-12 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Sistem Manajemen Kelas</h2>
        <p className="text-xs text-slate-400">
          Silakan masuk untuk mengakses kelas simulasi trading sekolah Anda.
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

  const enrolledClasses = user.enrolledClasses || [];
  const taughtClasses = user.taughtClasses || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <School className="w-7 h-7 text-emerald-400" />
            Kelas Simulasi Pasar Modal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Bergabung dengan kelas guru ekonomi Anda atau kelola kompetisi kelas virtual.
          </p>
        </div>

        <Link
          href="/classroom/leaderboard"
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 font-bold text-xs transition-all shadow-sm self-start sm:self-auto"
        >
          <Trophy className="w-4 h-4" />
          <span>Lihat Leaderboard Kelas</span>
        </Link>
      </div>

      {/* STUDENT VIEW */}
      {user.role === 'student' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Enrolled Classes List (7 cols) */}
          <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Users className="w-5 h-5 text-emerald-400" />
              Kelas yang Anda Ikuti ({enrolledClasses.length})
            </h2>

            {enrolledClasses.length > 0 ? (
              <div className="space-y-3">
                {enrolledClasses.map((item) => (
                  <div
                    key={item.class.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3 hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-white text-sm">{item.class.class_name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Guru Pembimbing: <b className="text-slate-300">{item.class.teacher?.name}</b>
                        </p>
                      </div>
                      <span className="bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs px-2.5 py-1 rounded-lg">
                        {item.class.invitation_code}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400 font-mono">
                      <span>Modal Awal: Rp{item.class.initial_balance.toLocaleString('id-ID')}</span>
                      <Link
                        href="/classroom/leaderboard"
                        className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 font-sans"
                      >
                        <span>Peringkat</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs">
                Anda belum bergabung dalam kelas mana pun. Masukkan kode undangan dari guru Anda pada panel di sebelah kanan.
              </div>
            )}
          </div>

          {/* Join Class Form (5 cols) */}
          <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              Gabung Kelas Baru
            </h2>

            {joinMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-start space-x-2 ${
                  joinMsg.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {joinMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                )}
                <span>{joinMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleJoinClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kode Undangan Kelas
                </label>
                <input
                  type="text"
                  placeholder="Contoh: SMAN1-EKO"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono uppercase text-emerald-400 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Dapatkan kode unik dari guru Ekonomi / PKWU Anda.
                </span>
              </div>

              <button
                type="submit"
                disabled={joinLoading}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {joinLoading ? 'Memproses...' : 'Gabung ke Kelas'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TEACHER VIEW */}
      {(user.role === 'teacher' || user.role === 'admin') && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Taught Classes List (7 cols) */}
          <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
                Daftar Kelas yang Anda Kelola ({taughtClasses.length})
              </h2>
              <Link
                href="/teacher/dashboard"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
              >
                <span>Dashboard Lengkap</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {taughtClasses.length > 0 ? (
              <div className="space-y-3">
                {taughtClasses.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3 hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-white text-sm">{c.class_name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Modal Awal: Rp{c.initial_balance.toLocaleString('id-ID')} per siswa
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-black text-xs px-2.5 py-1 rounded-lg">
                          {c.invitation_code}
                        </span>
                        <button
                          onClick={() => copyToClipboard(c.invitation_code)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                          title="Salin Kode"
                        >
                          {copiedCode === c.invitation_code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                      <span className="text-slate-500">Bagikan kode kepada siswa</span>
                      <Link
                        href={`/api/classes/${c.id}/export-csv`}
                        className="text-slate-300 hover:text-emerald-400 font-semibold"
                      >
                        Ekspor CSV
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs">
                Anda belum membuat kelas. Buat kelas baru pada panel di sebelah kanan.
              </div>
            )}
          </div>

          {/* Create Class Form (5 cols) */}
          <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              Buat Kelas Simulasi Baru
            </h2>

            {createMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-start space-x-2 ${
                  createMsg.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {createMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                )}
                <span>{createMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Kelas
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kelas XII IPS 2 - Ekonomi Bisnis"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Modal Virtual Awal per Siswa (Rp)
                </label>
                <input
                  type="number"
                  value={newInitialBalance}
                  onChange={(e) => setNewInitialBalance(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Default: Rp100.000.000 (Konfigurabel)
                </span>
              </div>

              <button
                type="submit"
                disabled={createLoading}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {createLoading ? 'Membuat Kelas...' : 'Buat Kelas Sekarang'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
