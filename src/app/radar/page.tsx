'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RadarHubData } from '@/types/advanced-intelligence';
import {
  Radar,
  Sparkles,
  Zap,
  TrendingUp,
  Activity,
  AlertTriangle,
  Flame,
  Calendar,
  ChevronRight,
  RefreshCw,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

export default function RadarPage() {
  const [data, setData] = useState<RadarHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'setups' | 'breakouts' | 'accumulation' | 'catalysts' | 'anomalies' | 'highRisk'
  >('setups');

  const fetchRadar = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/radar');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to load radar data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRadar();
  }, []);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center gap-1.5 border border-emerald-500/30">
              <Radar className="w-3.5 h-3.5" />
              AI RADAR COMMAND CENTER
            </span>
            <span className="text-xs text-slate-400 font-medium font-mono">
              Live Monitoring Stream
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Radar Peluang & Anomali Pasar
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
            Pemantauan multi-sinyal berbasis AI mencakup Top Setups, Breakout Watch, Smart Money Accumulation, Kalender Katalis, Deteksi Anomali, dan Peringatan Risiko Tinggi.
          </p>
        </div>

        <Link
          href="/radar/catalysts"
          className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold font-sans transition-all"
        >
          <Calendar className="w-4 h-4" />
          <span>Kalender Katalis Lengkap</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-lg overflow-x-auto text-xs font-semibold">
        {[
          { key: 'setups', label: 'Top Setups', icon: Sparkles },
          { key: 'breakouts', label: 'Breakout Watch', icon: TrendingUp },
          { key: 'accumulation', label: 'Akumulasi Institusi', icon: Zap },
          { key: 'catalysts', label: 'Katalis Terdekat', icon: Calendar },
          { key: 'anomalies', label: 'Deteksi Anomali', icon: Activity },
          { key: 'highRisk', label: 'Peringatan Risiko', icon: ShieldAlert },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === key
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Stream Content */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
          <p className="text-xs text-slate-400 font-mono">Memindai 6 aliran radar pasar...</p>
        </div>
      ) : data ? (
        <div className="space-y-4 font-sans">
          {/* 1. TOP SETUPS */}
          {activeTab === 'setups' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.topSetups.map((s) => (
                <div
                  key={s.ticker}
                  className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-5 shadow-xl transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-lg text-white">{s.ticker}</span>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold text-xs">
                      Skor AI: {s.score}/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{s.companyName}</p>
                  <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-850 flex items-center justify-between font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Setup Type</span>
                      <span className="text-slate-200 font-bold">{s.setupType}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Sinyal</span>
                      <span className="text-emerald-400 font-bold">{s.signal}</span>
                    </div>
                  </div>
                  <Link
                    href={`/stock/${s.ticker}`}
                    className="w-full mt-2 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold text-center block transition-colors"
                  >
                    Buka Chart & Analisis
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* 2. BREAKOUT WATCH */}
          {activeTab === 'breakouts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.breakoutWatch.map((b) => (
                <div
                  key={b.ticker}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-5 shadow-xl transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-lg text-white">{b.ticker}</span>
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-bold text-xs">
                      Trigger: Rp{b.breakoutTrigger.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-850 grid grid-cols-2 gap-2 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Harga Saat Ini</span>
                      <span className="text-slate-200 font-bold">Rp{b.price.toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Ekspansi Volume</span>
                      <span className="text-emerald-400 font-bold">+{b.volumeExpansionPct}%</span>
                    </div>
                  </div>
                  <Link
                    href={`/stock/${b.ticker}`}
                    className="w-full mt-2 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold text-center block transition-colors"
                  >
                    Pantau Breakout Level
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* 3. ACCUMULATION */}
          {activeTab === 'accumulation' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.accumulation.map((a) => (
                <div
                  key={a.ticker}
                  className="bg-slate-900 border border-slate-800 hover:border-sky-500/40 rounded-3xl p-5 shadow-xl transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-lg text-white">{a.ticker}</span>
                    <span className="px-2.5 py-1 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 font-mono font-bold text-xs">
                      {a.status}
                    </span>
                  </div>
                  <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-850 grid grid-cols-2 gap-2 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Foreign Inflow 5D</span>
                      <span className="text-emerald-400 font-bold">+Rp{(a.foreignInflow5D / 1e9).toFixed(0)} M</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Konsentrasi Broker</span>
                      <span className="text-slate-200 font-bold">{a.concentrationPct}%</span>
                    </div>
                  </div>
                  <Link
                    href={`/stock/${a.ticker}`}
                    className="w-full mt-2 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold text-center block transition-colors"
                  >
                    Detail Smart Money
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* 4. CATALYSTS */}
          {activeTab === 'catalysts' && (
            <div className="space-y-3">
              {data.catalystWatch.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-white text-base">{c.ticker}</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold">
                        {c.eventType}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(c.eventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-200">{c.title}</h4>
                    <p className="text-xs text-slate-400">{c.description}</p>
                  </div>
                  <Link
                    href={`/stock/${c.ticker}`}
                    className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium"
                  >
                    Buka Saham
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* 5. ANOMALIES */}
          {activeTab === 'anomalies' && (
            <div className="space-y-3">
              {data.anomalyWatch.map((anom) => (
                <div
                  key={anom.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-white text-base">{anom.ticker}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                          anom.severity === 'HIGH_ALERT'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {anom.severity}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{anom.anomalyType}</span>
                    </div>
                    <p className="text-xs text-slate-300">{anom.description}</p>
                  </div>
                  <Link
                    href={`/stock/${anom.ticker}`}
                    className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium"
                  >
                    Investigasi
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* 6. HIGH RISK */}
          {activeTab === 'highRisk' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.highRiskWatch.map((hr) => (
                <div
                  key={hr.ticker}
                  className="bg-slate-900 border border-rose-500/30 rounded-3xl p-5 shadow-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-lg text-white">{hr.ticker}</span>
                    <span className="px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 font-mono font-bold text-xs">
                      HIGH VOLATILITY
                    </span>
                  </div>
                  <p className="text-xs text-rose-200/90 leading-relaxed">{hr.reason}</p>
                  <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-850 grid grid-cols-2 gap-2 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Volatilitas (30D)</span>
                      <span className="text-rose-400 font-bold">{hr.volatility}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Max Drawdown</span>
                      <span className="text-slate-300 font-bold">-{hr.drawdown}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
