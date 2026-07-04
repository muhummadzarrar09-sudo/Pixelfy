#!/bin/bash
set -e
ROOT=/home/user/pixelforge
rm -rf $ROOT
mkdir -p $ROOT

# root files
cat > $ROOT/settings.gradle.kts <<'EOF'
pluginManagement {
  repositories {
    google(); mavenCentral(); gradlePluginPortal()
  }
}
dependencyResolutionManagement {
  repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
  repositories { google(); mavenCentral() }
}
rootProject.name = "PixelForge"
include(":app")
include(":core:ui")
include(":core:data")
include(":core:domain")
include(":feature:dashboard")
include(":feature:gallery")
include(":feature:editor")
include(":feature:batch")
include(":feature:presets")
include(":feature:auth")
include(":processor")
EOF

cat > $ROOT/gradle.properties <<'EOF'
org.gradle.jvmargs=-Xmx4g -Dfile.encoding=UTF-8 -XX:+HeapDumpOnOutOfMemoryError
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.configuration-cache=true
android.useAndroidX=true
android.nonTransitiveRClass=true
android.nonFinalResIds=false
android.enableR8.fullMode=true
# AGP 9 new DSL
android.newDsl=true
android.builtInKotlin=true
kotlin.code.style=official
kotlin.mpp.androidSourceSetLayoutVersion=2
EOF

mkdir -p $ROOT/gradle
cat > $ROOT/gradle/libs.versions.toml <<'EOF'
[versions]
agp = "9.1.1"
kotlin = "2.4.0"
ksp = "2.4.0-2.0.2"
compileSdk = "36"
minSdk = "28"
targetSdk = "36"

core-ktx = "1.17.0"
lifecycle = "2.9.2"
activity-compose = "1.11.0"

compose-bom = "2026.07.01"
compose-ui = "1.11.4"
material3 = "1.4.0"
material3-adaptive = "1.3.0-rc01"
adaptive = "1.2.0"
navigation = "2.9.3"

hilt = "2.57"
hilt-navigation = "1.3.0"

room = "2.8.0"
datastore = "1.1.7"
paging = "3.3.6"

coil = "3.2.0"

supabase = "3.3.0"
ktor = "3.5.0"
kotlinx-serialization = "1.9.0"
kotlinx-coroutines = "1.10.2"
kotlinx-datetime = "0.7.1"
kotlinx-collections = "0.4.0"

tflite = "2.19.0"
mediapipe = "0.10.24"
opencv = "4.11.0"
camerax = "1.5.0"
exif = "1.3.7"

junit = "4.13.2"
androidx-test-ext-junit = "1.3.0"
espresso-core = "3.7.0"

[libraries]
androidx-core-ktx = { module = "androidx.core:core-ktx", version.ref = "core-ktx" }
androidx-lifecycle-runtime-ktx = { module = "androidx.lifecycle:lifecycle-runtime-ktx", version.ref = "lifecycle" }
androidx-lifecycle-viewmodel-compose = { module = "androidx.lifecycle:lifecycle-viewmodel-compose", version.ref = "lifecycle" }
androidx-activity-compose = { module = "androidx.activity:activity-compose", version.ref = "activity-compose" }

androidx-compose-bom = { module = "androidx.compose:compose-bom", version.ref = "compose-bom" }
androidx-compose-ui = { module = "androidx.compose.ui:ui" }
androidx-compose-ui-graphics = { module = "androidx.compose.ui:ui-graphics" }
androidx-compose-ui-tooling-preview = { module = "androidx.compose.ui:ui-tooling-preview" }
androidx-compose-material3 = { module = "androidx.compose.material3:material3", version.ref = "material3" }
androidx-material3-adaptive-navigation-suite = { module = "androidx.compose.material3:material3-adaptive-navigation-suite", version.ref = "material3-adaptive" }
androidx-material3-adaptive = { module = "androidx.compose.material3.adaptive:adaptive", version.ref = "adaptive" }
androidx-navigation-compose = { module = "androidx.navigation:navigation-compose", version.ref = "navigation" }

hilt-android = { module = "com.google.dagger:hilt-android", version.ref = "hilt" }
hilt-compiler = { module = "com.google.dagger:hilt-android-compiler", version.ref = "hilt" }
androidx-hilt-navigation-compose = { module = "androidx.hilt:hilt-navigation-compose", version.ref = "hilt-navigation" }

androidx-room-runtime = { module = "androidx.room:room-runtime", version.ref = "room" }
androidx-room-ktx = { module = "androidx.room:room-ktx", version.ref = "room" }
androidx-room-compiler = { module = "androidx.room:room-compiler", version.ref = "room" }
androidx-room-paging = { module = "androidx.room:room-paging", version.ref = "room" }

androidx-datastore-preferences = { module = "androidx.datastore:datastore-preferences", version.ref = "datastore" }
androidx-paging-runtime = { module = "androidx.paging:paging-runtime-ktx", version.ref = "paging" }
androidx-paging-compose = { module = "androidx.paging:paging-compose", version.ref = "paging" }
androidx-work-runtime-ktx = { module = "androidx.work:work-runtime-ktx", version = "2.11.0" }

coil-compose = { module = "io.coil-kt.coil3:coil-compose", version.ref = "coil" }
coil-network-okhttp = { module = "io.coil-kt.coil3:coil-network-okhttp", version.ref = "coil" }

# Supabase BOM
supabase-bom = { module = "io.github.jan-tennert.supabase:bom", version.ref = "supabase" }
supabase-auth = { module = "io.github.jan-tennert.supabase:auth-kt" }
supabase-postgrest = { module = "io.github.jan-tennert.supabase:postgrest-kt" }
supabase-storage = { module = "io.github.jan-tennert.supabase:storage-kt" }
supabase-realtime = { module = "io.github.jan-tennert.supabase:realtime-kt" }
supabase-functions = { module = "io.github.jan-tennert.supabase:functions-kt" }

ktor-client-okhttp = { module = "io.ktor:ktor-client-okhttp", version.ref = "ktor" }
ktor-client-cio = { module = "io.ktor:ktor-client-cio", version.ref = "ktor" }
ktor-content-negotiation = { module = "io.ktor:ktor-client-content-negotiation", version.ref = "ktor" }
ktor-serialization-kotlinx-json = { module = "io.ktor:ktor-serialization-kotlinx-json", version.ref = "ktor" }

kotlinx-serialization-json = { module = "org.jetbrains.kotlinx:kotlinx-serialization-json", version.ref = "kotlinx-serialization" }
kotlinx-coroutines-android = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-android", version.ref = "kotlinx-coroutines" }
kotlinx-datetime = { module = "org.jetbrains.kotlinx:kotlinx-datetime", version.ref = "kotlinx-datetime" }
kotlinx-collections-immutable = { module = "org.jetbrains.kotlinx:kotlinx-collections-immutable", version.ref = "kotlinx-collections" }

tensorflow-lite = { module = "org.tensorflow:tensorflow-lite", version.ref = "tflite" }
tensorflow-lite-gpu = { module = "org.tensorflow:tensorflow-lite-gpu-delegate-plugin", version = "0.5.0" }
mediapipe-tasks-vision = { module = "com.google.mediapipe:tasks-vision", version.ref = "mediapipe" }

camerax-core = { module = "androidx.camera:camera-core", version.ref = "camerax" }
camerax-camera2 = { module = "androidx.camera:camera-camera2", version.ref = "camerax" }
camerax-lifecycle = { module = "androidx.camera:camera-lifecycle", version.ref = "camerax" }
camerax-view = { module = "androidx.camera:camera-view", version.ref = "camerax" }
androidx-exifinterface = { module = "androidx.exifinterface:exifinterface", version.ref = "exif" }

junit = { module = "junit:junit", version.ref = "junit" }
androidx-test-ext-junit = { module = "androidx.test.ext:junit", version.ref = "androidx-test-ext-junit" }
espresso-core = { module = "androidx.test.espresso:espresso-core", version.ref = "espresso-core" }
androidx-compose-ui-test-junit4 = { module = "androidx.compose.ui:ui-test-junit4" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
android-library = { id = "com.android.library", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
kotlin-parcelize = { id = "org.jetbrains.kotlin.plugin.parcelize", version.ref = "kotlin" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
hilt = { id = "com.google.dagger.hilt.android", version.ref = "hilt" }
EOF

cat > $ROOT/build.gradle.kts <<'EOF'
// Top-level build file
plugins {
  alias(libs.plugins.android.application) apply false
  alias(libs.plugins.android.library) apply false
  alias(libs.plugins.kotlin.android) apply false
  alias(libs.plugins.kotlin.serialization) apply false
  alias(libs.plugins.kotlin.parcelize) apply false
  alias(libs.plugins.ksp) apply false
  alias(libs.plugins.hilt) apply false
}
EOF
echo "root done"
