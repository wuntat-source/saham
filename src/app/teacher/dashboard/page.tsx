'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  GraduationCap,
  PlusCircle,
  Users,
  Copy,
  Check,
  Download,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  School,
  Wallet,
  Clock,
  RefreshCw,
  Brain,
  AlertTriangle,
  Award,
  ChevronRight,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';
import { ClassroomAnalyticsSummary } from '@/types/classroom';

interface ClassItem {
  id: string;
  class_name: string;
  invitation_code: string;
  initial_balance: number;
  created_at: string;
  members: Array<{
    id: string;
    student: {
      id: string;
      name: string;
      email: string;
      wallet?: { cash_balance: number };
      portfolios: any[];
    };
  }>;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [analytics, setAnalytics] = useState<ClassroomAnalyticsSummary | null>(null);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Class Form State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newInitialBalance, setNewInitialBalance] = useState('100000000');
  const [createLoading, setCreateLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchClassDetails = async (classId: string) => {
    try {
      const res = await fetch(`/api/classes/${classId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedClass(data.class);
        setRecentTrades(data.recentTransactions || []);
      }

      // Also fetch Phase 6 Classroom Intelligence analytics
      const analyticsRes = await fetch(`/api/teacher/classes/${classId}/analytics`);
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAllTeacherData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const taught = user.taughtClasses || [];
      if (taught.length > 0) {
        const classId = taught[0].id;
        await fetchClassDetails(classId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTeacherData();
  }, [user]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const res = await fetch('/api/classes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className: newClassName,
          initialBalance: parseFloat(newInitialBalance),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCreateModalOpen(false);
        setNewClassName('');
        window.location.reload();
      } else {
        alert('Gagal membuat kelas.');
      }
    } catch (e) {
      console.error(e);
      alert('Error saat membuat kelas.');
    } finally {
      setCreateLoading(false);
    }
  };

  const copyInvitationCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-white">Dashboard Guru & Kelas</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            EduTradeX V2 Classroom Intelligence: Pantau proses belajar, analisis risiko, dan diagnostik kompetensi siswa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/teacher/reports"
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Rekap Nilai & CSV</span>
          </Link>

          <Link
            href="/classroom/leaderboard"
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Leaderboard Multi-Kategori</span>
          </Link>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Kelas Baru</span>
          </button>
        </div>
      </div>

      {/* Classroom Intelligence Banner & Class Selector */}
      {selectedClass && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <School className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-black text-white">{selectedClass.class_name}</h2>
              </div>
              <p className="text-xs text-slate-400">
                Modal Awal Siswa: Rp{Number(selectedClass.initial_balance).toLocaleString('id-ID')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-2xl flex items-center space-x-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Kode Undangan</span>
                  <span className="text-sm font-mono font-black text-emerald-400 tracking-wider">
                    {selectedClass.invitation_code}
                  </span>
                </div>
                <button
                  onClick={() => copyInvitationCode(selectedClass.invitation_code)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                  title="Salin Kode"
                >
                  {copiedCode === selectedClass.invitation_code ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <button
                onClick={() => fetchClassDetails(selectedClass.id)}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-emerald-400 rounded-2xl transition-colors"
                title="Refresh Analytics"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Aggregate Classroom Intelligence Metrics */}
          {analytics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Learning Score</span>
                  <Brain className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-mono font-black text-emerald-400 mt-1">
                  {analytics.avgLearningScore}/100
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Process Quality Avg</span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Risk Management</span>
                  <Activity className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-mono font-black text-amber-400 mt-1">
                  {analytics.avgRiskScore}/100
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Stop Loss Adherence</span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Jurnal Trading</span>
                  <FileText className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-mono font-black text-indigo-400 mt-1">
                  {analytics.journalComplianceRate}%
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Thesis Pre-Order Ratio</span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Tugas Selesai</span>
                  <Award className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-mono font-black text-cyan-400 mt-1">
                  {analytics.assignmentCompletionRate}%
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Assignment Completion</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Warnings & Remediation Alert (If Any) */}
      {analytics && analytics.studentsAtRisk.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <ShieldAlert className="w-5 h-5" />
            <span>Peringatan Dini Pembelajaran (Students Needing Teacher Attention)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analytics.studentsAtRisk.map((risk, idx) => (
              <div key={idx} className="bg-slate-950/70 border border-rose-500/20 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{risk.studentName}</div>
                  <div className="text-[11px] text-rose-300/80">{risk.reason}</div>
                </div>
                <Link
                  href={`/teacher/students/${risk.studentId}`}
                  className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-[10px] font-bold transition-colors"
                >
                  Lihat Profil
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Roster Table with Behavioral Segment Badges */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Daftar Siswa & Profil Pembelajaran ({selectedClass?.members?.length || 0} Siswa)
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Klik siswa untuk analisis mendalam</span>
        </div>

        {selectedClass?.members && selectedClass.members.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                  <th className="py-3 px-3">Nama Siswa</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Saldo Kas</th>
                  <th className="py-3 px-3 text-center">Profil Pembelajaran</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {selectedClass.members.map((m) => {
                  const student = m.student;
                  const cash = student.wallet?.cash_balance || selectedClass.initial_balance;

                  return (
                    <tr key={student.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-3">
                        <Link
                          href={`/teacher/students/${student.id}`}
                          className="font-bold text-white hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                        >
                          <span>{student.name}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">{student.email}</td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        Rp{Number(cash).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          Active Learner
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/teacher/students/${student.id}`}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 rounded-xl text-xs font-bold transition-all inline-block"
                        >
                          Detail Diagnostik
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            Belum ada siswa yang bergabung di kelas ini. Bagikan kode undangan kepada siswa.
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Buat Kelas Virtual Baru</h3>
                <p className="text-xs text-slate-400">Siapkan lingkungan simulasi untuk siswa Anda</p>
              </div>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Kelas</label>
                <input
                  type="text"
                  placeholder="Contoh: XII IPA 1 - Pasar Modal"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Modal Awal Virtual per Siswa (Rp)
                </label>
                <input
                  type="number"
                  value={newInitialBalance}
                  onChange={(e) => setNewInitialBalance(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Default: Rp100.000.000</span>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {createLoading ? 'Membuat...' : 'Buat Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
