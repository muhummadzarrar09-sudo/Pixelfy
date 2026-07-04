#!/bin/bash
set -e
cd "$(dirname "$0")/.."

echo "=== PixelForge Phase 3 — Release APK ==="
echo "AGP 9.1.1 / Kotlin 2.4.0 / Compose 1.11.4"

# Generate keystore if missing
if [ ! -f app/pixelforge-release.jks ]; then
  echo "Generating release keystore..."
  keytool -genkeypair -v \
    -keystore app/pixelforge-release.jks \
    -alias pixelforge \
    -keyalg RSA -keysize 4096 -validity 10000 \
    -storetype PKCS12 \
    -storepass pixelforge \
    -keypass pixelforge \
    -dname "CN=PixelForge, OU=Mobile, O=PixelForge AI, L=Rawalpindi, ST=Punjab, C=PK"
fi

export PF_STORE_FILE=app/pixelforge-release.jks
export PF_STORE_PASSWORD=pixelforge
export PF_KEY_ALIAS=pixelforge
export PF_KEY_PASSWORD=pixelforge

./gradlew clean :app:assembleRelease --no-daemon -Pandroid.injected.signing.store.file=$PF_STORE_FILE -Pandroid.injected.signing.store.password=$PF_STORE_PASSWORD -Pandroid.injected.signing.key.alias=$PF_KEY_ALIAS -Pandroid.injected.signing.key.password=$PF_KEY_PASSWORD

echo ""
echo "APK(s):"
find app/build/outputs -name "*.apk" -type f | xargs ls -lh

# Verify
$ANDROID_HOME/build-tools/36.0.0/apksigner verify --print-certs app/build/outputs/apk/release/app-release.apk || true

echo "Done — install: adb install -r app/build/outputs/apk/release/app-release.apk"
