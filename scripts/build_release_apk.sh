#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== Pixelfy Phase 3.1 — Release APKs ==="
echo "AGP 9.1.1 / Gradle 9.6.1 / Kotlin 2.4.0 / JDK 21 recommended"

KEYSTORE="app/pixelfy-release.jks"
ALIAS="pixelfy"

if [ ! -f "$KEYSTORE" ]; then
  echo "Generating local release keystore for testing only..."
  keytool -genkeypair -v \
    -keystore "$KEYSTORE" \
    -alias "$ALIAS" \
    -keyalg RSA -keysize 4096 -validity 10000 \
    -storetype PKCS12 \
    -storepass pixelforge \
    -keypass pixelforge \
    -dname "CN=Pixelfy, OU=Mobile, O=Pixelfy Labs, L=Rawalpindi, ST=Punjab, C=PK"
fi

export PF_STORE_FILE="$KEYSTORE"
export PF_STORE_PASSWORD="${PF_STORE_PASSWORD:-pixelforge}"
export PF_KEY_ALIAS="${PF_KEY_ALIAS:-$ALIAS}"
export PF_KEY_PASSWORD="${PF_KEY_PASSWORD:-pixelforge}"

./scripts/doctor.sh || true

./gradlew clean :app:assembleBetaRelease :app:assembleOwnerRelease :app:bundleBetaRelease --no-daemon \
  -Pandroid.injected.signing.store.file=$PF_STORE_FILE \
  -Pandroid.injected.signing.store.password=$PF_STORE_PASSWORD \
  -Pandroid.injected.signing.key.alias=$PF_KEY_ALIAS \
  -Pandroid.injected.signing.key.password=$PF_KEY_PASSWORD

echo ""
echo "Artifacts:"
find app/build/outputs -name "*.apk" -o -name "*.aab" | sort | xargs -r ls -lh

if [ -n "${ANDROID_HOME:-}" ]; then
  for apk in app/build/outputs/apk/beta/release/*.apk app/build/outputs/apk/owner/release/*.apk; do
    [ -f "$apk" ] || continue
    "$ANDROID_HOME/build-tools/36.0.0/apksigner" verify --print-certs "$apk" || true
  done
fi

echo "Done. Install beta: adb install -r app/build/outputs/apk/beta/release/*.apk"
