'use client';

import React, { useEffect, useState } from 'react';
import { OrderBook as OrderBookType } from '@/lib/market';
import { Layers, RefreshCw } from 'lucide-react';

interface OrderBookProps {
  ticker: string;
  currentPrice: number;
}

export default function OrderBook({ ticker, currentPrice }: OrderBookProps) {
  const [orderBook, setOrderBook] = useState<OrderBookType | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchOrderBook = async () => {
    try {
      const res = await fetch(`/api/market/orderbook/${ticker}`);
      if (res.ok) {
        const data = await res.json();
        setOrderBook(data.orderBook);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 8000);
    return () => clearInterval(interval);
  }, [ticker, currentPrice]);

  if (!orderBook) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-center min-h-[220px]">
        <RefreshCw className="w-5 h-5 text-slate-500 animate-spin" />
      </div>
    );
  }

  const maxBidLots = Math.max(...orderBook.bids.map((b) => b.lots), 1);
  const maxAskLots = Math.max(...orderBook.asks.map((a) => a.lots), 1);
  const maxVolume = Math.max(maxBidLots, maxAskLots);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Order Book (Bid / Offer)
          </h3>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Spread: <b className="text-slate-200">Rp{orderBook.spread.toLocaleString('id-ID')}</b>
        </div>
      </div>

      {/* Header */}
      <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider pb-1 px-1">
        <div className="flex justify-between">
          <span>Bid (Beli)</span>
          <span>Vol (Lot)</span>
        </div>
        <div className="flex justify-between text-right">
          <span>Vol (Lot)</span>
          <span>Offer (Jual)</span>
        </div>
      </div>

      {/* 5 Levels Depth Table */}
      <div className="space-y-1 font-mono text-xs">
        {Array.from({ length: 5 }).map((_, idx) => {
          const bid = orderBook.bids[idx];
          const ask = orderBook.asks[idx];

          const bidPct = bid ? (bid.lots / maxVolume) * 100 : 0;
          const askPct = ask ? (ask.lots / maxVolume) * 100 : 0;

          return (
            <div key={idx} className="grid grid-cols-2 gap-2">
              {/* Bid Side (Green) */}
              <div className="relative flex items-center justify-between px-2 py-1 bg-slate-950/80 rounded border border-slate-800/60 overflow-hidden">
                <div
                  className="absolute inset-y-0 right-0 bg-emerald-500/15 transition-all duration-300"
                  style={{ width: `${bidPct}%` }}
                />
                <span className="font-bold text-emerald-400 relative z-10">
                  {bid ? bid.price.toLocaleString('id-ID') : '-'}
                </span>
                <span className="text-slate-300 text-[11px] relative z-10">
                  {bid ? bid.lots.toLocaleString('id-ID') : '-'}
                </span>
              </div>

              {/* Ask Side (Red) */}
              <div className="relative flex items-center justify-between px-2 py-1 bg-slate-950/80 rounded border border-slate-800/60 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-rose-500/15 transition-all duration-300"
                  style={{ width: `${askPct}%` }}
                />
                <span className="text-slate-300 text-[11px] relative z-10">
                  {ask ? ask.lots.toLocaleString('id-ID') : '-'}
                </span>
                <span className="font-bold text-rose-400 relative z-10">
                  {ask ? ask.price.toLocaleString('id-ID') : '-'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Harga Terakhir:</span>
        <span className="font-mono font-bold text-emerald-400">
          Rp{currentPrice.toLocaleString('id-ID')}
        </span>
      </div>
    </div>
  );
}
