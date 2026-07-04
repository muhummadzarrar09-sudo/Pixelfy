# Pixelfy — Transition Phase 3 hardening
# Keep only framework/reflection entry points. Do NOT use broad `-keep class **`.

-keepattributes *Annotation*, Signature, InnerClasses, EnclosingMethod

# Hilt / Dagger generated entry points
-keep class dagger.hilt.** { *; }
-keep class hilt_aggregated_deps.** { *; }
-keep class *_HiltModules_* { *; }
-keep class * extends dagger.hilt.android.lifecycle.HiltViewModel { *; }
-keep class * extends androidx.work.ListenableWorker { *; }

# Room database/DAO/entity metadata used by generated code and migrations
-keep class * extends androidx.room.RoomDatabase { *; }
-keep @androidx.room.Entity class * { *; }
-keep @androidx.room.Dao class * { *; }

# Kotlinx serialization generated serializers
-keepclassmembers class **$$serializer { *; }
-keepclassmembers class **$Companion { *; }
-keepclasseswithmembers class * {
    kotlinx.serialization.KSerializer serializer(...);
}

# TensorFlow Lite / MediaPipe native bindings
-keep class org.tensorflow.lite.** { *; }
-keep class com.google.mediapipe.** { *; }
-dontwarn org.tensorflow.**
-dontwarn com.google.mediapipe.**
-dontwarn org.opencv.**

# Supabase/Ktor models use serialization; retain annotations/signatures above.
-dontwarn io.ktor.**
-dontwarn io.github.jan.supabase.**
