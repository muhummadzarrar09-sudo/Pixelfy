# Pixelfy Web Studio — Laptop-First Pivot (2026-08-31)

## Decision

Pixelfy gains a **laptop-first web app** at `web-app/`, built for the owner's
personal use. The Android app (`app/`, `feature/`, `core/`, `processor/`) is
**parked, not deleted** — both tracks may proceed in parallel later ("Parallel
FOR NOW"), with the web app as the faster iteration surface.

Rationale:

- The Android build chain (JDK 21 gap, APK signing, emulator/device loops) was
  the bottleneck for trying ideas quickly. The web app runs anywhere with a
  browser and needs no toolchain beyond Node.
- A laptop unlocks what mobile physically can't: a large before/after canvas,
  precision sliders, drag-and-drop folders of RAW-ish photos, keyboard
  shortcuts, and headroom for heavier GPU work.
- Everything stays **local-first**: images are decoded in-browser (EXIF-aware),
  processed on the GPU via WebGL2, and never leave the tab. No auth, no
  Supabase, no analytics.

## What it is

`web-app/` — Vite + React 19 + TypeScript, zero runtime backend.

- `src/engine/glsl.ts` — GLSL ES 3.00 shader registry; every adjustment is a
  GPU pass. Mirrors the Android `OpType`/`RenderEngine` vocabulary (exposure,
  contrast, highlights/shadows, whites/blacks, vibrance, temperature/tint,
  split tone, dehaze, sharpen/clarity/texture, gaussian/motion/radial blur,
  vignette, grain, bloom, chromatic aberration, fade, sepia, B&W, invert, …).
- `src/engine/pipeline.ts` — WebGL2 ping-pong pipeline: geometry pass
  (crop/rotate/flip) → op passes → before/after result slots → compose
  (split A/B). Full-res export via readback → canvas → Blob.
- `src/engine/ops.ts` — op catalog (params, ranges, pass plans). Presets are
  plain op-state snapshots; user presets persist to localStorage.
- `src/state/store.tsx` — reducer store: per-image op stacks, 100-step
  undo/redo, compare state, export settings (persisted).
- `src/components/` — TopBar, CanvasView (zoom/pan/split-drag), CropOverlay
  (8-handle crop with aspect locks), Sidebar (grouped panels + histogram +
  presets), Filmstrip (multi-photo sessions), ExportDialog.

## Status (v0.1)

Working: multi-file import (picker + drag-and-drop), 24 real-time shader ops,
crop/rotate/flip, split compare + hold-to-peek (B), undo/redo, live histogram,
presets (6 built-in + custom saves), filmstrip, JPEG/PNG/WEBP export at up to
8K (GPU-capped), sample photo for instant demo.

**Theming (2026-08-31):** palette system with 6 themes, default **Amber
Darkroom** (chosen over the original purple "Nebula", which remains as a
legacy theme). Theme cards: `assets/branding/palettes/*.png`. Themes are CSS
variable sets (`styles.css [data-theme]`) + GL colours fed into the compose
shader (`engine/themes.ts`); picker in the top bar, persisted to localStorage.

Known limits (honest list):

- HEIC/HEIF input is rejected with a message (no browser decoder).
- Preview renders at ≤1800px for interactivity; export re-renders at full res.
- No layers/masks/brushes yet; ops apply globally.
- No AI ops yet. Path forward: ONNX Runtime Web (WebGPU) — the Android
  TFLite hooks in `processor/` map conceptually to it.
- Batch apply/export (the Android `feature/batch` idea) not yet implemented.

## Run

```bash
cd web-app
npm install
npm run dev        # http://localhost:5173
```

Build for static hosting: `npm run build` → `web-app/dist/`.

## Roadmap hooks (fastest wins first)

1. Batch: apply current stack to all filmstrip photos, export-all.
2. ONNX Runtime Web + WebGPU: denoise / super-res on laptop GPU.
3. Tauri wrapper → real desktop installer for the laptop.
4. Curves editor (shader already accepts LUTs).
5. Recipe file (`.pxfy.json`) export/import to share edit stacks.
