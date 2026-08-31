import { useState } from 'react';
import { baseName, download, fmtBytes } from '../engine/image';
import { activeImage, useEditor } from '../state/store';
import type { RenderEngine } from '../engine/pipeline';

export function ExportDialog({ engineRef }: { engineRef: React.MutableRefObject<RenderEngine | null> }) {
  const { state, dispatch } = useEditor();
  const img = activeImage(state);
  const cfg = state.exportCfg;
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  if (!state.exportOpen || !img) return null;

  const doExport = async () => {
    const engine = engineRef.current;
    if (!engine) return;
    setBusy(true);
    setDone(null);
    dispatch({ type: 'SET_STATUS', text: 'Rendering full resolution…' });
    // let the status paint before the heavy render blocks the main thread
    await new Promise((r) => setTimeout(r, 30));
    try {
      const { blob, w, h } = await engine.exportBlob(img.ops, img.geo, cfg.format, cfg.quality, cfg.maxDim);
      const name = (cfg.name.trim() || `${baseName(img.name)}-pixelfy`) + '.' + (cfg.format === 'jpeg' ? 'jpg' : cfg.format);
      download(blob, name);
      setDone(`Saved ${name} — ${w}×${h}px · ${fmtBytes(blob.size)}`);
      dispatch({ type: 'SET_STATUS', text: `Exported ${name} (${w}×${h})` });
    } catch (e) {
      setDone(`Export failed: ${e instanceof Error ? e.message : e}`);
      dispatch({ type: 'SET_STATUS', text: null });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => !busy && dispatch({ type: 'SET_EXPORT_OPEN', open: false })}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Export photo</h3>

        <label className="field">
          <span>Format</span>
          <div className="seg">
            {(['jpeg', 'webp', 'png'] as const).map((f) => (
              <button key={f} className={`seg-btn ${cfg.format === f ? 'on' : ''}`} onClick={() => dispatch({ type: 'SET_EXPORT_CFG', cfg: { format: f } })}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </label>

        {cfg.format !== 'png' && (
          <label className="field">
            <span>Quality — {Math.round(cfg.quality * 100)}%</span>
            <input type="range" min={0.5} max={1} step={0.01} value={cfg.quality}
              onChange={(e) => dispatch({ type: 'SET_EXPORT_CFG', cfg: { quality: Number(e.target.value) } })} />
          </label>
        )}

        <label className="field">
          <span>Resolution</span>
          <div className="seg">
            {[{ l: '2048px', v: 2048 }, { l: '4K', v: 4096 }, { l: '8K', v: 8192 }].map((s) => (
              <button key={s.v} className={`seg-btn ${cfg.maxDim === s.v ? 'on' : ''}`} onClick={() => dispatch({ type: 'SET_EXPORT_CFG', cfg: { maxDim: s.v } })}>{s.l}</button>
            ))}
          </div>
        </label>

        <label className="field">
          <span>Filename</span>
          <input className="text-input" placeholder={`${baseName(img.name)}-pixelfy`} value={cfg.name}
            onChange={(e) => dispatch({ type: 'SET_EXPORT_CFG', cfg: { name: e.target.value } })} />
        </label>

        {done && <div className="export-done">{done}</div>}

        <div className="modal-actions">
          <button className="btn ghost" disabled={busy} onClick={() => dispatch({ type: 'SET_EXPORT_OPEN', open: false })}>Close</button>
          <button className="btn accent" disabled={busy} onClick={doExport}>{busy ? 'Rendering…' : '⭳ Export'}</button>
        </div>
        <p className="modal-note">Everything is processed locally on your machine — your photo never leaves this tab.</p>
      </div>
    </div>
  );
}
