#!/bin/bash
set -e
ROOT=/home/user/home/user/pixelforge

# Manifest
mkdir -p $ROOT/app/src/main
cat > $ROOT/app/src/main/AndroidManifest.xml <<'MF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <application
        android:name=".PixelForgeApp"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="PixelForge"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.PixelForge"
        android:enableOnBackInvokedCallback="true">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.PixelForge"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            <!-- Supabase Magic Link -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="pixelforge" android:host="auth" />
            </intent-filter>
        </activity>
    </application>
</manifest>
MF

# resources
mkdir -p $ROOT/app/src/main/res/values
cat > $ROOT/app/src/main/res/values/themes.xml <<'TH'
<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="Theme.PixelForge" parent="android:Theme.Material.Light.NoActionBar" />
</resources>
TH
cat > $ROOT/app/src/main/res/values/strings.xml <<'S'
<resources>
    <string name="app_name">PixelForge</string>
</resources>
S
mkdir -p $ROOT/app/src/main/res/xml
cat > $ROOT/app/src/main/res/xml/backup_rules.xml <<'B'
<?xml version="1.0" encoding="utf-8"?><full-backup-content></full-backup-content>
B
cat > $ROOT/app/src/main/res/xml/data_extraction_rules.xml <<'D'
<?xml version="1.0" encoding="utf-8"?><data-extraction-rules><cloud-backup><exclude domain="sharedpref" path="."/></cloud-backup></data-extraction-rules>
D
# dummy mipmap
mkdir -p $ROOT/app/src/main/res/mipmap-xxxhdpi
touch $ROOT/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
touch $ROOT/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png
cp $ROOT/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png $ROOT/app/src/main/res/mipmap-xxxhdpi/ic_launcher.webp 2>/dev/null || true
mkdir -p $ROOT/app/src/main/res/mipmap-hdpi $ROOT/app/src/main/res/mipmap-mdpi $ROOT/app/src/main/res/mipmap-xhdpi $ROOT/app/src/main/res/mipmap-xxhdpi
cp $ROOT/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png $ROOT/app/src/main/res/mipmap-hdpi/ic_launcher.png
cp $ROOT/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png $ROOT/app/src/main/res/mipmap-mdpi/ic_launcher.png
cp $ROOT/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png $ROOT/app/src/main/res/mipmap-xhdpi/ic_launcher.png
cp $ROOT/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png $ROOT/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
cp $ROOT/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png $ROOT/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
cp $ROOT/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png $ROOT/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
cp $ROOT/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png $ROOT/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
cp $ROOT/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png $ROOT/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
cp $ROOT/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png $ROOT/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

# PixelForgeApp
cat > $ROOT/app/src/main/java/ai/pixelforge/enhancer/PixelForgeApp.kt <<'KT'
package ai.pixelforge.enhancer

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class PixelForgeApp: Application()
KT

# MainActivity
cat > $ROOT/app/src/main/java/ai/pixelforge/enhancer/MainActivity.kt <<'KT'
package ai.pixelforge.enhancer

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import ai.pixelforge.core.ui.theme.PixelForgeTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            PixelForgeTheme {
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    PixelForgeNavHost()
                }
            }
        }
    }
}
KT

# NavHost
mkdir -p $ROOT/app/src/main/java/ai/pixelforge/enhancer/navigation
cat > $ROOT/app/src/main/java/ai/pixelforge/enhancer/navigation/PixelForgeNavHost.kt <<'KT'
package ai.pixelforge.enhancer

import androidx.compose.material3.*
import androidx.compose.material3.adaptive.navigationsuite.NavigationSuiteScaffold
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.*
import ai.pixelforge.feature.dashboard.DashboardScreen
import ai.pixelforge.feature.gallery.GalleryScreen
import ai.pixelforge.feature.editor.EditorScreen
import ai.pixelforge.feature.batch.BatchScreen
import ai.pixelforge.feature.presets.PresetsScreen
import ai.pixelforge.feature.auth.AuthScreen

sealed class Dest(val route: String, val label: String, val icon: String) {
    data object Dashboard: Dest("dashboard","Home","⌂")
    data object Gallery: Dest("gallery","Gallery","▦")
    data object Editor: Dest("editor/{id}","Editor","✎")
    data object Batch: Dest("batch","Batch","⟳")
    data object Presets: Dest("presets","Presets","✦")
    data object Exports: Dest("exports","Exports","⇩")
    data object Auth: Dest("auth","Sign in","◉")
}
val topDestinations = listOf(Dest.Dashboard, Dest.Gallery, Dest.Batch, Dest.Presets, Dest.Exports)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PixelForgeNavHost() {
    val navController = rememberNavController()
    val backStack by navController.currentBackStackEntryAsState()
    val currentRoute = backStack?.destination?.route ?: Dest.Dashboard.route
    var showAuth by rememberSaveable { mutableStateOf(false) }

    NavigationSuiteScaffold(
        navigationSuiteItems = {
            topDestinations.forEach { dest ->
                item(
                    selected = currentRoute.startsWith(dest.route.substringBefore("/{")),
                    onClick = { 
                        navController.navigate(dest.route.substringBefore("/{")) {
                            popUpTo(Dest.Dashboard.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    icon = { Text(dest.icon) },
                    label = { Text(dest.label) }
                )
            }
        }
    ) {
        NavHost(navController, startDestination = Dest.Dashboard.route, modifier = Modifier) {
            composable(Dest.Dashboard.route) { DashboardScreen(
                onOpenProject = { id -> navController.navigate("editor/$id") },
                onOpenAuth = { showAuth = true }
            )}
            composable(Dest.Gallery.route) { GalleryScreen(onOpen = { id -> navController.navigate("editor/$id") }) }
            composable(Dest.Batch.route) { BatchScreen() }
            composable(Dest.Presets.route) { PresetsScreen() }
            composable(Dest.Exports.route) { 
                ai.pixelforge.feature.presets.ExportsScreen() 
            }
            composable(Dest.Editor.route) { entry ->
                val id = entry.arguments?.getString("id") ?: "demo"
                EditorScreen(projectId = id, onBack = { navController.popBackStack() })
            }
        }
        if (showAuth) {
            AlertDialog(
                onDismissRequest = { showAuth = false },
                confirmButton = {},
                title = { Text("Sign in") },
                text = { AuthScreen(onSignedIn = { showAuth = false }) }
            )
        }
    }
}
KT

# Core UI theme
mkdir -p $ROOT/core/ui/src/main/java/ai/pixelforge/core/ui/theme
cat > $ROOT/core/ui/src/main/java/ai/pixelforge/core/ui/theme/Theme.kt <<'KT'
package ai.pixelforge.core.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.sp
import androidx.compose.ui.text.TextStyle

private val DarkColors = darkColorScheme()
private val LightColors = lightColorScheme()

@Composable
fun PixelForgeTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val ctx = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(ctx) else dynamicLightColorScheme(ctx)
        }
        darkTheme -> DarkColors
        else -> LightColors
    }
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(
            bodyLarge = TextStyle(fontFamily = FontFamily.Default, fontSize = 16.sp, lineHeight = 24.sp)
        ),
        content = content
    )
}
KT

echo "src base done"
