'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  TrendingUp,
  LogIn,
  AlertCircle,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    const loginEmail = customEmail || email;
    const loginPassword = customPassword || password;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        await refreshUser();
        if (data.user.role === 'teacher') {
          router.push('/teacher/dashboard');
        } else {
          router.push('/trade/BBCA');
        }
      } else {
        setError(data.error || 'Email atau password salah.');
      }
    } catch {
      setError('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = (role: 'teacher' | 'student') => {
    if (role === 'teacher') {
      setEmail('guru@edutradex.id');
      setPassword('guru123');
      handleLogin(undefined, 'guru@edutradex.id', 'guru123');
    } else {
      setEmail('siswa1@edutradex.id');
      setPassword('siswa123');
      handleLogin(undefined, 'siswa1@edutradex.id', 'siswa123');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 mb-2">
            <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-emerald-600 font-black" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Masuk ke EduTrade<span className="text-emerald-600">X</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Akses terminal simulasi pasar modal virtual sekolah Anda
          </p>
        </div>

        {/* Demo Login Quick Shortcuts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-sm">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Akses Cepat Demo Pengguna</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('pidi');
                setPassword('pidi123');
                handleLogin(undefined, 'pidi', 'pidi123');
              }}
              className="px-3 py-2 bg-emerald-50/50 hover:bg-emerald-100/70 border border-emerald-200 rounded-xl text-left transition-all text-xs group cursor-pointer"
            >
              <div className="font-bold text-emerald-800 flex items-center justify-between">
                <span>👨‍🎓 Murid: Pidi</span>
                <ArrowRight className="w-3 h-3 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="text-[10px] text-slate-600 font-mono font-semibold">pidi / pidi123</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('bampri');
                setPassword('bampri123');
                handleLogin(undefined, 'bampri', 'bampri123');
              }}
              className="px-3 py-2 bg-emerald-50/50 hover:bg-emerald-100/70 border border-emerald-200 rounded-xl text-left transition-all text-xs group cursor-pointer"
            >
              <div className="font-bold text-emerald-800 flex items-center justify-between">
                <span>👨‍🎓 Murid: Bampri</span>
                <ArrowRight className="w-3 h-3 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="text-[10px] text-slate-600 font-mono font-semibold">bampri / bampri123</div>
            </button>

            <button
              type="button"
              onClick={() => loginDemo('teacher')}
              className="px-3 py-2 bg-indigo-50/50 hover:bg-indigo-100/70 border border-indigo-200 rounded-xl text-left transition-all text-xs group cursor-pointer"
            >
              <div className="font-bold text-indigo-800 flex items-center justify-between">
                <span>👨‍🏫 Akun Guru</span>
                <ArrowRight className="w-3 h-3 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="text-[10px] text-slate-600 font-mono font-semibold">guru@edutradex.id</div>
            </button>

            <button
              type="button"
              onClick={() => loginDemo('student')}
              className="px-3 py-2 bg-amber-50/50 hover:bg-amber-100/70 border border-amber-200 rounded-xl text-left transition-all text-xs group cursor-pointer"
            >
              <div className="font-bold text-amber-800 flex items-center justify-between">
                <span>👨‍🎓 Demo Siswa 1</span>
                <ArrowRight className="w-3 h-3 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="text-[10px] text-slate-600 font-mono font-semibold">siswa1@edutradex.id</div>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username atau Email Terdaftar
              </label>
              <input
                type="text"
                placeholder="Contoh: pidi, bampri, atau email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Memverifikasi...' : 'Masuk Sekarang'}</span>
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-500 font-medium">
            Belum memiliki akun?{' '}
            <Link href="/register" className="text-emerald-600 font-bold hover:underline">
              Daftar Siswa / Guru Baru
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
