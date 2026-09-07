'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CatalystsByTimeline, CatalystItem } from '@/types/advanced-intelligence';
import {
  Calendar,
  Sparkles,
  Flame,
  ArrowUpRight,
  ChevronRight,
  Clock,
  Building2,
  RefreshCw,
} from 'lucide-react';

export default function CatalystCalendarPage() {
  const [data, setData] = useState<CatalystsByTimeline | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCatalysts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/radar/catalysts');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to load catalysts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalysts();
  }, []);

  const renderSection = (title: string, list: CatalystItem[], badgeColor: string) => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <span className={`w-3 h-3 rounded-full ${badgeColor}`} />
        <h3 className="font-bold text-white text-base font-mono uppercase tracking-wider">
          {title} ({list.length})
        </h3>
      </div>

      {list.length > 0 ? (
        <div className="space-y-3 font-sans">
          {list.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-xl transition-all flex flex-wrap items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-3xl">
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono font-black text-emerald-400 text-base">
                    {c.ticker}
                  </span>
                  <span className="text-xs text-slate-400 font-medium font-sans">
                    {c.companyName}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800 font-mono text-[10px] font-bold">
                    {c.eventType}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{c.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{c.description}</p>
                <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono pt-1">
                  <span>Sumber: {c.source}</span>
                  <span>•</span>
                  <span>
                    Tanggal:{' '}
                    {new Date(c.eventDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <Link
                href={`/stock/${c.ticker}`}
                className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-sans transition-all flex items-center space-x-1"
              >
                <span>Lihat Saham</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-6 text-center text-xs text-slate-500">
          Tidak ada katalis emiten yang dijadwalkan pada periode ini.
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center gap-1.5 border border-amber-500/30">
              <Calendar className="w-3.5 h-3.5" />
              CORPORATE ACTION & CATALYST CALENDAR
            </span>
            <span className="text-xs text-slate-400 font-medium font-mono">
              Bursa Efek Indonesia
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Kalender Katalis Korporasi & Dividen
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
            Jadwal rilis laporan keuangan, dividen tunai, RUPS/RUPSLB, aksi korporasi spin-off, buyback, serta rebalancing indeks global.
          </p>
        </div>

        <Link
          href="/radar"
          className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all"
        >
          <span>Kembali ke AI Radar</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent" />
          <p className="text-xs text-slate-400 font-mono">Memuat kalender katalis terverifikasi...</p>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {renderSection('Hari Ini (Today)', data.today, 'bg-emerald-400 animate-pulse')}
          {renderSection('Minggu Ini (This Week)', data.thisWeek, 'bg-amber-400')}
          {renderSection('30 Hari Mendatang (Next 30 Days)', data.next30Days, 'bg-sky-400')}
        </div>
      ) : null}
    </div>
  );
}
