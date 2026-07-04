# Pixelfy — Phases Redefined

The old phase file mixed build milestones with release/product milestones. From Transition Phase 3.1 onward, the canonical phase plan lives here:

- `DOCS/PHASES_REDEFINED.md`
- `DOCS/PHASE_3_1_BUILD_CORE_LOOP.md`

## Current phase

**Phase 3.1 — Build + Honest Core Loop**

Goal:

> Import one photo → apply a visible edit → compare before/after → export/share → understand privacy and AI availability.

## Quick summary

1. Phase 0 — Product Truth + Positioning — Done
2. Phase 1 — Architecture Scaffold — Done / needs build verification
3. Phase 2 — Local-First Alpha 0.9.3 — In progress
4. Phase 3 — Alpha → Beta Transition Hardening — Active
5. Phase 3.1 — Build + Honest Core Loop — Active now
6. Phase 4 — Closed Beta 1 — Next
7. Phase 5 — Beta 2 / Monetization Validation
8. Phase 6 — RC 1.0
9. Phase 7 — Production 1.0

Run:

```bash
./scripts/doctor.sh
```

Then on JDK 21:

```bash
./gradlew :app:assembleBetaDebug --stacktrace --no-daemon
```
