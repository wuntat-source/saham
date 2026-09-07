'use client';

import React, { useEffect, useState } from 'react';
import { TradingPlanLevel, PositionSizingResult } from '@/types/advanced-intelligence';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  ShieldCheck,
  Target,
  Calculator,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

interface StockTradingPlanTabProps {
  ticker: string;
}

export default function StockTradingPlanTab({ ticker }: StockTradingPlanTabProps) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<TradingPlanLevel | null>(null);
  const [loading, setLoading] = useState(true);

  // Position Sizing Interactive State
  const [riskPct, setRiskPct] = useState<1 | 2 | 5>(2);
  const [accountBalance, setAccountBalance] = useState(user?.wallet?.cash_balance || 100_000_000);

  useEffect(() => {
    let isMounted = true;
    const fetchPlan = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/stocks/${ticker}/trading-plan`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setPlan(json.plan);
        }
      } catch (e) {
        console.error('Failed to load trading plan:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPlan();
    return () => {
      isMounted = false;
    };
  }, [ticker]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
        <p className="text-xs text-slate-400 font-mono">
          Menghitung level teknikal & rencana trading simulasi untuk {ticker}...
        </p>
      </div>
    );
  }

  if (!plan) return null;

  // Position sizing dynamic calculations
  const maxRiskAmount = Math.round((accountBalance * riskPct) / 100);
  const currentEstPrice = (plan.entryZone.min + plan.entryZone.max) / 2;
  const stopDistancePerShare = Math.max(1, currentEstPrice - plan.stopLoss);
  const maxShares = Math.floor(maxRiskAmount / stopDistancePerShare);
  const maxLots = Math.floor(maxShares / 100);
  const actualShares = maxLots * 100;
  const capitalRequired = actualShares * currentEstPrice;
  const potentialLoss = actualShares * stopDistancePerShare;
  const potentialGainTp1 = actualShares * Math.max(0, plan.tp1 - currentEstPrice);
  const potentialGainTp2 = actualShares * Math.max(0, plan.tp2 - currentEstPrice);

  return (
    <div className="space-y-6">
      {/* Top Banner: Educational Disclaimer */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
              Simulated Educational Trading Plan
            </span>
            <h3 className="text-lg font-black text-white">
              Rencana Eksekusi Trading Simulasi ({ticker})
            </h3>
          </div>

          <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-mono text-xs text-emerald-400 font-bold">
            <Target className="w-4 h-4" />
            <span>Risk / Reward: 1 : {plan.riskRewardRatio}</span>
          </div>
        </div>

        {/* Level Cards Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5 font-mono text-xs">
          {/* Entry Zone */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-sky-500/30 space-y-1">
            <span className="text-[10px] uppercase font-bold text-sky-400 block">
              🎯 Entry Zone
            </span>
            <div className="text-white font-black text-sm">
              Rp{plan.entryZone.min.toLocaleString('id-ID')} – Rp{plan.entryZone.max.toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-slate-500 font-sans block">Retest / Konsolidasi</span>
          </div>

          {/* Breakout Level */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-amber-500/30 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">
              ⚡ Breakout Trigger
            </span>
            <div className="text-white font-black text-sm">
              Rp{plan.breakoutLevel.toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-slate-500 font-sans block">Konfirmasi Volume</span>
          </div>

          {/* Stop Loss */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-rose-500/30 space-y-1">
            <span className="text-[10px] uppercase font-bold text-rose-400 block">
              🛑 Stop Loss (SL)
            </span>
            <div className="text-rose-400 font-black text-sm">
              Rp{plan.stopLoss.toLocaleString('id-ID')} (-{plan.stopDistancePct}%)
            </div>
            <span className="text-[10px] text-slate-500 font-sans block">Swing Low Support</span>
          </div>

          {/* Target Profit TP2 */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-emerald-500/30 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">
              🏁 Target Profit (TP2)
            </span>
            <div className="text-emerald-400 font-black text-sm">
              Rp{plan.tp2.toLocaleString('id-ID')} (+{plan.tp2UpsidePct}%)
            </div>
            <span className="text-[10px] text-slate-500 font-sans block">TP1: Rp{plan.tp1.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Explanation Logic */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-1.5 font-sans text-xs text-slate-300">
          <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
            Bagaimana Level Ini Ditentukan?
          </span>
          {plan.logicExplanation.map((expl, i) => (
            <div key={i} className="flex items-start space-x-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span>{expl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Position Sizing Calculator (Requirement 9) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base">
              Kalkulator Manajemen Alokasi Lot (Position Sizing)
            </h4>
            <p className="text-xs text-slate-400 font-sans">
              Hitung alokasi lot maksimal secara disiplin agar potensi risiko rugi tidak melebihi toleransi modal Anda.
            </p>
          </div>
        </div>

        {/* Select Risk Tolerance */}
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center space-x-3">
            <span className="text-slate-400 font-sans">Toleransi Risiko per Trade:</span>
            <div className="flex items-center space-x-2">
              {([1, 2, 5] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskPct(r)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                    riskPct === r
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-105'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {r}% Modal ({r === 1 ? 'Konservatif' : r === 2 ? 'Moderat' : 'Agresif'})
                </button>
              ))}
            </div>
          </div>

          <div className="text-slate-400 font-sans">
            Saldo Kas: <span className="font-mono text-white font-bold">Rp{accountBalance.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Position Sizing Output Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 font-mono text-xs">
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Maksimal Risiko (IDR)</span>
            <span className="text-rose-400 font-black text-sm mt-0.5 block">
              Rp{maxRiskAmount.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">{riskPct}% dari saldo</span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-emerald-500/30">
            <span className="text-[10px] text-emerald-400 uppercase font-bold block">Alokasi Maksimal</span>
            <span className="text-white font-black text-base mt-0.5 block">
              {maxLots} Lot
            </span>
            <span className="text-[10px] text-slate-400 font-sans">({actualShares.toLocaleString('id-ID')} lembar)</span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Kebutuhan Modal Virtual</span>
            <span className="text-slate-200 font-black text-sm mt-0.5 block">
              Rp{capitalRequired.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">
              {((capitalRequired / Math.max(1, accountBalance)) * 100).toFixed(1)}% dari kas
            </span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Potensi Profit (TP2)</span>
            <span className="text-emerald-400 font-black text-sm mt-0.5 block">
              +Rp{potentialGainTp2.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">Risk: Rp{potentialLoss.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-slate-500 italic font-sans leading-relaxed">
          ⚠️ {plan.disclaimer}
        </p>
      </div>
    </div>
  );
}
