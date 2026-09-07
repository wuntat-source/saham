'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  RuleCondition,
  RuleField,
  RuleOperator,
  StrategyRules,
} from '@/types/quant';
import {
  Binary,
  PlusCircle,
  Trash2,
  Play,
  Save,
  Sliders,
  ShieldCheck,
  Target,
  Sparkles,
  ArrowRight,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';

const AVAILABLE_FIELDS: Array<{ field: RuleField; label: string; group: string; defaultValue: number }> = [
  // Pillar Scores
  { field: 'technical_score', label: 'Technical Score (0-100)', group: 'Skor AI', defaultValue: 75 },
  { field: 'fundamental_score', label: 'Fundamental Score (0-100)', group: 'Skor AI', defaultValue: 70 },
  { field: 'valuation_score', label: 'Valuation Score (0-100)', group: 'Skor AI', defaultValue: 65 },
  { field: 'smart_money_score', label: 'Smart Money Score (0-100)', group: 'Skor AI', defaultValue: 75 },
  { field: 'sentiment_score', label: 'Sentiment Score (0-100)', group: 'Skor AI', defaultValue: 70 },
  { field: 'risk_score', label: 'Safety / Risk Score (0-100)', group: 'Skor AI', defaultValue: 80 },
  { field: 'overall_score', label: 'Overall Composite Score (0-100)', group: 'Skor AI', defaultValue: 80 },
  { field: 'relative_strength', label: 'Relative Strength Score (0-100)', group: 'Skor AI', defaultValue: 70 },
  // Technical Indicators
  { field: 'rsi_14', label: 'RSI 14-Period (0-100)', group: 'Indikator Teknikal', defaultValue: 65 },
  { field: 'sma_20', label: 'SMA 20-Day', group: 'Indikator Teknikal', defaultValue: 5000 },
  { field: 'sma_50', label: 'SMA 50-Day', group: 'Indikator Teknikal', defaultValue: 5000 },
  { field: 'sma_200', label: 'SMA 200-Day', group: 'Indikator Teknikal', defaultValue: 5000 },
  // Fundamental Ratios
  { field: 'pe_ratio', label: 'P/E Ratio (x)', group: 'Fundamental Rasio', defaultValue: 15 },
  { field: 'pbv_ratio', label: 'PBV Ratio (x)', group: 'Fundamental Rasio', defaultValue: 2.5 },
  { field: 'roe', label: 'ROE (% Return on Equity)', group: 'Fundamental Rasio', defaultValue: 15 },
];

function StrategyBuilderInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');

  // Strategy Meta
  const [name, setName] = useState('Strategi Kuantitatif Kustom');
  const [description, setDescription] = useState('Aturan entry berbasis filter momentum teknikal dan evaluasi fundamental.');
  const [universe, setUniverse] = useState('LQ45');

  // Entry Rule Conditions
  const [logicalOperator, setLogicalOperator] = useState<'AND' | 'OR'>('AND');
  const [conditions, setConditions] = useState<RuleCondition[]>([
    { field: 'technical_score', operator: '>=', value: 75 },
    { field: 'fundamental_score', operator: '>=', value: 70 },
    { field: 'rsi_14', operator: '<=', value: 70 },
  ]);

  // Exit Rules
  const [stopLossPct, setStopLossPct] = useState(3.5);
  const [takeProfitPct, setTakeProfitPct] = useState(7.5);
  const [maxHoldDays, setMaxHoldDays] = useState(40);

  // Position Sizing
  const [positionSizePct, setPositionSizePct] = useState(20);
  const [maxPositions, setMaxPositions] = useState(5);

  // Backtest Run Config
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2025-12-31');
  const [initialCapital, setInitialCapital] = useState(100000000);
  const [slippagePct, setSlippagePct] = useState(0.1);
  const [walkForward, setWalkForward] = useState(true);

  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [templateId]);

  const loadTemplate = async (id: string) => {
    try {
      const res = await fetch(`/api/strategies/${id}`);
      if (res.ok) {
        const data = await res.json();
        const strat = data.strategy;
        setName(strat.name + ' (Klon)');
        setDescription(strat.description);
        setUniverse(strat.universe);
        setLogicalOperator(strat.rules.entryRules.logicalOperator);
        setConditions(strat.rules.entryRules.conditions);
        setStopLossPct(strat.rules.exitRules.stopLossPct);
        setTakeProfitPct(strat.rules.exitRules.takeProfitPct);
        setMaxHoldDays(strat.rules.exitRules.maxHoldDays || 40);
        setPositionSizePct(strat.rules.positionSizePct || 20);
        setMaxPositions(strat.rules.maxPositions || 5);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addCondition = () => {
    setConditions((prev) => [
      ...prev,
      { field: 'rsi_14', operator: '<=', value: 65 },
    ]);
  };

  const removeCondition = (index: number) => {
    setConditions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, key: keyof RuleCondition, val: any) => {
    setConditions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: val };
      return updated;
    });
  };

  const getStrategyRules = (): StrategyRules => ({
    entryRules: {
      logicalOperator,
      conditions,
    },
    exitRules: {
      stopLossPct,
      takeProfitPct,
      maxHoldDays,
    },
    positionSizePct,
    maxPositions,
  });

  const handleSaveStrategy = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          universe,
          rules: getStrategyRules(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/quant-lab/strategies`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleRunBacktest = async () => {
    setRunning(true);
    try {
      // 1. Save or use rules directly
      const saveRes = await fetch('/api/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          universe,
          rules: getStrategyRules(),
        }),
      });

      let strategyId: string | undefined;
      if (saveRes.ok) {
        const data = await saveRes.json();
        strategyId = data.strategy.id;
      }

      // 2. Execute Backtest
      const btRes = await fetch('/api/backtests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId,
          strategyRules: getStrategyRules(),
          startDate,
          endDate,
          initialCapital,
          slippagePct,
          universe,
          walkForward,
        }),
      });

      if (btRes.ok) {
        const btData = await btRes.json();
        router.push(`/quant-lab/backtests/${btData.report.id}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl backdrop-blur">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              Interactive Strategy Builder
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Perancang Strategi Kuantitatif
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Susun logika kondisi entri multi-pilar, tentukan batas risiko stop loss &amp; take profit, serta jalankan simulasi backtest dengan model biaya transaksi riil.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveStrategy}
            disabled={saving || running}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl border border-slate-700 flex items-center gap-2 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Draft'}</span>
          </button>
          <button
            onClick={handleRunBacktest}
            disabled={running || saving}
            className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-xs font-bold rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition disabled:opacity-50"
          >
            {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{running ? 'Mensimulasikan...' : 'Simulasikan & Backtest'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Rule Constructor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Strategy Meta */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Binary className="w-4 h-4 text-indigo-400" />
              1. Identitas &amp; Semesta Saham
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Strategi</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Semesta Saham (Universe)</label>
                  <select
                    value={universe}
                    onChange={(e) => setUniverse(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-indigo-400 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LQ45">LQ45 (45 Saham Paling Likuid)</option>
                    <option value="BANKING">Perbankan Big-4 (BBCA, BBRI, BMRI, BBNI)</option>
                    <option value="CONSUMER">Consumer Goods (ICBP, UNVR, INDF, KLBF)</option>
                    <option value="KOMPAS100">Kompas 100 IDX</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Timeframe Grafik</label>
                  <input
                    type="text"
                    value="Daily (1D)"
                    disabled
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Deskripsi &amp; Logika Tesis</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Entry Rules Constructor */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                2. Kondisi Sinyal Beli (Entry Rules)
              </h2>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Logika:</span>
                <select
                  value={logicalOperator}
                  onChange={(e) => setLogicalOperator(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 text-xs font-bold text-emerald-400 rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-500"
                >
                  <option value="AND">AND (Semua Kondisi Terpenuhi)</option>
                  <option value="OR">OR (Salah Satu Kondisi)</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Tentukan parameter teknikal atau fundamental yang harus dipenuhi sebelum posisi dibuka.
            </p>

            <div className="space-y-3 pt-2">
              {conditions.map((cond, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-3"
                >
                  <div className="flex-1 w-full sm:w-auto">
                    <select
                      value={cond.field}
                      onChange={(e) => updateCondition(idx, 'field', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {AVAILABLE_FIELDS.map((f) => (
                        <option key={f.field} value={f.field}>
                          [{f.group}] {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full sm:w-32">
                    <select
                      value={cond.operator}
                      onChange={(e) => updateCondition(idx, 'operator', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none focus:border-indigo-500"
                    >
                      <option value=">=">&gt;= (Lebih besar/sama)</option>
                      <option value="<=">&lt;= (Lebih kecil/sama)</option>
                      <option value=">">&gt; (Lebih besar dari)</option>
                      <option value="<">&lt; (Lebih kecil dari)</option>
                      <option value="==">== (Sama dengan)</option>
                      <option value="!=">!= (Tidak sama)</option>
                      <option value="CROSSES_ABOVE">CROSSES_ABOVE (Menembus Atas)</option>
                      <option value="CROSSES_BELOW">CROSSES_BELOW (Menembus Bawah)</option>
                    </select>
                  </div>

                  <div className="w-full sm:w-28">
                    <input
                      type="number"
                      step="any"
                      value={cond.value}
                      onChange={(e) => updateCondition(idx, 'value', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white text-right focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeCondition(idx)}
                    disabled={conditions.length <= 1}
                    className="p-2 text-slate-500 hover:text-rose-400 transition disabled:opacity-20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addCondition}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tambah Kondisi Entry</span>
            </button>
          </div>

          {/* Exit Rules Constructor */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              3. Batasan Risiko &amp; Kondisi Keluar (Exit Rules)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-rose-400">Stop Loss (%)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="20"
                    value={stopLossPct}
                    onChange={(e) => setStopLossPct(parseFloat(e.target.value) || 3.5)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                  />
                  <span className="text-xs text-slate-400 font-bold">%</span>
                </div>
                <p className="text-[10px] text-slate-500">Batas toleransi risiko maksimal dari harga beli.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-emerald-400">Take Profit (%)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="50"
                    value={takeProfitPct}
                    onChange={(e) => setTakeProfitPct(parseFloat(e.target.value) || 7.5)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs text-slate-400 font-bold">%</span>
                </div>
                <p className="text-[10px] text-slate-500">Target realisasi keuntungan otomatis.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-amber-400">Max Hold (Hari)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={maxHoldDays}
                    onChange={(e) => setMaxHoldDays(parseInt(e.target.value, 10) || 40)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-xs text-slate-400 font-bold">Hari</span>
                </div>
                <p className="text-[10px] text-slate-500">Exit berbasis waktu jika target belum tersentuh.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Execution Settings & Parameters */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Parameter Backtest
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Rentang Tanggal Pengujian</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl p-2 text-[11px] text-white focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl p-2 text-[11px] text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Modal Awal Virtual</label>
                <input
                  type="number"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(parseFloat(e.target.value) || 100000000)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Max Posisi</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={maxPositions}
                    onChange={(e) => setMaxPositions(parseInt(e.target.value, 10) || 5)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs font-mono text-white text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Ukuran Posisi (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={positionSizePct}
                    onChange={(e) => setPositionSizePct(parseFloat(e.target.value) || 20)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs font-mono text-white text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Simulasi Slippage (%)</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1.0"
                  value={slippagePct}
                  onChange={(e) => setSlippagePct(parseFloat(e.target.value) || 0.1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
                  <input
                    type="checkbox"
                    checked={walkForward}
                    onChange={(e) => setWalkForward(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
                  />
                  <span>Aktifkan Walk-Forward Split</span>
                </label>
                <p className="text-[10px] text-slate-500">
                  Memisahkan data menjadi In-Sample (60%), Validation (20%), dan Out-of-Sample Test (20%) untuk deteksi overfitting.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleRunBacktest}
                disabled={running || saving}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>{running ? 'Sedang Mensimulasikan...' : 'Jalankan Backtest Sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewStrategyPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Memuat Strategy Builder...</div>}>
      <StrategyBuilderInner />
    </Suspense>
  );
}
