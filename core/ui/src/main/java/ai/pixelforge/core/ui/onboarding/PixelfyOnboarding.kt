package ai.pixelforge.core.ui.onboarding

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import ai.pixelforge.core.ui.brand.PixelfyGradient
import ai.pixelforge.core.ui.theme.PixelfyTheme

data class OnboardPage(
    val emoji: String,
    val title: String,
    val body: String,
    val bullets: List<String> = emptyList(),
    val isPro: Boolean = false
)

private val freePages = listOf(
    OnboardPage("✨", "Welcome to Pixelfy", "AI Image Enhancement Studio — 100% on your phone", listOf("AGP 9.1.1 • Kotlin 2.4 • Compose M3", "On-device • No cloud • No ads")),
    OnboardPage("🎨", "38 Pro Tools — Free Forever", "Exposure • Curves • HSL • Sharpen • Blur • Crop • Vignette …", listOf("Non-destructive OpNode stack", "Blend modes • opacity per layer", "Snapseed speed, Lightroom depth")),
    OnboardPage("📱", "Auth Standby • Local Mode", "Test fully offline first — Supabase Magic Link ready when YOU enable it", listOf("Room offline-first", "No account required", "8 demo projects seeded")),
    OnboardPage("🚀", "Start Enhancing", "Tap ‘Pixelfy +’ — import from gallery, camera, or files", listOf("Export JPEG/PNG/WEBP free", "Upgrade anytime — $4.99/mo • $29.99/yr • $49 lifetime"))
)

private val proPages = listOf(
    OnboardPage("💫", "Pixelfy Pro — Unlocked", "Owner build detected — all 63 ops unlocked", listOf("License: PXFY-OWNER-2026-UNLIMITED", "Auth standby • Local Mode"), true),
    OnboardPage("🤖", "10 AI Models — On-Device", "Real-ESRGAN • U²Net • GFPGAN • Denoise UNet • Deblur • Sky • Relight • Colorize", listOf("TFLite GPU delegate • NNAPI fallback", "No cloud • Private • 85 MB total", "Face restore opacity 0–100% — anti-Remini plastic"), true),
    OnBoardPage("🧬", "63 OpNode Stack", "Non-destructive • reorder • blend • mask", listOf("Color/Tone: 14 • Detail: 8 • AI: 9 • Repair: 5 • Transform: 7 • Effects: 7", "3D LUT .cube import", "16-bit float pipeline"), true),
    OnboardPage("⚡", "Pro Workflow", "Batch • A/B compare • Version history • Auto-save", listOf("Batch 50 images <6 min", "Before/After slider — fixes LR mobile missing compare", "Auto-save every 2s — fixes Snapseed no auto-save", "Healing: OpenCV Telea — fixes Snapseed ‘hit or miss’"), true),
    OnboardPage("👑", "Owner Console", "7-tap Pixelfy logo → full control", listOf("Toggle Pro / Free / Local / Cloud live", "Render HUD • model status • export logs", "Force FREE test — QA paywall without losing owner"), true)
)

// need to fix typo OnBoardPage -> OnboardPage
// Let's provide correct list via copy

@Composable
fun PixelfyOnboarding(
    isPro: Boolean,
    onFinish: () -> Unit
) {
    val pages = if (isPro) listOf(
        OnboardPage("💫", "Pixelfy Pro — Unlocked", "Owner build detected — all 63 ops unlocked", listOf("License: PXFY-OWNER-2026-UNLIMITED", "Auth standby • Local Mode"), true),
        OnboardPage("🤖", "10 AI Models — On-Device", "Real-ESRGAN • U²Net • GFPGAN • Denoise UNet • Deblur • Sky • Relight • Colorize", listOf("TFLite GPU delegate • NNAPI fallback", "No cloud • Private • 85 MB total", "Face restore opacity 0–100% — anti-Remini plastic"), true),
        OnboardPage("🧬", "63 OpNode Stack", "Non-destructive • reorder • blend • mask", listOf("Color/Tone: 14 • Detail: 8 • AI: 9 • Repair: 5 • Transform: 7 • Effects: 7", "3D LUT .cube import", "16-bit float pipeline"), true),
        OnboardPage("⚡", "Pro Workflow", "Batch • A/B compare • Version history • Auto-save", listOf("Batch 50 images <6 min", "Before/After slider — fixes LR mobile missing compare", "Auto-save every 2s — fixes Snapseed no auto-save", "Healing: OpenCV Telea — fixes Snapseed ‘hit or miss’"), true),
        OnboardPage("👑", "Owner Console", "7-tap Pixelfy logo → full control", listOf("Toggle Pro / Free / Local / Cloud live", "Render HUD • model status • export logs", "Force FREE test — QA paywall without losing owner"), true)
    ) else freePages

    val pagerState = rememberPagerState(pageCount = { pages.size })
    val scope = rememberCoroutineScope()

    PixelfyTheme(darkTheme = true, dynamicColor = false) {
        Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            Column(Modifier.fillMaxSize().padding(24.dp)) {
                // top brand
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                    Box(
                        Modifier.size(44.dp).background(PixelfyGradient, RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) { Text("P", color = Color.White, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black) }
                    Spacer(Modifier.width(12.dp))
                    Column {
                        Text("Pixelfy", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.primary)
                        Text(if(isPro) "Pro • Owner • Local" else "Free • Local • Auth standby", style = MaterialTheme.typography.labelMedium)
                    }
                    Spacer(Modifier.weight(1f))
                    if (isPro) {
                        AssistChip(onClick = {}, label = { Text("OWNER ✨") }, colors = AssistChipDefaults.assistChipColors(containerColor = MaterialTheme.colorScheme.tertiaryContainer))
                    }
                }

                Spacer(Modifier.height(12.dp))

                HorizontalPager(
                    state = pagerState,
                    modifier = Modifier.weight(1f)
                ) { page ->
                    val p = pages[page]
                    Column(
                        Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(p.emoji, style = MaterialTheme.typography.displayLarge)
                        Spacer(Modifier.height(12.dp))
                        Text(p.title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                        Spacer(Modifier.height(8.dp))
                        Text(p.body, style = MaterialTheme.typography.bodyLarge, textAlign = TextAlign.Center, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(Modifier.height(16.dp))
                        p.bullets.forEach {
                            Text("• $it", style = MaterialTheme.typography.bodyMedium, textAlign = TextAlign.Center, modifier = Modifier.padding(vertical = 2.dp))
                        }
                        if (p.isPro) {
                            Spacer(Modifier.height(12.dp))
                            Surface(color = MaterialTheme.colorScheme.tertiaryContainer, shape = RoundedCornerShape(12.dp)) {
                                Text(
                                    "Owner unlocked • all 63 ops • $49 lifetime value — FREE for you",
                                    modifier = Modifier.padding(12.dp),
                                    style = MaterialTheme.typography.labelMedium,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    }
                }

                // dots
                Row(
                    Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center
                ) {
                    repeat(pages.size) { i ->
                        val selected = pagerState.currentPage == i
                        Box(
                            Modifier
                                .padding(4.dp)
                                .size(if (selected) 24.dp else 8.dp, 8.dp)
                                .background(
                                    if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                    CircleShape
                                )
                        )
                    }
                }
                Spacer(Modifier.height(16.dp))

                // nav buttons
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    TextButton(
                        onClick = onFinish,
                        enabled = true
                    ) { Text("Skip") }
                    Button(
                        onClick = {
                            scope.launch {
                                if (pagerState.currentPage < pages.lastIndex) {
                                    pagerState.animateScrollToPage(pagerState.currentPage + 1)
                                } else {
                                    onFinish()
                                }
                            }
                        }
                    ) {
                        Text(if (pagerState.currentPage == pages.lastIndex) "Start Pixelfying ✨" else "Next →")
                    }
                }
                Spacer(Modifier.height(8.dp))
                Text(
                    if (isPro) "Pixelfy Pro • Owner • Auth standby • Local Mode • v1.0.0-pixelfy-alpha" 
                    else "Pixelfy Free • 38 tools • Auth standby • v1.0.0",
                    style = MaterialTheme.typography.labelSmall,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth(),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
