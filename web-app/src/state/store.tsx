/**
 * Pixelfy Web — editor state store (React context + useReducer).
 * Per-image non-destructive state: op params + geometry. History = snapshots.
 */
import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { defaultOpStates, type OpStates } from '../engine/ops';
import { DEFAULT_GEO, type GeoState } from '../engine/pipeline';
import { DEFAULT_THEME as DEFAULT_THEME_ID } from '../engine/themes';

export interface EditorImage {
  id: string;
  name: string;
  width: number;
  height: number;
  bitmap: ImageBitmap;
  ops: OpStates;
  geo: GeoState;
}

export interface Preset {
  id: string;
  name: string;
  builtin?: boolean;
  ops: OpStates;
}

export interface ExportCfg {
  format: 'jpeg' | 'png' | 'webp';
  quality: number;       // 0..1 (jpeg/webp)
  maxDim: number;        // export pixel cap
  name: string;          // '' → default from image name
}

interface Snapshot { ops: OpStates; geo: GeoState }

interface State {
  images: EditorImage[];
  activeId: string | null;
  tool: 'adjust' | 'crop';
  compare: boolean;         // split view
  splitPos: number;         // 0..1
  holdBefore: boolean;      // transient (B key / hold button)
  past: Snapshot[];
  future: Snapshot[];
  presets: Preset[];
  exportOpen: boolean;
  exportCfg: ExportCfg;
  status: string | null;    // transient status line
  zoom: number | null;      // null = fit to window
  pan: { x: number; y: number };
  cropAspect: number | null; // locked crop aspect (null = free)
  theme: string;            // theme id from engine/themes.ts
}

const LS_PRESETS = 'pixelfy.customPresets.v1';
const LS_EXPORT = 'pixelfy.exportCfg.v1';
const LS_THEME = 'pixelfy.theme.v1';

function loadCustomPresets(): Preset[] {
  try { return JSON.parse(localStorage.getItem(LS_PRESETS) ?? '[]'); } catch { return []; }
}
function loadExportCfg(): ExportCfg | null {
  try { return JSON.parse(localStorage.getItem(LS_EXPORT) ?? 'null'); } catch { return null; }
}

/** Built-in preset helper: start from defaults, override some ops. */
function mkPreset(id: string, name: string, defs: Record<string, { enabled?: boolean; values: Record<string, number> }>): Preset {
  const ops = defaultOpStates();
  for (const [opId, d] of Object.entries(defs)) {
    if (!ops[opId]) continue;
    ops[opId] = { enabled: d.enabled ?? true, values: { ...ops[opId].values, ...d.values } };
  }
  return { id, name, builtin: true, ops };
}

export const BUILTIN_PRESETS: Preset[] = [
  mkPreset('p-vivid', 'Vivid Punch', {
    vibrance: { values: { vib: 0.45 } },
    saturation: { values: { sat: 0.12 } },
    contrast: { values: { amount: 0.18 } },
    clarity: { values: { amount: 0.3, radius: 10 } },
  }),
  mkPreset('p-noir', 'Noir B&W', {
    blackWhite: { values: { amount: 1 } },
    contrast: { values: { amount: 0.3 } },
    whitesBlacks: { values: { whites: 0.2, blacks: 0.25 } },
    grain: { values: { amount: 0.18, size: 1.4 } },
  }),
  mkPreset('p-film', 'Faded Film', {
    fade: { values: { amount: 0.55 } },
    temperature: { values: { temp: 0.12, tint: 0 } },
    grain: { values: { amount: 0.22, size: 1.8 } },
    vignette: { values: { amount: -0.25, midpoint: 0.45, feather: 0.7 } },
  }),
  mkPreset('p-warm', 'Warm Sunset', {
    temperature: { values: { temp: 0.35, tint: 0.05 } },
    vibrance: { values: { vib: 0.3 } },
    exposure: { values: { ev: 0.15 } },
    splitTone: { values: { shHue: 250, shSat: 0.12, hiHue: 40, hiSat: 0.25, balance: 0 } },
  }),
  mkPreset('p-arctic', 'Arctic Cool', {
    temperature: { values: { temp: -0.35, tint: 0 } },
    saturation: { values: { sat: -0.1 } },
    highlights: { values: { amount: -0.2 } },
    splitTone: { values: { shHue: 210, shSat: 0.2, hiHue: 195, hiSat: 0.12, balance: 0 } },
  }),
  mkPreset('p-portrait', 'Soft Portrait', {
    texture: { values: { amount: -0.35, radius: 3.5 } },
    shadows: { values: { amount: 0.15 } },
    bloom: { values: { threshold: 0.8, intensity: 0.35, radius: 18 } },
  }),
];

const DEFAULT_EXPORT: ExportCfg = { format: 'jpeg', quality: 0.92, maxDim: 4096, name: '' };

function initialState(): State {
  return {
    images: [], activeId: null,
    tool: 'adjust', compare: false, splitPos: 0.5, holdBefore: false,
    past: [], future: [],
    presets: [...BUILTIN_PRESETS, ...loadCustomPresets()],
    exportOpen: false,
    exportCfg: loadExportCfg() ?? DEFAULT_EXPORT,
    status: null,
    zoom: null, pan: { x: 0, y: 0 }, cropAspect: null,
    theme: localStorage.getItem(LS_THEME) ?? DEFAULT_THEME_ID,
  };
}

// ---------------- helpers ----------------
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function activeImage(s: State): EditorImage | undefined {
  return s.images.find((i) => i.id === s.activeId);
}

function replaceImage(s: State, img: EditorImage): State {
  return { ...s, images: s.images.map((i) => (i.id === img.id ? img : i)) };
}

/** push current snapshot of img onto history (dedupes no-op pushes) */
function withHistory(s: State, img: EditorImage, next: { ops?: OpStates; geo?: GeoState }, force = false): State {
  const snap: Snapshot = { ops: img.ops, geo: img.geo };
  const nops = next.ops ?? img.ops;
  const ngeo = next.geo ?? img.geo;
  if (!force && eq(snap.ops, nops) && eq(snap.geo, ngeo)) return replaceImage(s, { ...img, ops: nops, geo: ngeo });
  const past = [...s.past, snap].slice(-100);
  return { ...replaceImage(s, { ...img, ops: nops, geo: ngeo }), past, future: [] };
}

// ---------------- actions ----------------
type Action =
  | { type: 'ADD_IMAGES'; images: EditorImage[] }
  | { type: 'REMOVE_IMAGE'; id: string }
  | { type: 'SELECT'; id: string }
  | { type: 'SET_PARAM'; opId: string; key: string; value: number }        // transient (during drag)
  | { type: 'BEGIN_EDIT' }                                                  // snapshot for undo
  | { type: 'TOGGLE_OP'; opId: string }
  | { type: 'RESET_OP'; opId: string }
  | { type: 'RESET_ALL' }
  | { type: 'SET_GEO'; geo: Partial<GeoState> }                             // with history
  | { type: 'PATCH_CROP'; crop: GeoState['crop'] }                          // transient (during drag)
  | { type: 'COMMIT_CROP' }                                                 // push history (uses pre-drag baseline)
  | { type: 'SET_TOOL'; tool: State['tool'] }
  | { type: 'SET_COMPARE'; on: boolean }
  | { type: 'SET_SPLIT'; pos: number }
  | { type: 'SET_HOLD'; on: boolean }
  | { type: 'APPLY_PRESET'; preset: Preset }
  | { type: 'SAVE_PRESET'; name: string }
  | { type: 'DELETE_PRESET'; id: string }
  | { type: 'UNDO' } | { type: 'REDO' }
  | { type: 'SET_EXPORT_OPEN'; open: boolean }
  | { type: 'SET_EXPORT_CFG'; cfg: Partial<ExportCfg> }
  | { type: 'SET_STATUS'; text: string | null }
  | { type: 'SET_VIEW'; zoom?: number | null; pan?: { x: number; y: number } }
  | { type: 'SET_CROP_ASPECT'; aspect: number | null }
  | { type: 'SET_THEME'; theme: string };

function reducer(s: State, a: Action): State {
  const img = activeImage(s);
  switch (a.type) {
    case 'ADD_IMAGES': {
      const images = [...s.images, ...a.images];
      return { ...s, images, activeId: a.images[0]?.id ?? s.activeId, past: [], future: [], zoom: null, pan: { x: 0, y: 0 } };
    }
    case 'REMOVE_IMAGE': {
      const idx = s.images.findIndex((i) => i.id === a.id);
      s.images[idx]?.bitmap.close();
      const images = s.images.filter((i) => i.id !== a.id);
      const activeId = s.activeId === a.id ? (images[Math.min(idx, images.length - 1)]?.id ?? null) : s.activeId;
      return { ...s, images, activeId, past: [], future: [] };
    }
    case 'SELECT': {
      if (a.id === s.activeId) return s;
      return { ...s, activeId: a.id, past: [], future: [], tool: 'adjust', zoom: null, pan: { x: 0, y: 0 } };
    }
    case 'BEGIN_EDIT': {
      if (!img) return s;
      const past = [...s.past, { ops: clone(img.ops), geo: clone(img.geo) }].slice(-100);
      return { ...s, past, future: [] };
    }
    case 'SET_PARAM': {
      if (!img) return s;
      const op = img.ops[a.opId];
      if (!op) return s;
      const ops = { ...img.ops, [a.opId]: { enabled: true, values: { ...op.values, [a.key]: a.value } } };
      return replaceImage(s, { ...img, ops });
    }
    case 'TOGGLE_OP': {
      if (!img) return s;
      const op = img.ops[a.opId];
      return withHistory(s, img, { ops: { ...img.ops, [a.opId]: { ...op, enabled: !op.enabled } } });
    }
    case 'RESET_OP': {
      if (!img) return s;
      const defs = defaultOpStates();
      return withHistory(s, img, { ops: { ...img.ops, [a.opId]: defs[a.opId] } });
    }
    case 'RESET_ALL': {
      if (!img) return s;
      return withHistory(s, img, { ops: defaultOpStates(), geo: clone(DEFAULT_GEO) });
    }
    case 'SET_GEO': {
      if (!img) return s;
      return withHistory(s, img, { geo: { ...img.geo, ...a.geo } });
    }
    case 'PATCH_CROP': {
      if (!img) return s;
      return replaceImage(s, { ...img, geo: { ...img.geo, crop: a.crop } });
    }
    case 'COMMIT_CROP': {
      // history snapshot was taken by BEGIN_EDIT when the drag started
      if (!img) return s;
      return { ...s };
    }
    case 'SET_TOOL': return { ...s, tool: a.tool };
    case 'SET_COMPARE': return { ...s, compare: a.on };
    case 'SET_SPLIT': return { ...s, splitPos: a.pos };
    case 'SET_HOLD': return { ...s, holdBefore: a.on };
    case 'APPLY_PRESET': {
      if (!img) return s;
      return withHistory(s, img, { ops: clone(a.preset.ops) }, true);
    }
    case 'SAVE_PRESET': {
      if (!img) return s;
      const preset: Preset = { id: `c-${Date.now()}`, name: a.name.trim() || 'My preset', ops: clone(img.ops) };
      const presets = [...s.presets, preset];
      const customs = presets.filter((p) => !p.builtin);
      try { localStorage.setItem(LS_PRESETS, JSON.stringify(customs)); } catch { /* quota */ }
      return { ...s, presets };
    }
    case 'DELETE_PRESET': {
      const presets = s.presets.filter((p) => p.id !== a.id);
      const customs = presets.filter((p) => !p.builtin);
      try { localStorage.setItem(LS_PRESETS, JSON.stringify(customs)); } catch { /* quota */ }
      return { ...s, presets };
    }
    case 'UNDO': {
      if (!img || s.past.length === 0) return s;
      const prev = s.past[s.past.length - 1];
      const cur: Snapshot = { ops: img.ops, geo: img.geo };
      return {
        ...replaceImage(s, { ...img, ops: prev.ops, geo: prev.geo }),
        past: s.past.slice(0, -1),
        future: [cur, ...s.future],
      };
    }
    case 'REDO': {
      if (!img || s.future.length === 0) return s;
      const [next, ...rest] = s.future;
      const cur: Snapshot = { ops: img.ops, geo: img.geo };
      return {
        ...replaceImage(s, { ...img, ops: next.ops, geo: next.geo }),
        past: [...s.past, cur],
        future: rest,
      };
    }
    case 'SET_EXPORT_OPEN': return { ...s, exportOpen: a.open };
    case 'SET_EXPORT_CFG': {
      const exportCfg = { ...s.exportCfg, ...a.cfg };
      try { localStorage.setItem(LS_EXPORT, JSON.stringify(exportCfg)); } catch { /* ignore */ }
      return { ...s, exportCfg };
    }
    case 'SET_STATUS': return { ...s, status: a.text };
    case 'SET_VIEW': return { ...s, zoom: a.zoom !== undefined ? a.zoom : s.zoom, pan: a.pan ?? s.pan };
    case 'SET_CROP_ASPECT': return { ...s, cropAspect: a.aspect };
    case 'SET_THEME': {
      try { localStorage.setItem(LS_THEME, a.theme); } catch { /* ignore */ }
      return { ...s, theme: a.theme };
    }
    default: return s;
  }
}

// ---------------- context ----------------
const Ctx = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useEditor() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useEditor outside provider');
  return ctx;
}

export function makeEditorImage(name: string, bitmap: ImageBitmap): EditorImage {
  return {
    id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name, width: bitmap.width, height: bitmap.height, bitmap,
    ops: defaultOpStates(), geo: clone(DEFAULT_GEO),
  };
}

export { activeImage };
export type { Action, State };
