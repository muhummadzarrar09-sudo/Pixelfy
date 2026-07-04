# Phase 3.1 — Build + Honest Core Loop

Status: ACTIVE
Date: 2026-07-04

## Why this phase exists

A real product cannot be built on claims. Pixelfy must prove the first user loop before more roadmap expansion.

The user-centred promise:

> I can install Pixelfy, skip auth, import one photo, make it visibly better, compare before/after, and export it — without wondering where my photo went.

## Completed in this pass

### Toolchain

- Gradle wrapper updated to `9.6.1`.
- `gradlew` made executable.
- `scripts/doctor.sh` added.

Current blocker:

- This sandbox only has JDK 11.
- Gradle 9.6.1 requires JDK 17+.
- Use JDK 21 for local/CI verification.

### Workspace optimization

- `.gitignore` added for Gradle/Android/Node/build outputs/secrets.
- `DOCS/` folder created as the source of truth.
- Phase docs redefined.

### User loop

- Android Photo Picker import started from Dashboard FAB.
- Import creates a local `Project` with the selected photo URI.
- Imported images are copied into app-private project storage before the project opens.
- Editor now loads real imported image URIs and renders previews from real bitmaps.
- Editor now shows honest image-load failure states instead of a fake preview.
- Eight core free edits are wired against imported image previews: brightness, exposure, contrast, saturation, B&W, sepia, invert, fade.
- JPEG / PNG / WEBP export writes to app-private storage first.
- Exported files can now be explicitly saved to Gallery via MediaStore or shared via Android Sharesheet.
- Owner and beta flavors are defined; entitlement now comes from app resource `pixelfy_is_owner` instead of a library BuildConfig.
- Beta builds cannot self-promote to owner through the 7-tap toggle or DataStore state.
- Beta-safe onboarding copy removes visible owner license text unless owner flavor/runtime state allows it.
- Export progress/cancel UI baseline added.
- Owner/Beta console now shows an honest model availability list.
- CI now runs `scripts/check_beta_safety.sh` before builds.
- AI tools with missing model assets are disabled with a clear trust-preserving message.
- Demo seed data now writes local-only and does not enqueue cloud sync outbox items.
- Favorite toggle now performs a real optimistic local update.
- Empty state copy is now user-centred: local mode, privacy, import photo.

### Trust/honesty

- Product readiness audit created.
- AI/model honesty called out as P0 before beta.

## Commands

Run doctor:

```bash
./scripts/doctor.sh
```

Run build after JDK 21 is active:

```bash
export JAVA_HOME=/path/to/jdk-21
./gradlew :app:assembleBetaDebug --stacktrace --no-daemon
```

## Phase 3.1 checklist

### P0 — Build

- [x] Gradle wrapper updated to 9.6.1.
- [x] Doctor script added.
- [ ] JDK 21 active in local/CI.
- [ ] Debug build passes.
- [ ] Fix compiler errors from real Gradle run.

### P0 — Import

- [x] Dashboard Photo Picker launcher added.
- [x] Picked image creates a local project.
- [x] Editor loads the project image URI for Photo Picker imports.
- [x] Copy imported image into app-private project storage for process-death-safe access.
- [x] Show import/image-load failure states.

### P0 — Visible edits

- [x] Brightness wired to imported image preview via RenderEngine.
- [x] Contrast wired to imported image preview via RenderEngine.
- [x] Saturation wired to imported image preview via RenderEngine.
- [x] Exposure wired to imported image preview via RenderEngine.
- [x] B&W wired to imported image preview via RenderEngine.
- [x] Sepia wired to imported image preview via RenderEngine.
- [x] Invert wired to imported image preview via RenderEngine.
- [x] Fade wired to imported image preview via RenderEngine.
- [ ] On-device runtime verification after JDK 21 build.

### P0 — Compare

- [x] Before/after uses real image for imported Photo Picker projects.
- [x] Split comparison maps to actual layout weights instead of mock text only.
- [ ] Long-press original preview behavior verified.

### P0 — Export

- [x] Export current edit as JPEG to app-private storage.
- [x] Export current edit as PNG to app-private storage.
- [x] Export current edit as WEBP to app-private storage.
- [x] Save to app-private first.
- [x] MediaStore/gallery save remains explicit and is not automatic.
- [x] Progress + cancel UI baseline.
- [x] Share/save-to-gallery action baseline.

### P0 — Honest AI/model states

- [x] Detect bundled model assets for the main AI model-backed tools.
- [x] Show model state baseline in UI: Available / Missing for bundled model assets.
- [x] Disable missing AI tools instead of silently passing through.
- [x] Owner/Beta console model status list.
- [ ] Expand model state to include Coming soon / Pro / CPU fallback / GPU fallback.

### P1 — Beta safety

- [x] Add owner flavor/release path with `IS_OWNER=true` via app resource flag.
- [x] Add beta flavor/release path with `IS_OWNER=false` via app resource flag.
- [x] Move entitlement source away from library `BuildConfig` to app flavor resource `pixelfy_is_owner`.
- [x] Remove visible owner license from beta onboarding/runtime copy.
- [x] Add CI gate against public owner build accidental upload.

## Do not do in Phase 3.1

- Do not add new AI model claims.
- Do not add new monetization screens before export works.
- Do not enable cloud sync before RLS/auth/deletion are tested.
- Do not ship silent pass-through tools as if they worked.
