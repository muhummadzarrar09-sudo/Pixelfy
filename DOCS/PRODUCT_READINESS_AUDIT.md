# Pixelfy — Product Readiness / User-Centred Audit

Date: 2026-07-04
Status: Phase 3.1 — Build + Honest Core Loop

## Bottom line

Pixelfy is pointed in the right direction for a real product: local-first, privacy-forward, no-account-required onboarding, and a clear competitor wedge. But it is **not product-ready** until the build is verified and the high-friction user journeys become real.

## What is good for users already

- **Local Mode default**: users can try the editor without signing in.
- **Privacy posture improved**: backup disabled, cleartext disabled, sync no-ops while credentials are placeholders.
- **Auth standby messaging**: the app clearly says cloud/auth is paused.
- **Photo Picker import started**: Dashboard import now uses Android Photo Picker and creates a local project.
- **Import persistence improved**: picked images are copied into app-private project storage.
- **Real editor preview started**: Editor loads imported image URIs and renders real bitmaps instead of only mock preview text.
- **Core free edits wired**: brightness, exposure, contrast, saturation, B&W, sepia, invert, and fade now run through the imported-image preview path.
- **Private export baseline started**: JPEG / PNG / WEBP exports write to app-private storage first.
- **Explicit user export actions started**: exported files can be saved to Gallery via MediaStore or shared via Android Sharesheet.
- **Owner/beta split started**: app flavors define owner and beta entitlement through resource flags, and beta cannot self-promote to owner.
- **Beta-safe onboarding started**: owner license copy is removed from public onboarding/runtime copy.
- **Model availability surfaced**: console lists available/missing model assets.
- **Honest AI state started**: missing model-backed AI tools are disabled with user-facing explanation.
- **Demo data no longer pollutes sync outbox**: seed projects are local-only.
- **Owner/QA controls**: owner console and force-free mode are useful for testing monetization without shipping blind.
- **On-device AI positioning**: strong trust story, especially for photo/face privacy.

## Biggest product risks right now

### P0 — Build verification blocked in this sandbox

The Gradle wrapper is updated to `9.6.1`, but this sandbox only has JDK 11. Gradle 9.6.1 requires JVM 17+, and Pixelfy should use JDK 21.

Required command once JDK is fixed:

```bash
./gradlew :app:assembleBetaDebug --stacktrace --no-daemon
```

### P0 — Editor visible edit path still needs build/runtime verification

Dashboard can create a project from a picked image URI and the Editor now attempts to load/render that URI. The next user-centred task is verifying this on-device with JDK 21/Android build and making the first 8 edits visibly reliable.

### P0 — Export journey is not real yet

For users, the core loop must work before anything else:

1. Import photo
2. Apply visible edit
3. Compare before/after
4. Export/save/share

Current issue: export screen is mock data and export workers are not implemented.

### P0 — AI/model claims need honest UX

The product says 10 AI models are wired, but the model files are not bundled and several processors gracefully fall back/pass through. This is okay for Alpha, but the UI must show honest model status:

- Available
- Missing model
- CPU fallback
- GPU fallback
- Coming soon
- Pro locked

Never let users tap an AI tool and feel nothing happened.

### P1 — Real beta should not ship owner defaults

`IS_OWNER=true` is acceptable for owner/internal builds, but public beta needs a separate variant with:

- `IS_OWNER=false`
- no owner license visible by default
- no unlimited Pro unless entitlement is real
- clear free/pro affordances

### P1 — Auth/cloud sync should remain opt-in

Current placeholder no-op is good. Before enabling cloud sync:

- real Supabase URL/key through BuildConfig/CI env
- PKCE magic link tested
- RLS tests
- deletion/export-my-data flows
- privacy copy matching actual code

### P1 — Accessibility and low-end devices

For user-centred beta, verify:

- TalkBack labels on controls
- dynamic font scaling
- reduced-motion support
- low-RAM handling for large images
- visible progress/cancel states for long operations
- no silent failures

## User-centred beta acceptance criteria

A beta tester should be able to complete this in under 2 minutes:

1. Install app.
2. Understand “Local Mode / no account required.”
3. Import one photo.
4. Apply one visible free edit.
5. Toggle before/after.
6. Export JPEG/PNG/WEBP.
7. Know whether AI tools are unavailable, Pro, or missing model assets.
8. Delete local data or reset demo data.

## Active implementation phase

### Phase 3.1 — Build + Honest Core Loop

- Fix JDK/toolchain and get `:app:assembleBetaDebug` green.
- Load the imported image URI in Editor.
- Implement at least 8 visibly working free ops end-to-end.
- Implement export worker for JPEG/PNG/WEBP.
- Add model availability screen/chips.
- Add honest disabled states for unbundled AI tools.
- Add beta variant with owner disabled.

## Static checks passed

- Gradle wrapper points to `gradle-9.6.1-bin.zip`.
- No mid-file Kotlin imports detected.
- No broad `-keep class ai.pixelforge.**` rule.
- Manifest backup disabled.
- Manifest cleartext disabled.
- Live Room `DataModule` no longer uses destructive migration fallback.
