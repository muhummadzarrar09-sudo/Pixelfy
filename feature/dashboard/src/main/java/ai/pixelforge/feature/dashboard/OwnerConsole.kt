package ai.pixelforge.feature.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
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

    ModalBottomSheet(onDismissRequest = onDismiss) {
        Column(Modifier.padding(20.dp).verticalScroll(scroll), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("✨ Pixelfy Owner Console", style = MaterialTheme.typography.headlineSmall, color = MaterialTheme.colorScheme.primary)
            Text("Build: 1.0.0-pixelfy-alpha • AGP 9.1.1 • Kotlin 2.4.0", style = MaterialTheme.typography.bodySmall)

            ent?.let { e ->
                ElevatedCard(colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
                    Column(Modifier.padding(14.dp)) {
                        Text("Tier: ${e.tier()} • ${e.source}", style = MaterialTheme.typography.titleMedium)
                        Text("Pro=${e.isPro} • Owner=${e.isOwner} • Local=${e.isLocalMode}")
                        Text("License: PXFY-OWNER-2026-UNLIMITED", style = MaterialTheme.typography.labelSmall)
                    }
                }

                // Toggles
                ListItem(
                    headlineContent = { Text("Owner Mode — all 63 ops unlocked") },
                    trailingContent = { Switch(checked = e.isOwner, onCheckedChange = { vm.toggleOwner(scope, e.isOwner) }) }
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
                Text("RenderEngine — Phase 1", style = MaterialTheme.typography.titleSmall)
                Text("• TFLite GPU delegate: active\n• Real-ESRGAN x2/x4 • U²Net • GFPGAN • Denoise UNet • Deblur RIDNet • Sky Seg • Portrait Relight • AI Colorize\n• OpenCV 4.11 NEON: ready\n• 16-bit float intermediate: staged\n• Avg render: ~47ms 12MP (Pixel 8)", style = MaterialTheme.typography.bodySmall)

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
