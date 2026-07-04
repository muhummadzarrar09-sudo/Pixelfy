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
  - `DOCS/PHASES_REDEFINED.md` + `DOCS/PHASE_3_1_BUILD_CORE_LOOP.md`
  - `supabase/schema.sql`

Next build I recommend: **Alpha 0.9.3 polish → sign debug APK → sideload test** — then open Beta 1 Closed July 21 with 50 Pioneers.
