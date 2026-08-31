import { useCallback, useRef } from 'react';
import { activeImage, useEditor } from '../state/store';

interface Rect { x: number; y: number; w: number; h: number }

type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move' | 'new';

/** Interactive crop rectangle drawn over the image rect (display-space fractions). */
export function CropOverlay({ rect, cssSize }: { rect: Rect; cssSize: { w: number; h: number } }) {
  const { state, dispatch } = useEditor();
  const img = activeImage(state);
  const dragRef = useRef<{ handle: Handle; startFx: number; startFy: number; orig: Rect; px0: number; py0: number } | null>(null);

  const imgAspect = rect.w / rect.h;
  const crop = img?.geo.crop ?? { x: 0, y: 0, w: 1, h: 1 };
  const aspect = state.cropAspect; // null = free

  const toFrac = useCallback((clientX: number, clientY: number, host: HTMLElement) => {
    const r = host.getBoundingClientRect();
    return {
      fx: (clientX - r.left - rect.x) / rect.w,
      fy: (clientY - r.top - rect.y) / rect.h,
    };
  }, [rect]);

  const beginDrag = (handle: Handle) => (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!img) return;
    const host = (e.currentTarget as HTMLElement).closest('.crop-root') as HTMLElement;
    const { fx, fy } = toFrac(e.clientX, e.clientY, host);
    dispatch({ type: 'BEGIN_EDIT' });
    if (handle === 'new') {
      const c = { x: clamp01(fx), y: clamp01(fy), w: 0.02, h: 0.02 };
      dispatch({ type: 'PATCH_CROP', crop: c });
      dragRef.current = { handle: 'se', startFx: fx, startFy: fy, orig: { ...c }, px0: e.clientX, py0: e.clientY };
    } else {
      dragRef.current = { handle, startFx: fx, startFy: fy, orig: { x: crop.x, y: crop.y, w: crop.w, h: crop.h }, px0: e.clientX, py0: e.clientY };
    }
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || !img) return;
    const host = (e.currentTarget as HTMLElement).closest('.crop-root') as HTMLElement;
    const { fx, fy } = toFrac(e.clientX, e.clientY, host);
    let dx = fx - d.startFx;
    let dy = fy - d.startFy;
    let { x, y, w, h } = { x: d.orig.x, y: d.orig.y, w: Math.max(d.orig.w, 0.001), h: Math.max(d.orig.h, 0.001) };
    const MIN = 0.02;

    if (d.handle === 'move') {
      x = clamp(d.orig.x + dx, 0, 1 - w);
      y = clamp(d.orig.y + dy, 0, 1 - h);
    } else {
      if (d.handle.includes('e')) w = d.orig.w + dx;
      if (d.handle.includes('s')) h = d.orig.h + dy;
      if (d.handle.includes('w')) { x = d.orig.x + dx; w = d.orig.w - dx; }
      if (d.handle.includes('n')) { y = d.orig.y + dy; h = d.orig.h - dy; }
      // aspect lock (image-space): h = w / aspect (fractions are relative to img w/h → convert)
      if (aspect) {
        const wantH = (w / aspect) * imgAspect;
        if (d.handle === 'e' || d.handle === 'w') h = wantH;
        else w = (h * aspect) / imgAspect;
      }
      if (w < MIN) { x = d.handle.includes('w') ? d.orig.x + d.orig.w - MIN : x; w = MIN; }
      if (h < MIN) { y = d.handle.includes('n') ? d.orig.y + d.orig.h - MIN : y; h = MIN; }
      // clamp inside
      x = clamp(x, 0, 1 - MIN); y = clamp(y, 0, 1 - MIN);
      w = clamp(w, MIN, 1 - x); h = clamp(h, MIN, 1 - y);
    }
    dispatch({ type: 'PATCH_CROP', crop: { x: round4(x), y: round4(y), w: round4(w), h: round4(h) } });
  };

  const endDrag = () => { dragRef.current = null; dispatch({ type: 'COMMIT_CROP' }); };

  if (!img) return null;

  const bx = rect.x + crop.x * rect.w;
  const by = rect.y + crop.y * rect.h;
  const bw = crop.w * rect.w;
  const bh = crop.h * rect.h;

  const handles: Handle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
  const handlePos = (h: Handle): React.CSSProperties => {
    const cx = h.includes('w') ? bx : h.includes('e') ? bx + bw : bx + bw / 2;
    const cy = h.includes('n') ? by : h.includes('s') ? by + bh : by + bh / 2;
    return { left: cx - 7, top: cy - 7 };
  };

  return (
    <div className="crop-root" style={{ width: cssSize.w, height: cssSize.h }} onPointerDown={beginDrag('new')} onPointerMove={onMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
      {/* dimmed surroundings */}
      <div className="crop-dim" style={{ left: 0, top: 0, width: cssSize.w, height: by }} />
      <div className="crop-dim" style={{ left: 0, top: by + bh, width: cssSize.w, height: cssSize.h - by - bh }} />
      <div className="crop-dim" style={{ left: 0, top: by, width: bx, height: bh }} />
      <div className="crop-dim" style={{ left: bx + bw, top: by, width: cssSize.w - bx - bw, height: bh }} />
      {/* the box */}
      <div className="crop-box" style={{ left: bx, top: by, width: bw, height: bh }} onPointerDown={beginDrag('move')}>
        <div className="crop-grid" />
      </div>
      {handles.map((h) => (
        <div key={h} className={`crop-handle ch-${h}`} style={handlePos(h)} onPointerDown={beginDrag(h)} />
      ))}
      <div className="crop-hint" style={{ left: bx, top: Math.max(4, by - 34) }}>
        {Math.max(1, Math.round(crop.w * rect.w * 100) / 100)}× — drag corners · Esc to finish
      </div>
    </div>
  );
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const clamp01 = (v: number) => clamp(v, 0, 1);
const round4 = (v: number) => Math.round(v * 10000) / 10000;
