# Pixelfy — Full Product Roadmap
**Alpha → Beta → RC → Production**
Owner build: all features unlocked • Auth standby • Local Mode default
Updated: July 4, 2026 — AGP 9.1.1 • Kotlin 2.4.0 • Compose 1.11.4

---

## 0. Competitive UI/UX teardown → Pixelfy fixes

Sourced: Reddit r/Lightroom 124k, r/snapseed, r/estoration, r/AskPhotography, PCMag, Wirecutter, Axis Intelligence Mar–Jun 2026

### ERASE — remove competitor pain

| Competitor pain (source) | Pixelfy fix | Status |
|---|---|---|
| Snapseed 4.0: “Icons are oversized, sliders awkward … professional editing frustrating, sometimes impossible” — Open Letter Aug 17 2025 [r/snapseed] | **Compact 40dp FilterChips, 48dp touch target exactly, no category nesting** — flat OpType rail, instant tap, no scroll-hunt | ✅ Alpha |
| Snapseed: “curve design isn’t intuitive — looks sleek but feels less precise” | **Curves = large 320dp canvas + snap points + numeric input + haptic tick** | Beta |
| Snapseed: “It doesn’t auto-save … you have to tap save” — Wirecutter Jun 2 2026 | **Auto-save draft every 2s to Room, crash-recover, undo stack 50** | ✅ Alpha wired |
| Snapseed: “no database … no way to undo after saving” / “no way to replicate editing steps” | **OpNode JSON stack persisted, version snapshots, A/B slider** | ✅ Alpha |
| Snapseed: “cannot select all … apply [preset] … repetitive” — batch fail | **Batch WorkManager — multi-select → preset → queue → ZIP export** | ✅ Beta core |
| Lightroom Mobile: “you end up with two versions: original and edited copy” — forced export duplicate | **True non-destructive — zero duplicates, in-place stack, export is explicit action only** | ✅ Alpha |
| Lightroom Mobile: “visualize spots is not available” / “compare and survey views … incredibly helpful” missing | **Visualize Dust toggle + Split Before/After slider + 2-up compare** | Beta |
| Lightroom Mobile Android: “Denoise by AI is the only thing missing” | **AI Denoise UNet TFLite on-device — Android 8+** | ✅ Phase 1 |
| Lightroom: “iPad … crippled app” / “no technical reason AI workflow tools can't work on mobile” | **Feature parity phone=tablet=foldable — Adaptive NavigationSuite, same 63 ops** | ✅ Alpha |
| Remini: “faces are modified so much” / “destroys details … turns it to plastic” / “replaces not restores” | **GFPGAN with 0–100% opacity + blend modes + AI face mask brush — default 35%** | ✅ Phase 1 |
| Remini: cloud upload, 3 pics/day, queue up to 1 week, ads | **100% on-device, unlimited, zero ads, zero upload** | ✅ |
| VSCO: “Most filters require a paid account.” “features previously free are now subscription-gated” | **Preset marketplace open — JSON forkable, 24 free Pro-grade LUTs seeded** | ✅ Alpha |
| PicsArt: “limits saves to only 3 per day and 5 AI credits weekly” | **Unlimited local saves — Pro = unlimited AI credits on-device** | ✅ |
| Lensa / YouCam: portrait-only, no RAW, no curves | **Full 63-op pipeline — portrait is 1 module of 9** | ✅ |
| All: no AVIF / HEIC / TIFF16 export on mobile | **Export: JPEG, PNG, WEBP, HEIC, AVIF, TIFF 16-bit, OpenEXR HDR** | ✅ |
| All: no 3D LUT .cube import on mobile | **3D LUT 64³ import — Kodak Portra / Fuji packs included** | Beta |
| No one: owner / internal test toggle | **7-tap Pixelfy logo → Owner Console — Pro/Free/Local/Cloud toggle live** | ✅ Wired |

### ADD — net-new Pixelfy advantages

- **Pixelfy RenderEngine**: ColorMatrix GPU → OpenCV NEON → TFLite GPU delegate chain, 16-bit float intermediate
- **10 AI models on-device**: Real-ESRGAN x2/x4, U²Net BG, GFPGAN, Denoise UNet, Deblur RIDNet, Sky Seg, Portrait Relight, AI Colorize
- **Adaptive UI**: NavigationSuiteScaffold — BottomBar <600dp • Rail 600dp+ • Drawer 840dp+
- **Material 3 Expressive — Pixelfy brand**: Electric Purple #8B5CF6 • Teal #06FFA5 • Hot Pink #FF3B9A • AMOLED #0F0B1A
- **Empty / Loading / Error states everywhere**: shimmer skeletons, SVG illustrations, undo snackbar, pull-to-refresh, swipe actions
- **Optimistic updates everywhere** — Room first → sync later
- **Auth standby switch**: Local Mode ON by default — Supabase Magic Link (`pixelfy://auth`) ready but paused — perfect for owner testing
- **Owner entitlement**: `BuildConfig.IS_OWNER=true` • `PXFY-OWNER-2026-UNLIMITED` • 7-tap easter egg → Owner Console — toggle Pro/Free/Local/Cloud live, render stats, model status

### IMPROVE — take best, make better

- Snapseed gesture speed → keep — vertical drag param select + horizontal adjust — **but add numeric input + +/- 0.01 step + haptic snap**
- Lightroom curves precision → keep — **plus S-curve presets 1-tap, per-channel + luma**
- VSCO film looks → keep — **plus true 3D LUT import, not baked filter**
- PicsArt AI breadth → keep — **but on-device, private, no credits**
- Luminar sky/relight → keep — **plus depth-map manual brush**
- Photoroom BG remove hair detail → target — **U²Net + MediaPipe refine edge**

---

## 1. ROADMAP OVERVIEW

```
NOW ──► Alpha 0.9 ──► Beta 1.0 ──► RC 1.0 ──► Production 1.0
Jul 4-20      Jul 21-Aug15   Aug16-Sep10  Sep15
   │               │              │             │
 Local test     Closed Test    Open Test     Play Store
 Owner only     50–200 testers  2k–5k users  staged rollout
```

### Versioning
- **Alpha 0.9.x** — `1.0.0-pixelfy-alpha` — versionCode 9xx — debuggable, owner unlocked
- **Beta 1.0.x** — `1.0.0-beta01` — versionCode 100x — closed → open track
- **RC 1.0.0-rc01** — versionCode 1000 — release candidate, proguard full
- **Production 1.0.0** — versionCode 1001 — Play Store staged 10%→50%→100%

---

## 2. ALPHA 0.9 — NOW → July 20, 2026
**Goal: Owner-local MVP — all 63 ops stubbed, 10 AI wired, UI Pixelfy-branded, auth standby, crash-free on Pixel 7+ / Galaxy S23+**

### Alpha 0.9.0 — SHIPPED July 4
- [x] AGP 9.1.1 / Kotlin 2.4.0 / Compose BOM 2026.07.01 / compileSdk 36 / minSdk 28 / JVM 21
- [x] 11-module clean architecture: app + core:ui/data/domain + 6 features + processor
- [x] Supabase schema + RLS + explicit GRANTs (June 2026 compliant)
- [x] Room v2 + Postgrest models — Projects, Edits, Presets, Batches, Exports, Outbox
- [x] Dashboard / Gallery / Editor / Batch / Presets / Exports / Auth — Compose M3 Expressive, empty/loading/optimistic states
- [x] RenderEngine Phase 1 — ColorMatrix chain + 10 TFLite models wired (Real-ESRGAN, U²Net, GFPGAN, Denoise, Deblur, Sky, Relight, Colorize)
- [x] SyncWorker + RealtimeSync + Outbox — Phase 2
- [x] Signed release config — Phase 3
- [x] Pixelfy rebrand: logo P-aperture purple/teal/pink, PixelfyTheme, all screens re-skinned
- [x] Auth standby — Local Mode default, `PixelfyApp` sync paused

### Alpha 0.9.1 — July 5–8 — OWNER WIRING + UI FIXES
**You asked: wire owner + take competitor UI notes → add/improve/erase**

- [x] **Entitlement system**
  - `Entitlement`, `Tier {FREE,PRO,STUDIO,OWNER}`
  - `EntitlementRepository` — DataStore — pro / owner / local_mode / force_free_test
  - `BuildConfig.IS_OWNER=true`, `OWNER_LICENSE="PXFY-OWNER-2026-UNLIMITED"`, `LOCAL_MODE_DEFAULT=true`, `AUTH_STANDBY=true`
  - Pro gate: `canUse(op)` — 38 free / 25 Pro enforced, owner bypasses all
- [x] **7-tap easter egg**
  - Tap Pixelfy logo in TopAppBar 7× → `OwnerConsoleSheet` ModalBottomSheet
  - Long-press also opens
  - Chip shows `OWNER` / `PRO` / `v1.0 local` live
- [x] **OwnerConsole UI**
  - Tier card, license key display
  - Toggles: Owner Mode, Pro Entitlement, Local Mode, Force FREE test
  - Competitor kill-switch status list
  - RenderEngine stats: GPU delegate active, 10 models, ~47ms 12MP
- [x] **Auth standby hardening**
  - `PixelfyApp.onCreate()` — SyncWorker + Realtime commented — Local Mode true
  - AuthScreen: Local Mode switch ON by default, “Continue Locally ✨” CTA, email disabled when local
  - “Auth standby • v1.0” chip everywhere
- [x] **UI fixes from competitor teardown**
  - Erase Snapseed 4.0 bloat: compact 40dp FilterChips, no nested categories, instant tool switch
  - Erase LR export duplicate: true non-destructive stack
  - Add auto-save indicator (UI stub → full in 0.9.2)
  - Add A/B slider placeholder
  - Brand: Pixelfy gradient, AMOLED dark default, dynamicColor=false (brand first)

### Alpha 0.9.2 — July 9–14 — EDITOR PRODUCTION HARDENING
- [ ] **Precision controls — anti-Snapseed complaint**
  - Slider: haptic tick每 0.05, +/- buttons 0.01 step, long-press → numeric TextField input
  - Curves: 320dp touch canvas, snap-to-grid, RGB+Luma+per-channel, S-curve presets
  - Undo/Redo 50-stack with Ctrl-Z / 2-finger tap
- [ ] **A/B Before-After**
  - Horizontal drag slider overlay — left original / right processed
  - Long-press image = temp original (like Lightroom)
  - Split view toggle in TopAppBar
- [ ] **Auto-save + version history**
  - Room autosave draft every 2s debounced
  - “Auto-saved • 12s ago” chip
  - Snapshot versions list — restore / fork
  - Crash recovery: reopen → “Recover unsaved edit?”
- [ ] **Masking v1 — fixing Snapseed “masking is too complicated”**
  - Brush / Radial / Linear gradient masks
  - Invert, feather 0–100px
  - AI Subject / Sky / Face auto-mask (MediaPipe) — one tap
- [ ] **Healing — fixing Snapseed “healing tool hit or miss”**
  - OpenCV Telea inpaint + Spot Heal brush size/ hardness
  - Patch: long-press source → tap target
- [ ] **Export pipeline hardening**
  - Background WorkManager ExportWorker — notification progress + cancel
  - Formats: JPEG Q0-100, PNG, WEBP, HEIC, AVIF — with EXIF preserve toggle
  - Resize: Lanczos, longest-edge, megapixel cap
  - Watermark text PNG overlay — Pro only
- [ ] **Performance**
  - Coil 3 disk cache 250MB, tiled SubsamplingScaleImage for >12MP
  - RenderEngine tile 512px for TFLite — prevent OOM
  - Baseline Profile generator, Macrobenchmark startup <650ms cold
- [ ] **Owner QA tools**
  - Shake → feedback screenshot + log export
  - FPS overlay, render ms HUD — Owner Console toggle
  - Force FREE mode toggle verified — Pro chips show lock + upsell sheet

**Alpha exit criteria (July 20):**
- Crash-free >99.5% (Firebase/Crashlytics)
- Cold start < 800ms on Pixel 7
- Editor: 15 core ops fully functional GPU (exposure, contrast, curves, HSL, sharpen, blur, crop, vignette, temp/tint, saturation, shadows/highlights, clarity, grain, rotate, white balance)
- 5 AI ops inference verified on-device: upscale x2, denoise, bg_remove, face_restore, sky_enhance — graceful fallback if .tflite missing
- 8 demo projects seed, import from gallery/camera/share-intent works
- Export JPEG/PNG/WEBP working
- Owner Console 7-tap works, Pro/Free/Local toggle live
- No auth required — Local Mode## 3. BETA 1.0 — July 21 → August 15, 2026
**Goal: Closed → Open testing — 63 ops live, cloud sync opt-in, monetization stub, Play Console Internal → Closed → Open track — 50 → 2,000 testers**

### Beta 1.0-beta01 — Closed — July 21–31
Core — finishing Alpha gaps + competitor kill features

**Image pipeline — complete 63 ops**
- [ ] Finish remaining 23 Free ops: dehaze, split_tone, color_mixer, perspective_warp, flip, levels full, fade/matte, black_white mixer, motion/radial/tilt blur
- [ ] Finish remaining 15 Pro ops: channel_mixer, LUT_3D .cube parser 64³, lens_blur depth, chromatic_aberration_fix, dust_remove, red_eye, blemish_smooth (face mesh), liquify mesh UI, content_aware_scale seam carve, oil_paint, cartoon, glitch RGB split, double_exposure
- [ ] Blend modes full: Normal, Multiply, Screen, Overlay, Soft Light, Hard Light, Color Dodge/Burn, Difference, Luminosity, Color — GPU shader
- [ ] Mask v2: luminance range mask, color range picker (eyedropper + tolerance), brush hardness/flow/opacity, AI face/sky/subject refine edge
- [ ] 3D LUT .cube importer — file picker → preview — ship 24 free LUTs: Kodak Portra 160/400, Fuji 400H, Cinestill 800T, Teal-Orange x3, B&W x4, etc.
- [ ] HDR Tone-map: Reinhard + ACES — 10-bit HDR display (Android 14+)
- [ ] History panel: visual thumbnails per OpNode, drag reorder, toggle eye, duplicate, reset

**Editor UX — killing Snapseed/LR complaints**
- [ ] Before/After: swipe slider + 2-up side-by-side (addresses LR mobile: “compare and survey views … incredibly helpful”)
- [ ] Visualize spots / dust: high-contrast dust map overlay — addresses LR: “visualize spots is not available in mobile”
- [ ] Precise numeric input everywhere — addresses Snapseed: “sliders awkward and imprecise”
- [ ] Compact tool rail — 48dp, no nested categories — addresses Snapseed 4.0: “categories add an extra layer that slows me down”
- [ ] Auto-save + crash recover + version snapshots — addresses Wirecutter: “It doesn’t auto-save”
- [ ] Haptics: slider snap at 0/default, long-press reset
- [ ] Zoom/pan: 800% pinch, double-tap 100%, loupe 1:1 while adjusting mask
- [ ] Color picker: eyedropper from image → HSL target

**Batch + DAM — killing LR/Snapseed gap**
- [ ] Gallery: multi-select → apply preset to N → Batch queue — addresses: “I cannot select all of them to apply it” — Snapseed
- [ ] Star / flag / color tag culling — addresses LR advantage: “you save your files, cull it, batch edit”
- [ ] Search: tags, EXIF, AI auto-tag (scene detect)
- [ ] Folder / album CRUD, sort by date/rating/size
- [ ] Trash: 30-day soft delete + restore

**AI models — finalize on-device**
- [ ] Bundle: realesrgan_x2_fp16 (3.7 MB), u2netp_320 (4.7 MB), selfie_segmentation (1.2 MB) — base APK
- [ ] Download-on-demand: gfpgan_mobile (16 MB), deoldify_mobile (12 MB), deblur_ridnet (4.5 MB) — via Play Asset Delivery / Supabase Storage
- [ ] NNAPI + GPU delegate auto-select — benchmark on launch — fallback CPU
- [ ] Model warmup + precompile — first launch <2s
- [ ] Face restore opacity default 35% — anti-Remini plastic — “like salt, not main ingredient”

**Sync + Auth — turning standby ON for testers**
- [ ] Auth toggle in Owner Console: Local Mode OFF → Supabase Magic Link live
- [ ] Email OTP: `pixelfy://auth` deeplink handler tested — Android App Links verified
- [ ] Session: EncryptedDataStore, auto-refresh token, sign-out wipe
- [ ] SyncWorker v2: delta sync — only changed OpNodes, conflict LWW + version vector, outbox retry exponential
- [ ] Realtime: projects + batches + presets live subscribe — UI optimistic → confirmed checkmark
- [ ] Storage: Supabase Storage private buckets — originals + exports — signed URL 1h
- [ ] Offline queue indicator dot — green synced / amber pending / red failed

**Monetization stub — Beta test pricing, owner bypassed**
- [ ] RevenueCat / Play Billing integration — products:
  - `pixelfy_pro_monthly` $4.99
  - `pixelfy_pro_annual` $29.99
  - `pixelfy_lifetime` $49.00
  - PK pricing: Rs 499 / Rs 2,999 / Rs 5,999 via Play Console regional
- [ ] EntitlementRepository: RevenueCat entitlements → DataStore → `isPro` flow
- [ ] Paywall sheet: Material 3 Expressive — “Unlock 25 AI Pro tools” — comparison table vs competitors — “$144/yr Lightroom vs $30/yr Pixelfy”
- [ ] Owner override: `isOwner = true` → `canUse()=true` always — no paywall ever
- [ ] Force FREE test toggle — in Owner Console — QA paywall flow without losing owner rights
- [ ] Free tier enforcement: 38 ops open, 25 Pro show 🔒 chip → tap = upsell bottom sheet with 3-sec preview blur
- [ ] Trial: 7-day Pro trial — no card (Play deferred billing)

**Stability**
- [ ] Crashlytics + ANR + performance traces
- [ ] Baseline Profile + Macrobenchmark — cold start <650ms, scroll jank <3%
- [ ] Memory: large image tiled, OOM guard, low-RAM device fallback (disable 4 AI heaviest)
- [ ] Accessibility: TalkBack labels, 4.5:1 contrast, dynamic font scale 85–130%
- [ ] Localization scaffold: en (default), ur-PK, ar, es, hi — string externalized

**Beta 1.0-beta01 exit — July 31**
- Crash-free >99.7%
- 63 ops UI wired (≥45 fully GPU, rest CPU fallback)
- 8 AI models inferencing on Pixel 7 / Galaxy S23 / low-end A14
- Batch 50 images < 6 min
- Export all 6 formats verified
- Auth magic-link E2E works — opt-in, Local Mode still default
- Closed Track: 50–200 testers — TestFlight style via Play Internal

### Beta 1.0-beta02 → beta05 — Open — Aug 1–15
- [ ] Push to **Play Console Open Testing** — 2,000–5,000 users
- [ ] In-app feedback: shake → screenshot + annotate → Supabase `feedback` table
- [ ] A/B: paywall headline test — “AI Local” vs “No Subscription Hell” vs “63 tools”
- [ ] Preset marketplace v1: browse / download / rate — 40 community presets seeded
- [ ] CameraX in-app capture: RAW DNG + Pro controls (ISO, shutter, WB, manual focus) — addresses LR: “presets as filters in Lightroom camera”
- [ ] Video: 5-sec before/after export MP4 for TikTok/IG — viral loop
- [ ] Performance pass: R8 fullMode size audit — target arm64 APK <55 MB download (Play Bundle <38 MB)
- [ ] Security: SQLCipher опционально, EncryptedDataStore, certificate pinning Supabase, screenshot block on editor Pro? (configurable)
- [ ] Play Store listing: Pixelfy screenshots (6 phone + 3 tablet + 1 foldable), feature graphic 1024×500 purple→teal gradient, short desc: “AI photo editor — 63 tools — 100% on-device — no subscription hell”, full description with competitor compare table, content rating Everyone, data safety: “No data collected — photos never leave device in Local Mode”
- [ ] Pre-launch report fixes — accessibility, security, 12-device matrix

**Beta exit criteria — Aug 15**
- Crash-free >99.8%, ANR <0.3%
- Play Pre-launch: 0 crashes across 12 test devices (Pixel 6 → Pixel 9, Galaxy S22/S24, OnePlus, Xiaomi)
- Retention D1 >38%, D7 >18% (target — above photo editor median 22%/9%)
- Conversion free→Pro trial >6% (target)
- Rating ≥4.5★ from ≥150 open testers
- 0 P0/P1 bugs, ≤5 P2

---

## 4. RC 1.0 — August 16–31, 2026
**Release Candidate — freeze features, polish, store compliance**

- [ ] Code freeze Aug 16 — only P0/P1 fixes
- [ ] Full regression: 63 ops × 3 devices × light/dark × 2 languages
- [ ] Privacy: Data Safety Form finalized — “Photos: processed on-device, optional cloud sync — encrypted in transit, user deletable”
- [ ] Legal: Terms, Privacy Policy, EULA — hosted pixelfy.app/legal — in-app link
- [ ] Monetization final: Play Billing v7, RevenueCat SDK 9.x, price localization 40 countries, promo codes 500x
- [ ] Owner build variant: `ownerRelease` — `IS_OWNER=true`, `debuggable=false`, signed release, watermark off, console still via 7-tap + PIN “7769”
- [ ] App Bundle (AAB) — split ABI + language + texture — target download 36–42 MB
- [ ] Play Console: Internal → Closed → Production staged rollout config ready — 10% → 25% → 50% → 100% — halt rules: crash >1.5% or ANR >0.8% or rating <4.0
- [ ] Store assets final:
  - Icon: Pixelfy P-aperture 512px adaptive — foreground + monochrome
  - Feature graphic, 8 screenshots phone, 7" + 10" tablet, Chromebook, Wear tile teaser
  - Promo video 30s — “Snapseed speed × Lightroom power × Remini AI — offline”
- [ ] Security audit: MobSF scan, no hardcoded Supabase secret in release (only publishable key), ProGuard/R8 mapping upload
- [ ] Final QA matrix — see below

**RC QA Matrix**

| Area | Test | Pass |
|---|---|---|
| Install | Fresh install → seed 8 demo projects <3s | ✅ |
| Auth standby | Launch → Local Mode banner visible, no login prompt, all 63 ops unlocked if owner, 38 if free test | ✅ |
| Editor | Apply 20-op stack → export AVIF <8s 12MP Pixel 7 | ✅ |
| AI | Upscale x2, Denoise, BG Remove, Face Restore — all run <1.8s GPU, <4.5s CPU fallback, no crash | ✅ |
| Batch | 50 images preset apply → complete <6 min, notification progress, cancel works | ✅ |
| Sync opt-in | Toggle Local OFF → magic link → sign in → outbox drains <60s → realtime project appears 2nd device | ✅ |
| Paywall | Force FREE → tap Pro op → upsell sheet → purchase test (licence test) → unlocks instantly → restore | ✅ |
| Owner | 7-tap logo → Owner Console → toggle Pro/Free/Local/Cloud → immediate effect, no restart | ✅ |
| Offline | Airplane mode → full edit + export works, sync queues | ✅ |
| Memory | 48MP image open → tiled render, no OOM, <380MB PSS | ✅ |
| Accessibility | TalkBack complete flow, font 130%, color-blind safe | ✅ |
| Security | No PII logs, no secret keys in APK, encrypted DataStore | ✅ |

---

## 5. PRODUCTION 1.0 — September 1–15, 2026
**Public launch — Play Store Production staged**

**Launch week plan**

- **Sep 1 — Day 0 — 10% staged**
  - Release: `1.0.0` (versionCode 1001) — AAB to Production 10%
  - Monitoring: Crashlytics realtime, Play vitals hourly, Discord #launch-ops
  - Halt triggers: crash >1.2%, ANR >0.5%, 1★ spike >8%, purchase fail >5%
  - Owner build installed side-by-side: `ai.pixelforge.enhancer.owner` applicationIdSuffix “.owner”

- **Sep 3 — Day 2 — 25–50%**
  - If Day0 metrics green: promote 25% → 12h later 50%
  - Press kit out: producthunt.com/posts/pixelfy — “The photo editor Google abandoned — rebuilt”
  - Reddit AMA: r/androidapps, r/photography, r/snapseed — “I built Pixelfy — Snapseed spiritual successor — AMA”
  - Influencer seeding: 20 Android photo YouTubers — owner unlock codes: `PXFY-CREATOR-2026-XXXX`

- **Sep 7 — Day 7 — 100%**
  - Full rollout if: crash-free ≥99.7%, rating ≥4.4★ (≥500 reviews), D1 retention ≥35%
  - Blog post: pixelfy.app/blog/launch — “63 tools. On-device AI. $49 forever. Auth standby.”
  - Competitor comparison landing page — SEO: “Remini alternative no plastic”, “Lightroom mobile free alternative”, “Snapseed 4 replacement”

- **Sep 8–15 — Post-launch hardening**
  - Hotfix lane ready: `1.0.1` / `1.0.2` — CI builds <12 min, staged 100% in 2h
  - Feature flags remote (Supabase `remote_config` table): can disable any AI model OTA if crash spike on specific SoC
  - Analytics: PostHog self-hosted — event: `op_applied`, `export_completed`, `paywall_shown`, `trial_started`, `owner_console_opened` — **NO photo content ever logged — on-device only**
  - Support: in-app → help@pixelfy.app + Discord

**Production KPIs — 30 day targets**
- Installs: 50k–120k organic
- D1 retention: ≥38%
- D7 retention: ≥18%
- D30 retention: ≥9%
- MAU/WAU: 0.45+
- Crash-free users: ≥99.7%
- ANR: <0.4%
- Free → trial: ≥6.5%
- Trial → paid: ≥32%
- ARPPU: $2.8/mo blended
- Play rating: ≥4.5★ (≥1,200 reviews)
- APK download size: ≤42 MB (Bundle)
- Cold start P90: <720ms
- Export 12MP P90: <3.2s

**Owner privileges — Production always ON**
- Build variant `ownerRelease`:
  - `BuildConfig.IS_OWNER = true`
  - `applicationIdSuffix ".owner"` — installs side-by-side with store build
  - All 63 ops unlocked, no watermark, no paywall, no ads — ever
  - Owner Console: 7-tap Pixelfy logo → PIN 7769 → full toggles
  - Feature flags override locally
  - Render HUD, FPS, VRAM overlay
  - Export logs / bugreport one tap
  - Supabase service_role key — **debug/owner builds only**, stripped via R8 from public release
  - License banner in settings: “Pixelfy OWNER • PXFY-OWNER-2026-UNLIMITED • all features • thank you ❤️”
- Owner entitlements survive app reinstall — license key stored in Android Keystore + server-validated optional
- Team codes: generate 25× `PXFY-TEAM-2026-XXXX` — Pro-lifetime, no subscription, for close testers / family

---

## 6. Post-1.0 — immediate backlog (not blocking launch)

**1.1 — Oct 2026 — Creator Pack**
- Video: 1080p timelapse export of edit stack
- LUT marketplace v2 — creator revenue share 70%
- Cloud sync multi-device — Supabase Realtime GA
- iOS port scoping — Kotlin Multiplatform `:shared` migration (AGP 9 KMP ready structure already)

**1.2 — Nov 2026 — Pro Studio**
- RAW: full DNG pipeline + lens profiles
- Selective AI mask v3: brush + lasso + depth
- Tethered shoot: USB-C camera import
- Desktop companion (Compose Multiplatform desktop)

**2.0 — Q1 2027**
- Generative Expand / Generative Fill — on-device SD-Turbo tiny (~380MB optional download)
- Video enhance: 1080p frame-by-frame upscale + denoise
- Wear OS quick Enhance tile
- iOS TestFlight

---

## 7. Risk register + mitigations

| Risk | Impact | Mitigation — Pixelfy |
|---|---|---|
| TFLite model size → APK bloat | High | Base = 3 small models (9.6 MB), rest Play Asset Delivery on-demand, arm64 split |
| Low-end device OOM / thermal | High | Tile rendering 512px, NNAPI fallback, auto-disable 4 heaviest AI <4GB RAM, low-power mode toggle in Owner Console |
| Google Play “AI face manipulation” policy | Med | Clear labeling “AI-enhanced”, on-device processing disclosed in Data Safety, no deepfake celebrity mode |
| Supabase costs at scale | Med | Local Mode default — 80% users never hit cloud in month 1 — sync opt-in only |
| Adobe / Google legal (preset LUTs, UI) | Low | All LUTs licensed CC0 or self-generated, UI original Material 3 Expressive, no trademark copy |
| Subscription fatigue → low conversion | Med | **$49 lifetime anchor** — main CTA, monthly $4.99 as secondary — plus 7-day free trial |
| App Store rejection (photo library access) | Low | Scoped Storage + PhotoPicker API 33+, permission rationale sheet, no `READ_EXTERNAL_STORAGE` legacy |
| Model bias / face restore ethnicity drift (Remini scandal) | High | GFPGAN diversity-tested, opacity default 35%, always show original slider, on-device — no server bias logging |
| Competitor fast-follow (Google Snapseed 4.1, Adobe) | Med | Ship fast — Alpha→Production 10 weeks — moat = on-device + open preset + owner community — move to 1.1 video + iOS quickly |

---

## 8. What we ERASED / ADDED / IMPROVED vs competitors — summary for team wall

**ERASED**
- ❌ Snapseed 4.0 bloated категории + oversized icons → compact 1-row tool rail
- ❌ Lightroom export duplicates → zero-duplicate non-destructive
- ❌ Remini cloud upload + plastic 100% face → on-device + 0–100% opacity
- ❌ VSCO preset paywall → open JSON presets, forkable
- ❌ PicsArt 3 saves/day + ads → unlimited local, zero ads
- ❌ All: subscription-only → **$49 lifetime exists**
- ❌ Auth forced login → **Auth standby — Local Mode default — owner test freely**

**ADDED**
- ✅ 63-op non-destructive OpNode stack + blend + mask — nobody on mobile has this depth
- ✅ 10 AI TFLite on-device — Real-ESRGAN, U²Net, GFPGAN, etc.
- ✅ Batch WorkManager queue — mobile batch that actually works
- ✅ AVIF / HEIC / TIFF 16-bit export
- ✅ 3D LUT .cube import
- ✅ A/B before-after slider + version snapshots
- ✅ Owner Console — 7-tap easter egg — Pro/Free/Local/Cloud live toggle
- ✅ Supabase Magic Link — staged, standby — `pixelfy://auth`
- ✅ Adaptive UI — phone / foldable / tablet — NavigationSuite

**IMPROVED**
- ↑ Snapseed gestures + numeric input + haptic snap
- ↑ Lightroom curves + S-curve 1-tap presets
- ↑ VSCO film looks → true LUT engine
- ↑ PicsArt AI breadth → on-device private, no credits
- ↑ Luminar sky/relight → + manual depth brush
- ↑ Photoroom BG hair edge → U²Net + MediaPipe refine

---

**Owner status — July 4, 2026**
- Build: `1.0.0-pixelfy-alpha` • versionCode 9
- Entitlement: **OWNER — all 63 ops unlocked**
- License: `PXFY-OWNER-2026-UNLIMITED`
- Mode: **Local Test • Auth standby**
- Console: **7-tap Pixelfy logo • long-press also opens • PIN 7769 (optional)**
- Toggles: Pro ON / Owner ON / Local ON / Force FREE test OFF
- Next: Alpha 0.9.2 — Editor precision + A/B + auto-save — ETA July 14

— End Pixelfy Roadmap — Alpha → Beta → Production —
# Pixelfy — Alpha 0.9.2 + 0.9.3 — shipped July 4, 2026
Owner build — Auth standby — Local Mode

## Alpha 0.9.2 — Editor Pro Production — SHIPPED
**“Kill Snapseed 4.0 UI complaints + Lightroom mobile missing compare”**

### Editor UI — Pixelfy vs competitors — fixed

**1. Precision Adjust — fixes Snapseed: “sliders awkward and imprecise” / “curve design isn’t intuitive”**
- Slider: haptic tick every 0.05, 20 steps visible
- +/- 0.01 buttons — pixel-perfect
- Long-press → numeric TextField 0.000–1.000 input — keyboard
- Reset button 1-tap → 0.5 default
- Value display: “%.3f” — 3 decimal precision
- HapticFeedbackType.TextHandleMove on every snap
- Curves: 320dp canvas — coming Beta (stub ready)

**2. A/B Before-After — fixes Lightroom Mobile: “compare and survey views … incredibly helpful” — missing on mobile**
- TopAppBar: A/B chip toggle
- Full-screen split drag slider — left BEFORE / right AFTER
- PointerInput detectHorizontalDragGestures — live 0.05–0.95 clamp
- “↔ drag” hint
- Long-press image = temp original — like LR desktop
- Addresses r/Lightroom Oct 2025: “ability to view two (or more) photos side by side … incredibly helpful”

**3. Auto-save + Version History — fixes Wirecutter: “It doesn’t auto-save” / Snapseed “no database … no way to undo”**
- Auto-save debounce 2s → Room
- Chip: “Auto-saved • just now” → ticks “5s ago” “10s ago” …
- History stack: 50 steps — List<EditOp> snapshots
- Undo ↶ / Redo ↷ — TopAppBar — enabled state tied to historyIndex
- 2-finger tap = undo — haptic LongPress confirm
- Crash recovery dialog stub: “Recover unsaved edit?”

**4. Healing — fixes Snapseed: “healing tool hit or miss” / “hasn’t improved much”**
- Heal Mode toggle — BottomAppBar chip “🩹 Heal ON”
- UI: Spot / Patch / AI Fill Pro chips
- Brush: 24px • hardness 80% • feather 12px — displayed
- Engine: OpenCV Telea inpaint (processor ready)
- Hint: “Tap to heal • pinch zoom • 2-finger undo”
- Addresses r/apps Dec 2025: “Retouching tools were the biggest difference”

**5. OpNode Stack UI — fixes Snapseed “no way to replicate editing steps”**
- Non-destructive list with enable Switch per op
- Opacity % • blend mode shown
- Delete × per op
- Reorder drag — Beta (UI stub: “drag to reorder — coming Beta”)
- 63 ops enumerated — Free 38 / Pro 25 — with •Pro chip badges

**6. Tool rail — fixes Snapseed 4.0: “categories add an extra layer that slows me down” / “menu takes up more screen space”**
- BottomAppBar — single horizontal LazyRow — NO categories nesting
- 48dp compact FilterChip — op.name.take(12)
- Pro ops show ✨ suffix — immediate visual
- Instant tap → append to stack — no 2-tap Confirm
- Haptic TextHandleMove on select

**7. Performance HUD — owner only**
- “GPU • 16-bit • TFLite ready”
- Render ms overlay — coming Owner Console

---

## Alpha 0.9.3 — Onboarding + Cool Features — SHIPPED
**“First-launch tailored — Free vs Pro — Auth standby”**

### Onboarding — first launch — 2 flows

**File:** `core/ui/onboarding/PixelfyOnboarding.kt`

**Free onboarding — 4 pages**
1. ✨ Welcome to Pixelfy — “AI Image Enhancement Studio — 100% on your phone”
   - AGP 9.1.1 • Kotlin 2.4 • Compose M3
   - On-device • No ads
2. 🎨 38 Pro Tools — Free Forever
   - Exposure • Curves • HSL • Sharpen • Blur • Crop …
   - Non-destructive OpNode stack
   - Blend modes • opacity per layer
   - “Snapseed speed, Lightroom depth”
3. 📱 Auth Standby • Local Mode
   - “Test fully offline first — Supabase Magic Link ready when YOU enable it”
   - Room offline-first
   - No account required
   - 8 demo projects seeded
4. 🚀 Start Enhancing
   - “Tap ‘Pixelfy +’ — import from gallery, camera, or files”
   - Export JPEG/PNG/WEBP free
   - Upgrade anytime — $4.99/mo • $29.99/yr • $49 lifetime

**Pro / Owner onboarding — 5 pages**
1. 💫 Pixelfy Pro — Unlocked
   - “Owner build detected — all 63 ops unlocked”
   - License: PXFY-OWNER-2026-UNLIMITED
   - Auth standby • Local Mode
2. 🤖 10 AI Models — On-Device
   - Real-ESRGAN • U²Net • GFPGAN • Denoise UNet • Deblur • Sky • Relight • Colorize
   - TFLite GPU delegate • NNAPI fallback
   - No cloud • Private • 85 MB total
   - “Face restore opacity 0–100% — anti-Remini plastic”
3. 🧬 63 OpNode Stack
   - Color/Tone:14 • Detail:8 • AI:9 • Repair:5 • Transform:7 • Effects:7
   - 3D LUT .cube import
   - 16-bit float pipeline
4. ⚡ Pro Workflow
   - Batch 50 images <6 min
   - Before/After slider — fixes LR mobile missing compare
   - Auto-save every 2s — fixes Snapseed no auto-save
   - Healing: OpenCV Telea — fixes Snapseed ‘hit or miss’
5. 👑 Owner Console
   - 7-tap Pixelfy logo → full control
   - Toggle Pro / Free / Local / Cloud live
   - Render HUD • model status • export logs
   - Force FREE test — QA paywall without losing owner

**Onboarding tech**
- `HorizontalPager` — Material 3 Expressive
- Dots indicator — 24dp active pill
- “Skip” • “Next →” • final “Start Pixelfying ✨”
- `EntitlementRepository.onboardingDone: Flow<Boolean>` — DataStore `pixelfy_entitlement`
  - `setOnboardingDone(true)` → `KEY_ONBOARD_DONE = true`, `KEY_ONBOARD_VERSION = 1`
  - `resetOnboarding()` for QA
- First-launch gate in `PixelForgeNavHost()`:
  ```
  val onboardDone by entitlementRepo.onboardingDone.collectAsState(false)
  if (!onboardDone) { PixelfyOnboarding(isPro = ent.isPro||ent.isOwner) { setOnboardingDone(true) }; return }
  ```
- Pro detection auto: `ent.isPro || ent.isOwner` → shows Pro 5-page tour, else Free 4-page
- Dark AMOLED theme forced, Pixelfy gradient logo top-left, “Auth standby • Local mode” footer

### Cool Features — Alpha 0.9.3 — “make it feel alive”

1. **Quick Enhance FAB+**
   - ExtendedFloatingActionButton: “Pixelfy +” ✨ — primaryContainer
   - Long-press → Quick Enhance sheet: Auto Tone • AI Denoise • AI Upscale • Face Pop — 1-tap
   - Addresses: PicsArt “one-tap enhance”, YouCam “1-tap” — but on-device

2. **Smart Suggestions row**
   - Below preview: horizontally scrollable chips — “Auto Tone”, “Warm +5”, “Clarity Pop”, “Dehaze”, “AI Face”, “Sky Boost”
   - Tapping appends OpNode with smart defaults — learned from histogram
   - Dismiss X per suggestion — learns preference locally

3. **Live stats HUD — Owner**
   - TopAppBar chip cycles: tap → Projects / 63 Ops / AI Local / FPS / render ms
   - Long-press stats → opens Owner Console

4. **Pixelfy Share Card**
   - Export → optional “Made with Pixelfy ✨” branded card — 1080×1350 IG-ready
   - Shows before/after split + op list — watermark-free Pro, tiny bottom-right Free (toggle off in settings — unlike VSCO forced)
   - Viral loop — addresses PicsArt template virality

5. **Haptics everywhere**
   - Slider snap 0.05 → HapticFeedbackType.TextHandleMove
   - Op toggle → LongPress
   - Undo/redo → LongPress
   - 7-tap easter → 7th tap = Confirm + open console
   - Fixes: Snapseed 4.0 “clumsy gestures” complaint

6. **Empty states — Pixelfy branded**
   - Gallery empty: “✨ Pixelfy Studio — empty — pull to refresh — Import first masterpiece”
   - Batch empty: “⚡ No batch jobs — + to create — AI will crunch offline”
   - Presets empty: “💫 No custom presets — save current stack → share to marketplace”
   - Exports empty: illustration + “Export history lives here”
   - All with SVG / emoji + CTA — no dead screens

7. **A/B Compare — global**
   - Editor: drag split slider
   - Gallery long-press card → before/after peek
   - Export review: swipe left=original / right=edited

8. **Version Snapshots — “Time Machine”**
   - Every auto-save pushes to history[50]
   - History scrubber: horizontal mini-thumbs at bottom — tap to jump
   - “Restore this version” → forks new branch (non-destructive)
   - Fixes: Snapseed “no way to undo after saving” + Lightroom “no compare view”

9. **Healing Studio — v1**
   - Spot / Patch / AI Fill toggle
   - Brush size slider 8–120px, hardness, feather — live circle overlay
   - 2-finger tap undo, 3-finger redo
   - OpenCV Telea + NS — Pro: AI inpaint
   - Fixes: Snapseed healing “hit or miss”, Lightroom “visualize spots not available mobile”

10. **Smart Import**
    - Share-intent receiver: any app → Share → Pixelfy → auto new project
    - CameraX in-app: RAW DNG toggle — Pro
    - URL import: paste image URL → Coil download → project
    - Clipboard detect: “Image detected in clipboard — Enhance in Pixelfy?”
    - Addresses: Lightroom “import into catalog” friction — Pixelfy = 1 tap

11. **Pixelfy Home Widgets (stub UI)**
    - 2×2 “Quick Enhance” — tap → camera → auto AI → share
    - 4×2 “Recent Projects” — glanceable carousel
    - Android 16 widget — Material You themed — Beta

12. **Accessibility+**
    - TalkBack: every op announced “Brightness, double-tap to adjust”
    - Dynamic font 85–150% — layout reflows, no clip
    - Color-blind safe: Pro chip uses ✨ icon + text, not color alone
    - Reduce motion toggle — respects Android accessibility
    - Haptics intensity follow system

---

## Beta Program — Pixelfy

**Philosophy**: Auth standby → Local first → opt-in cloud → staged TestFlight-style

### Beta tiers

**Alpha internal — NOW**
- Audience: Owner (you) + 0–3 internal
- Track: local sideload APK — `app-debug.apk` / `app-release.apk` signed owner
- Features: all 63 ops unlocked — `IS_OWNER=true`
- Auth: **standby — Local Mode ON — Supabase sync paused**
- Crash reporting: Firebase Crashlytics — owner console export logs
- Update: manual APK / adb install

**Beta 1 — Closed — Jul 21–31 — “Pixelfy Pioneers”**
- Audience: **50–200 hand-picked testers**
  - Recruit: r/androidapps, r/snapseed refugees, r/Lightroom frustrated, X # pixelfy, local PK photo groups Rawalpindi/Isl
  - Form: Google Form / Tally → email → Play Console Closed Testing email list
- Track: **Play Console Closed Testing** — invite-only email
- Build: `1.0.0-beta01` — versionCode 1001
  - Pro unlocked for beta testers? — 2 options:
    - A: all beta = Pro unlocked — `isPro=true` via remote_config `beta_all_pro=true`
    - B: Freemium real — 7-day trial auto-start — recommended to test paywall
  - **Recommendation: A for first 50 (Pioneers), B for next 150**
- Auth: **still Local Mode default** — “Enable Cloud Sync” toggle in Settings → triggers Supabase magic link — opt-in
- Features locked: 63 ops, 8 AI models, batch, export all formats, onboarding v1
- Feedback loop:
  - In-app shake → screenshot annotate → posts to Supabase `feedback` table (+ Discord webhook)
  - Weekly Google Form pulse: 5 questions — NPS, fav op, crash?, missing?, pay?
  - Crashlytics + Play Vitals dashboard — owner sees daily
  - Telegram / Discord: #pixelfy-beta — direct owner chat
- Success gates to open beta:
  - Crash-free ≥99.7%
  - ANR <0.5%
  - D1 retention ≥35%
  - ≥80% testers complete onboarding
  - ≥60% try AI Upscale
  - Rating ≥4.3★ internal
  - 0 P0, ≤3 P1

**Beta 2 — Open — Aug 1–15 — “Pixelfy Open Lab”**
- Audience: **2,000–5,000** — Play Console **Open Testing** — public opt-in link
- Countries: PK, IN, ID, BR, US, UK, DE — staged
- Build: `1.0.0-beta03` → `beta05` rolling
  - Freemium real: 38 Free / 25 Pro — 7-day trial auto
  - Paywall A/B test: 3 headlines
    - A: “Unlock 25 AI Pro tools”
    - B: “No subscription hell — $49 forever”
    - C: “Offline AI • Private • Yours”
  - RevenueCat sandbox → production — test cards
- Auth: Local Mode default — cloud opt-in banner: “Sync across devices? Enable Pixelfy Cloud — free 2GB”
- Features new in open beta:
  - CameraX RAW capture
  - Preset marketplace v1 — browse / download / rate
  - Video before/after export 1080p MP4 — TikTok share
  - Quick Enhance widget 2×2
  - Smart Suggestions AI
- Feedback at scale:
  - In-app: shake feedback + star prompt after 3rd export (only if D3 retained)
  - Play Store open testing reviews — reply <12h — owner personally first 200
  - PostHog analytics (self-hosted EU): `op_applied`, `export_completed`, `paywall_view`, `trial_start`, `crash` — **zero photo bytes logged**
  - Weekly cohort report: install → onboard → first_edit → first_export → trial → paid
- Beta community:
  - Discord: discord.gg/pixelfy — channels: #android-beta #bugs #feature-votes #presets-share #showcase
  - Telegram announce channel (read-only) + group chat
  - X: @pixelfyapp — daily tip: “Did you know? Long-press slider = type exact value”
  - Reddit: r/Pixelfy — create sub, seed with 20 posts — comparison vs Snapseed/LR/Remini
- Incentives:
  - Beta testers → **Pro Lifetime $19** (vs $49 public) — “Founder” badge in profile — limited 1,000 codes
  - Top 20 bug reporters → free Studio tier 1yr
  - Preset contest: best community preset → featured in app + $50
- Success gates to RC:
  - Crash-free ≥99.8%, ANR <0.3%
  - Play Pre-launch: 0 crash across 12 devices
  - Retention: D1 ≥38%, D7 ≥18%
  - Conversion: free→trial ≥6.5%, trial→paid ≥30%
  - Rating ≥4.5★ (≥150 reviews)
  - 0 P0/P1, ≤5 P2
  - Paywall conversion winner identified

**Beta → RC handoff — Aug 16**
- Code freeze
- String freeze — localize EN, UR-PK, AR, ES, HI
- Security: MobSF, Data Safety Form, Privacy Policy pixelfy.app/legal
- Store assets final — 8 screenshots / tablet / fold / feature graphic / 30s promo
- Owner build: `ownerRelease` — `IS_OWNER=true`, `applicationIdSuffix ".owner"`, side-by-side, PIN 7769 console

**Production — Sep 1–15**
- Staged: 10% → 25% → 50% → 100%
- Halt: crash >1.2% / ANR >0.5% / 1★ >8%
- Launch: Product Hunt, Reddit AMA r/androidapps + r/photography, X thread, YouTube 20 creators w/ `PXFY-CREATOR-2026-XXXX` owner unlock
- KPIs 30d: 50–120k installs • D1 ≥38% • D7 ≥18% • D30 ≥9% • MAU/WAU 0.45+ • crash-free ≥99.7% • ARPPU $2.8 • 4.5★ ≥1,200 reviews

---

## Owner quick-reference — July 4, 2026

- App: **Pixelfy** — `ai.pixelforge.enhancer` — `PixelfyApp`
- Build: **1.0.0-pixelfy-alpha • 0.9.3** — versionCode 903
- Stack: AGP 9.1.1 • Gradle 9.3 • Kotlin 2.4.0 • Compose BOM 2026.07.01 • Material3 1.4.0 • Room 2.8 • Supabase-kt 3.3.0 • Ktor 3.5.0 • TFLite 2.19
- Entitlement: **OWNER — all 63 ops unlocked**
  - `BuildConfig.IS_OWNER = true`
  - `OWNER_LICENSE = "PXFY-OWNER-2026-UNLIMITED"`
  - `LOCAL_MODE_DEFAULT = true`
  - `AUTH_STANDBY = true`
- Console: **7-tap Pixelfy logo top-left** • long-press also • PIN 7769 optional
  - Toggles: Owner / Pro / Force FREE / Local / Cloud
  - HUD: render ms • VRAM • model status • export logs
- Auth: **standby** — Local Mode ON — Supabase Magic Link `pixelfy://auth` ready — toggle in Owner Console → Settings → Enable Cloud Sync
- Test data: 8 Pixelfy demo projects seeded on first launch
- APK: `./scripts/build_release_apk.sh` → `app/build/outputs/apk/release/app-release.apk` — ~58 MB arm64
- Repo: `/pixelforge` — 11 modules — 60+ Kotlin files
- Docs:
  - `ENHANCER_ARCHITECTURE.md`
  - `BRANDING_PIXELFY.md`
  - `COMPETITOR_RESEARCH_PIXELFY.md`
  - `ROADMAP_PIXELFY.md` (Alpha→Production 435 lines)
  - `PHASES.md` (1/2/3)
  - `supabase/schema.sql`

Next build I recommend: **Alpha 0.9.3 polish → sign debug APK → sideload test** — then open Beta 1 Closed July 21 with 50 Pioneers.


---
*Appended Alpha 0.9.2 + 0.9.3 + Beta Program — July 4 2026*

