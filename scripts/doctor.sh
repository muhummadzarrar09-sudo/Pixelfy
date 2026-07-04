#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

fail=0
warn() { printf '\033[33mWARN\033[0m %s\n' "$*"; }
pass() { printf '\033[32mPASS\033[0m %s\n' "$*"; }
err() { printf '\033[31mFAIL\033[0m %s\n' "$*"; fail=1; }

printf 'Pixelfy doctor — Transition Phase 3.1\n'
printf 'Workspace: %s\n\n' "$ROOT"

if [[ -x ./gradlew ]]; then pass "gradlew is executable"; else err "gradlew is not executable; run chmod +x gradlew"; fi

if command -v java >/dev/null 2>&1; then
  java_out="$(java -version 2>&1 | head -1)"
  printf 'Java: %s\n' "$java_out"
  major="$(java -XshowSettings:properties -version 2>&1 | awk -F'= ' '/java.specification.version/{print $2; exit}')"
  case "$major" in
    1.*) major="${major#1.}" ;;
  esac
  if [[ "${major%%.*}" -ge 17 ]]; then pass "JDK runtime is 17+"; else err "Gradle 9.6.1 requires JDK 17+; use JDK 21 for Pixelfy"; fi
else
  err "java not found"
fi

if grep -q 'gradle-9.6.1-bin.zip' gradle/wrapper/gradle-wrapper.properties; then pass "Gradle wrapper is 9.6.1"; else err "Gradle wrapper is not pinned to 9.6.1"; fi

if grep -q 'android:allowBackup="false"' app/src/main/AndroidManifest.xml; then pass "Android backup disabled"; else err "android:allowBackup must be false for beta"; fi
if grep -q 'android:usesCleartextTraffic="false"' app/src/main/AndroidManifest.xml; then pass "Cleartext traffic disabled"; else err "Cleartext traffic must be disabled"; fi
if grep -q 'networkSecurityConfig' app/src/main/AndroidManifest.xml; then pass "Network security config attached"; else err "Missing networkSecurityConfig"; fi
if grep -q -- '-keep class ai.pixelforge\.\*\*' app/proguard-rules.pro; then err "Broad ai.pixelforge keep rule detected"; else pass "No broad ai.pixelforge keep-all rule"; fi
if grep -RIn 'fallbackToDestructiveMigration' core app feature processor --include='*.kt' --include='*.kts' >/tmp/pixelfy_doctor_destructive.txt 2>/dev/null; then
  err "Destructive Room migration call found: $(cat /tmp/pixelfy_doctor_destructive.txt)"
else
  pass "No live destructive Room migration call found"
fi
if grep -RInE '(SUPABASE_SERVICE_ROLE|SERVICE_ROLE_KEY|sb_secret_[A-Za-z0-9_\-]{8,})\s*=' app core feature processor web-beta/app web-beta/lib --include='*.kt' --include='*.kts' --include='*.ts' --include='*.tsx' >/tmp/pixelfy_doctor_secrets.txt 2>/dev/null; then
  err "Potential server secret assignment found: $(cat /tmp/pixelfy_doctor_secrets.txt)"
else
  pass "No server-secret assignments found in app/web code"
fi

printf '\nNext: ./gradlew :app:assembleBetaDebug --stacktrace --no-daemon\n'
exit "$fail"
