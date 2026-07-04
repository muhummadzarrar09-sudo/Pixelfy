package ai.pixelforge.feature.dashboard

import android.content.Context
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import ai.pixelforge.core.data.billing.EntitlementRepository
import ai.pixelforge.core.data.repo.ProjectRepository
import ai.pixelforge.core.domain.model.Entitlement
import ai.pixelforge.core.domain.model.Project
import dagger.hilt.android.lifecycle.HiltViewModel
import java.io.File
import java.io.FileOutputStream
import java.util.UUID
import javax.inject.Inject
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@HiltViewModel
class DashboardViewModel @Inject constructor(
    val repo: ProjectRepository,
    val entitlementRepo: EntitlementRepository
) : ViewModel() {
    val projects = repo.projects
    val entitlement = entitlementRepo.entitlement

    init {
        viewModelScope.launch {
            if (repo.projects.value.isEmpty()) SeedData.seed(repo)
            repo.refresh()
        }
    }

    fun easterTap(scope: CoroutineScope, onUnlock: () -> Unit) = scope.launch {
        val count = entitlementRepo.tapEaster()
        if (count == 0) onUnlock()
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalFoundationApi::class)
@Composable
fun DashboardScreen(
    onOpenProject: (String) -> Unit,
    onOpenAuth: () -> Unit,
    vm: DashboardViewModel = hiltViewModel()
) {
    val projects by vm.projects.collectAsState()
    val ent by vm.entitlement.collectAsState(
        initial = Entitlement(isPro = true, isOwner = true, isLocalMode = true, source = "owner")
    )
    var ownerConsoleOpen by remember { mutableStateOf(false) }
    var tapCount by remember { mutableIntStateOf(0) }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    fun importUri(uri: Uri) {
        val id = UUID.randomUUID().toString()
        scope.launch {
            val localUri = copyImportedImage(context, uri, id) ?: uri.toString()
            val project = Project(
                id = id,
                title = "Imported photo",
                thumbUri = localUri,
                width = 0,
                height = 0,
                status = "draft",
                isFavorite = false,
                tags = listOf("imported", "local"),
                updatedAt = System.currentTimeMillis()
            )
            vm.repo.upsert(project)
            onOpenProject(id)
        }
    }

    val photoPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
        onResult = { uri -> if (uri != null) importUri(uri) }
    )
    val launchImport = {
        photoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
    }

    Scaffold(
        topBar = {
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
                                    vm.easterTap(scope) { ownerConsoleOpen = true }
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
                                        else -> "LOCAL"
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
                    AssistChip(
                        onClick = onOpenAuth,
                        label = { Text(if (ent.isLocalMode) "Auth standby" else "Sign in") },
                        leadingIcon = { if (ent.isLocalMode) Text("🔒") }
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.primary
                )
            )
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = launchImport,
                text = { Text("Import photo") },
                icon = { Text("✨") },
                containerColor = MaterialTheme.colorScheme.primaryContainer
            )
        }
    ) { pad ->
        if (projects.isEmpty()) {
            EmptyState(pad, onImport = launchImport)
        } else {
            Column(Modifier.padding(pad).padding(16.dp)) {
                LocalModeBanner(onOpenAuth)
                Spacer(Modifier.height(16.dp))
                StatsRow(projects)
                Spacer(Modifier.height(16.dp))
                Text("Recent Pixelfy projects", style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.height(8.dp))
                LazyVerticalGrid(
                    columns = GridCells.Adaptive(160.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(projects.size) { i ->
                        ProjectCard(projects[i], onOpenProject, vm)
                    }
                }
            }
        }

        if (ownerConsoleOpen) {
            OwnerConsoleSheet(onDismiss = { ownerConsoleOpen = false })
        }
    }
}

@Composable
private fun LocalModeBanner(onOpenAuth: () -> Unit) {
    ElevatedCard(
        colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Text("🧪 ", style = MaterialTheme.typography.titleMedium)
            Column(Modifier.weight(1f)) {
                Text("Local Test Mode", style = MaterialTheme.typography.titleSmall)
                Text(
                    "No account needed • photos stay on device • cloud sync paused",
                    style = MaterialTheme.typography.bodySmall
                )
            }
            TextButton(onClick = onOpenAuth) { Text("Auth") }
        }
    }
}

@Composable
fun StatsRow(projects: List<Project>) {
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
        ElevatedCard(
            Modifier.weight(1f),
            colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
        ) {
            Column(Modifier.padding(16.dp)) {
                Text("${projects.size}", style = MaterialTheme.typography.headlineSmall, color = MaterialTheme.colorScheme.onPrimaryContainer)
                Text("Projects", style = MaterialTheme.typography.labelMedium)
            }
        }
        ElevatedCard(
            Modifier.weight(1f),
            colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)
        ) {
            Column(Modifier.padding(16.dp)) {
                Text("63", style = MaterialTheme.typography.headlineSmall)
                Text("Tools", style = MaterialTheme.typography.labelMedium)
            }
        }
        ElevatedCard(
            Modifier.weight(1f),
            colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.tertiaryContainer)
        ) {
            Column(Modifier.padding(16.dp)) {
                Text("AI", style = MaterialTheme.typography.headlineSmall)
                Text("Local", style = MaterialTheme.typography.labelMedium)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProjectCard(p: Project, onOpen: (String) -> Unit, vm: DashboardViewModel) {
    val scope = rememberCoroutineScope()
    ElevatedCard(onClick = { onOpen(p.id) }) {
        Column(Modifier.padding(14.dp)) {
            Text(p.title, style = MaterialTheme.typography.titleMedium)
            Text(
                if (p.width > 0 && p.height > 0) "${p.width}×${p.height} · ${p.status}" else "Local import · ${p.status}",
                style = MaterialTheme.typography.bodySmall
            )
            Spacer(Modifier.height(8.dp))
            Row {
                AssistChip(
                    onClick = { scope.launch { vm.repo.toggleFavorite(p.id) } },
                    label = { Text(if (p.isFavorite) "★ Favorite" else "☆ Favorite") }
                )
                Spacer(Modifier.width(8.dp))
                AssistChip(onClick = {}, label = { Text(p.tags.firstOrNull() ?: "edit") })
            }
        }
    }
}

@Composable
fun EmptyState(pad: PaddingValues, onImport: () -> Unit) {
    Box(Modifier.fillMaxSize().padding(pad), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("✨", style = MaterialTheme.typography.displayLarge)
            Text("Pixelfy", style = MaterialTheme.typography.displaySmall, color = MaterialTheme.colorScheme.primary)
            Text("Enhance privately. No account required.", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(8.dp))
            AssistChip(onClick = {}, enabled = false, label = { Text("Local mode • Photos stay on device") })
            Spacer(Modifier.height(16.dp))
            Text("Start with one photo", style = MaterialTheme.typography.titleLarge)
            Text("Import from Android Photo Picker", style = MaterialTheme.typography.bodyMedium)
            Spacer(Modifier.height(12.dp))
            Button(
                onClick = onImport,
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
            ) { Text("✨ Import photo") }
        }
    }
}

private suspend fun copyImportedImage(context: Context, uri: Uri, projectId: String): String? = withContext(Dispatchers.IO) {
    runCatching {
        val dir = File(context.filesDir, "projects/$projectId").apply { mkdirs() }
        val dest = File(dir, "original")
        context.contentResolver.openInputStream(uri)?.use { input ->
            FileOutputStream(dest).use { output -> input.copyTo(output) }
        } ?: return@runCatching null
        Uri.fromFile(dest).toString()
    }.getOrNull()
}

object SeedData {
    suspend fun seed(repo: ProjectRepository) {
        val demo = listOf(
            Project("pfy1", "Pixelfy Portrait • NYC", null, 4000, 6000, "exported", true, listOf("portrait", "ai", "pixelfy")),
            Project("pfy2", "Kyoto Temple – Pixelfy HDR", null, 5472, 3648, "draft", false, listOf("travel", "hdr")),
            Project("pfy3", "Food Flatlay Pro", null, 3024, 3024, "processing", false, listOf("food", "pixelfy")),
            Project("pfy4", "Astro Milky Way • AI Denoise", null, 6000, 4000, "exported", true, listOf("astro", "denoise", "ai")),
            Project("pfy5", "Sneaker Drop – Clean", null, 4500, 4500, "draft", false, listOf("product", "pixelfy")),
            Project("pfy6", "B&W Street • Portra", null, 2400, 3600, "exported", false, listOf("bw", "film")),
            Project("pfy7", "Pixelfy Selfie ✨", null, 3088, 3088, "draft", true, listOf("selfie", "face-restore")),
            Project("pfy8", "Sky Replace Demo", null, 6000, 4000, "exported", false, listOf("sky", "ai"))
        )
        demo.forEach { repo.upsertLocal(it) }
    }
}
