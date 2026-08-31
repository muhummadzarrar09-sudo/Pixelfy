import { useEffect, useRef } from 'react';

export interface HistogramBins { r: Uint32Array; g: Uint32Array; b: Uint32Array; l: Uint32Array }

/** RGB + luma histogram drawn on a small 2D canvas. */
export function Histogram({ bins }: { bins: HistogramBins | null }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    if (!bins) return;
    const BINS = bins.l.length;
    let max = 1;
    for (let i = 1; i < BINS - 1; i++) max = Math.max(max, bins.r[i], bins.g[i], bins.b[i]);
    const draw = (arr: Uint32Array, color: string) => {
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < BINS; i++) {
        const x = (i / (BINS - 1)) * W;
        const y = H - Math.pow(arr[i] / max, 0.5) * (H - 4);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };
    draw(bins.r, 'rgba(255,80,80,0.75)');
    draw(bins.g, 'rgba(80,255,150,0.6)');
    draw(bins.b, 'rgba(90,140,255,0.75)');
    ctx.globalCompositeOperation = 'source-over';
    // luma line follows theme text colour
    const dim = getComputedStyle(document.documentElement).getPropertyValue('--text-dim').trim();
    ctx.strokeStyle = dim || 'rgba(160,160,160,0.5)';
    ctx.beginPath();
    for (let i = 0; i < BINS; i++) {
      const x = (i / (BINS - 1)) * W;
      const y = H - Math.pow(bins.l[i] / max, 0.5) * (H - 4);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.globalAlpha = 0.55;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }, [bins]);

  return (
    <div className="histogram" title="Live histogram of the edited image">
      <canvas ref={ref} width={260} height={72} />
    </div>
  );
}
