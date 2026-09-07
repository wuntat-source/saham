'use client';

import React, { useState } from 'react';
import { ChartTheme, ToolType } from './types';
import {
  MousePointer2,
  TrendingUp,
  Minus,
  GitFork,
  Square,
  Brush,
  Type,
  Ruler,
  Trash2,
  RotateCcw,
  Eye,
  EyeOff,
} from 'lucide-react';

interface ChartDrawingToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
  lineWidth: number;
  setLineWidth: (width: number) => void;
  onUndo: () => void;
  onClearAll: () => void;
  onDeleteSelected: () => void;
  selectedId: string | null;
  drawingsCount: number;
  hideDrawings: boolean;
  setHideDrawings: (hide: boolean) => void;
  theme: ChartTheme;
}

const TOOLS: { type: ToolType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'cursor', label: 'Crosshair / Kursor (Pilih & Geser)', icon: MousePointer2 },
  { type: 'trendline', label: 'Garis Tren / Trendline (Tarik 2 Titik)', icon: TrendingUp },
  { type: 'horizontal', label: 'Garis Horizontal (Support & Resistance)', icon: Minus },
  { type: 'fibonacci', label: 'Fibonacci Retracement (Rasio Koreksi)', icon: GitFork },
  { type: 'rectangle', label: 'Kotak Zona / Order Block (Supply & Demand)', icon: Square },
  { type: 'brush', label: 'Kuas Coretan Bebas / Brush Pen', icon: Brush },
  { type: 'text', label: 'Teks Anotasi / Catatan Analisis', icon: Type },
  { type: 'measure', label: 'Penggaris Ukur / Measure (ΔHarga & %)', icon: Ruler },
];

const COLORS = [
  { name: 'Emerald', hex: '#059669' },
  { name: 'Cyan', hex: '#0284c7' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Rose', hex: '#e11d48' },
  { name: 'Purple', hex: '#7c3aed' },
  { name: 'Dark', hex: '#0f172a' },
];

export default function ChartDrawingToolbar({
  activeTool,
  setActiveTool,
  currentColor,
  setCurrentColor,
  lineWidth,
  setLineWidth,
  onUndo,
  onClearAll,
  onDeleteSelected,
  selectedId,
  drawingsCount,
  hideDrawings,
  setHideDrawings,
  theme,
}: ChartDrawingToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const isLight = theme === 'light';

  return (
    <div
      className={`flex flex-col items-center p-1.5 gap-1.5 z-20 select-none border-r transition-colors ${
        isLight
          ? 'bg-slate-50/95 border-slate-200 text-slate-700'
          : 'bg-slate-950/90 border-slate-800 text-slate-300'
      }`}
    >
      {/* Tool Buttons */}
      <div className="flex flex-col gap-1">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.type;
          return (
            <button
              key={tool.type}
              onClick={() => setActiveTool(tool.type)}
              title={tool.label}
              className={`p-2 rounded-xl text-xs transition-all relative group ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105 font-bold'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />

              {/* Tooltip */}
              <span
                className={`absolute left-full ml-2 px-2.5 py-1 text-[11px] rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-800'
                    : 'bg-slate-900 border-slate-700 text-white'
                }`}
              >
                {tool.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className={`w-5 h-[1px] my-1 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />

      {/* Color & Style Controls */}
      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          title="Ubah Warna & Ketebalan Garis"
          className={`p-2 rounded-xl transition-colors relative ${
            isLight ? 'hover:bg-slate-200/80' : 'hover:bg-slate-800'
          }`}
        >
          <div
            className="w-4 h-4 rounded-full border border-slate-400/60 shadow-inner"
            style={{ backgroundColor: currentColor }}
          />
        </button>

        {showColorPicker && (
          <div
            className={`absolute left-full top-0 ml-2 p-3 rounded-2xl shadow-2xl z-50 flex flex-col gap-2.5 w-48 border ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-white'
            }`}
          >
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Pilihan Warna
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => {
                    setCurrentColor(c.hex);
                    setShowColorPicker(false);
                  }}
                  className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-[10px] font-medium transition-all ${
                    currentColor === c.hex
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 font-bold'
                      : isLight
                      ? 'border-transparent text-slate-600 hover:bg-slate-100'
                      : 'border-transparent text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-slate-300"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>

            <div className={`w-full h-[1px] my-0.5 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />

            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Ketebalan Garis
            </span>
            <div className="flex gap-1">
              {[1, 2, 3].map((w) => (
                <button
                  key={w}
                  onClick={() => setLineWidth(w)}
                  className={`flex-1 py-1 rounded-md text-[10px] font-bold border transition-all ${
                    lineWidth === w
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : isLight
                      ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                      : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {w}px
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <button
        onClick={onUndo}
        disabled={drawingsCount === 0}
        title="Undo Terakhir (Ctrl+Z)"
        className={`p-2 rounded-xl disabled:opacity-30 disabled:pointer-events-none transition-colors ${
          isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
        }`}
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      <button
        onClick={() => setHideDrawings(!hideDrawings)}
        title={hideDrawings ? 'Tampilkan Semua Gambar' : 'Sembunyikan Gambar'}
        className={`p-2 rounded-xl transition-colors ${
          hideDrawings
            ? 'text-amber-600 bg-amber-500/20'
            : isLight
            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
        }`}
      >
        {hideDrawings ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>

      {selectedId && (
        <button
          onClick={onDeleteSelected}
          title="Hapus Gambar Terpilih (Delete / Backspace)"
          className="p-2 rounded-xl text-rose-600 bg-rose-500/15 hover:bg-rose-500/25 transition-colors animate-pulse"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {drawingsCount > 0 && !selectedId && (
        <button
          onClick={onClearAll}
          title={`Hapus Semua Coretan (${drawingsCount})`}
          className={`p-2 rounded-xl transition-colors ${
            isLight
              ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
              : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
          }`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
