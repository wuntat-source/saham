'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  FileText,
  Download,
  School,
  TrendingUp,
  AlertTriangle,
  Award,
  Users,
  Shield,
  Brain,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { ClassroomAnalyticsSummary } from '@/types/classroom';

export default function TeacherReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ClassroomAnalyticsSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teacher/reports');
      if (res.ok) {
        const json = await res.json();
        setReports(json.reports || []);
        if (json.reports && json.reports.length > 0 && !selectedClassId) {
          setSelectedClassId(json.reports[0].classId);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  const activeReport = reports.find((r) => r.classId === selectedClassId) || reports[0];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/teacher/dashboard"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-emerald-400 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard Guru
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-indigo-400" />
            Laporan Kinerja Kelas & Rekap Pedagogis
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analisis diagnostik mingguan, distribusi kompetensi 9-pilar, dan export nilai kurikulum siswa.
          </p>
        </div>

        {activeReport && (
          <a
            href={`/api/teacher/reports/export?classId=${activeReport.classId}`}
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Nilai (CSV Format)
          </a>
        )}
      </div>

      {/* Class Selector Tabs */}
      {reports.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {reports.map((r) => (
            <button
              key={r.classId}
              onClick={() => setSelectedClassId(r.classId)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedClassId === r.classId
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {r.className} ({r.studentCount} Siswa)
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : activeReport ? (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                  <School className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">{activeReport.className}</h2>
                  <p className="text-xs text-slate-400 font-mono">Kode Kelas: {activeReport.invitationCode}</p>
                </div>
              </div>

              <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl font-mono">
                {activeReport.studentCount} Siswa Terdaftar
              </span>
            </div>

            {/* Key KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Rata-rata Skor Belajar</span>
                <div className="text-2xl font-mono font-black text-emerald-400 mt-1">
                  {activeReport.avgLearningScore}/100
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Standar kelulusan: 65</p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Analisis Fundamental & Teknikal</span>
                <div className="text-2xl font-mono font-black text-indigo-400 mt-1">
                  {activeReport.avgAnalysisScore}/100
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Kualitas thesis & data</p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Manajemen Risiko Kelas</span>
                <div className="text-2xl font-mono font-black text-amber-400 mt-1">
                  {activeReport.avgRiskScore}/100
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Kepatuhan stop-loss</p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Kepatuhan Jurnal & Tugas</span>
                <div className="text-2xl font-mono font-black text-cyan-400 mt-1">
                  {activeReport.journalComplianceRate}%
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Catatan sebelum order</p>
              </div>
            </div>
          </div>

          {/* 9-Pillar Competency Breakdown & Student Behavioral Segments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 9-Pillars */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Brain className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Rata-rata Penguasaan 9-Pilar Kompetensi</h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {Object.entries(activeReport.skillDistribution).map(([skill, val]) => (
                  <div key={skill} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-300 capitalize">{skill}</span>
                      <span className="text-emerald-400 font-bold">{val}/100</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, val))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Segments */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Distribusi Profil Pembelajaran Siswa</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {Object.entries(activeReport.segmentDistribution).map(([seg, count]) => (
                  <div key={seg} className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl space-y-1">
                    <div className="text-[10px] uppercase font-mono text-slate-400">
                      {seg.replace('_', ' ')}
                    </div>
                    <div className="text-lg font-black text-white font-mono">{count} Siswa</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Common Learning Gaps */}
          {activeReport.commonMistakes.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  Diagnostik Kesalahan Umum Pembelajaran ({activeReport.commonMistakes.length} Temuan)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeReport.commonMistakes.map((m) => (
                  <div
                    key={m.id}
                    className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-white">{m.title}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                        {m.affectedPercentage}% Siswa
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{m.description}</p>
                    <div className="text-[11px] text-emerald-400/90 bg-emerald-500/10 p-2.5 rounded-xl">
                      <span className="font-bold">Saran Tindak Lanjut Guru: </span>
                      {m.remediation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-500 text-xs">Belum ada data kelas yang dapat dirangkum.</div>
      )}
    </div>
  );
}
