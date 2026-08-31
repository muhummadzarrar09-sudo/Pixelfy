import { useEffect, useRef } from 'react';
import type { EditorImage } from '../state/store';
import { activeImage, useEditor } from '../state/store';

function Thumb({ img, active }: { img: EditorImage; active: boolean }) {
  const { dispatch } = useEditor();
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    const s = Math.min(1, 128 / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * s));
    const h = Math.max(1, Math.round(img.height * s));
    c.width = w; c.height = h;
    ctx.drawImage(img.bitmap, 0, 0, w, h);
  }, [img]);

  return (
    <div className={`thumb ${active ? 'active' : ''}`} title={img.name}>
      <canvas ref={ref} onClick={() => dispatch({ type: 'SELECT', id: img.id })} />
      <button className="thumb-x" title="Remove"
        onClick={(e) => { e.stopPropagation(); dispatch({ type: 'REMOVE_IMAGE', id: img.id }); }}>✕</button>
      <div className="thumb-name" onClick={() => dispatch({ type: 'SELECT', id: img.id })}>{img.name}</div>
    </div>
  );
}

export function Filmstrip() {
  const { state } = useEditor();
  const img = activeImage(state);
  if (state.images.length < 2) return null;
  return (
    <div className="filmstrip">
      {state.images.map((i) => <Thumb key={i.id} img={i} active={i.id === img?.id} />)}
    </div>
  );
}
