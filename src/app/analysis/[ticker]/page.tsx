'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { STOCKS } from '@/lib/constants';
import { ComprehensiveAnalysisResult } from '@/lib/stock-analysis';
import {
  Sparkles,
  TrendingUp,
  BarChart3,
  ShieldAlert,
  ShieldCheck,
  Award,
  Layers,
  Activity,
  DollarSign,
  PieChart,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Check,
  RefreshCw,
  FileText,
  Compass,
  Target,
  Clock,
  Calendar,
} from 'lucide-react';

interface AnalysisPageProps {
  params: Promise<{ ticker: string }>;
}

export default function AnalysisPage({ params }: AnalysisPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const currentTicker = (resolvedParams.ticker || 'BBCA').toUpperCase();

  const [data, setData] = useState<ComprehensiveAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'fundamental' | 'technical' | 'bandar' | 'tradingPlan'>('all');

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analysis/${currentTicker}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.analysis);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [currentTicker]);

  const copyMarkdownReport = () => {
    if (!data) return;
    const md = `
# 📊 ANALISIS SAHAM KOMPREHENSIF — ${data.ticker}
*Tanggal Analisis: ${data.dataDate}*
*Harga Terkini: Rp${data.quote.price.toLocaleString('id-ID')} (${data.quote.changePct >= 0 ? '+' : ''}${data.quote.changePct}%)*

## EXECUTIVE SUMMARY
- **Trend**: ${data.executiveSummary.trend}
- **Fundamental**: ${data.executiveSummary.fundamentalTag}
- **Valuasi**: ${data.executiveSummary.valuationTag}
- **Technical**: ${data.executiveSummary.technicalTag}
- **Bandarologi**: ${data.executiveSummary.bandarologiTag}
- **Sentimen**: ${data.executiveSummary.sentimentTag}
- **Risk Level**: ${data.executiveSummary.riskTag}
- **Investment Score**: ${data.scores.overallScore}/100 (${data.scores.interpretation})
- **Rekomendasi Tindakan**: ${data.executiveSummary.decisionAction}

---

## 1. MARKET OVERVIEW
- IHSG: ${data.marketOverview.ihsgStatus}
- Sektor: ${data.marketOverview.sectorName} (${data.marketOverview.sectorTrend})
- Suku Bunga: ${data.marketOverview.macroFactors.interestRate}
- Inflasi: ${data.marketOverview.macroFactors.inflation}
- Kurs USD/IDR: ${data.marketOverview.macroFactors.usdIdrRate}

## 2. FUNDAMENTAL & VALUASI
- Revenue Growth: ${data.fundamental.growth.revenueYoY}% YoY
- Laba Bersih Growth: ${data.fundamental.growth.netProfitYoY}% YoY
- ROE: ${data.fundamental.profitability.roe}% | NPM: ${data.fundamental.profitability.netProfitMargin}%
- DER: ${data.fundamental.balanceSheet.der}x | Status Neraca: ${data.fundamental.balanceSheet.status}
- PER: ${data.valuation.per}x | PBV: ${data.valuation.pbv}x | Div Yield: ${data.valuation.dividendYield}%
- Fair Value: Rp${data.valuation.fairValueRange.low.toLocaleString('id-ID')} - Rp${data.valuation.fairValueRange.high.toLocaleString('id-ID')} (${data.valuation.status})

## 3. TEKNIKAL & BANDAROLOGI
- Primary Trend: ${data.technical.primaryTrend}
- Support: Rp${data.technical.supportResistance.supportMajor.toLocaleString('id-ID')} (Major) / Rp${data.technical.supportResistance.supportMinor.toLocaleString('id-ID')} (Minor)
- Resistance: Rp${data.technical.supportResistance.resistanceMinor.toLocaleString('id-ID')} / Rp${data.technical.supportResistance.resistanceMajor.toLocaleString('id-ID')}
- Akumulasi Bandarologi: ${data.bandarologi.accumulationScore}/100 (${data.bandarologi.foreignFlow.status})

## 4. TRADING PLAN
- Entry Konservatif: Rp${data.tradingPlan.entryConservative.toLocaleString('id-ID')}
- Entry Breakout: Rp${data.tradingPlan.entryBreakout.toLocaleString('id-ID')}
- Stop Loss: Rp${data.tradingPlan.stopLoss.toLocaleString('id-ID')}
- Take Profit: TP1 Rp${data.tradingPlan.tp1.toLocaleString('id-ID')} | TP2 Rp${data.tradingPlan.tp2.toLocaleString('id-ID')} | TP3 Rp${data.tradingPlan.tp3.toLocaleString('id-ID')}
- Risk/Reward: ${data.tradingPlan.riskRewardRatio}

## 5. KESIMPULAN
${data.executiveSummary.conclusionParagraphs.join('\n\n')}
`;
    navigator.clipboard.writeText(md.trim());
    setCopied(true);
    setTimeout(() => setCopied(null as any), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Ticker Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Equity Research Terminal (15-Pillar Framework)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            Analisis Komprehensif: <span className="text-emerald-400 font-mono">{currentTicker}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analisis multi-dimensi fundamental, teknikal, bandarologi, valuasi wajar, dan trading plan berbasis data BEI terkini.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={copyMarkdownReport}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Laporan (MD)'}</span>
          </button>

          <Link
            href={`/trade/${currentTicker}`}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Buka Trading Terminal</span>
          </Link>
        </div>
      </div>

      {/* Ticker Quick Picker */}
      <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-2.5 rounded-2xl overflow-x-auto">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 shrink-0">
          Pilih Saham:
        </span>
        {STOCKS.map((s) => (
          <button
            key={s.ticker}
            onClick={() => router.push(`/analysis/${s.ticker}`)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold shrink-0 transition-all ${
              s.ticker === currentTicker
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-105'
                : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {s.ticker}
          </button>
        ))}
      </div>

      {loading || !data ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
          <h3 className="text-base font-bold text-white">Memproses 15-Pillar Analisis Saham {currentTicker}...</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Menghitung rasio fundamental, valuasi DCF, indikator teknikal (SMA/RSI/MACD), arus dana bandarologi, dan matriks risiko.
          </p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* SECTION 15: EXECUTIVE DASHBOARD & SCORECARD */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Score Gauge (4 cols) */}
              <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-3 shadow-inner">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Overall Investment Score
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-5xl sm:text-6xl font-black font-mono text-emerald-400">
                    {data.scores.overallScore}
                  </span>
                  <span className="text-slate-500 font-mono text-xl">/100</span>
                </div>
                <div className="inline-flex items-center space-x-1.5 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-300">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>{data.scores.interpretation}</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  Rekomendasi Tindakan: <br />
                  <b className="text-white text-xs">{data.executiveSummary.decisionAction}</b>
                </div>
              </div>

              {/* Right Pillar Badges & Conclusion (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Fundamental</span>
                    <span className="text-sm font-bold text-white flex items-center gap-1">
                      {data.executiveSummary.fundamentalTag} {data.scores.fundamental}/100
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Valuasi</span>
                    <span className="text-sm font-bold text-white flex items-center gap-1">
                      {data.executiveSummary.valuationTag} {data.scores.valuation}/100
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Teknikal</span>
                    <span className="text-sm font-bold text-white flex items-center gap-1">
                      {data.executiveSummary.technicalTag} {data.scores.technical}/100
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Bandarologi</span>
                    <span className="text-sm font-bold text-white flex items-center gap-1">
                      {data.executiveSummary.bandarologiTag} {data.scores.bandarologi}/100
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Sentimen</span>
                    <span className="text-sm font-bold text-white flex items-center gap-1">
                      {data.executiveSummary.sentimentTag} {data.scores.sentiment}/100
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Tingkat Risiko</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {data.executiveSummary.riskTag} Risk
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {data.executiveSummary.conclusionParagraphs.slice(0, 2).map((p, idx) => (
                    <p key={idx} className="text-xs text-slate-300 leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 1: MARKET OVERVIEW & MACRO */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Compass className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">1. Market Overview & Faktor Makroekonomi</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Kondisi IHSG & Sektor
                </span>
                <p className="text-slate-300 leading-relaxed">{data.marketOverview.ihsgStatus}</p>
                <div className="pt-2 flex items-center justify-between font-mono">
                  <span className="text-slate-400">Tren Sektor:</span>
                  <span className="font-bold text-emerald-400">{data.marketOverview.sectorTrend}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 md:col-span-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Faktor Makro & Moneter
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-500 font-semibold block">Suku Bunga BI:</span>
                    <span>{data.marketOverview.macroFactors.interestRate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Nilai Tukar USD/IDR:</span>
                    <span>{data.marketOverview.macroFactors.usdIdrRate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Inflasi Domestik:</span>
                    <span>{data.marketOverview.macroFactors.inflation}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block">Sentimen Global:</span>
                    <span>{data.marketOverview.macroFactors.globalSentiment}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 & 3: FUNDAMENTAL & VALUASI */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fundamental Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">2. Analisis Fundamental & Kualitas Laba</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Revenue YoY</div>
                  <div className="text-emerald-400 font-bold text-sm mt-0.5">
                    +{data.fundamental.growth.revenueYoY}%
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Net Profit YoY</div>
                  <div className="text-emerald-400 font-bold text-sm mt-0.5">
                    +{data.fundamental.growth.netProfitYoY}%
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">ROE (Return on Equity)</div>
                  <div className="text-white font-bold text-sm mt-0.5">
                    {data.fundamental.profitability.roe}%
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Net Profit Margin</div>
                  <div className="text-white font-bold text-sm mt-0.5">
                    {data.fundamental.profitability.netProfitMargin}%
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Debt to Equity (DER)</div>
                  <div className="text-slate-300 font-bold text-sm mt-0.5">
                    {data.fundamental.balanceSheet.der}x
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Kualitas Laba</div>
                  <div className="text-emerald-400 font-bold text-xs mt-0.5">
                    {data.fundamental.earningsQuality.tag}
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <div className="font-bold text-slate-200">Arus Kas & Neraca:</div>
                <div className="text-slate-400">
                  Operating Cash Flow: <b className="text-slate-200">{data.fundamental.cashFlow.operatingCashFlow}</b>
                </div>
                <div className="text-slate-400">
                  Status Struktur Neraca: <b className="text-emerald-400">{data.fundamental.balanceSheet.status}</b>
                </div>
              </div>
            </div>

            {/* Valuation Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">3. Analisis Valuasi & Estimasi Fair Value</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">P/E Ratio (PER)</div>
                  <div className="text-white font-bold text-sm mt-0.5">{data.valuation.per}x</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Price to Book (PBV)</div>
                  <div className="text-white font-bold text-sm mt-0.5">{data.valuation.pbv}x</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Dividend Yield</div>
                  <div className="text-emerald-400 font-bold text-sm mt-0.5">
                    {data.valuation.dividendYield}%
                  </div>
                </div>
              </div>

              {/* Fair Value Box */}
              <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300 uppercase tracking-wider">
                    Rentang Nilai Wajar (Fair Value)
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded text-[11px]">
                    {data.valuation.status}
                  </span>
                </div>

                <div className="flex items-center justify-between font-mono text-sm sm:text-base font-bold text-white pt-1">
                  <span>Rp{data.valuation.fairValueRange.low.toLocaleString('id-ID')}</span>
                  <span className="text-emerald-400 text-lg sm:text-xl">
                    Rp{data.valuation.fairValueRange.mid.toLocaleString('id-ID')} (Mid)
                  </span>
                  <span>Rp{data.valuation.fairValueRange.high.toLocaleString('id-ID')}</span>
                </div>

                <div className="text-[11px] text-slate-500 pt-1">
                  Metode: {data.valuation.fairValueRange.method}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4 & 5: TEKNIKAL & BANDAROLOGI */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Technical Analysis */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">4. Analisis Teknikal & Level S/R</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">SMA 20</div>
                  <div className="text-slate-200 font-bold">
                    Rp{data.technical.sma.sma20.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">SMA 50</div>
                  <div className="text-slate-200 font-bold">
                    Rp{data.technical.sma.sma50.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">SMA 200</div>
                  <div className="text-slate-200 font-bold">
                    Rp{data.technical.sma.sma200.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">RSI (14)</div>
                  <div className="text-emerald-400 font-bold">{data.technical.momentum.rsi}</div>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-rose-400">
                  <span>Resistance Utama / Minor:</span>
                  <b>
                    Rp{data.technical.supportResistance.resistanceMajor.toLocaleString('id-ID')} / Rp
                    {data.technical.supportResistance.resistanceMinor.toLocaleString('id-ID')}
                  </b>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Support Minor / Utama:</span>
                  <b>
                    Rp{data.technical.supportResistance.supportMinor.toLocaleString('id-ID')} / Rp
                    {data.technical.supportResistance.supportMajor.toLocaleString('id-ID')}
                  </b>
                </div>
                <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                  <span>Breakout Trigger Level:</span>
                  <b className="text-amber-300">
                    Rp{data.technical.supportResistance.breakoutLevel.toLocaleString('id-ID')}
                  </b>
                </div>
              </div>
            </div>

            {/* Bandarologi & Microstructure */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Layers className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">5. Bandarologi & Market Microstructure</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                  <div className="text-[10px] uppercase text-slate-500 font-bold">Skor Akumulasi</div>
                  <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                    {data.bandarologi.accumulationScore}/100
                  </div>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
                  <div className="text-[10px] uppercase text-slate-500 font-bold">Skor Distribusi</div>
                  <div className="text-2xl font-black font-mono text-rose-400 mt-1">
                    {data.bandarologi.distributionScore}/100
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <div>
                  <span className="text-slate-500 font-semibold block">Foreign Flow:</span>
                  <span>
                    Status <b>{data.bandarologi.foreignFlow.status}</b> ({data.bandarologi.foreignFlow.weeklyEstimate})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Broker & Volume Behavior:</span>
                  <span>{data.bandarologi.topBrokerFlow}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 font-semibold text-emerald-300">
                  {data.bandarologi.conclusion}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 9: SCENARIOS (BULL, BASE, BEAR CASE) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Target className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">9. Skenario Proyeksi (Bull, Base, & Bear Case)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Bull Case */}
              <div className="bg-gradient-to-b from-slate-950 to-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-emerald-400">🐂 Bull Case</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    +{data.scenarios.bullCase.upsidePct}%
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-white">
                  Rp{data.scenarios.bullCase.targetPrice.toLocaleString('id-ID')}
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  {data.scenarios.bullCase.assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>

              {/* Base Case */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-slate-300">⚖️ Base Case</span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    +{data.scenarios.baseCase.upsidePct}%
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-white">
                  Rp{data.scenarios.baseCase.targetPrice.toLocaleString('id-ID')}
                </div>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  {data.scenarios.baseCase.assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>

              {/* Bear Case */}
              <div className="bg-gradient-to-b from-slate-950 to-rose-950/20 border border-rose-500/30 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-rose-400">🐻 Bear Case</span>
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {data.scenarios.bearCase.downsidePct}%
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-white">
                  Rp{data.scenarios.bearCase.targetPrice.toLocaleString('id-ID')}
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  {data.scenarios.bearCase.risks.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* SECTION 11 & 12: TRADING PLAN & INVESTMENT HORIZON */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trading Plan */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">11. Actionable Trading Plan</h2>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Entry Konservatif (Pullback Support):</span>
                  <b className="text-white">Rp{data.tradingPlan.entryConservative.toLocaleString('id-ID')}</b>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Entry Breakout:</span>
                  <b className="text-emerald-400">Rp{data.tradingPlan.entryBreakout.toLocaleString('id-ID')}</b>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between">
                  <span className="text-rose-400">Discipline Stop Loss:</span>
                  <b className="text-rose-400">Rp{data.tradingPlan.stopLoss.toLocaleString('id-ID')}</b>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between">
                  <span className="text-emerald-400">Target Profit (TP1 / TP2 / TP3):</span>
                  <b className="text-emerald-400">
                    Rp{data.tradingPlan.tp1.toLocaleString('id-ID')} / Rp
                    {data.tradingPlan.tp2.toLocaleString('id-ID')} / Rp
                    {data.tradingPlan.tp3.toLocaleString('id-ID')}
                  </b>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between">
                  <span className="text-slate-300">Risk : Reward Ratio:</span>
                  <b className="text-amber-300">{data.tradingPlan.riskRewardRatio}</b>
                </div>
              </div>
            </div>

            {/* Investment Plan by Horizon */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">12. Strategi Berdasarkan Profil Investor</h2>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="font-bold text-emerald-400 mb-1">🏦 Investor Jangka Panjang (Investing)</div>
                  <p className="text-slate-300 leading-relaxed">{data.investmentPlan.longTermInvestor}</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="font-bold text-amber-300 mb-1">📈 Swing Trader (Mid-Term)</div>
                  <p className="text-slate-300 leading-relaxed">{data.investmentPlan.swingTrader}</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="font-bold text-teal-400 mb-1">⚡ Fast Scalper (Short-Term)</div>
                  <p className="text-slate-300 leading-relaxed">{data.investmentPlan.shortTermTrader}</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 14: RED FLAG CHECKLIST */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h2 className="text-base font-bold text-white">14. Red Flag Checklist Audit (11 Titik Kritis)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {data.redFlags.map((rf, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border flex items-start space-x-3 ${
                    rf.flagged
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  {rf.flagged ? (
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold text-slate-200 mb-0.5">{rf.item}</div>
                    <div className="text-[11px] text-slate-400">{rf.explanation}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
