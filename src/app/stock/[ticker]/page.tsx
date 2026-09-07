'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { STOCKS } from '@/lib/constants';
import { StockQuote } from '@/types/market';
import StockChart from '@/components/StockChart';
import OrderBook from '@/components/OrderBook';
import OrderBox from '@/components/OrderBox';
import { useAuth } from '@/context/AuthContext';
import StockIntelligencePanel from '@/components/StockIntelligencePanel';
import StockDebateTab from '@/components/StockDebateTab';
import StockScenarioTab from '@/components/StockScenarioTab';
import StockTradingPlanTab from '@/components/StockTradingPlanTab';
import StockInvestmentLensTab from '@/components/StockInvestmentLensTab';
import {
  TrendingUp,
  Activity,
  DollarSign,
  Building2,
  Clock,
  History,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Layers,
  Sparkles,
  Scale,
  Target,
  Calculator,
} from 'lucide-react';

interface StockPageProps {
  params: Promise<{ ticker: string }>;
}

export default function StockPage({ params }: StockPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const currentTicker = (resolvedParams.ticker || 'BBCA').toUpperCase();

  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'position' | 'trades'>('position');
  const [aiTab, setAiTab] = useState<'lens' | 'scores' | 'debate' | 'scenarios' | 'plan'>('lens');
  const [userPortfolio, setUserPortfolio] = useState<any>(null);
  const [tradeHistory, setTradeHistory] = useState<any[]>([]);

  const fetchQuote = async () => {
    try {
      const res = await fetch(`/api/market/quote/${currentTicker}`);
      if (res.ok) {
        const data = await res.json();
        setQuote(data.quote);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    if (!user) return;
    try {
      const pRes = await fetch('/api/portfolio/me');
      if (pRes.ok) {
        const pData = await pRes.json();
        const currentHolding = pData.holdings?.find(
          (h: any) => h.stock_code === currentTicker || h.stockCode === currentTicker
        );
        setUserPortfolio(currentHolding || null);
      }

      const tRes = await fetch(`/api/trade/history?ticker=${currentTicker}`);
      if (tRes.ok) {
        const tData = await tRes.json();
        setTradeHistory(tData.transactions || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQuote();
    fetchUserData();
    const interval = setInterval(() => {
      fetchQuote();
    }, 10000);
    return () => clearInterval(interval);
  }, [currentTicker, user]);

  const currentPrice = quote?.price || 1000;
  const holdingLots = userPortfolio?.lots || 0;
  const stockMeta = STOCKS.find((s) => s.ticker === currentTicker);

  return (
    <div className="space-y-6 pb-16">
      {/* Ticker Quick Switcher Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-lg overflow-x-auto gap-2">
        <div className="flex items-center space-x-1.5 shrink-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Pilih Emiten:
          </span>
          {STOCKS.slice(0, 12).map((s) => (
            <button
              key={s.ticker}
              onClick={() => router.push(`/stock/${s.ticker}`)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                s.ticker === currentTicker
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-105'
                  : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {s.ticker}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Chart & Metrics (8 cols), Right Order Box & Book (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stock Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center font-mono font-black text-xl text-emerald-400">
                {currentTicker.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-black text-white font-mono">{currentTicker}</h1>
                  <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-semibold">
                    {quote?.sector || 'BEI'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">{quote?.name}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black font-mono text-white">
                Rp{currentPrice.toLocaleString('id-ID')}
              </div>
              <div
                className={`text-xs font-mono font-bold inline-flex items-center gap-0.5 ${
                  ((quote?.change ?? 0) >= 0) ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {(quote?.change ?? 0) >= 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {(quote?.change ?? 0) >= 0 ? '+' : ''}
                {(quote?.change ?? 0).toLocaleString('id-ID')} ({((quote?.changePct ?? (quote as any)?.change_percent ?? 0) >= 0 ? '+' : '')}
                {(quote?.changePct ?? (quote as any)?.change_percent ?? 0).toFixed(2)}%)
              </div>
            </div>
          </div>

          {/* Interactive Candlestick Chart */}
          <StockChart
            ticker={currentTicker}
            currentPrice={currentPrice}
            changePct={Number((quote?.changePct ?? (quote as any)?.change_percent ?? 0).toFixed(2))}
          />

          {/* Key Metrics Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Statistik Informasi Saham
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Open (Pembukaan)</div>
                <div className="text-slate-200 font-bold mt-0.5">
                  Rp{(quote?.open ?? stockMeta?.basePrice ?? 0).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">High (Tertinggi)</div>
                <div className="text-emerald-400 font-bold mt-0.5">
                  Rp{(quote?.high ?? stockMeta?.basePrice ?? 0).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Low (Terendah)</div>
                <div className="text-rose-400 font-bold mt-0.5">
                  Rp{(quote?.low ?? stockMeta?.basePrice ?? 0).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Prev Close</div>
                <div className="text-slate-200 font-bold mt-0.5">
                  Rp{(quote?.prevClose ?? (quote as any)?.prev_close ?? stockMeta?.basePrice ?? 0).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Volume Harian</div>
                <div className="text-slate-200 font-bold mt-0.5">
                  {(quote?.volume ?? 0).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">P/E Ratio</div>
                <div className="text-slate-200 font-bold mt-0.5">{stockMeta?.peRatio || 15}x</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Kapitalisasi Pasar</div>
                <div className="text-slate-200 font-bold mt-0.5">{stockMeta?.marketCap || '50 T'}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Simbol Pasar</div>
                <div className="text-emerald-400 font-bold mt-0.5">{currentTicker}.JK</div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 leading-relaxed font-sans">
              <span className="font-bold text-slate-300">Profil Perusahaan: </span>
              {stockMeta?.description}
            </div>
          </div>
        </div>

        {/* Right Section: Order Execution Box & Order Book (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <OrderBox
            ticker={currentTicker}
            currentPrice={currentPrice}
            userHoldingLots={holdingLots}
            onOrderExecuted={() => {
              fetchQuote();
              fetchUserData();
            }}
          />

          <OrderBook ticker={currentTicker} currentPrice={currentPrice} />
        </div>
      </div>

      {/* AI Market Intelligence Hub */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-lg overflow-x-auto text-xs font-semibold">
          {[
            { key: 'lens', label: 'AI Investment Lens (6 Lensa)', icon: Building2 },
            { key: 'scores', label: '6 Pilar Skor AI', icon: Sparkles },
            { key: 'debate', label: '3-Agent AI Debate', icon: Scale },
            { key: 'scenarios', label: 'Matriks Skenario', icon: Layers },
            { key: 'plan', label: 'Trading Plan & Sizing', icon: Target },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setAiTab(key as any)}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                aiTab === key
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {aiTab === 'lens' && <StockInvestmentLensTab ticker={currentTicker} />}
        {aiTab === 'scores' && <StockIntelligencePanel ticker={currentTicker} />}
        {aiTab === 'debate' && <StockDebateTab ticker={currentTicker} />}
        {aiTab === 'scenarios' && <StockScenarioTab ticker={currentTicker} />}
        {aiTab === 'plan' && <StockTradingPlanTab ticker={currentTicker} />}
      </div>

      {/* Bottom Section: Position & History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center space-x-4 border-b border-slate-800 pb-3 mb-4">
          <button
            onClick={() => setActiveTab('position')}
            className={`flex items-center space-x-2 text-xs font-bold uppercase tracking-wider pb-2 -mb-3 transition-colors ${
              activeTab === 'position'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Posisi Saya ({currentTicker})</span>
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`flex items-center space-x-2 text-xs font-bold uppercase tracking-wider pb-2 -mb-3 transition-colors ${
              activeTab === 'trades'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Histori Transaksi ({tradeHistory.length})</span>
          </button>
        </div>

        {activeTab === 'position' && (
          <div>
            {userPortfolio ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Jumlah Kepemilikan</div>
                  <div className="text-white font-bold text-base mt-0.5">
                    {userPortfolio.lots} Lot ({(userPortfolio.total_shares || userPortfolio.totalShares || 0).toLocaleString('id-ID')} lembar)
                  </div>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Harga Beli Rata-Rata</div>
                  <div className="text-slate-300 font-bold text-base mt-0.5">
                    Rp{(userPortfolio.avg_buy_price || userPortfolio.avgBuyPrice || 0).toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Nilai Pasar Saat Ini</div>
                  <div className="text-white font-bold text-base mt-0.5">
                    Rp{(userPortfolio.market_value || userPortfolio.marketValue || 0).toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Unrealized P&L</div>
                  <div
                    className={`font-bold text-base mt-0.5 ${
                      (userPortfolio.unrealized_pnl ?? userPortfolio.unrealizedPnl ?? 0) >= 0
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {(userPortfolio.unrealized_pnl ?? userPortfolio.unrealizedPnl ?? 0) >= 0 ? '+' : ''}Rp
                    {(userPortfolio.unrealized_pnl ?? userPortfolio.unrealizedPnl ?? 0).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                Anda belum memiliki kepemilikan saham {currentTicker}. Beli saham menggunakan panel di sebelah kanan.
              </div>
            )}
          </div>
        )}

        {activeTab === 'trades' && (
          <div className="overflow-x-auto">
            {tradeHistory.length > 0 ? (
              <table className="w-full text-xs text-left font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400">
                    <th className="py-2.5 px-3">Tipe</th>
                    <th className="py-2.5 px-3">Jumlah Lot</th>
                    <th className="py-2.5 px-3">Harga Eksekusi</th>
                    <th className="py-2.5 px-3">Nilai Transaksi</th>
                    <th className="py-2.5 px-3">Broker Fee</th>
                    <th className="py-2.5 px-3">Penyelesaian (Settlement)</th>
                    <th className="py-2.5 px-3">Realized P&L</th>
                    <th className="py-2.5 px-3">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tradeHistory.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-850/50">
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.type === 'BUY'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-white font-bold">{t.lot_quantity} Lot</td>
                      <td className="py-2.5 px-3 text-slate-300">
                        Rp{t.price.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        Rp{t.total_amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        Rp{t.broker_fee.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-white font-bold">
                        Rp{t.total_settlement.toLocaleString('id-ID')}
                      </td>
                      <td
                        className={`py-2.5 px-3 font-bold ${
                          t.realized_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {t.type === 'SELL'
                          ? `${t.realized_pnl >= 0 ? '+' : ''}Rp${t.realized_pnl.toLocaleString('id-ID')}`
                          : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {new Date(t.executed_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                Belum ada transaksi untuk saham {currentTicker}.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
