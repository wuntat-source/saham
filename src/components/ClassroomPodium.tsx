'use client';

import React, { useEffect } from 'react';
import { Trophy, Crown, Sparkles, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  name: string;
  email: string;
  cashBalance: number;
  stockValue: number;
  totalEquity: number;
  initialBalance: number;
  returnPct: number;
  totalReturnRp: number;
  holdingsCount: number;
}

interface ClassroomPodiumProps {
  topThree: LeaderboardEntry[];
}

export default function ClassroomPodium({ topThree }: ClassroomPodiumProps) {
  useEffect(() => {
    if (topThree.length > 0) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [topThree]);

  if (topThree.length === 0) return null;

  const first = topThree.find((s) => s.rank === 1);
  const second = topThree.find((s) => s.rank === 2);
  const third = topThree.find((s) => s.rank === 3);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-400 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TOP TRADERS OF THE CLASS</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Podium Kejuaraan Trading
        </h2>
      </div>

      {/* 3 Pedestals */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end max-w-2xl mx-auto pt-8">
        {/* 2nd Place (Silver - Left) */}
        {second && (
          <div className="flex flex-col items-center order-1">
            <div className="relative mb-3 flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 p-0.5 shadow-lg shadow-slate-400/20">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-slate-200 font-black text-sm sm:text-base">
                  {getInitials(second.name)}
                </div>
              </div>
              <span className="absolute -top-3 bg-slate-400 text-slate-950 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow">
                #2
              </span>
            </div>

            <div className="text-center w-full mb-2">
              <div className="font-bold text-xs sm:text-sm text-white truncate px-1">
                {second.name}
              </div>
              <div
                className={`text-[11px] sm:text-xs font-mono font-bold inline-flex items-center gap-0.5 ${
                  second.returnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {second.returnPct >= 0 ? '+' : ''}
                {second.returnPct}% ROI
              </div>
            </div>

            {/* Pedestal Block */}
            <div className="w-full h-28 sm:h-36 bg-gradient-to-t from-slate-800 to-slate-850 rounded-t-2xl border-t-2 border-slate-400 flex flex-col items-center justify-center p-2 shadow-inner">
              <span className="text-slate-400 font-black text-2xl sm:text-3xl font-mono">2</span>
              <span className="text-[10px] sm:text-xs font-mono text-slate-300 font-bold text-center">
                Rp{(second.totalEquity / 1_000_000).toFixed(1)} jt
              </span>
            </div>
          </div>
        )}

        {/* 1st Place (Gold - Center) */}
        {first && (
          <div className="flex flex-col items-center order-2 -mt-6">
            <div className="relative mb-3 flex flex-col items-center">
              <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 animate-bounce mb-1" />
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-200 p-0.5 shadow-xl shadow-amber-500/30">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-amber-300 font-black text-base sm:text-xl">
                  {getInitials(first.name)}
                </div>
              </div>
              <span className="absolute -top-3 right-0 bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow">
                🥇 #1
              </span>
            </div>

            <div className="text-center w-full mb-2">
              <div className="font-bold text-xs sm:text-base text-white truncate px-1">
                {first.name}
              </div>
              <div
                className={`text-xs sm:text-sm font-mono font-bold inline-flex items-center gap-0.5 ${
                  first.returnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {first.returnPct >= 0 ? '+' : ''}
                {first.returnPct}% ROI
              </div>
            </div>

            {/* Pedestal Block */}
            <div className="w-full h-36 sm:h-48 bg-gradient-to-t from-amber-950/40 via-slate-800 to-slate-850 rounded-t-2xl border-t-2 border-amber-400 flex flex-col items-center justify-center p-2 shadow-2xl relative">
              <div className="absolute inset-x-0 top-0 h-1 bg-amber-400/50 shadow-lg shadow-amber-400/50"></div>
              <Trophy className="w-6 h-6 text-amber-400 mb-1" />
              <span className="text-amber-400 font-black text-3xl sm:text-4xl font-mono">1</span>
              <span className="text-xs sm:text-sm font-mono text-amber-200 font-bold text-center">
                Rp{(first.totalEquity / 1_000_000).toFixed(1)} jt
              </span>
            </div>
          </div>
        )}

        {/* 3rd Place (Bronze - Right) */}
        {third && (
          <div className="flex flex-col items-center order-3">
            <div className="relative mb-3 flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-500 p-0.5 shadow-lg shadow-amber-700/20">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-amber-500 font-black text-sm sm:text-base">
                  {getInitials(third.name)}
                </div>
              </div>
              <span className="absolute -top-3 bg-amber-700 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full shadow">
                #3
              </span>
            </div>

            <div className="text-center w-full mb-2">
              <div className="font-bold text-xs sm:text-sm text-white truncate px-1">
                {third.name}
              </div>
              <div
                className={`text-[11px] sm:text-xs font-mono font-bold inline-flex items-center gap-0.5 ${
                  third.returnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {third.returnPct >= 0 ? '+' : ''}
                {third.returnPct}% ROI
              </div>
            </div>

            {/* Pedestal Block */}
            <div className="w-full h-24 sm:h-32 bg-gradient-to-t from-slate-800 to-slate-850 rounded-t-2xl border-t-2 border-amber-600 flex flex-col items-center justify-center p-2 shadow-inner">
              <span className="text-amber-600 font-black text-2xl sm:text-3xl font-mono">3</span>
              <span className="text-[10px] sm:text-xs font-mono text-slate-300 font-bold text-center">
                Rp{(third.totalEquity / 1_000_000).toFixed(1)} jt
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
