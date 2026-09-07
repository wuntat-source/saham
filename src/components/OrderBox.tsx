'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BUY_BROKER_FEE_RATE, SELL_BROKER_FEE_RATE, SHARES_PER_LOT } from '@/lib/constants';
import {
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Calculator,
  Wallet,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrderBoxProps {
  ticker: string;
  currentPrice: number;
  userHoldingLots?: number;
  onOrderExecuted?: () => void;
}

export default function OrderBox({
  ticker,
  currentPrice,
  userHoldingLots = 0,
  onOrderExecuted,
}: OrderBoxProps) {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState<'BUY' | 'SELL'>('BUY');
  const [mode, setMode] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [priceInput, setPriceInput] = useState<number>(currentPrice);
  const [lots, setLots] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    if (mode === 'MARKET') {
      setPriceInput(currentPrice);
    }
  }, [currentPrice, mode]);

  const cashBalance = user?.wallet?.cash_balance || 0;
  const executionPrice = mode === 'MARKET' ? currentPrice : priceInput || currentPrice;
  const shares = lots * SHARES_PER_LOT;
  const grossAmount = shares * executionPrice;

  const buyFee = grossAmount * BUY_BROKER_FEE_RATE;
  const buyTotal = grossAmount + buyFee;

  const sellFee = grossAmount * SELL_BROKER_FEE_RATE;
  const sellTotal = grossAmount - sellFee;

  // Calculate max affordable lots
  const singleLotCost = executionPrice * 100 * (1 + BUY_BROKER_FEE_RATE);
  const maxAffordableLots = singleLotCost > 0 ? Math.floor(cashBalance / singleLotCost) : 0;
  const maxSellableLots = userHoldingLots;

  const applyPercent = (pct: number) => {
    if (tab === 'BUY') {
      const calculatedLots = Math.max(1, Math.floor((maxAffordableLots * pct) / 100));
      setLots(calculatedLots);
    } else {
      const calculatedLots = Math.max(1, Math.floor((maxSellableLots * pct) / 100));
      setLots(calculatedLots);
    }
  };

  const handleExecute = async () => {
    if (!user) {
      setMsg({ type: 'error', text: 'Silakan login terlebih dahulu untuk bertransaksi.' });
      return;
    }

    if (lots <= 0) {
      setMsg({ type: 'error', text: 'Jumlah lot harus lebih besar dari 0.' });
      return;
    }

    if (tab === 'BUY' && buyTotal > cashBalance) {
      setMsg({
        type: 'error',
        text: `Saldo kas tidak mencukupi. Diperlukan Rp${buyTotal.toLocaleString('id-ID')}`,
      });
      return;
    }

    if (tab === 'SELL' && lots > userHoldingLots) {
      setMsg({
        type: 'error',
        text: `Anda hanya memiliki ${userHoldingLots} lot untuk saham ${ticker}.`,
      });
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/trade/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock_code: ticker,
          type: tab,
          mode,
          lots,
          price: executionPrice,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMsg({
          type: 'success',
          text: `Berhasil ${tab === 'BUY' ? 'Membeli' : 'Menjual'} ${lots} lot ${ticker} @ Rp${executionPrice.toLocaleString('id-ID')}!`,
        });

        // Trigger celebratory confetti on profit or trade execution
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
        });

        await refreshUser();
        if (onOrderExecuted) onOrderExecuted();
      } else {
        setMsg({ type: 'error', text: data.error || 'Gagal mengeksekusi order.' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Terjadi kegagalan jaringan saat eksekusi order.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col">
      {/* Tab Selector (BUY / SELL) */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl mb-4 border border-slate-200">
        <button
          onClick={() => {
            setTab('BUY');
            setMsg(null);
          }}
          className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            tab === 'BUY'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Beli (Buy)</span>
        </button>
        <button
          onClick={() => {
            setTab('SELL');
            setMsg(null);
          }}
          className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
            tab === 'SELL'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowDownRight className="w-4 h-4" />
          <span>Jual (Sell)</span>
        </button>
      </div>

      {/* Mode Selector (Market / Limit) */}
      <div className="flex items-center justify-between text-xs mb-3 text-slate-500">
        <span className="font-semibold text-slate-700">Tipe Eksekusi:</span>
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setMode('MARKET')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
              mode === 'MARKET' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Instan (Market)
          </button>
          <button
            onClick={() => setMode('LIMIT')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
              mode === 'LIMIT' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kustom (Limit)
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-3">
        {/* Price Field */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Harga Eksekusi (Rp)
          </label>
          <div className="relative">
            <input
              type="number"
              disabled={mode === 'MARKET'}
              value={mode === 'MARKET' ? currentPrice : priceInput}
              onChange={(e) => setPriceInput(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 disabled:opacity-80 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            {mode === 'MARKET' && (
              <span className="absolute right-3 top-2.5 text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Live Market
              </span>
            )}
          </div>
        </div>

        {/* Lot Field */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Jumlah Lot (1 Lot = 100 Lembar)
            </label>
            <span className="text-[11px] text-slate-500 font-mono font-semibold">
              {tab === 'BUY'
                ? `Maks: ${maxAffordableLots} Lot`
                : `Dimiliki: ${userHoldingLots} Lot`}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setLots((prev) => Math.max(1, prev - 1))}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-slate-700 font-bold text-base transition-colors cursor-pointer"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={lots}
              onChange={(e) => setLots(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 text-center focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              onClick={() => setLots((prev) => prev + 1)}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-slate-700 font-bold text-base transition-colors cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Quick Percent Buttons */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => applyPercent(pct)}
              className="py-1.5 bg-slate-100 hover:bg-emerald-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Financial Ledger Calculation Breakdown */}
      <div className="my-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Nilai Saham ({shares.toLocaleString('id-ID')} lembar):</span>
          <span className="font-mono text-slate-900 font-semibold">
            Rp{grossAmount.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>
            Fee Broker ({tab === 'BUY' ? '0.15%' : '0.25%'}):
          </span>
          <span className="font-mono text-slate-700">
            Rp{(tab === 'BUY' ? buyFee : sellFee).toLocaleString('id-ID')}
          </span>
        </div>
        <div className="h-px bg-slate-200 my-1" />
        <div className="flex justify-between text-slate-800 font-bold">
          <span>Total {tab === 'BUY' ? 'Pembayaran' : 'Penerimaan'}:</span>
          <span className={`font-mono text-sm ${tab === 'BUY' ? 'text-emerald-700' : 'text-rose-700'}`}>
            Rp{(tab === 'BUY' ? buyTotal : sellTotal).toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Alerts / Feedback Message */}
      {msg && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold mb-3 flex items-start space-x-2 ${
            msg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleExecute}
        disabled={loading}
        className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer ${
          tab === 'BUY'
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
            : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
        }`}
      >
        {loading ? (
          <span>Memproses Transaksi...</span>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            <span>
              {tab === 'BUY' ? `Konfirmasi Beli ${ticker}` : `Konfirmasi Jual ${ticker}`}
            </span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center space-x-1 text-[10px] text-slate-500 mt-2 font-medium">
        <span>Eksekusi instan ledger dummy — Bebas risiko finansial</span>
      </div>
    </div>
  );
}
