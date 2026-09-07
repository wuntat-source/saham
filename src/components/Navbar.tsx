'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  TrendingUp,
  PieChart,
  Trophy,
  GraduationCap,
  Wallet,
  LogOut,
  LogIn,
  UserPlus,
  PlusCircle,
  Sparkles,
  School,
  ChevronDown,
  BarChart3,
  Radar,
  BookOpen,
  Brain,
  Binary,
  Layers,
  Building2,
  Landmark,
  Globe,
  Briefcase,
  Zap,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, refreshUser } = useAuth();
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMsg, setJoinMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [lensDropdownOpen, setLensDropdownOpen] = useState(false);

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
        setJoinMsg({ type: 'success', text: `Berhasil bergabung ke kelas ${data.class_name}!` });
        await refreshUser();
        setTimeout(() => {
          setJoinModalOpen(false);
          setJoinCode('');
          setJoinMsg(null);
        }, 1200);
      } else {
        setJoinMsg({ type: 'error', text: data.error || 'Gagal bergabung' });
      }
    } catch {
      setJoinMsg({ type: 'error', text: 'Terjadi kesalahan sistem' });
    } finally {
      setJoinLoading(false);
    }
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: TrendingUp },
    { href: '/market', label: 'Pasar Saham', icon: BarChart3 },
    { href: '/screener', label: 'AI Screener', icon: Sparkles, highlight: true },
    { href: '/radar', label: 'AI Radar', icon: Radar, highlight: true },
    { href: '/quant-lab', label: 'Quant Lab', icon: Binary, highlight: true },
    { href: '/journal', label: 'Jurnal', icon: BookOpen, highlight: true },
    { href: '/ai-mentor', label: 'AI Mentor', icon: Brain, highlight: true },
    { href: '/learning', label: 'Belajar', icon: GraduationCap, highlight: true },
    { href: '/portfolio', label: 'Portofolio', icon: PieChart },
  ];

  if (user?.role === 'teacher' || user?.role === 'admin') {
    navLinks.push(
      { href: '/teacher/dashboard', label: 'Dashboard Guru', icon: GraduationCap }
    );
  }

  const lensSubmenu = [
    { href: '/investment-lens', label: 'Hub Semua Lensa', icon: Layers },
    { href: '/investment-lens/institutional', label: 'Institutional / Risk-Adjusted', icon: Building2 },
    { href: '/investment-lens/long-term', label: 'Long-Term Quality & Valuation', icon: Landmark },
    { href: '/investment-lens/growth', label: 'Fundamental Growth', icon: TrendingUp },
    { href: '/investment-lens/macro', label: 'Macro + Fundamental + Catalyst', icon: Globe },
    { href: '/investment-lens/earnings', label: 'Earnings & Market Expectations', icon: Briefcase },
    { href: '/investment-lens/compounder', label: 'Quality Compounder', icon: Zap },
    { href: '/investment-lens/compare', label: 'Bandingkan 6 Lensa (Radar)', icon: BarChart3 },
  ];

  const primaryClass = user?.enrolledClasses?.[0]?.class;
  const isLensActive = pathname.startsWith('/investment-lens');

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center space-x-5">
              <Link href="/" className="flex items-center space-x-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-5 h-5 text-white font-black" />
                </div>
                <div>
                  <span className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1">
                    EduTrade<span className="text-emerald-600">X</span>
                  </span>
                  <span className="block text-[10px] text-slate-500 font-semibold -mt-1 tracking-wider uppercase">
                    Virtual Stock Market
                  </span>
                </div>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center space-x-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-200/80 font-bold'
                          : (link as any).highlight
                          ? 'text-emerald-600 hover:bg-emerald-50/80 hover:text-emerald-700'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : (link as any).highlight ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}

                {/* AI Investment Lens Dropdown Menu */}
                <div
                  className="relative"
                  onMouseEnter={() => setLensDropdownOpen(true)}
                  onMouseLeave={() => setLensDropdownOpen(false)}
                >
                  <Link
                    href="/investment-lens"
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      isLensActive
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                        : 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>AI Investment Lens</span>
                    <ChevronDown className="w-3 h-3 text-indigo-600 opacity-70" />
                  </Link>

                  {lensDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                      <div className="px-3 py-1.5 text-[10px] uppercase font-mono text-slate-500 border-b border-slate-100 font-bold">
                        6 Professional Methodologies
                      </div>
                      {lensSubmenu.map((sub) => {
                        const SubIcon = sub.icon;
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setLensDropdownOpen(false)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs transition-colors ${
                              isSubActive
                                ? 'bg-indigo-50 text-indigo-700 font-bold'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                            }`}
                          >
                            <SubIcon className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="truncate">{sub.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side Info & Actions */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  {/* Classroom Badge */}
                  {user.role === 'student' && (
                    primaryClass ? (
                      <div className="hidden sm:flex items-center space-x-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs text-slate-700">
                        <School className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold text-slate-800 truncate max-w-[130px]">
                          {primaryClass.class_name}
                        </span>
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                          {primaryClass.invitation_code}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setJoinModalOpen(true)}
                        className="hidden sm:flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Gabung Kelas</span>
                      </button>
                    )
                  )}

                  {/* Wallet Balance Pill */}
                  <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 block -mb-0.5 font-semibold">
                        Saldo Kas
                      </span>
                      <span className="text-xs sm:text-sm font-bold font-mono text-emerald-600">
                        Rp{(user.wallet?.cash_balance ?? 100000000).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* User Profile Pill */}
                  <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-bold text-slate-800">{user.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium capitalize">
                        {user.role === 'teacher' ? '👨‍🏫 Guru' : '👨‍🎓 Siswa'}
                      </div>
                    </div>
                    <button
                      onClick={logout}
                      title="Logout"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Masuk</span>
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm shadow-emerald-600/20 transition-all font-sans"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Daftar Gratis</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Join Class Modal */}
      {joinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <School className="w-5 h-5 text-emerald-600" />
              Gabung ke Kelas Simulasi
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Masukkan 6 atau 8 digit kode undangan yang diberikan oleh guru Ekonomi/PKWU Anda.
            </p>

            {joinMsg && (
              <div
                className={`p-3 rounded-lg text-xs font-medium mb-4 ${
                  joinMsg.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {joinMsg.text}
              </div>
            )}

            <form onSubmit={handleJoinClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode Undangan Kelas
                </label>
                <input
                  type="text"
                  placeholder="Contoh: SMAN1-EKO"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono uppercase tracking-widest text-emerald-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setJoinModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={joinLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  {joinLoading ? 'Memproses...' : 'Gabung Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
