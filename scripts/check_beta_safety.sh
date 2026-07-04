#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

fail=0
err() { printf '\033[31mFAIL\033[0m %s\n' "$*"; fail=1; }
pass() { printf '\033[32mPASS\033[0m %s\n' "$*"; }

printf 'Pixelfy beta safety gate\n\n'

if grep -q 'create("beta")' app/build.gradle.kts && grep -q 'create("owner")' app/build.gradle.kts; then
  pass "owner/beta flavors exist"
else
  err "Missing owner/beta flavors"
fi

if awk '/defaultConfig \{/,/\}/{print}' app/build.gradle.kts | grep -q 'IS_OWNER", "true"'; then
  err "defaultConfig must not set IS_OWNER=true"
else
  pass "defaultConfig is not owner"
fi

if awk '/create\("beta"\)/,/create\("owner"\)|buildTypes \{/{print}' app/build.gradle.kts | grep -q 'IS_OWNER", "true"'; then
  err "beta flavor must not set IS_OWNER=true"
else
  pass "beta flavor is not owner"
fi

if grep -q 'pixelfy_is_owner", "false"' app/build.gradle.kts; then
  pass "beta/default owner resource false present"
else
  err "Missing pixelfy_is_owner=false"
fi

if grep -q 'if (buildOwner)' core/data/src/main/java/ai/pixelforge/core/data/billing/EntitlementRepository.kt; then
  pass "entitlement escalation is build-owner gated"
else
  err "Owner escalation is not gated by buildOwner"
fi

if grep -RIn 'PXFY-OWNER-2026-UNLIMITED' core/ui app feature --include='*.kt' | grep -v 'isOwner' >/tmp/pixelfy_owner_copy.txt 2>/dev/null; then
  err "Owner license appears without owner guard: $(cat /tmp/pixelfy_owner_copy.txt)"
else
  pass "owner license copy is guarded or absent in runtime UI"
fi

exit "$fail"
