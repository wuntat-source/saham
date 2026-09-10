'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { StockQuote } from '@/lib/market';

export default function TickerRibbon() {
  const [quotes, setQuotes] = useState<StockQuote[]>([]);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await fetch('/api/market/quotes');
        if (res.ok) {
          const data = await res.json();
          setQuotes(data.quotes || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 15000);
    return () => clearInterval(interval);
  }, []);

  if (quotes.length === 0) return null;

  // Duplicate list to create seamless infinite scroll loop
  const displayQuotes = [...quotes, ...quotes];

  return (
    <div className="bg-slate-100/95 border-b border-slate-200 text-xs py-1.5 overflow-hidden select-none">
      <div className="flex items-center space-x-2 px-3 border-r border-slate-200 float-left bg-slate-100 z-10 text-emerald-700 font-bold uppercase tracking-wider text-[10px]">
        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
        <span>IDX LIVE</span>
      </div>

      <div
        className="flex animate-marquee whitespace-nowrap space-x-6 items-center"
        style={{ animationDuration: `${Math.max(120, quotes.length * 2.5)}s` }}
      >
        {displayQuotes.map((q, idx) => {
          const isUp = q.change >= 0;
          return (
            <Link
              key={`${q.ticker}-${idx}`}
              href={`/trade/${q.ticker}`}
              className="inline-flex items-center space-x-1.5 hover:text-emerald-700 transition-colors group cursor-pointer"
            >
              <span className="font-bold text-slate-800 group-hover:text-emerald-600">
                {q.ticker}
              </span>
              <span className="text-slate-600 font-mono">
                Rp{q.price.toLocaleString('id-ID')}
              </span>
              <span
                className={`inline-flex items-center text-[11px] font-bold ${
                  isUp ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {isUp ? (
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-0.5" />
                )}
                {isUp ? '+' : ''}
                {q.changePct}%
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
