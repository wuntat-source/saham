'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { STOCKS } from '@/lib/constants';
import { StockQuote } from '@/lib/market';
import StockChart from '@/components/StockChart';
import OrderBook from '@/components/OrderBook';
import OrderBox from '@/components/OrderBox';
import { useAuth } from '@/context/AuthContext';
import {
  TrendingUp,
  Activity,
  DollarSign,
  Building2,
  Clock,
  History,
  Briefcase,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface TradePageProps {
  params: Promise<{ ticker: string }>;
}

export default function TradePage({ params }: TradePageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const currentTicker = (resolvedParams.ticker || 'BBCA').toUpperCase();

  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'position' | 'trades'>('position');
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
      // Fetch portfolio
      const pRes = await fetch('/api/portfolio/me');
      if (pRes.ok) {
        const pData = await pRes.json();
        const currentHolding = pData.holdings?.find(
          (h: any) => h.stockCode === currentTicker
        );
        setUserPortfolio(currentHolding || null);
      }

      // Fetch trades
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

  const handleTickerChange = (ticker: string) => {
    router.push(`/trade/${ticker}`);
  };

  const currentPrice = quote?.price || 1000;
  const holdingLots = userPortfolio?.lots || 0;
  const stockMeta = STOCKS.find((s) => s.ticker === currentTicker);

  return (
    <div className="space-y-6">
      {/* Ticker Quick Switcher Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-3 shadow-xs overflow-x-auto gap-2">
        <div className="flex items-center space-x-1.5 shrink-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
            Pilih Saham:
          </span>
          {STOCKS.map((s) => (
            <button
              key={s.ticker}
              onClick={() => handleTickerChange(s.ticker)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                s.ticker === currentTicker
                  ? 'bg-emerald-600 text-white shadow-xs scale-105'
                  : 'bg-slate-50 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {s.ticker}
            </button>
          ))}
        </div>
      </div>

      {/* Main Terminal Viewport Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section: Interactive Chart & Key Metrics (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stock Header Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-mono font-black text-xl text-emerald-700 shadow-xs">
                {currentTicker.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-black text-slate-900 font-mono">{currentTicker}</h1>
                  <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold border border-slate-200">
                    {quote?.sector || 'BEI'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{quote?.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href={`/analysis/${currentTicker}`}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-700 text-xs font-bold transition-all shadow-xs group"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-12 transition-transform" />
                <span>Analisis AI 15-Pillar</span>
              </Link>
              <div className="text-right">
                <div className="text-2xl font-black font-mono text-slate-900">
                  Rp{currentPrice.toLocaleString('id-ID')}
                </div>
                <div
                  className={`text-xs font-mono font-bold inline-flex items-center gap-0.5 ${
                    ((quote?.change ?? 0) >= 0) ? 'text-emerald-700' : 'text-rose-700'
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
          </div>

          {/* Interactive Candlestick Chart */}
          <StockChart
            ticker={currentTicker}
            currentPrice={currentPrice}
            changePct={Number((quote?.changePct ?? (quote as any)?.change_percent ?? 0).toFixed(2))}
          />

          {/* Key Metrics Grid */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              Statistik Kunci Pasar
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Open (Pembukaan)</div>
                <div className="text-slate-900 font-bold mt-0.5">
                  Rp{(quote?.open ?? stockMeta?.basePrice ?? 0).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">High (Tertinggi)</div>
                <div className="text-emerald-700 font-bold mt-0.5">
                  Rp{(quote?.high ?? stockMeta?.basePrice ?? 0).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Low (Terendah)</div>
                <div className="text-rose-700 font-bold mt-0.5">
                  Rp{(quote?.low ?? stockMeta?.basePrice ?? 0).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Prev Close</div>
                <div className="text-slate-900 font-bold mt-0.5">
                  Rp{(quote?.prevClose ?? (quote as any)?.prev_close ?? stockMeta?.basePrice ?? 0).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Volume Perdagangan</div>
                <div className="text-slate-900 font-bold mt-0.5">
                  {(quote?.volume ?? 0).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">P/E Ratio</div>
                <div className="text-slate-900 font-bold mt-0.5">{quote?.peRatio || stockMeta?.peRatio || 15}x</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Kapitalisasi Pasar</div>
                <div className="text-slate-900 font-bold mt-0.5">{quote?.marketCap || stockMeta?.marketCap || '50 T'}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Simbol Yahoo</div>
                <div className="text-emerald-700 font-bold mt-0.5">{currentTicker}.JK</div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 leading-relaxed font-sans">
              <span className="font-bold text-slate-800">Profil Singkat: </span>
              {quote?.description}
            </div>
          </div>
        </div>

        {/* Right Section: Order Book & Order Box (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Order Execution Box */}
          <OrderBox
            ticker={currentTicker}
            currentPrice={currentPrice}
            userHoldingLots={holdingLots}
            onOrderExecuted={() => {
              fetchQuote();
              fetchUserData();
            }}
          />

          {/* Mini Order Book Depth */}
          <OrderBook ticker={currentTicker} currentPrice={currentPrice} />
        </div>
      </div>

      {/* Bottom Tabs: Active Position & Trade History for Active Ticker */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center space-x-4 border-b border-slate-200 pb-3 mb-4">
          <button
            onClick={() => setActiveTab('position')}
            className={`flex items-center space-x-2 text-xs font-bold uppercase tracking-wider pb-2 -mb-3 transition-colors cursor-pointer ${
              activeTab === 'position'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Posisi Saya ({currentTicker})</span>
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`flex items-center space-x-2 text-xs font-bold uppercase tracking-wider pb-2 -mb-3 transition-colors cursor-pointer ${
              activeTab === 'trades'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Histori Transaksi ({tradeHistory.length})</span>
          </button>
        </div>

        {/* Tab 1: Position View */}
        {activeTab === 'position' && (
          <div>
            {userPortfolio ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Jumlah Kepemilikan</div>
                  <div className="text-slate-900 font-bold text-base mt-0.5">
                    {userPortfolio.lots} Lot ({userPortfolio.totalShares.toLocaleString('id-ID')}{' '}
                    lembar)
                  </div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Harga Beli Rata-Rata</div>
                  <div className="text-slate-700 font-bold text-base mt-0.5">
                    Rp{userPortfolio.avgBuyPrice.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Nilai Pasar Saat Ini</div>
                  <div className="text-slate-900 font-bold text-base mt-0.5">
                    Rp{userPortfolio.marketValue.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Floating P&L</div>
                  <div
                    className={`font-bold text-base mt-0.5 ${
                      userPortfolio.unrealizedPnl >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {userPortfolio.unrealizedPnl >= 0 ? '+' : ''}Rp
                    {userPortfolio.unrealizedPnl.toLocaleString('id-ID')} (
                    {userPortfolio.unrealizedPnlPct}%)
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                Anda belum memiliki kepemilikan saham {currentTicker}. Beli saham menggunakan panel
                di sebelah kanan.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Trade History */}
        {activeTab === 'trades' && (
          <div className="overflow-x-auto">
            {tradeHistory.length > 0 ? (
              <table className="w-full text-xs text-left font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase text-slate-500 font-bold">
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
                <tbody className="divide-y divide-slate-100">
                  {tradeHistory.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.type === 'BUY'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-900 font-bold">{t.lot_quantity} Lot</td>
                      <td className="py-2.5 px-3 text-slate-700 font-semibold">
                        Rp{t.price.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        Rp{t.total_amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        Rp{t.broker_fee.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-slate-900 font-bold">
                        Rp{t.total_settlement.toLocaleString('id-ID')}
                      </td>
                      <td
                        className={`py-2.5 px-3 font-bold ${
                          t.realized_pnl >= 0 ? 'text-emerald-700' : 'text-rose-700'
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
