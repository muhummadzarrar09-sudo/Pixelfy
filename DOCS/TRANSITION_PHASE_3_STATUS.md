# Pixelfy — Transition Phase 3 Status

Date: 2026-07-04
Active phase: **Phase 3.1 — Build + Honest Core Loop**

## What was resumed

The project is being treated as already inside the Alpha → Beta transition hardening track. The previous handoff was truncated, so this file captures the actual repo changes made from the resumed Phase 3 onward.

## Completed in Transition Phase 3 baseline

1. **Android app hardening baseline**
   - `android:allowBackup="false"`
   - `android:usesCleartextTraffic="false"`
   - `@xml/network_security_config` added
   - Backup/data extraction excludes prefs, database, exports, cache
   - Removed broad video media permission from manifest

2. **Auth/deeplink alignment**
   - Supabase auth scheme changed from `pixelforge://auth` to `pixelfy://auth`
   - Legacy `pixelforge://auth` kept for migration
   - Future verified App Link target added: `https://pixelfy.app/auth`

3. **Room/data integrity hardening**
   - Removed destructive migration from live `DataModule`
   - Added explicit Room migration `1 -> 2` for `sync_outbox`
   - Enabled Room WAL journaling
   - Export schema enabled
   - Fixed invalid mid-file imports in `Entities.kt`

4. **Sync safety in local/auth-standby mode**
   - Supabase placeholder credentials now make sync/realtime no-op instead of attempting network calls
   - SyncWorker now dead-letters after max attempts without crashing app startup

5. **Build graph cleanup**
   - `core:data` no longer imports app module `BuildConfig`
   - `core:data` now has its own transition-safe `BuildConfig` fields
   - Added missing WorkManager/Hilt Worker/Supabase Functions/coroutines dependencies to `core:data`
   - Added missing feature module dependencies for `dashboard`, `gallery`, `editor`, and Compose Foundation usage

6. **R8/ProGuard hardening**
   - Replaced broad `-keep class ai.pixelforge.** { *; }`
   - Kept only Hilt, WorkManager, Room, Kotlinx serialization, TFLite/MediaPipe binding requirements

7. **RASP baseline**
   - Added `SecurityModule`
   - Collects root, emulator, debugger, hooking, and signature-tamper signals
   - Does not crash on detection; exposes scoring for later Pro/cloud gates

8. **Versioning alignment**
   - App version changed to `versionCode = 903`
   - App version name changed to `0.9.3-pixelfy-alpha`

## Completed in Phase 3.1 so far

- Gradle wrapper updated to `9.6.1`.
- `gradlew` made executable.
- `.gitignore` added for build outputs, IDE files, generated artifacts, Node outputs, and secrets.
- `DOCS/` folder created as the new source of truth.
- Root `.md` documents moved into `DOCS/` except root `README.md`, which remains as the project entrypoint.
- Generator/scaffold scripts moved into `scripts/`.
- Branding image moved into `assets/branding/`.
- Phases redefined in `DOCS/PHASES_REDEFINED.md`.
- Active plan written in `DOCS/PHASE_3_1_BUILD_CORE_LOOP.md`.
- Workspace doctor added: `scripts/doctor.sh`.
- Dashboard Photo Picker import started.
- Picked photo is copied into app-private project storage before project creation.
- Picked photo URI now creates a local `Project`.
- Editor now loads imported image URIs and renders real bitmap previews.
- Editor A/B now compares real original/rendered bitmaps for imported images.
- Eight free edits are wired to imported previews: brightness, exposure, contrast, saturation, B&W, sepia, invert, fade.
- JPEG / PNG / WEBP export writes to app-private storage first.
- Exported files can now be explicitly saved to Gallery via MediaStore or shared via Android Sharesheet.
- Export progress/cancel UI baseline added.
- Owner and beta flavors are defined; entitlement now comes from app resource `pixelfy_is_owner` instead of a library BuildConfig.
- Beta builds cannot self-promote into owner mode through DataStore/easter egg state.
- Beta-safe onboarding removes visible owner license text from public runtime copy.
- Owner/Beta console now shows an honest model availability list.
- CI workflow updated for owner/beta debug and release artifact paths plus beta safety gate.
- Missing AI model-backed tools are disabled with honest user-facing messaging.
- Demo seed data now uses `upsertLocal()` and does not enqueue cloud sync outbox entries.
- Project favorite chip now performs a real local update.
- Product readiness audit updated with user-centred acceptance criteria.

## Current blocker

This sandbox only has JDK 11:

```text
openjdk version "11"
```

Gradle 9.6.1 requires JDK 17+. Pixelfy should use JDK 21.

Run on a JDK 21 machine:

```bash
./scripts/doctor.sh
./gradlew :app:assembleBetaDebug --stacktrace --no-daemon
```

## Next Phase 3.1 tasks

- Install/use JDK 21 and run a real debug build.
- Fix compiler errors from the Gradle run.
- Load imported project image URI in Editor.
- Render at least 8 free visible edits against real images.
- Implement JPEG/PNG/WEBP export.
- Add honest AI model availability states.
- Add `ownerRelease` and `betaRelease` variants.
- Inject expected signing cert SHA-256 into release BuildConfig.
- Add CI gates for backup, cleartext, debuggable, testOnly, broad ProGuard keeps, owner leakage, and server-secret leakage.
