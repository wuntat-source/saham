'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Cpu,
  Activity,
  Users,
  School,
  FileText,
  Award,
  Clock,
  Terminal,
  RefreshCw,
  Zap,
  Layers,
  Database,
  Lock,
} from 'lucide-react';
import { AuditLogItem, AIGovernanceTelemetry } from '@/types/classroom';

interface AdminData {
  metrics: {
    totalUsers: number;
    studentCount: number;
    teacherCount: number;
    classCount: number;
    tradeCount: number;
    journalCount: number;
    strategyCount: number;
    certificateCount: number;
  };
  aiTelemetry: AIGovernanceTelemetry;
  recentAuditLogs: AuditLogItem[];
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-indigo-400" />
            School Admin & AI Governance Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pengawasan infrastruktur sekolah, audit kepatuhan transaksi, dan telemetri pemakaian AI Mentor.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* Top Platform Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Total Akun Sekolah</span>
              <div className="text-2xl font-black font-mono text-white mt-1">{data.metrics.totalUsers}</div>
              <div className="text-[10px] text-slate-400">
                {data.metrics.studentCount} Siswa • {data.metrics.teacherCount} Guru
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Kelas Terdaftar</span>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-1">{data.metrics.classCount}</div>
              <div className="text-[10px] text-slate-400">Active Simulation Rooms</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Total Transaksi Virtual</span>
              <div className="text-2xl font-black font-mono text-indigo-400 mt-1">{data.metrics.tradeCount}</div>
              <div className="text-[10px] text-slate-400">{data.metrics.journalCount} Jurnal Tersimpan</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Sertifikat Diterbitkan</span>
              <div className="text-2xl font-black font-mono text-amber-400 mt-1">
                {data.metrics.certificateCount}
              </div>
              <div className="text-[10px] text-slate-400">{data.metrics.strategyCount} Strategi Kuantitatif</div>
            </div>
          </div>

          {/* AI Governance & Telemetry */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">AI Governance & LLM Inference Telemetry</h2>
                  <p className="text-xs text-slate-400">
                    Transparansi model, audit token konsumsi, dan pemantauan latensi AI Mentor & Evaluator.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  Model: {data.aiTelemetry.activeModelVersion}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-bold">
                  Prompt: {data.aiTelemetry.activePromptVersion}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Total Pemanggilan AI</span>
                <div className="text-xl font-mono font-black text-white mt-1">{data.aiTelemetry.totalCalls} Calls</div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Total Token Terpakai</span>
                <div className="text-xl font-mono font-black text-emerald-400 mt-1">
                  {data.aiTelemetry.totalTokens.toLocaleString()} Tokens
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Rata-rata Latensi AI</span>
                <div className="text-xl font-mono font-black text-amber-400 mt-1">
                  {data.aiTelemetry.avgLatencyMs} ms
                </div>
              </div>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">System Security & Compliance Audit Log</h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">Immutable audit trail</span>
            </div>

            {data.recentAuditLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                      <th className="py-2.5 px-3">Waktu</th>
                      <th className="py-2.5 px-3">Pengguna</th>
                      <th className="py-2.5 px-3">Aksi</th>
                      <th className="py-2.5 px-3">Entitas</th>
                      <th className="py-2.5 px-3">Perubahan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {data.recentAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-850/50">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                          {new Date(log.timestamp).toLocaleString('id-ID')}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-white">{log.userName}</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">{log.action}</td>
                        <td className="py-2.5 px-3 font-mono text-indigo-400">{log.entity}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 truncate max-w-xs">
                          {log.newValue || log.oldValue || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">Belum ada aktivitas audit log.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 text-xs">Gagal memuat telemetri admin.</div>
      )}
    </div>
  );
}
