package ai.pixelforge.feature.dashboard

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import ai.pixelforge.core.data.repo.ProjectRepository
import ai.pixelforge.core.domain.model.Project
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DashboardViewModel @Inject constructor(
    val repo: ProjectRepository,
    val entitlementRepo: ai.pixelforge.core.data.billing.EntitlementRepository
): ViewModel() {
    val projects = repo.projects
    val entitlement = entitlementRepo.entitlement
    init { viewModelScope.launch { 
        if (repo.projects.value.isEmpty()) SeedData.seed(repo)
        repo.refresh() 
    }}
    fun easterTap(scope: kotlinx.coroutines.CoroutineScope, onUnlock: () -> Unit) = scope.launch {
        val count = entitlementRepo.tapEaster()
        if (count == 0) onUnlock() // unlocked resets to 0
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalFoundationApi::class)
@Composable
fun DashboardScreen(onOpenProject: (String)->Unit, onOpenAuth: ()->Unit, vm: DashboardViewModel = hiltViewModel()) {
    val projects by vm.projects.collectAsState()
    val ent by vm.entitlement.collectAsState(initial = ai.pixelforge.core.domain.model.Entitlement(isPro = true, isOwner = true, isLocalMode = true, source = "owner"))
    var ownerConsoleOpen by remember { mutableStateOf(false) }
    var tapCount by remember { mutableIntStateOf(0) }
    val scope = rememberCoroutineScope()
    val entitlementRepo = vm.entitlementRepo

    Scaffold(topBar = {
        TopAppBar(
            title = { 
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.combinedClickable(
                        onClick = {
                            tapCount++
                            if (tapCount >= 7) {
                                ownerConsoleOpen = true
                                tapCount = 0
                                scope.launch {
                                    vm.easterTap(scope) { ownerConsoleOpen = true }
                                }
                            }
                        },
                        onLongClick = { ownerConsoleOpen = true }
                    )
                ) {
                    Text("✨ ", style = MaterialTheme.typography.titleLarge)
                    Text("Pixelfy", style = MaterialTheme.typography.titleLarge)
                    Spacer(Modifier.width(8.dp))
                    AssistChip(
                        onClick = { ownerConsoleOpen = true },
                        label = { 
                            Text(
                                when {
                                    ent.isOwner -> "OWNER"
                                    ent.isPro -> "PRO"
                                    else -> "v1.0 local"
                                }, 
                                style = MaterialTheme.typography.labelSmall
                            ) 
                        },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = when {
                                ent.isOwner -> MaterialTheme.colorScheme.tertiaryContainer
                                ent.isPro -> MaterialTheme.colorScheme.primaryContainer
                                else -> MaterialTheme.colorScheme.surfaceVariant
                            }
                        )
                    )
                }
            },
            actions = {
                if (ent.isLocalMode) {
                    AssistChip(onClick = onOpenAuth, label = { Text("Auth standby") }, leadingIcon = { Text("🔒") })
                } else {
                    AssistChip(onClick = onOpenAuth, label = { Text("Sign in") })
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(
                containerColor = MaterialTheme.colorScheme.surface,
                titleContentColor = MaterialTheme.colorScheme.primary
            )
        )
    }, floatingActionButton = {
        ExtendedFloatingActionButton(
            onClick = { /* import */ }, 
            text = { Text("Pixelfy +") },
            icon = { Text("✨") },
            containerColor = MaterialTheme.colorScheme.primaryContainer
        )
    }) { pad ->
        if (projects.isEmpty()) {
            EmptyState(pad)
        } else {
            Column(Modifier.padding(pad).padding(16.dp)) {
                // Local mode banner
                ElevatedCard(
                    colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text("🧪 ", style = MaterialTheme.typography.titleMedium)
                        Column(Modifier.weight(1f)) {
                            Text("Local Test Mode", style = MaterialTheme.typography.titleSmall)
                            Text("Auth on standby • all 63 ops unlocked locally • Supabase sync paused", style = MaterialTheme.typography.bodySmall)
                        }
                        TextButton(onClick = onOpenAuth) { Text("Auth") }
                    }
                }
                Spacer(Modifier.height(16.dp))
                StatsRow(projects)
                Spacer(Modifier.height(16.dp))
                Text("Recent Pixelfy projects", style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.height(8.dp))
                LazyVerticalGrid(columns = GridCells.Adaptive(160.dp), verticalArrangement = Arrangement.spacedBy(12.dp), horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxSize()) {
                    items(projects.size) { i ->
                        ProjectCard(projects[i], onOpenProject, vm)
                    }
                }
            }
        }
    // Owner console — 7-tap easter egg
    if (ownerConsoleOpen) {
        OwnerConsoleSheet(onDismiss = { ownerConsoleOpen = false })
    }

    }
}

@Composable
fun StatsRow(projects: List<Project>) {
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
        ElevatedCard(Modifier.weight(1f), colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) { 
            Column(Modifier.padding(16.dp)) { 
                Text("${projects.size}", style = MaterialTheme.typography.headlineSmall, color = MaterialTheme.colorScheme.onPrimaryContainer)
                Text("Pixelfy", style = MaterialTheme.typography.labelMedium) 
            } 
        }
        ElevatedCard(Modifier.weight(1f), colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)) { 
            Column(Modifier.padding(16.dp)) { 
                Text("63", style = MaterialTheme.typography.headlineSmall)
                Text("Ops", style = MaterialTheme.typography.labelMedium) 
            } 
        }
        ElevatedCard(Modifier.weight(1f), colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.tertiaryContainer)) { 
            Column(Modifier.padding(16.dp)) { 
                Text("AI", style = MaterialTheme.typography.headlineSmall)
                Text("Local", style = MaterialTheme.typography.labelMedium) 
            } 
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProjectCard(p: Project, onOpen: (String)->Unit, vm: DashboardViewModel) {
    ElevatedCard(onClick = { onOpen(p.id) }) {
        Column(Modifier.padding(14.dp)) {
            Text(p.title, style = MaterialTheme.typography.titleMedium)
            Text("${p.width}×${p.height} · ${p.status}", style = MaterialTheme.typography.bodySmall)
            Spacer(Modifier.height(8.dp))
            Row {
                AssistChip(onClick = { /* optimistic */ }, label = { Text(if (p.isFavorite) "★" else "☆") })
                Spacer(Modifier.width(8.dp))
                AssistChip(onClick = {}, label = { Text(p.tags.firstOrNull() ?: "edit") })
            }
        }
    }
}

@Composable
fun EmptyState(pad: PaddingValues) {
    Box(Modifier.fillMaxSize().padding(pad), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("✨", style = MaterialTheme.typography.displayLarge)
            Text("Pixelfy", style = MaterialTheme.typography.displaySmall, color = MaterialTheme.colorScheme.primary)
            Text("AI Image Enhancement", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(8.dp))
            AssistChip(onClick = {}, enabled = false, label = { Text("Auth standby • Local mode") })
            Spacer(Modifier.height(16.dp))
            Text("No projects yet", style = MaterialTheme.typography.titleLarge)
            Text("Import a photo to start enhancing", style = MaterialTheme.typography.bodyMedium)
            Spacer(Modifier.height(12.dp))
            Button(onClick = {}, colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)) { Text("✨ Pixelfy Image") }
            Spacer(Modifier.height(8.dp))
            TextButton(onClick = {}) { Text("Try demo projects →") }
        }
    }
}

object SeedData {
    suspend fun seed(repo: ProjectRepository) {
        val demo = listOf(
            Project("pfy1","Pixelfy Portrait • NYC",null,4000,6000,"exported",true,listOf("portrait","ai","pixelfy")),
            Project("pfy2","Kyoto Temple – Pixelfy HDR",null,5472,3648,"draft",false,listOf("travel","hdr")),
            Project("pfy3","Food Flatlay Pro",null,3024,3024,"processing",false,listOf("food","pixelfy")),
            Project("pfy4","Astro Milky Way • AI Denoise",null,6000,4000,"exported",true,listOf("astro","denoise","ai")),
            Project("pfy5","Sneaker Drop – Clean",null,4500,4500,"draft",false,listOf("product","pixelfy")),
            Project("pfy6","B&W Street • Portra",null,2400,3600,"exported",false,listOf("bw","film")),
            Project("pfy7","Pixelfy Selfie ✨",null,3088,3088,"draft",true,listOf("selfie","face-restore")),
            Project("pfy8","Sky Replace Demo",null,6000,4000,"exported",false,listOf("sky","ai"))
        )
        demo.forEach { repo.upsert(it) }
    }
}
