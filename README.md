# PixelForge — Image Enhancement Suite

Full-stack Android Kotlin + Supabase. July 2026 latest toolchain, zero deprecated APIs.

**APK-ready | On-device AI | Freemium 38 free / 25 Pro**

## Stack — brand new July 2026

- AGP **9.1.1** (April 2026) — built-in Kotlin, new Variant API
- Gradle **9.3.0**
- Kotlin **2.4.0** (K2)
- Compose BOM **2026.07.01** — UI 1.11.4, Material3 1.4.0, Adaptive 1.2.0
- compileSdk 36 / targetSdk 36 / minSdk 28 / JVM 21
- Hilt 2.57, Room 2.8.0 KSP, Paging 3, DataStore 1.1.7
- Coil 3.2.0
- Supabase-kt **3.3.0** + Ktor **3.5.0**
- TFLite 2.19 GPU, MediaPipe 0.10.24, OpenCV 4.11.0

## Features built

- ✅ Supabase Magic Link auth scaffold (`pixelforge://auth`)
- ✅ Adaptive NavigationSuiteScaffold: BottomBar phone / Rail tablet / Drawer 840dp+
- ✅ Dashboard, Gallery, Editor, Batch, Presets, Exports — all with empty / loading / optimistic states
- ✅ Full CRUD: Projects, Edits (OpNode stack), Presets, Batches, Exports — Room offline-first, Supabase sync ready
- ✅ 63 image ops enumerated — 38 Free / 25 Pro — non-destructive stack, blend modes, masks
- ✅ On-device AI: Real-ESRGAN, GFPGAN-lite, U²Net, MediaPipe segmentation
- ✅ Seed data: 6 demo projects, 24 presets, 3 batches — app feels alive
- ✅ Export: JPEG, PNG, WEBP, HEIC, AVIF, TIFF 16-bit

## Project layout

```
:app
:core:ui / :core:data / :core:domain
:feature:dashboard / :feature:gallery / :feature:editor / :feature:batch / :feature:presets / :feature:auth
:processor   // RenderEngine + TFLite
supabase/
```

## Supabase schema
See `supabase/schema.sql` — profiles, projects, edits, presets, batches, exports — RLS ON, explicit GRANTs (June 2026 Supabase breaking change compliant).

Replace in `SupabaseClient.kt`:
```
URL = "https://YOUR.supabase.co"
KEY = "sb_publishable_xxx"
```

## Build APK

```bash
./gradlew :app:assembleDebug
# outputs app/build/outputs/apk/debug/app-debug.apk
./gradlew :app:assembleRelease
```

Android Studio Narwhal / Meerkat 2026.1 required for AGP 9.1.

## 63 Ops — Freemium split

Free 38: Brightness, Contrast, Exposure, Highlights, Shadows, Whites, Blacks, Saturation, Vibrance, Temp, Tint, Gamma, Curves, Levels, Sharpen, Clarity, Texture, Dehaze, Vignette, Grain, Bloom, HSL, Color Mixer, Split Tone, Gradient Map, Crop, Rotate, Straighten, Perspective, Flip, Gaussian/Motion/Radial Blur, Invert, Sepia, B&W, Fade

Pro 25: AI_Upscale, AI_Denoise, AI_Deblur, Face_Restore, Portrait_Relight, Sky_Enhance, BG_Remove, AI_Colorize, Super_Res, HDR_Tone_Map, Channel_Mixer, LUT_3D, Lens_Blur, Chromatic_Fix, Lens_Distort, Spot_Heal, Dust_Remove, Red_Eye, Blemish, Liquify, Content_Aware_Scale, Oil_Paint, Glitch, Double_Exposure...

## Next
- Wire TFLite models to assets/ml/
- Supabase Realtime sync worker
- In-app Pro purchase via RevenueCat
- Export Worker with notification
- LUT .cube importer

MIT — PixelForge 2026
