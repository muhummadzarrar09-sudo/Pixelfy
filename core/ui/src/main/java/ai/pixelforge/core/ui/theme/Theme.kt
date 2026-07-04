package ai.pixelforge.core.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.compose.ui.text.TextStyle

// Pixelfy Brand — July 2026
// Primary: Electric Purple #8B5CF6
// Secondary: Teal Mint #06FFA5
// Tertiary: Hot Pink #FF3B9A
// Accent: Deep Violet #5B21B6
// Surface: #0F0B1A dark / #FEFCFF light

private val PixelfyPurple = Color(0xFF8B5CF6)
private val PixelfyTeal = Color(0xFF06FFA5)
private val PixelfyPink = Color(0xFFFF3B9A)
private val PixelfyDeep = Color(0xFF5B21B6)
private val PixelfyDarkBg = Color(0xFF0F0B1A)
private val PixelfyDarkSurface = Color(0xFF1A1328)

private val PixelfyLightColors = lightColorScheme(
    primary = PixelfyPurple,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFE9D5FF),
    onPrimaryContainer = PixelfyDeep,
    secondary = PixelfyTeal,
    onSecondary = Color(0xFF002117),
    secondaryContainer = Color(0xFFA6F4D5),
    onSecondaryContainer = Color(0xFF002117),
    tertiary = PixelfyPink,
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFFFFD8E4),
    onTertiaryContainer = Color(0xFF5F112B),
    background = Color(0xFFFEFCFF),
    surface = Color(0xFFFEFCFF),
    surfaceVariant = Color(0xFFE7E0EC),
    outline = Color(0xFF938F99)
)

private val PixelfyDarkColors = darkColorScheme(
    primary = Color(0xFFD0BCFF),
    onPrimary = Color(0xFF381E72),
    primaryContainer = PixelfyDeep,
    onPrimaryContainer = Color(0xFFE9D5FF),
    secondary = PixelfyTeal,
    onSecondary = Color(0xFF003828),
    secondaryContainer = Color(0xFF00513D),
    onSecondaryContainer = Color(0xFFA6F4D5),
    tertiary = Color(0xFFFFB1C8),
    onTertiary = Color(0xFF5F112B),
    tertiaryContainer = Color(0xFF7E2A4A),
    onTertiaryContainer = Color(0xFFFFD8E4),
    background = PixelfyDarkBg,
    surface = PixelfyDarkSurface,
    surfaceVariant = Color(0xFF49454F),
    outline = Color(0xFF938F99)
)

@Composable
fun PixelfyTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false, // Pixelfy brand ON by default — toggle true for Material You
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val ctx = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(ctx) else dynamicLightColorScheme(ctx)
        }
        darkTheme -> PixelfyDarkColors
        else -> PixelfyLightColors
    }
    val pixelfyTypography = Typography(
        displayLarge = TextStyle(fontFamily = FontFamily.Default, fontWeight = FontWeight.ExtraBold, fontSize = 57.sp, letterSpacing = (-0.25).sp),
        titleLarge = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 22.sp),
        bodyLarge = TextStyle(fontFamily = FontFamily.Default, fontSize = 16.sp, lineHeight = 24.sp),
        labelLarge = TextStyle(fontWeight = FontWeight.Medium, fontSize = 14.sp, letterSpacing = 0.1.sp)
    )
    MaterialTheme(
        colorScheme = colorScheme,
        typography = pixelfyTypography,
        content = content
    )
}

// Back-compat alias
@Composable
fun PixelForgeTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) = PixelfyTheme(darkTheme, dynamicColor, content)

