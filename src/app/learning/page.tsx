'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  StudentLearningProgress,
  StudentWeeklyReport,
  AssignmentItem,
  ChallengeItem,
} from '@/types/learning';
import { LearningStage } from '@/types/classroom';
import {
  GraduationCap,
  Sparkles,
  Trophy,
  Flame,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  Target,
  BarChart3,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Lock,
  Unlock,
} from 'lucide-react';

export default function LearningHubPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<StudentLearningProgress | null>(null);
  const [report, setReport] = useState<StudentWeeklyReport | null>(null);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [learningStages, setLearningStages] = useState<LearningStage[]>([]);
  const [activeStage, setActiveStage] = useState<LearningStage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadLearningData();
    }
  }, [user]);

  const loadLearningData = async () => {
    setLoading(true);
    try {
      const [progRes, repRes, assignRes, pathRes] = await Promise.all([
        fetch('/api/student/progress'),
        fetch('/api/student/report'),
        fetch('/api/teacher/assignments'),
        fetch('/api/learning/path'),
      ]);

      if (progRes.ok) {
        const progData = await progRes.json();
        setProgress(progData.progress);
      }
      if (repRes.ok) {
        const repData = await repRes.json();
        setReport(repData.report);
      }
      if (assignRes.ok) {
        const assignData = await assignRes.json();
        setAssignments(assignData.assignments || []);
        setChallenges(assignData.challenges || []);
      }
      if (pathRes.ok) {
        const pathData = await pathRes.json();
        setLearningStages(pathData.stages || []);
        setActiveStage(pathData.activeStage || null);
      }
    } catch (e) {
      console.error('Failed to load learning data:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-2xl">
        <GraduationCap className="w-12 h-12 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Akses Learning Hub EduTradeX</h2>
        <p className="text-sm text-slate-400">
          Silakan masuk terlebih dahulu untuk melihat kemajuan belajar, misi kelas, dan skor kecakapan Anda.
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

  const xpPercent = progress
    ? Math.min(100, Math.round((progress.xp / Math.max(1, progress.xp + progress.xpToNextLevel)) * 100))
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 p-6 sm:p-8 rounded-3xl backdrop-blur relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                EduTradeX Learning Hub & 7-Stage Curriculum
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-400">Evaluasi Pembelajaran Berbasis Proses</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Pusat Pengembangan Kompetensi Finansial
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Di EduTradeX, keberhasilan bukan hanya diukur dari profit sesaat, melainkan dari disiplin mencatat jurnal, pemahaman risiko portofolio, dan konsistensi nalar investasi Anda.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile/skills"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl border border-slate-700 flex items-center gap-2 transition"
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>9-Skill Matrix</span>
            </Link>
            <Link
              href="/ai-mentor"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition"
            >
              <Brain className="w-4 h-4" />
              <span>Tanya AI Mentor</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Gamification & Progress Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Level Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Level Siswa</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">Level {progress?.level || 1}</span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {progress?.level && progress.level >= 3 ? 'Market Strategist' : 'Junior Apprentice'}
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Progress XP</span>
              <span className="font-mono text-emerald-400">
                {progress?.xp || 0} XP
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Daily Streak Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Daily Active Streak</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-orange-400">{progress?.streakDays || 1} Hari</span>
            <span className="text-xs text-slate-400 font-medium">Konsistensi Riset</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Jaga streak dengan membuka jurnal atau berdiskusi dengan AI Mentor setiap hari.
          </p>
        </div>

        {/* Learning Score Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Multi-factor Learning Score</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">
              {report?.overallLearningScore || 80}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 100 Skor Proses</span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-1">
            Trading terencana & disiplin stop loss
          </p>
        </div>

        {/* Badges Unlocked Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Badges Diperoleh</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {progress?.badges?.length || 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">Lencana Prestasi</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-hidden">
            {progress?.badges && progress.badges.length > 0 ? (
              progress.badges.slice(0, 3).map((b, idx) => (
                <span
                  key={idx}
                  title={b.title}
                  className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-medium truncate"
                >
                  {b.title}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-500 italic">Selesaikan misi untuk badge</span>
            )}
          </div>
        </div>
      </div>

      {/* 7-Stage Progressive Learning Path Roadmap */}
      {learningStages.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">7-Stage Progressive Learning Roadmap</h2>
                <p className="text-xs text-slate-400">
                  Kurikulum terstruktur dari mekanisme BEI dasar hingga strategi kuantitatif multi-faktor.
                </p>
              </div>
            </div>

            {activeStage && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
                <Unlock className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">Tahap Aktif:</span>
                <span className="font-bold text-emerald-400">Stage {activeStage.level} - {activeStage.title}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {learningStages.map((stage) => {
              const isLocked = !stage.unlocked;
              const isDone = stage.completed;

              return (
                <div
                  key={stage.level}
                  className={`p-5 rounded-2xl border transition-all relative ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : !isLocked
                      ? 'bg-slate-950/80 border-indigo-500/40 ring-1 ring-indigo-500/20'
                      : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-300">
                      Stage {stage.level}
                    </span>
                    {isDone ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                      </span>
                    ) : isLocked ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                        <Lock className="w-3.5 h-3.5" /> Butuh {stage.xpRequired} XP
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-400">
                        <Unlock className="w-3.5 h-3.5" /> Berjalan
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2">{stage.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{stage.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Modul Pembelajaran:</div>
                    {stage.modules.map((m) => (
                      <div key={m.id} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300 truncate max-w-[160px]">{m.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{m.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Grid: Weekly Report & Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: AI Student Weekly Report */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Laporan Pembelajaran Mingguan</h2>
                  <p className="text-xs text-slate-400">
                    Evaluasi komprehensif atas keputusan investasi dan kepatuhan rencana trading Anda.
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* AI Summary Prose */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                AI Mentor Feedback
              </div>
              <p>
                {report?.weeklySummaryProse ||
                  'Anda telah menunjukkan kemajuan signifikan dalam menyusun tesis sebelum masuk pasar. Pertahankan kedisiplinan stop loss dan selalu tinjau katalis fundamental sebelum menambah porsi portofolio.'}
              </p>
            </div>

            {/* Strengths and Weaknesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Kekuatan Terpuji
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {report?.strengths && report.strengths.length > 0 ? (
                    report.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">•</span>
                        <span>{s}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400">Rasio Risk/Reward terencana di atas 1:2.</li>
                  )}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  Peluang Perbaikan
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {report?.weaknesses && report.weaknesses.length > 0 ? (
                    report.weaknesses.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400">•</span>
                        <span>{w}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400">Tingkatkan diversifikasi sektor pada portofolio.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Assignments & Challenges */}
        <div className="space-y-6">
          {/* Active Assignments */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                Tugas Kelas Aktif
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {assignments.length} Tugas
              </span>
            </div>

            {assignments.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-400">Belum ada tugas aktif dari guru.</p>
                <p className="text-[11px] text-slate-500">
                  Guru Anda dapat membuat tugas analisis saham atau simulasi portofolio di portal kelas.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/30 transition space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-white">{item.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {item.stockUniverse}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.deadline ? new Date(item.deadline).toLocaleDateString('id-ID') : 'Tanpa Tenggat'}
                      </span>
                      <Link
                        href={`/journal`}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5"
                      >
                        <span>Kerjakan</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Challenges */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Tantangan Simulasi
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {challenges.length} Tantangan
              </span>
            </div>

            {challenges.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-400">Belum ada tantangan aktif.</p>
                <p className="text-[11px] text-slate-500">
                  Contoh tantangan: Zero Stop Loss Violation, 5 Saham Berbeda Sektor, atau 100% Journal Compliance.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {challenges.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">{c.title}</span>
                      <span className="text-[10px] font-bold text-emerald-400">+{c.rewardXp} XP</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{c.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
