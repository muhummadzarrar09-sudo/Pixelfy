import { useEffect, useRef, useState } from 'react';
import { THEMES } from '../engine/themes';
import { activeImage, useEditor } from '../state/store';

function ThemePicker() {
  const { state, dispatch } = useEditor();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [open]);

  return (
    <div className="theme-picker" ref={ref}>
      <button className="btn ghost" onClick={() => setOpen(!open)} title="Change theme">🎨</button>
      {open && (
        <div className="theme-pop">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`theme-item ${state.theme === t.id ? 'on' : ''}`}
              onClick={() => { dispatch({ type: 'SET_THEME', theme: t.id }); setOpen(false); }}
            >
              <span className="theme-dots">
                {t.swatch.map((c) => <i key={c} style={{ background: c }} />)}
              </span>
              <span className="theme-meta">
                <b>{t.name}</b>
                <small>{t.blurb}</small>
              </span>
              {state.theme === t.id && <span className="theme-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TopBar({ onOpen }: { onOpen: () => void }) {
  const { state, dispatch } = useEditor();
  const img = activeImage(state);

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">▙</span>
        <span className="brand-name">Pixelfy</span>
        <span className="brand-tag">web studio</span>
      </div>

      <div className="topbar-actions">
        <button className="btn ghost" onClick={onOpen} title="Open photos (drag & drop works too)">⤒ Open</button>
      </div>

      <div className="topbar-center">
        {img && (
          <>
            <button className="btn ghost" disabled={state.past.length === 0} onClick={() => dispatch({ type: 'UNDO' })} title="Undo (Ctrl+Z)">↶</button>
            <button className="btn ghost" disabled={state.future.length === 0} onClick={() => dispatch({ type: 'REDO' })} title="Redo (Ctrl+Shift+Z)">↷</button>
            <span className="sep" />
            <button
              className={`btn ${state.compare ? 'accent' : 'ghost'}`}
              onClick={() => dispatch({ type: 'SET_COMPARE', on: !state.compare })}
              title="Before/after split (\)"
            >◩ Compare</button>
            <button
              className={`btn ${state.holdBefore ? 'accent' : 'ghost'}`}
              onPointerDown={() => dispatch({ type: 'SET_HOLD', on: true })}
              onPointerUp={() => dispatch({ type: 'SET_HOLD', on: false })}
              onPointerLeave={() => dispatch({ type: 'SET_HOLD', on: false })}
              title="Hold to see original (or hold B)"
            >👁 Before</button>
            <span className="sep" />
            <button className={`btn ghost ${state.zoom === null ? 'disabled-look' : ''}`} title="Fit to window (double-click canvas)"
              onClick={() => dispatch({ type: 'SET_VIEW', zoom: null, pan: { x: 0, y: 0 } })}>⤢ Fit</button>
            <button className="btn ghost" title="100% zoom"
              onClick={() => dispatch({ type: 'SET_VIEW', zoom: -1 })}>1:1</button>
          </>
        )}
      </div>

      <div className="topbar-right">
        <ThemePicker />
        <button className="btn accent" disabled={!img} onClick={() => dispatch({ type: 'SET_EXPORT_OPEN', open: true })} title="Export (Ctrl+E)">
          ⭳ Export
        </button>
      </div>
    </header>
  );
}
