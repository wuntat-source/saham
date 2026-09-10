'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  X,
  BarChart2,
  Zap,
  Flame,
} from 'lucide-react';
import { STOCKS } from '@/lib/constants';

interface StockSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_TICKERS = ['BBCA', 'BBRI', 'BMRI', 'TLKM', 'ASII', 'GOTO', 'AMMN', 'ADRO', 'ICBP', 'ANTM'];

const SECTOR_CATEGORIES = [
  { id: 'all', label: 'Semua' },
  { id: 'Financials', label: '🏦 Perbankan' },
  { id: 'Energy', label: '⚡ Energi' },
  { id: 'Consumer Non-Cyclicals', label: '🛒 Consumer' },
  { id: 'Basic Materials', label: '⛏️ Bahan Baku' },
  { id: 'Technology', label: '💻 Teknologi' },
  { id: 'Healthcare', label: '🏥 Kesehatan' },
  { id: 'Infrastructure', label: '📡 Infrastruktur' },
];

export default function StockSearchModal({ isOpen, onClose }: StockSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto focus on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedSector('all');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter stocks based on query & sector
  const filteredStocks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STOCKS.filter((stock) => {
      const matchesQuery =
        !q ||
        stock.ticker.toLowerCase().includes(q) ||
        stock.name.toLowerCase().includes(q) ||
        stock.sector.toLowerCase().includes(q) ||
        stock.description.toLowerCase().includes(q);

      const matchesSector =
        selectedSector === 'all' ||
        stock.sector.toLowerCase().includes(selectedSector.toLowerCase());

      return matchesQuery && matchesSector;
    });
  }, [query, selectedSector]);

  // Handle keyboard navigation inside list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredStocks.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredStocks.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredStocks[selectedIndex];
      if (selected) {
        onClose();
        router.push(`/stock/${selected.ticker}`);
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari kode saham, nama emiten, atau sektor (e.g. BBCA, Telkom, Tambang)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-slate-200/70 hover:bg-slate-200 rounded-lg transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Sector Quick Filters */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white">
          {SECTOR_CATEGORIES.map((sec) => (
            <button
              key={sec.id}
              onClick={() => {
                setSelectedSector(sec.id);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSector === sec.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Popular Tags when query is empty */}
        {!query && selectedSector === 'all' && (
          <div className="px-5 py-3 bg-slate-50/60 border-b border-slate-100 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Populer:
            </span>
            {POPULAR_TICKERS.map((ticker) => (
              <button
                key={ticker}
                onClick={() => setQuery(ticker)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 font-mono font-bold transition-all text-xs shadow-2xs"
              >
                {ticker}
              </button>
            ))}
          </div>
        )}

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {filteredStocks.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Tidak ada saham ditemukan</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Coba gunakan kata kunci lain seperti kode ticker (misal: <span className="font-mono font-bold text-emerald-600">BBCA</span>, <span className="font-mono font-bold text-emerald-600">TLKM</span>), atau nama sektor.
              </p>
            </div>
          ) : (
            filteredStocks.map((stock, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={stock.ticker}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`group relative p-3 sm:p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  {/* Left: Ticker & Name */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-mono font-black text-xs sm:text-sm shrink-0 shadow-xs group-hover:bg-emerald-600 transition-colors">
                      {stock.ticker.slice(0, 4)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 text-sm sm:text-base">
                          {stock.ticker}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {stock.sector}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 truncate mt-0.5">
                        {stock.name}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 hidden sm:block">
                        {stock.description}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Valuation / Price */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div>
                      <div className="text-xs sm:text-sm font-black font-mono text-slate-900">
                        Rp{stock.basePrice.toLocaleString('id-ID')}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        PER: <span className="font-semibold text-slate-700">{stock.peRatio}x</span> | Cap: <span className="font-semibold text-slate-700">{stock.marketCap}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/stock/${stock.ticker}`}
                        onClick={onClose}
                        className="p-2 sm:px-3 sm:py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                        title="Buka Chart & Analisis"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Chart</span>
                      </Link>
                      <Link
                        href={`/trade/${stock.ticker}`}
                        onClick={onClose}
                        className="p-2 sm:px-3 sm:py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                        title="Eksekusi Trade"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">Beli/Jual</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono shadow-2xs">↑↓</kbd> Navigasi
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono shadow-2xs">Enter</kbd> Pilih
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono shadow-2xs">Esc</kbd> Tutup
            </span>
          </div>
          <div>
            Total <span className="font-bold text-slate-800">{filteredStocks.length}</span> Saham IDX
          </div>
        </div>
      </div>
    </div>
  );
}
