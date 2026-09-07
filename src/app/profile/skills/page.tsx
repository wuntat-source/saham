'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { StudentSkillsMatrix, BehaviorPatternItem } from '@/types/learning';
import {
  GraduationCap,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Award,
  TrendingUp,
  BookOpen,
  PieChart,
  Target,
  Brain,
  Layers,
} from 'lucide-react';

export default function StudentSkillsPage() {
  const { user } = useAuth();
  const [skillMatrix, setSkillMatrix] = useState<StudentSkillsMatrix | null>(null);
  const [behaviors, setBehaviors] = useState<BehaviorPatternItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSkills();
    }
  }, [user]);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/student/skills');
      if (res.ok) {
        const data = await res.json();
        setSkillMatrix(data.skills);
        setBehaviors(data.behaviors || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-2xl">
        <GraduationCap className="w-12 h-12 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Akses Matriks Kecakapan</h2>
        <p className="text-sm text-slate-400">
          Silakan masuk untuk melihat perkembangan 9 dimensi kompetensi pasar modal Anda.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition"
        >
          Masuk Akun
        </Link>
      </div>
    );
  }

  const skillList = skillMatrix
    ? [
        { key: 'fundamental', name: 'Analisis Fundamental', icon: Layers, score: skillMatrix.fundamentalScore, weight: '15%' },
        { key: 'technical', name: 'Analisis Teknikal', icon: TrendingUp, score: skillMatrix.technicalScore, weight: '15%' },
        { key: 'valuation', name: 'Pemahaman Valuasi', icon: Target, score: skillMatrix.valuationScore, weight: '10%' },
        { key: 'risk', name: 'Manajemen Risiko & Cutloss', icon: ShieldCheck, score: skillMatrix.riskManagementScore, weight: '20%' },
        { key: 'portfolio', name: 'Alokasi Portofolio', icon: PieChart, score: skillMatrix.portfolioScore, weight: '10%' },
        { key: 'psychology', name: 'Psikologi & Sentimen', icon: Brain, score: skillMatrix.psychologyScore, weight: '10%' },
        { key: 'literacy', name: 'Literasi Keuangan', icon: BookOpen, score: skillMatrix.literacyScore, weight: '10%' },
        { key: 'research', name: 'Riset Pasar & Berita', icon: Sparkles, score: skillMatrix.researchScore, weight: '10%' },
        { key: 'decision', name: 'Konsistensi Keputusan', icon: BarChart3, score: skillMatrix.decisionScore, weight: '10%' },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl backdrop-blur">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              9-Skill Pedagogical Matrix
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Matriks Kecakapan Finansial Siswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Evaluasi proses belajar berbasis 9 pilar kompetensi trading & investasi. Skor dihitung otomatis dari jurnal, analisa screener, dan eksekusi simulator.
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
              Multi-factor Learning Score
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {skillMatrix?.learningScore ?? 80}
              <span className="text-xs text-slate-500 font-normal"> / 100</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Multi-factor Weighting Explain Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Formula Penilaian Pembelajaran (Proses &gt; Hasil)
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Di EduTradeX, skor belajar dirancang agar siswa tidak sekadar beruntung mendapat profit spekulatif. Bobot penilaian:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
            <div className="text-xs font-bold text-slate-200">Kualitas Analisis</div>
            <div className="text-lg font-black text-emerald-400 font-mono">25%</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
            <div className="text-xs font-bold text-slate-200">Manajemen Risiko</div>
            <div className="text-lg font-black text-emerald-400 font-mono">20%</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
            <div className="text-xs font-bold text-slate-200">Kelengkapan Riset</div>
            <div className="text-lg font-black text-emerald-400 font-mono">15%</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
            <div className="text-xs font-bold text-slate-200">Disiplin Jurnal</div>
            <div className="text-lg font-black text-emerald-400 font-mono">15%</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
            <div className="text-xs font-bold text-slate-200">Konsistensi Nalar</div>
            <div className="text-lg font-black text-emerald-400 font-mono">15%</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
            <div className="text-xs font-bold text-slate-200">Kemajuan Belajar</div>
            <div className="text-lg font-black text-emerald-400 font-mono">10%</div>
          </div>
        </div>
      </div>

      {/* 9-Skill Matrix Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          Rincian 9 Dimensi Kompetensi
        </h2>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Memuat matriks kecakapan...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillList.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.key}
                  className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      Bobot {s.weight}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-white">{s.name}</h3>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-2xl font-black text-emerald-400 font-mono">
                        {s.score}
                        <span className="text-[10px] text-slate-500 font-normal"> / 100</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {s.score >= 80 ? '🌟 Mahir' : s.score >= 60 ? '⚡ Berkembang' : '🌱 Pemula'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        s.score >= 80
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : s.score >= 60
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          : 'bg-gradient-to-r from-slate-600 to-slate-400'
                      }`}
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Observable Trading Behaviors */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-7 rounded-3xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-400" />
          Pola Perilaku Transaksi yang Teramati (Behavioral Engine)
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Algoritma EduTradeX memantau kebiasaan trading Anda untuk memberikan peringatan dini atas risiko psikologis seperti overtrading, konsentrasi portofolio, atau pengabaian stop loss.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {behaviors.length === 0 ? (
            <div className="col-span-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">
              Belum ada pola transaksi ekstrem yang teramati. Terus trading dengan rencana yang baik!
            </div>
          ) : (
            behaviors.map((b, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border space-y-2 ${
                  b.status === 'POSITIVE'
                    ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300'
                    : b.status === 'NEUTRAL'
                    ? 'bg-amber-950/20 border-amber-500/20 text-amber-300'
                    : 'bg-rose-950/20 border-rose-500/20 text-rose-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>{b.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/60 uppercase">
                    {b.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{b.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
