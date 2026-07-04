# PixelForge — Image Enhancement Suite
Full-Stack Android (Kotlin) + Supabase
Architecture v1 — July 3, 2026

## 0. Product thesis
PixelForge is a pro mobile image enhancement studio. Native Android APK first, with a Supabase-backed sync/dashboard. Offline-first GPU processing, with optional cloud AI upscale/denoise. Clean dashboard, sidebar nav on tablets, bottom nav on phones. Full CRUD for Projects, Presets, Batches, Exports. Magic-link auth.

Feels alive day-1 with 84 seeded demo edits.

---

## 1. Target & Toolchain — ZERO DEPRECATED — July 2026 latest

**Build system — all new AGP 9 DSL**
- Android Gradle Plugin: **9.1.1** (April 2026) — `com.android.application` with built-in Kotlin
  - AGP 9.0 Jan 2026 integrated Kotlin, androidComponents new Variant API only
  - `android.newDsl=true` default, legacy variant APIs removed in AGP 10 late 2026
- Gradle: **9.3.0** — configuration cache ON, isolated projects ready
- Kotlin: **2.4.0** stable (2.3.20 Mar 16 stable, 2.4.0-RC2 May, 2.4.20-Beta1 Jun 24)
  - K2 compiler ON by default, language +2.4
  - JVM target: **21** (Java 21 LTS, Java 26 preview supported)
- Android Studio: Narwhal Feature Drop | 2025.1.3 / Meerkat 2026.1
- compileSdk **36** (Android 16 / Baklava), targetSdk 36, minSdk **28** (supabase-kt requires 26+)

**UI — Compose First, May 2026 Google mandate**
- Compose BOM: **2026.07.01**
  - compose-ui **1.11.4** stable (1.12.0-beta02 available)
  - material3 **1.4.0** stable, adaptive **1.2.0** / 1.3.0-rc01
  - material3 **1.5.0-alpha23** opt-in for expressive components
  - navigation-compose **2.9.3**
  - activity-compose **1.11.0**
- Material 3 Expressive, dynamic color, edge-to-edge
- Adaptive: NavigationSuiteScaffold (rail / drawer / bottom auto)

**DI / Async**
- Hilt **2.57** (ksp)
- Coroutines **1.10.2**
- Kotlinx Serialization **1.9.0**

**Data**
- Room **2.8.0** KSP, with FTS
- DataStore Preferences **1.1.7**
- Coil **3.2.0** + coil-gif, coil-video
- Supabase-kt **3.3.0** BOM — Jan 4 2026 latest
  - `io.github.jan-tennert.supabase:supabase-kt:3.3.0`
  - auth-kt, postgrest-kt, storage-kt, realtime-kt, functions-kt
  - Ktor client **3.5.0** (May 15 2026) — `ktor-client-okhttp` + `ktor-client-cio`
- SQLCipher optional

**Image Pipeline — on-device GPU first**
- AndroidX Graphics: `graphics-core`, `graphics-shapes`
- RenderScript Intrinsics Replacement Toolkit (google)
- GPUImage Android fork (kotlin)
- OpenCV Android **4.11.0** — NDK C++ via JNI, NEON
- TensorFlow Lite **2.19** + GPU delegate + NNAPI
  - Real-ESRGAN x2/x4 TFLite
  - U2Net portrait matting
  - MediaPipe FaceMesh / selfie segmentation
- Coil + Android `ColorMatrix`, `RenderEffect` Blur API 31+
- CameraX **1.5.0**
- ExifInterface **1.3.7**
- libheif / AVIF via `androidx.heifwriter`

`build.gradle.kts` key versions:
```
plugins {
  id("com.android.application") version "9.1.1"
  id("org.jetbrains.kotlin.android") version "2.4.0"
  id("com.google.devtools.ksp") version "2.4.0-2.0.2"
  id("com.google.dagger.hilt.android") version "2.57"
  id("org.jetbrains.kotlin.plugin.serialization") version "2.4.0"
  id("kotlin-parcelize")
}
android {
  namespace = "ai.pixelforge.enhancer"
  compileSdk = 36
  defaultConfig {
    minSdk = 28
    targetSdk = 36
    ndk { abiFilters += listOf("arm64-v8a","x86_64") }
    renderscriptTargetApi = 34
    renderscriptSupportModeEnabled = true
  }
  compileOptions { sourceCompatibility = JavaVersion.VERSION_21; targetCompatibility = JavaVersion.VERSION_21 }
  kotlinOptions { jvmTarget = "21"; freeCompilerArgs += "-Xcontext-parameters" }
  buildFeatures { compose = true; buildConfig = true }
}
dependencies {
  val composeBom = platform("androidx.compose:compose-bom:2026.07.01")
  implementation(composeBom); androidTestImplementation(composeBom)
  implementation("androidx.compose.material3:material3:1.4.0")
  implementation("androidx.compose.material3:material3-adaptive-navigation-suite:1.3.0-rc01")
  implementation("androidx.compose.material3.adaptive:adaptive:1.2.0")
  implementation("androidx.navigation:navigation-compose:2.9.3")
  implementation("androidx.hilt:hilt-navigation-compose:1.3.0")
  implementation("io.coil-kt.coil3:coil-compose:3.2.0")
  implementation("io.coil-kt.coil3:coil-network-okhttp:3.2.0")
  // Supabase
  implementation(platform("io.github.jan-tennert.supabase:bom:3.3.0"))
  implementation("io.github.jan-tennert.supabase:auth-kt")
  implementation("io.github.jan-tennert.supabase:postgrest-kt")
  implementation("io.github.jan-tennert.supabase:storage-kt")
  implementation("io.github.jan-tennert.supabase:realtime-kt")
  implementation("io.github.jan-tennert.supabase:functions-kt")
  // Ktor 3.5.0
  implementation("io.ktor:ktor-client-okhttp:3.5.0")
  implementation("io.ktor:ktor-client-content-negotiation:3.5.0")
  // Room
  implementation("androidx.room:room-runtime:2.8.0")
  implementation("androidx.room:room-ktx:2.8.0")
  ksp("androidx.room:room-compiler:2.8.0")
  // ML
  implementation("org.tensorflow:tensorflow-lite-gpu-delegate-plugin:0.5.0")
  implementation("org.tensorflow:tensorflow-lite:2.19.0")
  implementation("com.google.mediapipe:tasks-vision:0.10.24")
  implementation("org.opencv:opencv-android:4.11.0")
}
```

---

## 2. App Architecture

**Clean MVVM + MVI Unidirectional**
```
ui (Compose) -> ViewModel (StateFlow<MVI>) -> UseCase -> Repository
                                                      -> Local (Room)
                                                      -> Remote (Supabase)
                                                      -> Processor (RenderEngine)
```

- Hilt modules: NetworkModule, DatabaseModule, ProcessorModule, SupabaseModule
- Offline-first: Room is source of truth, Supabase sync via WorkManager
- Optimistic updates everywhere, Undo Snackbar
- Paging 3 for galleries
- WorkManager for batch export / cloud AI jobs

Module split (AGP 9 KMP-ready):
- `:app` — androidApp entry, MainActivity
- `:core:ui` — design system
- `:core:data` — Room + Supabase repo
- `:core:domain` — models + usecases
- `:feature:editor`
- `:feature:gallery`
- `:feature:batch`
- `:feature:auth`
- `:processor` — native image engine

---

## 3. Supabase backend — Magic Link ready

Auth: `auth-kt` with OTP magic link, deeplink `pixelforge://auth`

Postgres tables (RLS ON — June 2026 Supabase explicit grants required):

```
profiles
  id uuid pk references auth.users
  handle text unique
  avatar_url text
  pro_tier boolean default false
  created_at timestamptz

projects
  id uuid pk default gen_random_uuid()
  owner uuid references profiles
  title text
  source_uri text
  thumb_uri text
  width int height int
  status text -- draft, processing, exported, archived
  is_favorite bool
  tags text[]
  created_at, updated_at
  -- RLS: owner = auth.uid()

edits
  id uuid pk
  project_id uuid
  stack jsonb -- ordered non-destructive ops list
  version int
  created_at

presets
  id uuid pk
  owner uuid nullable -- null = global
  name text
  category text
  stack jsonb
  preview_uri text
  downloads int default 0

batches
  id uuid pk
  owner uuid
  name text
  preset_id uuid
  input_count int
  status text

exports
  id uuid pk
  project_id uuid
  format text -- jpeg, png, webp, heic, avif, tiff
  quality int
  width int height int
  file_uri text
  file_size bigint
  created_at

-- Storage buckets:
- originals (private)
- exports (private, signed URLs 1h)
- presets_thumbs (public)
```

Realtime subscriptions on `projects` + `batches` for live dashboard.

Sync strategy: Room -> outbox table -> WorkManager sync worker every 15s online, conflict resolution LWW + version vector on `edits`.

---

## 4. Navigation / Dashboard UI

Adaptive NavigationSuiteScaffold:
- Phone: BottomBar
- Foldable/Tablet 600dp+: NavigationRail
- 840dp+: Permanent NavigationDrawer

Routes:
- `/dashboard` — stats cards, recent projects, quick enhance, batch queue
- `/gallery` — Paging grid, filters, search, multi-select
- `/editor/{projectId}` — full editor
- `/batch` — CRUD batches
- `/presets` — marketplace + my presets CRUD
- `/exports` — export history
- `/settings` — account, storage, AI toggle
- `/auth` — magic link

Polished states everywhere:
- Shimmer skeletons (AsyncPic-style)
- Empty states with SVG illustration + CTA
- Loading with linear + circular progress
- Error with retry
- Optimistic delete with undo
- Pull to refresh
- Swipe actions

Design system: Material 3 Expressive, dynamic color, dark AMOLED + light, true edge-to-edge, 12-column adaptive grid.

---

## 5. Core resources + CRUD flows

**Projects**
- Create: camera, gallery, files, URL import, share-intent
- Read: gallery grid/list, detail
- Update: rename, tags, favorite, archive, duplicate
- Delete: soft → trash 30d, optimistic

**Edits (non-destructive stack)**
- Append op, reorder, toggle, opacity, blend
- Version history / snapshots
- A/B before-after slider

**Presets**
- Save current stack, CRUD, share, fork, marketplace download count

**Batches**
- Create batch, pick images, pick preset, run WorkManager, progress realtime, export zip

**Exports**
- Create export job, format/quality/resize, watermark, background

All flows: optimistic UI → Room → enqueue sync → Supabase.

---

## 6. Image Enhancement Engine — 63 techniques

Non-destructive OpNode stack, GPU first, TFLite fallback.

**A. Basic Color / Tone (14)**
1. Brightness / Exposure EV
2. Contrast / S-curve
3. Highlights / Shadows recovery
4. Whites / Blacks point
5. Vibrance / Saturation HSL
6. Temperature / Tint (K)
7. Gamma
8. Levels (input/output)
9. Curves RGB + Luma + per-channel
10. Auto Tone (histogram stretch)
11. Auto Color / White Balance gray-world
12. Fade / Matte
13. HDR Tone-map (Reinhard / ACES)
14. Color Balance shadows/mids/highlights

**B. Detail / Sharpness (8)**
15. Unsharp Mask
16. Smart Sharpen / deconvolution
17. High-pass clarity
18. Texture / micro-contrast
19. Noise Reduction: bilateral, NLM, wavelet
20. AI Denoise TFLite
21. Deblur (Wiener)
22. Super-Resolution Real-ESRGAN x2 / x4 TFLite GPU

**C. Optics / Lens (6)**
23. Lens blur / Bokeh (depth map)
24. Vignette / film falloff
25. Chromatic aberration fix
26. Lens distortion / perspective
27. Grain / film grain
28. Bloom / glow

**D. Color Grading (7)**
29. 3D LUT .cube import — 64³
30. Split toning
31. HSL 8-band selective
32. Color Mixer
33. Channel Mixer
34. Gradient Map
35. Duotone / Tritone

**E. AI Enhancement (9)**
36. AI Upscale Real-ESRGAN Anime/Photo
37. Face Restore GFPGAN-lite TFLite
38. AI Denoise Low-light
39. AI Deblur motion
40. Portrait Relight
41. Sky Enhance / Sky Replace (MediaPipe segmentation)
42. Background Remove U²Net
43. Super Resolution Diffusion (cloud Supabase Function optional)
44. AI Colorize B&W

**F. Repair / Cleanup (5)**
45. Spot heal / inpainting (Telea NS OpenCV)
46. Dust & scratch remove
47. Red-eye fix
48. Blemish smooth (face mesh)
49. Banding dither

**G. Transform / Geometry (7)**
50. Crop / rotate / flip / straighten auto-horizon
51. Perspective warp 4-point
52. Liquify mesh
53. Resize Lanczos / AI
54. Content-aware scale seam carving
55. Flip canvas mirror
56. Tile / kaleidoscope

**H. Effects / Stylize (7)**
57. Blur: Gaussian, Motion, Radial, Tilt-shift
58. Sharpen edges
59. Oil paint / cartoon / sketch
60. Glitch / RGB split
61. Film emulations: Kodak Portra, Fuji, etc preset LUTs
62. VHS / halftone
63. Double exposure blend

Every OpNode: `{id, type, params:Json, enabled:bool, opacity:0..1, blend:enum, mask?:Mask}`

Blend modes: Normal, Multiply, Screen, Overlay, Soft Light, Hard Light, Color Dodge/Burn, Difference, Luminosity, Color.

Masks: brush, linear gradient, radial, luminance, color range, AI subject/sky/face.

Export pipeline: RenderEngine.render(stack) → GPU shader chain → 16-bit float intermediate → final 8/10-bit → EXIF preserved.

Formats: JPEG, PNG, WEBP, HEIC, AVIF, TIFF 16-bit, OpenEXR HDR.

---

## 7. Demo Seed Data

On first launch Room prepopulate:
- 6 demo projects: Portrait NYC, Kyoto Temple, Food Flatlay, Astro Milky Way, Product Sneaker, B&W Street
- 24 presets: Cinematic Teal-Orange, Portra 400, Clean Product, AI Portrait Pop, Vintage Fade, etc.
- 3 batch jobs (1 running, 2 complete)
- 12 exports history
- User profile: demo@pixelforge.app

Makes dashboard feel alive immediately.

---

## 8. Auth Flow — Supabase Magic Link (staged)

Phase 1: anonymous local
Phase 2: 
- `supabase.auth.signInWith(OTP) { email }`
- Deeplink intent-filter `pixelforge://auth`
- Store session in EncryptedDataStore
- Automatic token refresh
- Sign out wipes local secure store

UI: email-only screen, “Send magic link”, polling / deeplink catch, loading skeleton, error retry.

---

## 9. Performance / UX polish

- 120Hz animations, spring physics
- Coil 3 crossfade, memory cache 25%
- Paging placeholders true
- Optimistic CRUD + undo 5s
- Offline queue indicator
- Haptics on slider snap
- Large image tiled rendering (Subsampling)
- Export progress notification with cancel
- Crashlytics / Firebase optional

---

## 10. Project file tree (initial)

```
pixelforge/
  gradle/libs.versions.toml  <-- version catalog, single source
  app/
    src/main/
      AndroidManifest.xml
      java/ai/pixelforge/enhancer/
        MainActivity.kt
        PixelForgeApp.kt (@HiltAndroidApp)
        navigation/
        ui/theme/ (Material3 expressive)
        feature/
          dashboard/
          gallery/
          editor/
          batch/
          presets/
          auth/
      processor/
        RenderEngine.kt
        ops/
        ml/
  core-data / core-domain / core-ui modules
  supabase/
    schema.sql
    seed.sql
    policies.sql
```

---

## 11. Next build steps — confirm with you

1. Scaffold full AGP 9.1.1 / Kotlin 2.4.0 / Compose 1.11.4 project with version catalog
2. Supabase schema + RLS + seed SQL
3. Room entities + DAOs matching Supabase
4. Dashboard + NavigationSuite scaffold with empty/loading states
5. Editor screen with OpNode stack UI + 10 first ops wired (curves, exposure, upscale, denoise, etc.)
6. Auth magic-link screen wired
7. Export APK debug / release signed

Open decisions before I generate 120+ files:

- Cloud AI or on-device only at launch?
- Monetization / Pro tier gate which ops?
- Target device min: keep 28, or 29/31 for RenderEffect blur?
- Do you want KMP shared module (`:shared`) now for future iOS, per AGP 9 KMP structure, or pure Android first?
- Preset marketplace public, or private only initially?
- Storage: Supabase Storage only, or also Google Drive export?

Say go, and I will drop the full scaffolded APK-ready repo.
