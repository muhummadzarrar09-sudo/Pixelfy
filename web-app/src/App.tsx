import { useCallback, useEffect, useRef, useState } from 'react';
import { themeById } from './engine/themes';
import { CanvasView } from './components/CanvasView';
import { ExportDialog } from './components/ExportDialog';
import { Filmstrip } from './components/Filmstrip';
import { type HistogramBins } from './components/Histogram';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { decodeToBitmap } from './engine/image';
import type { RenderEngine } from './engine/pipeline';
import { activeImage, EditorProvider, makeEditorImage, useEditor } from './state/store';
import type { EditorImage } from './state/store';

function Shell() {
  const { state, dispatch } = useEditor();
  const img = activeImage(state);
  const engineRef = useRef<RenderEngine | null>(null);
  const [hist, setHist] = useState<HistogramBins | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ---------- importing ----------
  const importFiles = useCallback(async (files: Iterable<File>) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|avif|bmp|heic|heif)$/i.test(f.name));
    if (list.length === 0) return;
    dispatch({ type: 'SET_STATUS', text: `Importing ${list.length} photo${list.length > 1 ? 's' : ''}…` });
    const images: EditorImage[] = [];
    for (const f of list) {
      try {
        const bmp = await decodeToBitmap(f, f.name);
        images.push(makeEditorImage(f.name, bmp));
      } catch (e) {
        dispatch({ type: 'SET_STATUS', text: `Skipped ${f.name}: ${e instanceof Error ? e.message : e}` });
      }
    }
    if (images.length > 0) {
      dispatch({ type: 'ADD_IMAGES', images });
      dispatch({ type: 'SET_STATUS', text: `${images.length} photo${images.length > 1 ? 's' : ''} ready — everything stays on this device` });
    }
  }, [dispatch]);

  const openPicker = useCallback(() => fileRef.current?.click(), []);

  const loadSample = useCallback(async () => {
    try {
      const r = await fetch('sample.jpg');
      const blob = await r.blob();
      const bmp = await decodeToBitmap(blob, 'sample.jpg');
      dispatch({ type: 'ADD_IMAGES', images: [makeEditorImage('sample-valley.jpg', bmp)] });
      dispatch({ type: 'SET_STATUS', text: 'Sample loaded — it is intentionally flat, go fix it!' });
    } catch {
      dispatch({ type: 'SET_STATUS', text: 'Could not load the sample image' });
    }
  }, [dispatch]);

  // global drag & drop
  useEffect(() => {
    const onDragOver = (e: DragEvent) => { e.preventDefault(); setDragOver(true); };
    const onDragLeave = (e: DragEvent) => { if (e.relatedTarget === null) setDragOver(false); };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer?.files?.length) void importFiles(e.dataTransfer.files);
    };
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, [importFiles]);

  // keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); dispatch({ type: 'UNDO' }); }
      else if ((mod && e.key.toLowerCase() === 'z' && e.shiftKey) || (mod && e.key.toLowerCase() === 'y')) { e.preventDefault(); dispatch({ type: 'REDO' }); }
      else if (mod && e.key.toLowerCase() === 'e') { e.preventDefault(); if (img) dispatch({ type: 'SET_EXPORT_OPEN', open: true }); }
      else if (e.key.toLowerCase() === 'b' && !e.repeat && !mod) dispatch({ type: 'SET_HOLD', on: true });
      else if (e.key === '\\' && !mod) dispatch({ type: 'SET_COMPARE', on: !state.compare });
      else if (e.key.toLowerCase() === 'c' && !mod && img) dispatch({ type: 'SET_TOOL', tool: state.tool === 'crop' ? 'adjust' : 'crop' });
      else if (e.key === 'Escape') {
        if (state.exportOpen) dispatch({ type: 'SET_EXPORT_OPEN', open: false });
        else if (state.tool === 'crop') dispatch({ type: 'SET_TOOL', tool: 'adjust' });
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'b') dispatch({ type: 'SET_HOLD', on: false });
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [dispatch, img, state.compare, state.exportOpen, state.tool]);

  // status auto-clear
  useEffect(() => {
    if (!state.status) return;
    const t = setTimeout(() => dispatch({ type: 'SET_STATUS', text: null }), 5000);
    return () => clearTimeout(t);
  }, [state.status, dispatch]);

  // theme sync: CSS vars (DOM) + GL colours (canvas backdrop / divider)
  useEffect(() => {
    const t = themeById(state.theme);
    document.documentElement.dataset.theme = t.id;
    engineRef.current?.setTheme(t.glBg, t.glAccent);
  }, [state.theme]);

  return (
    <div className="shell">
      <TopBar onOpen={openPicker} />
      <div className="main">
        <CanvasView onHistogram={setHist} engineRef={engineRef} />
        <Sidebar histogram={hist} />
      </div>
      <Filmstrip />
      {state.status && <div className="status-bar">{state.status}</div>}

      <input
        ref={fileRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        hidden
        onChange={(e) => { if (e.target.files) void importFiles(e.target.files); e.target.value = ''; }}
      />

      {!img && (
        <div className="empty-state">
          <div className="empty-card">
            <div className="empty-logo">▙ Pixelfy</div>
            <p className="empty-tag">Local-first photo studio for your laptop.<br />No accounts. No uploads. Your photos never leave this tab.</p>
            <div className="empty-actions">
              <button className="btn accent big" onClick={openPicker}>⤒ Open photos</button>
              <button className="btn ghost big" onClick={loadSample}>✨ Try the sample</button>
            </div>
            <p className="empty-hint">…or just drag &amp; drop photos anywhere in this window.</p>
          </div>
        </div>
      )}

      {dragOver && (
        <div className="drop-overlay">
          <div className="drop-box">Drop your photos to import</div>
        </div>
      )}

      <ExportDialog engineRef={engineRef} />
    </div>
  );
}

export default function App() {
  return (
    <EditorProvider>
      <Shell />
    </EditorProvider>
  );
}
