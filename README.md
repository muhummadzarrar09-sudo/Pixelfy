# Pixelfy — Local-First AI Image Enhancement

Pixelfy is an Android Kotlin + Jetpack Compose image editor focused on a simple user promise:

> Import one photo → make it visibly better → compare before/after → export/share — with Local Mode first and cloud/auth opt-in.

## Current phase

**Phase 3.1 — Build + Honest Core Loop**

Canonical docs live in [`DOCS/`](DOCS/):

- [`DOCS/README.md`](DOCS/README.md)
- [`DOCS/PHASES_REDEFINED.md`](DOCS/PHASES_REDEFINED.md)
- [`DOCS/PHASE_3_1_BUILD_CORE_LOOP.md`](DOCS/PHASE_3_1_BUILD_CORE_LOOP.md)
- [`DOCS/PRODUCT_READINESS_AUDIT.md`](DOCS/PRODUCT_READINESS_AUDIT.md)
- [`DOCS/TRANSITION_PHASE_3_STATUS.md`](DOCS/TRANSITION_PHASE_3_STATUS.md)
- [`DOCS/WORKSPACE_STRUCTURE.md`](DOCS/WORKSPACE_STRUCTURE.md)

## Stack

- AGP **9.1.1**
- Gradle **9.6.1**
- Kotlin **2.4.0**
- compileSdk / targetSdk **36**
- JVM target **21**
- Compose Material 3
- Hilt, Room, DataStore, WorkManager
- Supabase scaffold for opt-in auth/cloud sync
- TensorFlow Lite / MediaPipe scaffold for on-device AI

## Repository layout

```text
app/                 Android application shell
core/                domain, data, ui modules
feature/             dashboard, gallery, editor, batch, presets, auth
processor/           render engine and TFLite hooks
supabase/            database schema and seed SQL
web-beta/            beta waitlist site scaffold
scripts/             doctor, build, generator/scaffold scripts
DOCS/                canonical product/phase/security docs
assets/branding/     source brand assets
```

## Quick checks

Run the workspace doctor:

```bash
./scripts/doctor.sh
```

Build on JDK 21:

```bash
export JAVA_HOME=/path/to/jdk-21
./gradlew :app:assembleBetaDebug --stacktrace --no-daemon
```

Current sandbox blocker: this environment only has JDK 11, while Gradle 9.6.1 requires JDK 17+.

## User-centred status

Started in Phase 3.1:

- Android Photo Picker import from Dashboard.
- Picked images are copied into app-private project storage.
- Picked image creates a local project.
- Editor loads imported image URIs and renders bitmap previews.
- A/B view compares imported original/rendered image.
- Eight free edits are wired against imported previews: brightness, exposure, contrast, saturation, B&W, sepia, invert, fade.
- JPEG / PNG / WEBP exports write to app-private storage first.
- Exports can be explicitly saved to Gallery or shared.
- Owner and beta flavors are defined with entitlement controlled by app resource flags.
- Beta cannot self-promote into owner mode through local state/easter egg.
- Beta-safe onboarding/runtime copy avoids exposing owner license text.
- Owner/Beta console lists available/missing model assets.
- Missing AI model-backed tools are disabled with honest messaging.
- Demo seed data is local-only and does not pollute sync outbox.

Still pending before real beta:

- JDK 21 debug build verification.
- JDK 21/on-device verification of the 8 wired free edits.
- JDK 21/on-device verification for beta build.
- expanded AI model states: Pro / Coming soon / CPU fallback / GPU fallback.
- CI build result cleanup after first JDK 21 run.

MIT — Pixelfy 2026
