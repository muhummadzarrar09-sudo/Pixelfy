# Pixelfy — Brand System
AI Image Enhancement Studio — July 2026

## Logo
- Icon: `app/src/main/res/mipmap-*/ic_launcher.png`
- Mark: aperture-blade “P” with sparkle stars
- Gradient: Electric Purple #8B5CF6 → Teal Mint #06FFA5 → Hot Pink #FF3B9A
- File: `assets/branding/pixelfy_logo.png` (1024px) — copied to all densities

## Colors — Material 3 Expressive
```
Primary        #8B5CF6  Electric Purple
PrimaryContainer #E9D5FF
Secondary      #06FFA5  Teal Mint
SecondaryContainer #A6F4D5
Tertiary       #FF3B9A  Hot Pink
TertiaryContainer #FFD8E4
Background Light #FEFCFF
Background Dark  #0F0B1A  AMOLED
Surface Dark     #1A1328
```

Dark theme default ON — AMOLED true blacks.

## Typography
- Display: ExtraBold, -0.25 tracking
- Title: SemiBold 22sp
- Body: 16/24
- Label: Medium 14sp

## UI Elements — Pixelfy tailored
- NavigationSuiteScaffold adaptive: BottomBar phone • Rail tablet • Drawer 840dp+
- TopAppBar: “✨ Pixelfy” with “v1.0 local” AssistChip, right action “🔒 Auth standby”
- FAB: Extended “Pixelfy +” with ✨ icon, primaryContainer
- Cards: elevated, 16dp radius, brand container tints
  - Stats: Purple / Teal / Pink containers
  - Local mode banner: secondaryContainer, 🧪 icon
- Chips: rounded 50dp, Pro badge = tertiaryContainer “✨ Pro”
- Empty state: ✨ large, “Pixelfy” headline in primary, “AI Image Enhancement” sub
- Editor: TopBar “✨ Pixelfy • $projectId”, Export = FilledTonalButton
- Presets: “💫 Pixelfy+ Presets”, 10 seeded Pixelfy presets
- Batch: “⚡ Pixelfy Batch”, tertiaryContainer FAB
- Gallery: “✨ Pixelfy Studio”

## Auth — STANDBY / LOCAL MODE
- Default: Local Mode ON
- `PixelfyApp.onCreate()` — SyncWorker + RealtimeSync commented out
- Dashboard shows: “🧪 Local Test Mode — Auth on standby • all 63 ops unlocked locally • Supabase sync paused”
- AuthScreen:
  - Top card: “🧪 Pixelfy Local Test Mode — Auth is on standby”
  - Switch: Local mode ON/OFF
  - Button: “Continue Locally ✨” when localMode=true
  - Email field disabled in local mode
  - Footer: “Pixelfy • Supabase Magic Link • OTP • sb_publishable_xxx”
  - Chip: “auth standby • v1.0”

Toggle off Local mode → enables Supabase magic-link (`pixelfy://auth` deeplink, legacy `pixelforge://auth` kept).

## App Identity
- App name: **Pixelfy**
- Package: `ai.pixelforge.enhancer` (legacy, stable)
- Application class: `PixelfyApp`
- Theme: `Theme.Pixelfy` / `PixelfyTheme()`
- Launcher label: Pixelfy
- Tagline: “AI Image Enhancement Studio”
- Deeplink: `pixelfy://auth`
- Seed data: 8 Pixelfy projects
  - Pixelfy Portrait • NYC
  - Kyoto Temple – Pixelfy HDR
  - Food Flatlay Pro
  - Astro Milky Way • AI Denoise
  - Sneaker Drop – Clean
  - B&W Street • Portra
  - Pixelfy Selfie ✨
  - Sky Replace Demo

## Brand Composables
`ai.pixelforge.core.ui.brand`:
- `PixelfyLogo()`
- `PixelfyBrandingHeader()`
- `PixelfyProBadge()`
- `PixelfyLocalModeChip()`
- `PixelfyGradient` Brush

## Iconography
Nav:
- Home ✨
- Studio 🖼️
- Edit 🎨
- Batch ⚡
- Pixelfy+ 💫
- Export ⬇️
- Local 🔒

All elements exactly tailored to Pixelfy — no PixelForge remnants in UI (code namespaces kept for stability).
