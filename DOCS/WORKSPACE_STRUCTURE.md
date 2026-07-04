# Pixelfy — Workspace Structure

Date: 2026-07-04

The repo has been reorganized so product docs, scripts, assets, app code, and service code are separated clearly.

## Root

```text
README.md              minimal project entrypoint
settings.gradle.kts    Gradle module includes
build.gradle.kts       root Gradle plugin aliases
gradle.properties      Gradle/Android flags
gradlew / gradlew.bat  Gradle wrapper
.gitignore             build/secrets/artifact ignore rules
```

Root is intentionally kept small. The only Markdown file left at root is `README.md` because GitHub and most dev tools expect it there.

## DOCS/

Canonical documentation source of truth.

```text
DOCS/README.md
DOCS/PHASES_REDEFINED.md
DOCS/PHASE_3_1_BUILD_CORE_LOOP.md
DOCS/PRODUCT_READINESS_AUDIT.md
DOCS/TRANSITION_PHASE_3_STATUS.md
DOCS/ALPHA_BETA_TRANSITION_HARDENING.md
DOCS/ROADMAP_PIXELFY.md
DOCS/ROADMAP_ALPHA_093.md
DOCS/BUILD_PIXELFY_APK.md
DOCS/BRANDING_PIXELFY.md
DOCS/COMPETITOR_RESEARCH_PIXELFY.md
DOCS/ENHANCER_ARCHITECTURE.md
```

## scripts/

Executable helpers and generators.

```text
scripts/doctor.sh
scripts/build_release_apk.sh
scripts/gen_features.sh
scripts/gen_modules.sh
scripts/gen_src.sh
scripts/gen_web_beta.sh
scripts/scaffold.sh
```

Run:

```bash
./scripts/doctor.sh
```

## assets/

Source product/brand assets that are not directly part of Android resources.

```text
assets/branding/pixelfy_logo.png
```

Android launcher resources remain in `app/src/main/res/`.

## Android app code

```text
app/
core/
feature/
processor/
```

## Backend/site code

```text
supabase/
web-beta/
```

## Rule going forward

- Product docs go in `DOCS/`.
- Shell scripts go in `scripts/`.
- Brand/source media go in `assets/`.
- Android runtime resources stay under `app/src/main/res/` or `app/src/main/assets/`.
- Do not put build artifacts, secrets, APKs, AABs, node modules, or generated folders in git.
