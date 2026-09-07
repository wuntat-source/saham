'use client';

import React, { useEffect, useState, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  Shield,
  BookOpen,
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Brain,
  FileText,
  Activity,
  ArrowLeft,
  Sparkles,
  Target,
  BarChart3,
  Flame,
} from 'lucide-react';
import Link from 'next/link';
import { StudentAnalyticsDetail } from '@/types/classroom';

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: studentId } = use(params);
  const { user } = useAuth();
  const [data, setData] = useState<StudentAnalyticsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Certificate Modal State
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certTitle, setCertTitle] = useState('Certificate of Achievement in Financial Analysis');
  const [certCategory, setCertCategory] = useState('FUNDAMENTAL');
  const [certGrade, setCertGrade] = useState<'DISTINCTION' | 'MERIT' | 'PASS'>('DISTINCTION');
  const [certSubmitting, setCertSubmitting] = useState(false);
  const [certSuccess, setCertSuccess] = useState<string | null>(null);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teacher/students/${studentId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      } else {
        setError('Gagal memuat profil siswa');
      }
    } catch (e: any) {
      setError(e.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCertSubmitting(true);
    try {
      const res = await fetch('/api/teacher/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          title: certTitle,
          category: certCategory,
          grade: certGrade,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setCertSuccess(`Sertifikat berhasil diterbitkan! Kode: ${json.certificate.credential_code}`);
        setTimeout(() => {
          setCertModalOpen(false);
          setCertSuccess(null);
        }, 3000);
      } else {
        alert('Gagal menerbitkan sertifikat');
      }
    } catch (e) {
      console.error(e);
      alert('Error saat menerbitkan sertifikat');
    } finally {
      setCertSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Siswa Tidak Ditemukan</h2>
        <p className="text-slate-400">{error || 'Data analisis siswa tidak tersedia.'}</p>
        <Link
          href="/teacher/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Guru Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/teacher/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard Guru
        </Link>

        <button
          onClick={() => setCertModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Award className="w-4 h-4" /> Terbitkan Sertifikat Prestasi
        </button>
      </div>

      {/* Header Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-2xl font-mono">
              {data.studentName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{data.studentName}</h1>
                <span
                  className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                    data.segment.segment === 'ANALYST'
                      ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                      : data.segment.segment === 'CONSISTENT_LEARNER'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : data.segment.segment === 'RISK_TAKER'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      : data.segment.segment === 'OVERTRADER'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {data.segment.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{data.email}</p>
              <p className="text-xs text-slate-300 mt-2 max-w-2xl">{data.segment.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono">Learning Score</span>
              <div className="text-xl font-mono font-black text-emerald-400">{data.learningScore}/100</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono">Total ROI</span>
              <div
                className={`text-xl font-mono font-black ${
                  data.wallet.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {data.wallet.roi >= 0 ? '+' : ''}
                {data.wallet.roi}%
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono">Max Drawdown</span>
              <div className="text-xl font-mono font-black text-amber-400">{data.riskMetrics.maxDrawdown}%</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono">Disiplin Jurnal</span>
              <div className="text-xl font-mono font-black text-indigo-400">{data.journalMetrics.complianceRate}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Pedagogical Diagnosis & Teacher Intervention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">AI Diagnostic & Pedagogical Feedback</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Kekuatan Pembelajaran (Strengths)
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {data.aiFeedback.strengths.map((str, idx) => (
                  <li key={idx}>{str}</li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" /> Area Butuh Remediasi (Gaps)
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {data.aiFeedback.weaknesses.map((weak, idx) => (
                  <li key={idx}>{weak}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
              <Brain className="w-4 h-4" /> Saran Intervensi Guru (Teacher Pedagogical Guidance)
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed">{data.aiFeedback.teacherIntervention}</p>
          </div>
        </div>

        {/* 9-Dimensional Mastery Matrix */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">9-Pillar Competency</h2>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {Object.entries(data.skills).map(([key, val]) => {
              const label =
                key === 'fundamental'
                  ? 'Fundamental'
                  : key === 'technical'
                  ? 'Technical'
                  : key === 'valuation'
                  ? 'Valuation'
                  : key === 'smartMoney'
                  ? 'Smart Money'
                  : key === 'riskManagement'
                  ? 'Risk Mgmt'
                  : key === 'sentiment'
                  ? 'Sentiment'
                  : key === 'discipline'
                  ? 'Discipline'
                  : key === 'portfolio'
                  ? 'Portfolio'
                  : 'Quantitative';

              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400 capitalize">{label}</span>
                    <span className="font-bold text-white">{val}/100</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        val >= 75 ? 'bg-emerald-400' : val >= 55 ? 'bg-indigo-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, val))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Assignment Submissions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Riwayat Pengumpulan Tugas & Evaluasi AI</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">{data.assignments.length} Tugas Selesai</span>
        </div>

        {data.assignments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                  <th className="py-2.5 px-3">Judul Tugas</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Skor AI</th>
                  <th className="py-2.5 px-3 text-center">Nilai Guru</th>
                  <th className="py-2.5 px-3">Waktu Kirim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {data.assignments.map((asg) => (
                  <tr key={asg.assignmentId} className="hover:bg-slate-850/50">
                    <td className="py-3 px-3 font-semibold text-white">{asg.title}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Submitted
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-indigo-400">
                      {asg.aiScore !== undefined && asg.aiScore !== null ? `${asg.aiScore}/100` : '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-400">
                      {asg.grade !== undefined && asg.grade !== null ? `${asg.grade}/100` : 'Belum dinilai'}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {asg.submittedAt ? new Date(asg.submittedAt).toLocaleDateString('id-ID') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">Siswa ini belum mengumpulkan tugas.</div>
        )}
      </div>

      {/* Certificate Modal */}
      {certModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Terbitkan Sertifikat Prestasi</h3>
                <p className="text-xs text-slate-400">Untuk siswa: {data.studentName}</p>
              </div>
            </div>

            {certSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center text-emerald-400 text-xs font-bold space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <p>{certSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleIssueCertificate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Judul Sertifikat</label>
                  <input
                    type="text"
                    value={certTitle}
                    onChange={(e) => setCertTitle(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Kategori Kompetensi</label>
                    <select
                      value={certCategory}
                      onChange={(e) => setCertCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="FUNDAMENTAL">Fundamental Analysis</option>
                      <option value="TECHNICAL">Technical Mastery</option>
                      <option value="RISK">Risk Management</option>
                      <option value="PORTFOLIO">Portfolio Construction</option>
                      <option value="QUANT">Quantitative Strategy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tingkat Kelulusan</label>
                    <select
                      value={certGrade}
                      onChange={(e) => setCertGrade(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="DISTINCTION">Distinction (Sangat Memuaskan)</option>
                      <option value="MERIT">Merit (Memuaskan)</option>
                      <option value="PASS">Pass (Lulus)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCertModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={certSubmitting}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all disabled:opacity-50"
                  >
                    {certSubmitting ? 'Menerbitkan...' : 'Terbitkan Sekarang'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
