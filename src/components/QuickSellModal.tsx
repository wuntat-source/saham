'use client';

import React, { useState } from 'react';
import { X, ArrowDownRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { SELL_BROKER_FEE_RATE, SHARES_PER_LOT } from '@/lib/constants';
import confetti from 'canvas-confetti';

interface QuickSellModalProps {
  stock: {
    stockCode: string;
    companyName: string;
    lots: number;
    avgBuyPrice: number;
    currentPrice: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function QuickSellModal({ stock, onClose, onSuccess }: QuickSellModalProps) {
  const [lots, setLots] = useState(stock.lots);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const shares = lots * SHARES_PER_LOT;
  const grossProceeds = shares * stock.currentPrice;
  const brokerFee = grossProceeds * SELL_BROKER_FEE_RATE;
  const netSettlement = grossProceeds - brokerFee;
  const realizedPnl = (stock.currentPrice - stock.avgBuyPrice) * shares - brokerFee;
  const realizedPnlPct = (realizedPnl / (shares * stock.avgBuyPrice)) * 100;

  const handleSell = async () => {
    if (lots <= 0 || lots > stock.lots) {
      setMsg({ type: 'error', text: `Jumlah lot harus antara 1 dan ${stock.lots}.` });
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch('/api/trade/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock_code: stock.stockCode,
          type: 'SELL',
          mode: 'MARKET',
          lots,
          price: stock.currentPrice,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMsg({
          type: 'success',
          text: `Berhasil menjual ${lots} lot ${stock.stockCode}! Realized P&L: Rp${realizedPnl.toLocaleString('id-ID')}`,
        });

        if (realizedPnl > 0) {
          confetti({ particleCount: 50, spread: 60 });
        }

        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      } else {
        setMsg({ type: 'error', text: data.error || 'Gagal mengeksekusi penjualan.' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Terjadi kesalahan sistem.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white font-mono">{stock.stockCode}</h3>
            <p className="text-xs text-slate-400 truncate max-w-[240px]">{stock.companyName}</p>
          </div>
        </div>

        {msg && (
          <div
            className={`p-3 rounded-xl text-xs font-medium mb-4 flex items-start space-x-2 ${
              msg.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {msg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-300">Jumlah Lot yang Dijual:</span>
              <span className="text-slate-400 font-mono">Tersedia: {stock.lots} Lot</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setLots((prev) => Math.max(1, prev - 1))}
                className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-xl font-bold text-white"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={stock.lots}
                value={lots}
                onChange={(e) =>
                  setLots(Math.min(stock.lots, Math.max(1, parseInt(e.target.value) || 1)))
                }
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-center text-sm font-bold font-mono text-white"
              />
              <button
                type="button"
                onClick={() => setLots((prev) => Math.min(stock.lots, prev + 1))}
                className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-xl font-bold text-white"
              >
                +
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setLots(Math.max(1, Math.floor((stock.lots * pct) / 100)))}
                  className="py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] font-bold text-slate-300 hover:text-rose-400 transition-colors"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Harga Pasar Saat Ini:</span>
              <span className="font-mono text-white">
                Rp{stock.currentPrice.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Harga Beli Rata-rata:</span>
              <span className="font-mono text-slate-300">
                Rp{stock.avgBuyPrice.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Fee Broker (0.25%):</span>
              <span className="font-mono text-slate-300">
                Rp{brokerFee.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimasi Realized P&L:</span>
              <span
                className={`font-mono font-bold ${
                  realizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {realizedPnl >= 0 ? '+' : ''}Rp{realizedPnl.toLocaleString('id-ID')} (
                {realizedPnlPct.toFixed(2)}%)
              </span>
            </div>
            <div className="h-px bg-slate-800 my-1" />
            <div className="flex justify-between text-slate-200 font-bold">
              <span>Penerimaan Bersih ke Kas:</span>
              <span className="font-mono text-sm text-emerald-400">
                Rp{netSettlement.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <button
            onClick={handleSell}
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/25 transition-all disabled:opacity-50"
          >
            {loading ? 'Mengeksekusi...' : `Konfirmasi Jual ${lots} Lot`}
          </button>
        </div>
      </div>
    </div>
  );
}
