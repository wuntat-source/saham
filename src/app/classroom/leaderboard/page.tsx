'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ClassroomPodium, { LeaderboardEntry } from '@/components/ClassroomPodium';
import {
  Trophy,
  School,
  TrendingUp,
  RefreshCw,
  Users,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Brain,
  CheckCircle2,
  BarChart3,
  Search,
} from 'lucide-react';
import { CategoryLeaderboard } from '@/types/classroom';

interface ClassData {
  id: string;
  className: string;
  invitationCode: string;
  initialBalance: number;
  teacher: { name: string; email: string };
  totalStudents: number;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [classInfo, setClassInfo] = useState<ClassData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [categoryBoards, setCategoryBoards] = useState<CategoryLeaderboard[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ROI');
  const [loading, setLoading] = useState(true);

  // Initialize class list
  useEffect(() => {
    const userClasses = user?.enrolledClasses?.map((ec) => ec.class) || [];
    if (user?.taughtClasses && user.taughtClasses.length > 0) {
      userClasses.push(...user.taughtClasses.map((c) => ({ ...c, teacher: { name: user.name, email: user.email } })));
    }

    if (userClasses.length > 0) {
      setClasses(userClasses);
      setSelectedClassId(userClasses[0].id);
    }
  }, [user]);

  const fetchLeaderboards = async (classId: string) => {
    setLoading(true);
    try {
      if (classId) {
        const res = await fetch(`/api/classes/${classId}/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          setClassInfo(data.class);
          setLeaderboard(data.leaderboard || []);
        }
      }

      // Fetch 6-dimensional pedagogical rankings
      const catRes = await fetch(`/api/classroom/leaderboard${classId ? `?classId=${classId}` : ''}`);
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategoryBoards(catData.leaderboards || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboards(selectedClassId);
  }, [selectedClassId]);

  const topThree = leaderboard.slice(0, 3);
  const activeCategoryBoard = categoryBoards.find((c) => c.category === activeTab);

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-amber-400" />
            Leaderboard Multi-Kategori & Prestasi Belajar
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Menghargai kedisiplinan proses, kualitas analisis, dan manajemen risiko di samping hasil ROI.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {classInfo && (
            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs flex items-center space-x-2">
              <School className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-semibold">{classInfo.className}</span>
              <span className="bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                {classInfo.invitationCode}
              </span>
            </div>
          )}

          <button
            onClick={() => fetchLeaderboards(selectedClassId)}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-emerald-400 rounded-xl transition-colors cursor-pointer"
            title="Perbarui Leaderboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('ROI')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'ROI'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Live ROI Trading</span>
        </button>

        {categoryBoards.map((cat) => (
          <button
            key={cat.category}
            onClick={() => setActiveTab(cat.category)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === cat.category
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat.category === 'OVERALL_CHAMPION' && <Trophy className="w-3.5 h-3.5" />}
            {cat.category === 'BEST_ANALYST' && <Brain className="w-3.5 h-3.5" />}
            {cat.category === 'BEST_RISK_MANAGER' && <Shield className="w-3.5 h-3.5" />}
            {cat.category === 'BEST_LEARNER' && <Award className="w-3.5 h-3.5" />}
            {cat.category === 'MOST_CONSISTENT' && <CheckCircle2 className="w-3.5 h-3.5" />}
            {cat.category === 'BEST_RESEARCHER' && <BarChart3 className="w-3.5 h-3.5" />}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Content based on Active Tab */}
      {activeTab === 'ROI' ? (
        <div className="space-y-8">
          {/* Top 3 Podium */}
          {topThree.length > 0 && <ClassroomPodium topThree={topThree} />}

          {/* Full Ranking Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">
                  Tabel Peringkat Live Ekuitas & ROI ({leaderboard.length} Peserta)
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">Diperbarui real-time</span>
            </div>

            {leaderboard.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                      <th className="py-3 px-3 w-12 text-center">Rank</th>
                      <th className="py-3 px-3">Nama Siswa</th>
                      <th className="py-3 px-3">Saldo Kas</th>
                      <th className="py-3 px-3">Nilai Saham</th>
                      <th className="py-3 px-3">Total Ekuitas</th>
                      <th className="py-3 px-3">Gain / Loss (Rp)</th>
                      <th className="py-3 px-3">Floating ROI (%)</th>
                      <th className="py-3 px-3 text-center">Aset</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {leaderboard.map((s) => {
                      const isCurrentUser = user?.id === s.studentId;

                      return (
                        <tr
                          key={s.studentId}
                          className={`hover:bg-slate-850/50 transition-colors ${
                            isCurrentUser ? 'bg-emerald-500/10 border-l-2 border-emerald-400' : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-center font-mono">
                            {s.rank === 1 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs">
                                1
                              </span>
                            ) : s.rank === 2 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-400 text-slate-950 font-black text-xs">
                                2
                              </span>
                            ) : s.rank === 3 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs">
                                3
                              </span>
                            ) : (
                              <span className="text-slate-400 font-bold">#{s.rank}</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-sm text-white flex items-center gap-1.5">
                              <span>{s.name}</span>
                              {isCurrentUser && (
                                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500">{s.email}</div>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-300">
                            Rp{s.cashBalance.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-300">
                            Rp{s.stockValue.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-white text-sm">
                            Rp{s.totalEquity.toLocaleString('id-ID')}
                          </td>
                          <td
                            className={`py-3 px-3 font-mono font-bold ${
                              s.totalReturnRp >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {s.totalReturnRp >= 0 ? '+' : ''}Rp
                            {s.totalReturnRp.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-3 font-mono">
                            <span
                              className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded ${
                                s.returnPct >= 0
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {s.returnPct >= 0 ? (
                                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                              ) : (
                                <ArrowDownRight className="w-3 h-3 mr-0.5" />
                              )}
                              {s.returnPct >= 0 ? '+' : ''}
                              {s.returnPct}%
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono">
                            <span className="bg-slate-950 text-slate-300 px-2 py-1 rounded text-xs">
                              {s.holdingsCount} Saham
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Belum ada data siswa dalam leaderboard kelas ini.
              </div>
            )}
          </div>
        </div>
      ) : activeCategoryBoard ? (
        /* Pedagogical Dimension Rankings */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-black text-white">{activeCategoryBoard.label}</h2>
            <p className="text-xs text-slate-400 mt-1">{activeCategoryBoard.description}</p>
          </div>

          <div className="space-y-3">
            {activeCategoryBoard.rankings.map((r) => {
              const isCurrentUser = user?.id === r.studentId;

              return (
                <div
                  key={r.studentId}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    r.rank === 1
                      ? 'bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/5'
                      : r.rank === 2
                      ? 'bg-slate-800/40 border-slate-700/50'
                      : r.rank === 3
                      ? 'bg-amber-700/10 border-amber-700/30'
                      : 'bg-slate-950/40 border-slate-800/60'
                  } ${isCurrentUser ? 'ring-2 ring-emerald-500/50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 text-center font-mono font-black text-base">
                      {r.rank === 1 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-slate-950">
                          1
                        </span>
                      ) : r.rank === 2 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-400 text-slate-950">
                          2
                        </span>
                      ) : r.rank === 3 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white">
                          3
                        </span>
                      ) : (
                        <span className="text-slate-400">#{r.rank}</span>
                      )}
                    </div>

                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <span>{r.studentName}</span>
                        {isCurrentUser && (
                          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.2 rounded">
                            Anda
                          </span>
                        )}
                        {r.segmentLabel && (
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-mono">
                            {r.segmentLabel}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{r.metricLabel}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black font-mono text-emerald-400">{r.score} Pts</div>
                    <span className="text-[10px] text-slate-500 font-mono">Pedagogical Index</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 text-xs">Kategori tidak ditemukan.</div>
      )}
    </div>
  );
}
