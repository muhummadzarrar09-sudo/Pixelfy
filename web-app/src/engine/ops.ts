/**
 * Pixelfy Web — operation catalog.
 * Mirrors ai.pixelforge.core.domain.model.OpType where practical, extended for desktop.
 *
 * An op = metadata + slider params + a list of render passes.
 * A pass maps current param values to shader uniforms; pipeline.ts executes passes in order.
 */

export type GroupId = 'light' | 'color' | 'detail' | 'blur' | 'effects';

export const GROUPS: { id: GroupId; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'color', label: 'Color' },
  { id: 'detail', label: 'Detail' },
  { id: 'blur', label: 'Blur' },
  { id: 'effects', label: 'Effects' },
];

export interface ParamDef {
  key: string;
  label: string;
  min: number;
  max: number;
  def: number;
  step?: number;
  unit?: string;
}

export interface PassDef {
  shader: string;
  /** resolve uniforms from the op's param values + render context */
  uniforms?: (v: Record<string, number>, ctx: { w: number; h: number }) => Record<string, number | number[]>;
  /** render scale for this pass (e.g. 0.5 for cheap glow blurs) */
  scale?: number;
  /** bind the op's chain-input texture as u_tex2 (for composites) */
  blendWithInput?: boolean;
}

export interface OpDef {
  id: string;
  name: string;
  group: GroupId;
  hint?: string;
  params: ParamDef[];
  passes: PassDef[];
}

const single = (shader: string, map: Record<string, string | number>): PassDef[] => [
  {
    shader,
    uniforms: (v) => {
      const out: Record<string, number> = {};
      for (const [uniform, src] of Object.entries(map)) {
        out[uniform] = typeof src === 'string' ? v[src] ?? 0 : src;
      }
      return out;
    },
  },
];

export const OPS: OpDef[] = [
  // ---------------- LIGHT ----------------
  { id: 'exposure', name: 'Exposure', group: 'light', hint: 'Stops of light (EV)',
    params: [{ key: 'ev', label: 'Exposure', min: -3, max: 3, def: 0, step: 0.01, unit: 'EV' }],
    passes: single('exposure', { u_ev: 'ev' }) },
  { id: 'brightness', name: 'Brightness', group: 'light',
    params: [{ key: 'value', label: 'Brightness', min: -1, max: 1, def: 0, step: 0.01 }],
    passes: single('brightness', { u_value: 'value' }) },
  { id: 'contrast', name: 'Contrast', group: 'light',
    params: [{ key: 'amount', label: 'Contrast', min: -1, max: 1, def: 0, step: 0.01 }],
    passes: single('contrast', { u_amount: 'amount' }) },
  { id: 'highlights', name: 'Highlights', group: 'light', hint: 'Pull / recover bright tones',
    params: [{ key: 'amount', label: 'Highlights', min: -1, max: 1, def: 0, step: 0.01 }],
    passes: single('highlights', { u_amount: 'amount' }) },
  { id: 'shadows', name: 'Shadows', group: 'light', hint: 'Lift / deepen dark tones',
    params: [{ key: 'amount', label: 'Shadows', min: -1, max: 1, def: 0, step: 0.01 }],
    passes: single('shadows', { u_amount: 'amount' }) },
  { id: 'whitesBlacks', name: 'Whites & Blacks', group: 'light', hint: 'Levels end-points',
    params: [
      { key: 'whites', label: 'Whites', min: -1, max: 1, def: 0, step: 0.01 },
      { key: 'blacks', label: 'Blacks', min: -1, max: 1, def: 0, step: 0.01 },
    ],
    passes: single('whitesBlacks', { u_whites: 'whites', u_blacks: 'blacks' }) },
  { id: 'gamma', name: 'Gamma', group: 'light',
    params: [{ key: 'gamma', label: 'Gamma', min: 0.3, max: 3, def: 1, step: 0.01 }],
    passes: single('gamma', { u_gamma: 'gamma' }) },
  { id: 'fade', name: 'Fade (Film)', group: 'light', hint: 'Lifted blacks, soft matte',
    params: [{ key: 'amount', label: 'Fade', min: 0, max: 1, def: 0, step: 0.01 }],
    passes: single('fade', { u_amount: 'amount' }) },

  // ---------------- COLOR ----------------
  { id: 'saturation', name: 'Saturation', group: 'color',
    params: [{ key: 'sat', label: 'Saturation', min: -1, max: 1, def: 0, step: 0.01 }],
    passes: single('saturation', { u_sat: 'sat' }) },
  { id: 'vibrance', name: 'Vibrance', group: 'color', hint: 'Smart saturation — protects already-rich colours',
    params: [{ key: 'vib', label: 'Vibrance', min: -1, max: 1, def: 0, step: 0.01 }],
    passes: single('vibrance', { u_vib: 'vib' }) },
  { id: 'temperature', name: 'Temperature & Tint', group: 'color', hint: 'White balance',
    params: [
      { key: 'temp', label: 'Temperature', min: -1, max: 1, def: 0, step: 0.01 },
      { key: 'tint', label: 'Tint', min: -1, max: 1, def: 0, step: 0.01 },
    ],
    passes: single('temperature', { u_temp: 'temp', u_tint: 'tint' }) },
  { id: 'hueShift', name: 'Hue Shift', group: 'color',
    params: [{ key: 'deg', label: 'Hue', min: -180, max: 180, def: 0, step: 1, unit: '°' }],
    passes: single('hueShift', { u_deg: 'deg' }) },
  { id: 'splitTone', name: 'Split Tone', group: 'color', hint: 'Tint shadows & highlights separately',
    params: [
      { key: 'shHue', label: 'Shadow hue', min: 0, max: 360, def: 210, step: 1, unit: '°' },
      { key: 'shSat', label: 'Shadow amount', min: 0, max: 1, def: 0, step: 0.01 },
      { key: 'hiHue', label: 'Highlight hue', min: 0, max: 360, def: 45, step: 1, unit: '°' },
      { key: 'hiSat', label: 'Highlight amount', min: 0, max: 1, def: 0, step: 0.01 },
      { key: 'balance', label: 'Balance', min: -1, max: 1, def: 0, step: 0.01 },
    ],
    passes: single('splitTone', { u_shHue: 'shHue', u_shSat: 'shSat', u_hiHue: 'hiHue', u_hiSat: 'hiSat', u_balance: 'balance' }) },
  { id: 'dehaze', name: 'Dehaze', group: 'color', hint: 'Cut through atmospheric haze (or add it)',
    params: [{ key: 'amount', label: 'Dehaze', min: -1, max: 1, def: 0, step: 0.01 }],
    passes: single('dehaze', { u_amount: 'amount' }) },
  { id: 'sepia', name: 'Sepia', group: 'color',
    params: [{ key: 'amount', label: 'Sepia', min: 0, max: 1, def: 0, step: 0.01 }],
    passes: single('sepia', { u_amount: 'amount' }) },
  { id: 'blackWhite', name: 'Black & White', group: 'color', hint: 'Filmic mono conversion',
    params: [{ key: 'amount', label: 'B&W mix', min: 0, max: 1, def: 1, step: 0.01 }],
    passes: single('blackWhite', { u_amount: 'amount' }) },
  { id: 'invert', name: 'Invert', group: 'color',
    params: [], passes: [{ shader: 'invert' }] },

  // ---------------- DETAIL ----------------
  { id: 'sharpen', name: 'Sharpen', group: 'detail', hint: 'Unsharp mask (fine)',
    params: [
      { key: 'amount', label: 'Amount', min: 0, max: 2, def: 0, step: 0.01 },
      { key: 'radius', label: 'Radius', min: 0.5, max: 3, def: 1, step: 0.1, unit: 'px' },
    ],
    passes: single('sharpen', { u_amount: 'amount', u_radius: 'radius' }) },
  { id: 'clarity', name: 'Clarity', group: 'detail', hint: 'Mid-tone local contrast (wide)',
    params: [
      { key: 'amount', label: 'Clarity', min: -1, max: 1, def: 0, step: 0.01 },
      { key: 'radius', label: 'Radius', min: 3, max: 24, def: 10, step: 1, unit: 'px' },
    ],
    passes: single('clarity', { u_amount: 'amount', u_radius: 'radius' }) },
  { id: 'texture', name: 'Texture', group: 'detail', hint: 'Fine local contrast (medium)',
    params: [
      { key: 'amount', label: 'Texture', min: -1, max: 1, def: 0, step: 0.01 },
      { key: 'radius', label: 'Radius', min: 1, max: 8, def: 3.5, step: 0.5, unit: 'px' },
    ],
    passes: single('clarity', { u_amount: 'amount', u_radius: 'radius' }) },

  // ---------------- BLUR ----------------
  { id: 'gaussian', name: 'Gaussian Blur', group: 'blur',
    params: [{ key: 'radius', label: 'Radius', min: 0, max: 40, def: 0, step: 0.5, unit: 'px' }],
    passes: [
      { shader: 'blurDir', uniforms: (v, c) => ({ u_dir: [1 / c.w, 0], u_radius: v.radius }) },
      { shader: 'blurDir', uniforms: (v, c) => ({ u_dir: [0, 1 / c.h], u_radius: v.radius }) },
    ] },
  { id: 'motionBlur', name: 'Motion Blur', group: 'blur',
    params: [
      { key: 'angle', label: 'Angle', min: 0, max: 180, def: 0, step: 1, unit: '°' },
      { key: 'distance', label: 'Distance', min: 0, max: 60, def: 0, step: 0.5, unit: 'px' },
    ],
    passes: single('motionBlur', { u_angle: 'angle', u_distance: 'distance' }) },
  { id: 'radialBlur', name: 'Radial (Zoom) Blur', group: 'blur',
    params: [{ key: 'strength', label: 'Strength', min: 0, max: 1, def: 0, step: 0.01 }],
    passes: single('radialBlur', { u_strength: 'strength' }) },

  // ---------------- EFFECTS ----------------
  { id: 'vignette', name: 'Vignette', group: 'effects',
    params: [
      { key: 'amount', label: 'Amount', min: -1, max: 1, def: 0, step: 0.01 },
      { key: 'midpoint', label: 'Midpoint', min: 0, max: 1, def: 0.5, step: 0.01 },
      { key: 'feather', label: 'Feather', min: 0.01, max: 1, def: 0.6, step: 0.01 },
    ],
    passes: single('vignette', { u_amount: 'amount', u_midpoint: 'midpoint', u_feather: 'feather' }) },
  { id: 'grain', name: 'Film Grain', group: 'effects',
    params: [
      { key: 'amount', label: 'Amount', min: 0, max: 1, def: 0, step: 0.01 },
      { key: 'size', label: 'Size', min: 0.5, max: 4, def: 1.4, step: 0.1, unit: 'px' },
    ],
    passes: [{ shader: 'grain', uniforms: (v) => ({ u_amount: v.amount, u_size: v.size, u_seed: Math.floor(v.amount * 1000) % 7 }) }] },
  { id: 'bloom', name: 'Bloom', group: 'effects', hint: 'Dreamy highlight glow',
    params: [
      { key: 'threshold', label: 'Threshold', min: 0, max: 1, def: 0.75, step: 0.01 },
      { key: 'intensity', label: 'Intensity', min: 0, max: 2, def: 0, step: 0.01 },
      { key: 'radius', label: 'Radius', min: 2, max: 40, def: 14, step: 1, unit: 'px' },
    ],
    passes: [
      { shader: 'bloomBright', uniforms: (v) => ({ u_threshold: v.threshold }), scale: 0.5 },
      { shader: 'blurDir', scale: 0.5, uniforms: (v, c) => ({ u_dir: [2 / c.w, 0], u_radius: v.radius }) },
      { shader: 'blurDir', scale: 0.5, uniforms: (v, c) => ({ u_dir: [0, 2 / c.h], u_radius: v.radius }) },
      { shader: 'bloomCombine', uniforms: (v) => ({ u_intensity: v.intensity }), blendWithInput: true },
    ] },
  { id: 'chromatic', name: 'Chromatic Aberration', group: 'effects', hint: 'Lens-style RGB fringing',
    params: [{ key: 'amount', label: 'Amount', min: -1, max: 1, def: 0, step: 0.01 }],
    passes: single('chromatic', { u_amount: 'amount' }) },
];

export const OPS_BY_ID = new Map(OPS.map((o) => [o.id, o]));

/** default op-state map { opId: { enabled, values } } */
export type OpStates = Record<string, { enabled: boolean; values: Record<string, number> }>;

export function defaultOpStates(): OpStates {
  const out: OpStates = {};
  for (const op of OPS) {
    const values: Record<string, number> = {};
    for (const p of op.params) values[p.key] = p.def;
    out[op.id] = { enabled: false, values };
  }
  return out;
}

export function isNeutral(op: OpDef, values: Record<string, number>): boolean {
  if (op.id === 'invert') return true; // toggle op — handled by `enabled`
  return op.params.every((p) => values[p.key] === p.def);
}

/** ops in fixed pipeline order = catalog order */
export function activeOps(states: OpStates): { def: OpDef; values: Record<string, number> }[] {
  const out: { def: OpDef; values: Record<string, number> }[] = [];
  for (const op of OPS) {
    const s = states[op.id];
    if (!s || !s.enabled) continue;
    if (op.params.length > 0 && isNeutral(op, s.values) && op.id !== 'blackWhite') continue;
    out.push({ def: op, values: s.values });
  }
  return out;
}
