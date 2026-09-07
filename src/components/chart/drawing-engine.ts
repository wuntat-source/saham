import { ChartBounds, ChartPoint, DrawingElement } from './types';

// Convert Data Coordinate (index, price) to Screen Coordinate (x, y)
export function dataToScreen(
  point: ChartPoint,
  bounds: ChartBounds
): { x: number; y: number } {
  const stepX = bounds.chartWidth / Math.max(1, bounds.candleCount);
  const x = bounds.paddingLeft + point.index * stepX + stepX / 2;
  const priceRange = bounds.maxPrice - bounds.minPrice || 1;
  const y = bounds.paddingTop + ((bounds.maxPrice - point.price) / priceRange) * bounds.chartHeight;
  return { x, y };
}

// Convert Screen Coordinate (x, y) to Data Coordinate (index, price)
export function screenToData(
  x: number,
  y: number,
  bounds: ChartBounds,
  times: string[]
): ChartPoint {
  const stepX = bounds.chartWidth / Math.max(1, bounds.candleCount);
  const rawIndex = Math.floor((x - bounds.paddingLeft) / stepX);
  const index = Math.max(0, Math.min(bounds.candleCount - 1, rawIndex));
  const time = times[index] || '';

  const priceRange = bounds.maxPrice - bounds.minPrice || 1;
  const clampedY = Math.max(bounds.paddingTop, Math.min(bounds.paddingTop + bounds.chartHeight, y));
  const price = bounds.maxPrice - ((clampedY - bounds.paddingTop) / bounds.chartHeight) * priceRange;

  return { index, time, price: Math.round(price) };
}

// Render all drawing elements onto canvas
export function renderDrawings(
  ctx: CanvasRenderingContext2D,
  drawings: DrawingElement[],
  bounds: ChartBounds,
  selectedId: string | null = null,
  activePreview: DrawingElement | null = null
) {
  const allDrawings = activePreview ? [...drawings, activePreview] : drawings;

  allDrawings.forEach((elem) => {
    const isSelected = elem.id === selectedId;
    ctx.save();
    ctx.strokeStyle = elem.color;
    ctx.fillStyle = elem.color;
    ctx.lineWidth = isSelected ? elem.lineWidth + 1 : elem.lineWidth;

    switch (elem.type) {
      case 'trendline':
        renderTrendline(ctx, elem, bounds, isSelected);
        break;
      case 'horizontal':
        renderHorizontalLine(ctx, elem, bounds, isSelected);
        break;
      case 'fibonacci':
        renderFibonacci(ctx, elem, bounds, isSelected);
        break;
      case 'rectangle':
        renderRectangle(ctx, elem, bounds, isSelected);
        break;
      case 'brush':
        renderBrush(ctx, elem, bounds, isSelected);
        break;
      case 'text':
        renderText(ctx, elem, bounds, isSelected);
        break;
      case 'measure':
        renderMeasure(ctx, elem, bounds, isSelected);
        break;
    }

    ctx.restore();
  });
}

function renderTrendline(
  ctx: CanvasRenderingContext2D,
  elem: DrawingElement,
  bounds: ChartBounds,
  isSelected: boolean
) {
  if (elem.points.length < 2) return;
  const p1 = dataToScreen(elem.points[0], bounds);
  const p2 = dataToScreen(elem.points[1], bounds);
  const isLight = bounds.theme === 'light';

  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  // Anchors
  [p1, p2].forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, isSelected ? 5 : 3.5, 0, Math.PI * 2);
    ctx.fillStyle = elem.color;
    ctx.fill();
    ctx.strokeStyle = isLight ? '#0f172a' : '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // Calculate angle / return percentage label
  const diffPrice = elem.points[1].price - elem.points[0].price;
  const pct = ((diffPrice / elem.points[0].price) * 100).toFixed(1);
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;

  ctx.font = 'bold 9px monospace';
  ctx.fillStyle = isLight ? '#ffffff' : '#0f172a';
  ctx.fillRect(midX - 25, midY - 14, 50, 14);
  ctx.strokeStyle = elem.color;
  ctx.lineWidth = 1;
  ctx.strokeRect(midX - 25, midY - 14, 50, 14);
  ctx.fillStyle = Number(pct) >= 0 ? '#059669' : '#e11d48';
  ctx.textAlign = 'center';
  ctx.fillText(`${Number(pct) >= 0 ? '+' : ''}${pct}%`, midX, midY - 4);
}

function renderHorizontalLine(
  ctx: CanvasRenderingContext2D,
  elem: DrawingElement,
  bounds: ChartBounds,
  isSelected: boolean
) {
  if (elem.points.length < 1) return;
  const p = dataToScreen(elem.points[0], bounds);
  const isLight = bounds.theme === 'light';

  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(bounds.paddingLeft, p.y);
  ctx.lineTo(bounds.paddingLeft + bounds.chartWidth, p.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Price Badge on Right Axis
  const badgeX = bounds.paddingLeft + bounds.chartWidth + 2;
  const badgeWidth = 58;
  const badgeHeight = 16;
  ctx.fillStyle = elem.color;
  ctx.fillRect(badgeX, p.y - badgeHeight / 2, badgeWidth, badgeHeight);
  ctx.fillStyle = isLight ? '#ffffff' : '#0f172a';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`Rp${elem.points[0].price.toLocaleString('id-ID')}`, badgeX + 3, p.y + 3.5);
}

function renderFibonacci(
  ctx: CanvasRenderingContext2D,
  elem: DrawingElement,
  bounds: ChartBounds,
  isSelected: boolean
) {
  if (elem.points.length < 2) return;
  const p1 = dataToScreen(elem.points[0], bounds);
  const p2 = dataToScreen(elem.points[1], bounds);
  const isLight = bounds.theme === 'light';

  const price1 = elem.points[0].price;
  const price2 = elem.points[1].price;
  const diffPrice = price2 - price1;

  const levels = [
    { ratio: 0, label: '0.0%', color: isLight ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.12)' },
    { ratio: 0.236, label: '23.6%', color: isLight ? 'rgba(239, 68, 68, 0.18)' : 'rgba(239, 68, 68, 0.15)' },
    { ratio: 0.382, label: '38.2%', color: isLight ? 'rgba(249, 115, 22, 0.18)' : 'rgba(249, 115, 22, 0.15)' },
    { ratio: 0.5, label: '50.0%', color: isLight ? 'rgba(234, 179, 8, 0.18)' : 'rgba(234, 179, 8, 0.15)' },
    { ratio: 0.618, label: '61.8% (Golden)', color: isLight ? 'rgba(16, 185, 129, 0.22)' : 'rgba(16, 185, 129, 0.2)' },
    { ratio: 0.786, label: '78.6%', color: isLight ? 'rgba(6, 182, 212, 0.18)' : 'rgba(6, 182, 212, 0.15)' },
    { ratio: 1.0, label: '100.0%', color: isLight ? 'rgba(168, 85, 247, 0.18)' : 'rgba(168, 85, 247, 0.15)' },
  ];

  const minX = Math.min(p1.x, p2.x);
  const maxX = Math.max(p1.x, p2.x);
  const spanWidth = Math.max(80, maxX - minX);

  levels.forEach((lvl, i) => {
    const lvlPrice = price1 + diffPrice * lvl.ratio;
    const lvlY = dataToScreen({ index: 0, time: '', price: lvlPrice }, bounds).y;

    // Line
    ctx.strokeStyle = elem.color;
    ctx.lineWidth = lvl.ratio === 0.618 ? 2 : 1;
    ctx.setLineDash(lvl.ratio === 0.618 ? [] : [3, 2]);
    ctx.beginPath();
    ctx.moveTo(minX, lvlY);
    ctx.lineTo(minX + spanWidth, lvlY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Fill between levels
    if (i < levels.length - 1) {
      const nextPrice = price1 + diffPrice * levels[i + 1].ratio;
      const nextY = dataToScreen({ index: 0, time: '', price: nextPrice }, bounds).y;
      ctx.fillStyle = lvl.color;
      ctx.fillRect(minX, Math.min(lvlY, nextY), spanWidth, Math.abs(nextY - lvlY));
    }

    // Label
    ctx.font = 'bold 8.5px monospace';
    ctx.fillStyle = isLight ? '#1e293b' : '#f8fafc';
    ctx.textAlign = 'left';
    ctx.fillText(`${lvl.label} - Rp${Math.round(lvlPrice).toLocaleString('id-ID')}`, minX + 4, lvlY - 3);
  });
}

function renderRectangle(
  ctx: CanvasRenderingContext2D,
  elem: DrawingElement,
  bounds: ChartBounds,
  isSelected: boolean
) {
  if (elem.points.length < 2) return;
  const p1 = dataToScreen(elem.points[0], bounds);
  const p2 = dataToScreen(elem.points[1], bounds);
  const isLight = bounds.theme === 'light';

  const x = Math.min(p1.x, p2.x);
  const y = Math.min(p1.y, p2.y);
  const w = Math.abs(p2.x - p1.x);
  const h = Math.abs(p2.y - p1.y);

  // Background box fill
  ctx.fillStyle = hexToRgba(elem.color, isLight ? 0.20 : 0.15);
  ctx.fillRect(x, y, w, h);

  // Border
  ctx.strokeStyle = elem.color;
  ctx.lineWidth = isSelected ? elem.lineWidth + 1 : elem.lineWidth;
  ctx.strokeRect(x, y, w, h);

  // Top price & Bottom price tag
  const highPrice = Math.max(elem.points[0].price, elem.points[1].price);
  const lowPrice = Math.min(elem.points[0].price, elem.points[1].price);
  ctx.font = 'bold 8.5px monospace';
  ctx.fillStyle = isLight ? '#475569' : '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText(`Zone: Rp${lowPrice.toLocaleString('id-ID')} - Rp${highPrice.toLocaleString('id-ID')}`, x + 4, y + 10);
}

function renderBrush(
  ctx: CanvasRenderingContext2D,
  elem: DrawingElement,
  bounds: ChartBounds,
  isSelected: boolean
) {
  if (elem.points.length < 2) return;

  ctx.beginPath();
  const start = dataToScreen(elem.points[0], bounds);
  ctx.moveTo(start.x, start.y);

  for (let i = 1; i < elem.points.length; i++) {
    const pt = dataToScreen(elem.points[i], bounds);
    ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();
}

function renderText(
  ctx: CanvasRenderingContext2D,
  elem: DrawingElement,
  bounds: ChartBounds,
  isSelected: boolean
) {
  if (elem.points.length < 1 || !elem.text) return;
  const p = dataToScreen(elem.points[0], bounds);
  const isLight = bounds.theme === 'light';

  ctx.font = 'bold 11px sans-serif';
  const textWidth = ctx.measureText(elem.text).width;
  const pad = 6;

  // Badge background
  ctx.fillStyle = isLight ? '#ffffff' : '#0f172a';
  ctx.fillRect(p.x, p.y - 18, textWidth + pad * 2, 22);
  ctx.strokeStyle = elem.color;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(p.x, p.y - 18, textWidth + pad * 2, 22);

  // Text
  ctx.fillStyle = elem.color;
  ctx.textAlign = 'left';
  ctx.fillText(elem.text, p.x + pad, p.y - 3);
}

function renderMeasure(
  ctx: CanvasRenderingContext2D,
  elem: DrawingElement,
  bounds: ChartBounds,
  isSelected: boolean
) {
  if (elem.points.length < 2) return;
  const p1 = dataToScreen(elem.points[0], bounds);
  const p2 = dataToScreen(elem.points[1], bounds);
  const isLight = bounds.theme === 'light';

  const x = Math.min(p1.x, p2.x);
  const y = Math.min(p1.y, p2.y);
  const w = Math.abs(p2.x - p1.x);
  const h = Math.abs(p2.y - p1.y);

  const diffPrice = elem.points[1].price - elem.points[0].price;
  const pct = ((diffPrice / elem.points[0].price) * 100).toFixed(2);
  const bars = Math.abs(elem.points[1].index - elem.points[0].index) + 1;

  // Shaded area
  ctx.fillStyle = Number(pct) >= 0
    ? (isLight ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.12)')
    : (isLight ? 'rgba(244, 63, 94, 0.18)' : 'rgba(244, 63, 94, 0.12)');
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = Number(pct) >= 0 ? '#059669' : '#e11d48';
  ctx.setLineDash([3, 2]);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);

  // Arrow / Indicator Line
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  // Floating summary badge
  const badgeX = x + w / 2;
  const badgeY = y + h / 2;
  const badgeW = 126;
  const badgeH = 34;

  ctx.fillStyle = isLight ? '#ffffff' : '#0f172a';
  ctx.fillRect(badgeX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH);
  ctx.strokeStyle = Number(pct) >= 0 ? '#059669' : '#e11d48';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(badgeX - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH);

  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = Number(pct) >= 0 ? '#059669' : '#e11d48';
  ctx.textAlign = 'center';
  ctx.fillText(`${Number(pct) >= 0 ? '+' : ''}${pct}% (${diffPrice >= 0 ? '+' : ''}Rp${diffPrice.toLocaleString('id-ID')})`, badgeX, badgeY - 3);

  ctx.font = '9px sans-serif';
  ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
  ctx.fillText(`${bars} Bar / Candle`, badgeX, badgeY + 11);
}

function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('');
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
