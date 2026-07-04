# Pixelfy — Phases Redefined

Date: 2026-07-04

The original docs mixed implementation phases, product roadmap phases, and release phases. From now on, Pixelfy uses this simpler phase model.

## Phase 0 — Product Truth + Positioning — DONE

Goal: define what Pixelfy is and why users should trust it.

Status:
- App identity: Pixelfy.
- Differentiator: local-first, privacy-first image enhancement.
- Competitor wedge: Snapseed speed, Lightroom depth, Remini-style AI without cloud creep/plastic results.
- Monetization intent: users first; paywall after value is proven.

Exit criteria:
- Brand direction exists.
- Competitor research exists.
- Privacy promise is explicit.

## Phase 1 — Architecture Scaffold — DONE / NEEDS VERIFICATION

Goal: create the modular Android architecture.

Status:
- Modules exist: app, core ui/data/domain, feature modules, processor.
- Supabase schema exists.
- Web beta waitlist scaffold exists.

Exit criteria still pending:
- Full debug build verified with JDK 21.
- Module dependency graph validated by Gradle.

## Phase 2 — Local-First Alpha 0.9.3 — IN PROGRESS

Goal: make the app usable without account creation.

Status:
- Local Mode default exists.
- Demo projects seed locally.
- Owner console exists.
- Onboarding exists.
- Photo Picker import was started in Phase 3.1.

Exit criteria:
- Import creates a project from a real photo.
- At least 8 free edits visibly change the image.
- Before/after comparison works.
- Export JPEG/PNG/WEBP works.
- No account required for the first successful edit/export.

## Phase 3 — Alpha → Beta Transition Hardening — ACTIVE

Goal: remove trust debt before real testers.

Status completed:
- Backup disabled.
- Cleartext disabled.
- Network security config added.
- Destructive Room migration removed from live path.
- R8 keep rules narrowed.
- RASP baseline added.
- Sync/realtime no-op while Supabase credentials are placeholders.
- Gradle wrapper moved to 9.6.1.

Exit criteria:
- Doctor script passes on JDK 21.
- Debug build passes.
- CI build passes.
- No service-role/secret leaks.
- No public owner entitlement in beta variant.
- Privacy/data safety claims match actual code.

## Phase 3.1 — Build + Honest Core Loop — ACTIVE NOW

Goal: make Pixelfy honest and testable by a real user.

Scope:
- Fix toolchain/JDK/Gradle build.
- Implement real import path.
- Implement minimum visible edit path.
- Implement minimum export path.
- Add honest AI/model availability states.
- Add beta variant with owner off.

Exit criteria:
- `./scripts/doctor.sh` passes.
- `./gradlew :app:assembleBetaDebug --stacktrace --no-daemon` passes.
- A tester can import, edit, compare, and export one photo in under 2 minutes.
- Missing AI models are shown honestly, not silently ignored.

## Phase 4 — Closed Beta 1 — NEXT

Goal: validate with 50–200 real users.

Scope:
- Play Console closed testing.
- Crash reporting/feedback loop.
- Privacy policy live.
- Data deletion/export-my-data path.
- Beta waitlist connected to real invite workflow.

Exit criteria:
- Crash-free sessions ≥ 97%.
- Import/edit/export completion ≥ 80% for first-run testers.
- Clear top 10 user complaints.

## Phase 5 — Beta 2 / Monetization Validation

Goal: test Pro value without harming trust.

Scope:
- RevenueCat/Play Billing sandbox.
- Pro gates only after users see value.
- Owner build separate from beta build.
- Trial/lifetime pricing experiments.

Exit criteria:
- Paywall does not block first successful local export.
- Pro conversion signals are measurable.
- Refund/confusion rate is low.

## Phase 6 — RC 1.0

Goal: release candidate quality.

Scope:
- Performance, accessibility, localization basics.
- Large image handling.
- Export quality QA.
- Security/privacy final pass.

Exit criteria:
- No P0/P1 bugs.
- Data Safety complete.
- Store listing complete.
- Release signing and AAB verified.

## Phase 7 — Production 1.0

Goal: public launch.

Scope:
- Play Store rollout.
- Support workflows.
- Security transparency page.
- Analytics dashboards.

Exit criteria:
- Staged rollout healthy.
- Support channels ready.
- Incident rollback path documented.
