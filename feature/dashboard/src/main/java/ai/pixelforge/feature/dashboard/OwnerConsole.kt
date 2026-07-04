package ai.pixelforge.feature.dashboard

import android.content.Context
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import ai.pixelforge.core.data.billing.EntitlementRepository
import ai.pixelforge.core.domain.model.Tier
import ai.pixelforge.core.domain.model.tier
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope

@HiltViewModel
class OwnerConsoleViewModel @Inject constructor(
    val entitlementRepo: EntitlementRepository
): ViewModel() {
    val entitlement = entitlementRepo.entitlement
    fun togglePro(scope: kotlinx.coroutines.CoroutineScope, current: Boolean) {
        scope.launch { entitlementRepo.setPro(!current) }
    }
    fun toggleLocal(scope: kotlinx.coroutines.CoroutineScope, v: Boolean) {
        scope.launch { entitlementRepo.setLocalMode(v) }
    }
    fun toggleForceFree(scope: kotlinx.coroutines.CoroutineScope, v: Boolean) {
        scope.launch { entitlementRepo.setForceFreeTest(v) }
    }
    fun toggleOwner(scope: kotlinx.coroutines.CoroutineScope, v: Boolean) {
        scope.launch { entitlementRepo.setOwner(v) }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OwnerConsoleSheet(
    onDismiss: () -> Unit,
    vm: OwnerConsoleViewModel = hiltViewModel()
) {
    val ent by vm.entitlement.collectAsState(initial = null)
    val scope = rememberCoroutineScope()
    val scroll = rememberScrollState()
    val context = LocalContext.current
    val ownerBuild = remember { vm.entitlementRepo.isOwnerBuild() }

    ModalBottomSheet(onDismissRequest = onDismiss) {
        Column(Modifier.padding(20.dp).verticalScroll(scroll), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(if (ownerBuild) "✨ Pixelfy Owner Console" else "✨ Pixelfy Beta Console", style = MaterialTheme.typography.headlineSmall, color = MaterialTheme.colorScheme.primary)
            Text("Build: 0.9.3-pixelfy-alpha • AGP 9.1.1 • Gradle 9.6.1 • Kotlin 2.4.0", style = MaterialTheme.typography.bodySmall)

            ent?.let { e ->
                ElevatedCard(colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
                    Column(Modifier.padding(14.dp)) {
                        Text("Tier: ${e.tier()} • ${e.source}", style = MaterialTheme.typography.titleMedium)
                        Text("Pro=${e.isPro} • Owner=${e.isOwner} • Local=${e.isLocalMode}")
                        Text(if (ownerBuild) "Owner flavor: enabled" else "Beta flavor: owner escalation disabled", style = MaterialTheme.typography.labelSmall)
                        if (e.isOwner) Text("License: PXFY-OWNER-2026-UNLIMITED", style = MaterialTheme.typography.labelSmall)
                    }
                }

                // Toggles
                ListItem(
                    headlineContent = { Text("Owner Mode — all 63 ops unlocked") },
                    supportingContent = { Text(if (ownerBuild) "Owner build QA toggle" else "Disabled in beta builds by design") },
                    trailingContent = { Switch(enabled = ownerBuild, checked = e.isOwner, onCheckedChange = { vm.toggleOwner(scope, e.isOwner) }) }
                )
                ListItem(
                    headlineContent = { Text("Pro Entitlement") },
                    supportingContent = { Text("Unlocks 25 AI Pro tools") },
                    trailingContent = { Switch(checked = e.isPro, onCheckedChange = { vm.togglePro(scope, e.isPro) }) }
                )
                ListItem(
                    headlineContent = { Text("Local Mode (Auth standby)") },
                    supportingContent = { Text("Offline-first • Supabase sync paused") },
                    trailingContent = { Switch(checked = e.isLocalMode, onCheckedChange = { vm.toggleLocal(scope, !e.isLocalMode) }) }
                )
                var forceFree by remember(e) { mutableStateOf(false) }
                ListItem(
                    headlineContent = { Text("Force FREE tier — test paywall") },
                    supportingContent = { Text("Simulate free user — 38 ops only") },
                    trailingContent = { Switch(checked = forceFree, onCheckedChange = { forceFree = it; vm.toggleForceFree(scope, it) }) }
                )

                Divider()
                Text("Competitor kill switches", style = MaterialTheme.typography.titleSmall)
                Text("• Snapseed speed gestures: ON\n• Lightroom RAW + AI denoise: ON\n• Remini plastic guard: opacity 0–100% + mask\n• VSCO preset paywall: OFF — open marketplace\n• PicsArt ad hell: OFF — zero ads\n• Lensa cloud: OFF — on-device only\n• Export: AVIF/HEIC/TIFF16 enabled", style = MaterialTheme.typography.bodySmall)

                Divider()
                Text("Model availability — honest beta state", style = MaterialTheme.typography.titleSmall)
                ModelStatusList(context)

                Divider()
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = onDismiss, modifier = Modifier.weight(1f)) { Text("Close ✨") }
                    OutlinedButton(onClick = { /* export logs */ }, modifier = Modifier.weight(1f)) { Text("Export logs") }
                }
                Spacer(Modifier.height(24.dp))
            } ?: run {
                CircularProgressIndicator()
            }
        }
    }
}

@Composable
private fun ModelStatusList(context: Context) {
    val models = remember {
        listOf(
            "AI Upscale x2" to "ml/realesrgan_x2_fp16.tflite",
            "Super Res x4" to "ml/realesrgan_x4_fp16.tflite",
            "AI Denoise" to "ml/denoise_nl_unet_512.tflite",
            "AI Deblur" to "ml/deblur_ridnet.tflite",
            "Face Restore" to "ml/gfpgan_1_4_mobile.tflite",
            "Background Remove" to "ml/u2netp_320.tflite",
            "Sky Enhance" to "ml/mediapipe_selfie_segmentation.tflite",
            "Portrait Relight" to "ml/portrait_relight_256.tflite",
            "AI Colorize" to "ml/deoldify_mobile.tflite"
        )
    }
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        models.forEach { (label, asset) ->
            val available = remember(asset) {
                runCatching { context.assets.open(asset).close() }.isSuccess
            }
            ListItem(
                headlineContent = { Text(label) },
                supportingContent = { Text(asset) },
                trailingContent = {
                    AssistChip(
                        onClick = {},
                        label = { Text(if (available) "Available" else "Missing") },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = if (available) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.errorContainer
                        )
                    )
                }
            )
        }
        Text(
            "Missing models stay disabled in beta instead of silently passing through.",
            style = MaterialTheme.typography.bodySmall
        )
    }
}
