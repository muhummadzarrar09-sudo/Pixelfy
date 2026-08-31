import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RenderEngine } from '../engine/pipeline';
import { activeImage, useEditor, type EditorImage, type State, type Action } from '../state/store';
import { CropOverlay } from './CropOverlay';
import type { HistogramBins } from './Histogram';

interface Rect { x: number; y: number; w: number; h: number } // CSS px, top-down
type ChainResult = ReturnType<RenderEngine['renderChain']>;

const dpr = () => Math.min(window.devicePixelRatio || 1, 2);

/** view rect (CSS px) for the current result dims + zoom/pan. zoom -1 = 1 image px per CSS px. */
function computeViewRect(res: { w: number; h: number }, cssW: number, cssH: number, zoom: number | null, pan: { x: number; y: number }): Rect {
  const fit = Math.min(cssW / res.w, cssH / res.h) * 0.94;
  const scale = zoom === -1 ? 1 : fit * (zoom ?? 1);
  const w = res.w * scale, h = res.h * scale;
  return { x: (cssW - w) / 2 + pan.x, y: (cssH - h) / 2 + pan.y, w, h };
}

export function CanvasView({ onHistogram, engineRef }: {
  onHistogram?: (h: HistogramBins) => void;
  engineRef: React.MutableRefObject<RenderEngine | null>;
}) {
  const { state, dispatch } = useEditor();
  const img = activeImage(state);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [cssSize, setCssSize] = useState({ w: 1, h: 1 });
  const lastResult = useRef<ChainResult | null>(null);
  const lastImgId = useRef<string | null>(null);
  const viewRectRef = useRef<Rect | null>(null);
  const [viewRect, setViewRect] = useState<Rect | null>(null);
  const rafPending = useRef(false);
  const dirtyKind = useRef<'render' | 'present'>('render');
  const histTimer = useRef<number | null>(null);

  // live mirror of everything the rAF tick needs (avoids stale closures)
  const live = useRef<{
    img: EditorImage | undefined;
    state: State;
    cssSize: { w: number; h: number };
    dispatch: React.Dispatch<Action>;
    onHistogram?: (h: HistogramBins) => void;
  }>({ img: undefined, state, cssSize, dispatch, onHistogram });
  live.current = { img, state, cssSize, dispatch, onHistogram };

  // engine init (once)
  useEffect(() => {
    if (!canvasRef.current || engineRef.current) return;
    try {
      engineRef.current = new RenderEngine(canvasRef.current);
    } catch (e) {
      setEngineError(e instanceof Error ? e.message : String(e));
    }
  }, [engineRef]);

  const tick = useCallback(() => {
    rafPending.current = false;
    const { img: cimg, state: cs, cssSize: sz, onHistogram: onHist } = live.current;
    const engine = engineRef.current;
    if (!engine) return;

    if (!cimg) {
      lastImgId.current = null;
      lastResult.current = null;
      viewRectRef.current = null;
      setViewRect(null);
      engine.clearCanvas();
      return;
    }
    if (lastImgId.current !== cimg.id) {
      engine.setImage(cimg.bitmap, cimg.width, cimg.height);
      lastImgId.current = cimg.id;
      dirtyKind.current = 'render';
    }
    if (dirtyKind.current === 'render') {
      try {
        lastResult.current = engine.renderChain(cimg.ops, cimg.geo);
      } catch (e) {
        live.current.dispatch({ type: 'SET_STATUS', text: `Render error: ${e instanceof Error ? e.message : e}` });
        return;
      }
      if (onHist) {
        if (histTimer.current) window.clearTimeout(histTimer.current);
        histTimer.current = window.setTimeout(() => {
          if (lastResult.current && engineRef.current) {
            try { onHist(engineRef.current.histogram(lastResult.current)); } catch { /* ignore */ }
          }
        }, 250);
      }
    }
    dirtyKind.current = 'present';

    const res = lastResult.current;
    if (!res) return;
    const rect = computeViewRect(res, sz.w, sz.h, cs.zoom, cs.pan);
    const d = dpr();
    engine.present(
      res,
      { x: rect.x * d, y: rect.y * d, w: rect.w * d, h: rect.h * d },
      cs.compare ? cs.splitPos : -1,
      cs.holdBefore,
    );
    viewRectRef.current = rect;
    setViewRect(rect);
  }, [engineRef]);

  const markDirty = useCallback((kind: 'render' | 'present' = 'render') => {
    if (kind === 'render') dirtyKind.current = 'render';
    if (!rafPending.current) {
      rafPending.current = true;
      requestAnimationFrame(tick);
    }
  }, [tick]);

  // canvas sizing (DPR-aware) — markDirty is stable so [] deps are safe
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => {
      const r = wrap.getBoundingClientRect();
      setCssSize({ w: Math.max(1, r.width), h: Math.max(1, r.height) });
      const c = canvasRef.current;
      if (c) {
        c.width = Math.max(1, Math.round(r.width * dpr()));
        c.height = Math.max(1, Math.round(r.height * dpr()));
      }
      markDirty('present');
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [markDirty]);

  // render triggers
  const ops = img?.ops, geo = img?.geo, imgId = img?.id;
  useEffect(() => { markDirty('render'); }, [ops, geo, imgId, markDirty]);
  useEffect(() => { markDirty('present'); }); // every render — cheap no-op when rAF already pending
  useEffect(() => () => { if (histTimer.current) window.clearTimeout(histTimer.current); }, []);

  // ---------- pointer / zoom ----------
  const toLocal = (clientX: number, clientY: number) => {
    const r = wrapRef.current!.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  };

  const drag = useRef<{ mode: 'pan' | 'divider'; lastX: number; lastY: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!img || engineError) return;
    const p = toLocal(e.clientX, e.clientY);
    const rect = viewRectRef.current;
    if (state.compare && rect && e.button === 0) {
      const dx = rect.x + state.splitPos * rect.w;
      if (Math.abs(p.x - dx) < 10 && p.y > rect.y - 24 && p.y < rect.y + rect.h + 24) {
        drag.current = { mode: 'divider', lastX: p.x, lastY: p.y };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        return;
      }
    }
    if (state.tool === 'crop') return; // overlay handles its own interactions
    if (e.button === 0 || e.button === 1) {
      drag.current = { mode: 'pan', lastX: e.clientX, lastY: e.clientY };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !img) return;
    if (d.mode === 'pan') {
      const dx = e.clientX - d.lastX, dy = e.clientY - d.lastY;
      d.lastX = e.clientX; d.lastY = e.clientY;
      dispatch({ type: 'SET_VIEW', pan: { x: state.pan.x + dx, y: state.pan.y + dy } });
    } else {
      const rect = viewRectRef.current;
      if (!rect) return;
      const p = toLocal(e.clientX, e.clientY);
      dispatch({ type: 'SET_SPLIT', pos: Math.min(1, Math.max(0, (p.x - rect.x) / rect.w)) });
    }
  };

  const onPointerUp = () => { drag.current = null; };

  // wheel zoom anchored at cursor (non-passive to preventDefault)
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const onWheel = (e: WheelEvent) => {
      const { state: cs, cssSize: sz } = live.current;
      const res = lastResult.current;
      const rect = viewRectRef.current;
      if (!res || !rect) return;
      e.preventDefault();
      const r = wrap.getBoundingClientRect();
      const cx = e.clientX - r.left, cy = e.clientY - r.top;
      const fit = Math.min(sz.w / res.w, sz.h / res.h) * 0.94;
      const z0 = cs.zoom === -1 ? 1 / fit : (cs.zoom ?? 1);
      const z1 = Math.min(16, Math.max(0.05, z0 * Math.exp(-e.deltaY * 0.0014)));
      const ix = (cx - rect.x) / rect.w, iy = (cy - rect.y) / rect.h;
      const w1 = res.w * fit * z1, h1 = res.h * fit * z1;
      live.current.dispatch({
        type: 'SET_VIEW',
        zoom: z1,
        pan: { x: cx - ix * w1 - (sz.w - w1) / 2, y: cy - iy * h1 - (sz.h - h1) / 2 },
      });
    };
    wrap.addEventListener('wheel', onWheel, { passive: false });
    return () => wrap.removeEventListener('wheel', onWheel);
  }, []);

  const cursor = useMemo(() => {
    if (!img) return 'default';
    if (state.tool === 'crop') return 'crosshair';
    return 'grab';
  }, [img, state.tool]);

  return (
    <div
      ref={wrapRef}
      className="canvas-wrap"
      style={{ cursor }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={() => img && dispatch({ type: 'SET_VIEW', zoom: null, pan: { x: 0, y: 0 } })}
    >
      <canvas ref={canvasRef} className="gl-canvas" />
      {engineError && (
        <div className="canvas-error">
          <h3>WebGL2 unavailable</h3>
          <p>{engineError}</p>
          <p>Pixelfy Web needs WebGL2 — Chrome, Edge, or Firefox on your laptop all have it.</p>
        </div>
      )}
      {img && state.tool === 'crop' && viewRect && !engineError && (
        <CropOverlay rect={viewRect} cssSize={cssSize} />
      )}
      {state.compare && img && viewRect && (
        <div className="split-handle" style={{ left: viewRect.x + state.splitPos * viewRect.w }}>
          <div className="split-handle-knob">◂ ▸</div>
        </div>
      )}
    </div>
  );
}
