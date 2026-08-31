import { useMemo, useState } from 'react';
import { GROUPS, OPS, isNeutral, type OpDef } from '../engine/ops';
import { DEFAULT_GEO } from '../engine/pipeline';
import { activeImage, useEditor } from '../state/store';
import type { HistogramBins } from './Histogram';
import { Histogram } from './Histogram';
import { Slider } from './Slider';

function OpRow({ op }: { op: OpDef }) {
  const { state, dispatch } = useEditor();
  const img = activeImage(state)!;
  const st = img.ops[op.id];
  const neutral = op.params.length === 0 ? !st.enabled : isNeutral(op, st.values);
  const activeOn = st.enabled && !neutral;

  return (
    <div className={`op-row ${activeOn ? 'op-active' : ''}`} data-enabled={st.enabled || undefined}>
      <div className="op-head">
        <button
          className={`op-toggle ${st.enabled ? 'on' : ''}`}
          title={st.enabled ? 'Disable' : 'Enable'}
          onClick={() => dispatch({ type: 'TOGGLE_OP', opId: op.id })}
        />
        <span className="op-name" title={op.hint ?? op.name} onDoubleClick={() => dispatch({ type: 'RESET_OP', opId: op.id })}>
          {op.name}
        </span>
        {(!neutral || st.enabled) && (
          <button className="op-reset" title="Reset this edit" onClick={() => dispatch({ type: 'RESET_OP', opId: op.id })}>⟲</button>
        )}
      </div>
      {st.enabled && op.params.map((p) => (
        <Slider key={p.key} opId={op.id} param={p} value={st.values[p.key] ?? p.def} />
      ))}
    </div>
  );
}

function GroupPanel({ id, label }: { id: string; label: string }) {
  const [open, setOpen] = useState(id === 'light');
  const ops = OPS.filter((o) => o.group === id);
  return (
    <section className={`panel ${open ? 'open' : ''}`}>
      <header className="panel-head" onClick={() => setOpen(!open)}>
        <span className="panel-caret">{open ? '▾' : '▸'}</span>
        <span>{label}</span>
      </header>
      {open && ops.map((o) => <OpRow key={o.id} op={o} />)}
    </section>
  );
}

function GeometryPanel() {
  const { state, dispatch } = useEditor();
  const img = activeImage(state)!;
  const geo = img.geo;
  const cropped = !(geo.crop.x === 0 && geo.crop.y === 0 && geo.crop.w === 1 && geo.crop.h === 1);
  const [open, setOpen] = useState(false);

  return (
    <section className={`panel ${open ? 'open' : ''}`}>
      <header className="panel-head" onClick={() => setOpen(!open)}>
        <span className="panel-caret">{open ? '▾' : '▸'}</span>
        <span>Crop &amp; Rotate</span>
      </header>
      {open && (
        <div className="geo-body">
          <div className="geo-row">
            <button className="btn ghost" onClick={() => dispatch({ type: 'SET_GEO', geo: { rot: ((geo.rot + 3) % 4) as 0 | 1 | 2 | 3 } })} title="Rotate left">⟲ 90°</button>
            <button className="btn ghost" onClick={() => dispatch({ type: 'SET_GEO', geo: { rot: ((geo.rot + 1) % 4) as 0 | 1 | 2 | 3 } })} title="Rotate right">⟳ 90°</button>
            <button className="btn ghost" onClick={() => dispatch({ type: 'SET_GEO', geo: { flipH: !geo.flipH } })} title="Flip horizontal">⇋ H</button>
            <button className="btn ghost" onClick={() => dispatch({ type: 'SET_GEO', geo: { flipV: !geo.flipV } })} title="Flip vertical">⇵ V</button>
          </div>
          <div className="geo-row">
            <button
              className={`btn ${state.tool === 'crop' ? 'accent' : 'ghost'}`}
              onClick={() => dispatch({ type: 'SET_TOOL', tool: state.tool === 'crop' ? 'adjust' : 'crop' })}
            >
              ✂ Crop…
            </button>
            {cropped && (
              <button className="btn ghost" onClick={() => dispatch({ type: 'SET_GEO', geo: { crop: { ...DEFAULT_GEO.crop } } })}>
                Reset crop
              </button>
            )}
          </div>
          <div className="geo-row aspect-row">
            <span className="geo-label">Aspect</span>
            {[
              { l: 'Free', v: null }, { l: '1:1', v: 1 }, { l: '3:2', v: 3 / 2 }, { l: '4:3', v: 4 / 3 },
              { l: '16:9', v: 16 / 9 }, { l: '9:16', v: 9 / 16 },
            ].map((a) => (
              <button
                key={a.l}
                className={`chip ${state.cropAspect === a.v ? 'on' : ''}`}
                onClick={() => dispatch({ type: 'SET_CROP_ASPECT', aspect: a.v })}
              >{a.l}</button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function PresetsPanel() {
  const { state, dispatch } = useEditor();
  const [open, setOpen] = useState(false);
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');
  const builtins = state.presets.filter((p) => p.builtin);
  const customs = state.presets.filter((p) => !p.builtin);

  return (
    <section className={`panel ${open ? 'open' : ''}`}>
      <header className="panel-head" onClick={() => setOpen(!open)}>
        <span className="panel-caret">{open ? '▾' : '▸'}</span>
        <span>Presets</span>
      </header>
      {open && (
        <div className="presets-body">
          <div className="preset-grid">
            {builtins.map((p) => (
              <button key={p.id} className="preset-chip" onClick={() => dispatch({ type: 'APPLY_PRESET', preset: p })}>{p.name}</button>
            ))}
            {customs.map((p) => (
              <span key={p.id} className="preset-chip custom">
                <button className="preset-apply" onClick={() => dispatch({ type: 'APPLY_PRESET', preset: p })}>{p.name}</button>
                <button className="preset-del" title="Delete preset" onClick={() => dispatch({ type: 'DELETE_PRESET', id: p.id })}>✕</button>
              </span>
            ))}
          </div>
          {naming ? (
            <div className="geo-row">
              <input
                className="text-input"
                autoFocus
                placeholder="Preset name…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { dispatch({ type: 'SAVE_PRESET', name }); setNaming(false); setName(''); }
                  if (e.key === 'Escape') setNaming(false);
                }}
              />
              <button className="btn accent" onClick={() => { dispatch({ type: 'SAVE_PRESET', name }); setNaming(false); setName(''); }}>Save</button>
            </div>
          ) : (
            <button className="btn ghost wide" onClick={() => setNaming(true)}>＋ Save current as preset</button>
          )}
        </div>
      )}
    </section>
  );
}

export function Sidebar({ histogram }: { histogram: HistogramBins | null }) {
  const { state, dispatch } = useEditor();
  const img = activeImage(state);
  const activeCount = useMemo(() => {
    if (!img) return 0;
    return OPS.filter((o) => {
      const st = img.ops[o.id];
      return st?.enabled && !(o.params.length > 0 && isNeutral(o, st.values) && o.id !== 'blackWhite');
    }).length;
  }, [img]);

  if (!img) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-scroll">
        <Histogram bins={histogram} />
        <div className="sidebar-meta">
          <span>{img.name}</span>
          <span className="dim">{img.width}×{img.height}px · {activeCount} edit{activeCount === 1 ? '' : 's'} active</span>
        </div>
        <GeometryPanel />
        {GROUPS.map((g) => <GroupPanel key={g.id} id={g.id} label={g.label} />)}
        <PresetsPanel />
      </div>
      <div className="sidebar-foot">
        <button className="btn ghost" onClick={() => dispatch({ type: 'RESET_ALL' })}>Reset everything</button>
      </div>
    </aside>
  );
}
