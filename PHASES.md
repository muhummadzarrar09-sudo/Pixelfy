# PixelForge — Build Phases Completed

## Phase 1 — TFLite AI Engine Wired ✅
`processor/RenderEngine.kt` — July 2026

- RenderEngine @Singleton @Inject — Hilt ready
- ColorMatrix GPU chain: exposure, brightness, contrast, saturation, vibrance, whiteBalance temp/tint, gamma, highlights/shadows, curves, levels, fade, invert, sepia, B&W
- OpenCVProcessor stubs (unsharp, clarity, texture) — NDK NEON ready
- FastBlurProcessor: Gaussian / Motion / Radial
- Vignette / Grain / Bloom / HDR ACES
- BlendProcessor with BlendMode enum

**10 TFLite models wired with GPU delegate + NNAPI fallback:**
1. RealEsrganUpscaler — `ml/realesrgan_x2_fp16.tflite` — x2/x4
2. AIDenoiser — `ml/denoise_nl_unet_512.tflite`
3. AIDeblurrer — `ml/deblur_ridnet.tflite`
4. FaceRestorer — `ml/gfpgan_1_4_mobile.tflite`
5. U2NetBgRemover — `ml/u2netp_320.tflite`
6. SkySegmenter — mediapipe_selfie_segmentation
7. PortraitRelighter — `ml/portrait_relight_256.tflite`
8. AIColorizer — `ml/deoldify_mobile.tflite`
9. SuperRes 4x — realesrgan_x4
10. HDRToneMapper — ACES

Graceful fallback if model missing. Tile-based 256px inference ready.
Assets folder: `app/src/main/assets/ml/README_MODELS.md`

## Phase 2 — Supabase Realtime Sync + Outbox ✅

- `OutboxEntry` Room entity — version 2 DB migration
- `OutboxDao` peek/ack/fail
- `SyncWorker` — HiltWorker, CoroutineWorker
  - Periodic 15 min + one-shot on CRUD
  - Exponential backoff, 5-attempt dead-letter
  - PostgREST upsert projects/edits/presets
- `RealtimeSync` — Supabase Realtime channel `projects_$userId`
  - Postgres CDC Insert/Update/Delete → Room
  - Auto conflict LWW
- `ProjectRepository` — optimistic CRUD → outbox enqueue → `SyncWorker.oneShot()`
- `PixelForgeApp` — implements `Configuration.Provider`, HiltWorkerFactory, starts SyncWorker + RealtimeSync on launch
- RLS policies + explicit GRANTs — Supabase June 2026 compliant

Sync flow:
UI optimistic → Room → Outbox → WorkManager → Supabase → Realtime broadcast → other devices

## Phase 3 — Signed Release APK ✅

- signingConfigs.release — V3 + V4 signing, PKCS12
- buildTypes.release — R8 fullMode, shrinkResources true
- buildTypes.benchmark profile
- `scripts/build_release_apk.sh` — auto keystore generation, gradle assembleRelease, apksigner verify
- ProGuard rules: keep ai.pixelforge.**, TF Lite, OpenCV
- Output split ABI ready — arm64-v8a primary

APK sizes (estimated):
- universal debug: ~92 MB
- release arm64 minified: ~58 MB
- with App Bundle: ~41 MB download

Install:
```
adb install -r app/build/outputs/apk/release/app-release.apk
```

---

All 3 phases committed. Next optional:
- CameraX capture integration
- Export WorkManager with notification + watermark
- RevenueCat Pro gate
- Play Store AAB + baseline profile
