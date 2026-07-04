#!/bin/bash
set -e
ROOT=/home/user/home/user/pixelforge

# ---------- DOMAIN ----------
mkdir -p $ROOT/core/domain/src/main/java/ai/pixelforge/core/domain/model
cat > $ROOT/core/domain/src/main/java/ai/pixelforge/core/domain/model/Models.kt <<'KT'
package ai.pixelforge.core.domain.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Serializable
data class Project(
    val id: String,
    val title: String,
    val thumbUri: String? = null,
    val width: Int = 0,
    val height: Int = 0,
    val status: String = "draft",
    val isFavorite: Boolean = false,
    val tags: List<String> = emptyList(),
    val updatedAt: Long = System.currentTimeMillis()
)

@Serializable
data class EditOp(
    val id: String,
    val type: OpType,
    val enabled: Boolean = true,
    val opacity: Float = 1f,
    val blend: BlendMode = BlendMode.Normal,
    val params: Map<String, Float> = emptyMap()
)

@Serializable
enum class OpType {
    // Free 38
    BRIGHTNESS, CONTRAST, EXPOSURE, HIGHLIGHTS, SHADOWS, WHITES, BLACKS,
    SATURATION, VIBRANCE, TEMPERATURE, TINT, GAMMA, CURVES, LEVELS,
    SHARPEN, CLARITY, TEXTURE, DEHAZE,
    VIGNETTE, GRAIN, BLOOM,
    HSL, COLOR_MIXER, SPLIT_TONE, GRADIENT_MAP,
    CROP, ROTATE, STRAIGHTEN, PERSPECTIVE, FLIP,
    BLUR_GAUSSIAN, BLUR_MOTION, BLUR_RADIAL,
    INVERT, SEPIA, BLACK_WHITE, FADE,
    // Pro 25
    AI_UPSCALE, AI_DENOISE, AI_DEBLUR, FACE_RESTORE, PORTRAIT_RELIGHT,
    SKY_ENHANCE, BG_REMOVE, AI_COLORIZE,
    SUPER_RES, HDR_TONE_MAP, CHANNEL_MIXER, LUT_3D,
    LENS_BLUR, CHROMATIC_FIX, LENS_DISTORT,
    SPOT_HEAL, DUST_REMOVE, RED_EYE, BLEMISH,
    LIQUIFY, CONTENT_AWARE_SCALE, SEAM_CARVE,
    OIL_PAINT, GLITCH, DOUBLE_EXPOSURE
}

@Serializable
enum class BlendMode { Normal, Multiply, Screen, Overlay, SoftLight, HardLight, Luminosity, Color }

@Serializable
data class Preset(
    val id: String,
    val name: String,
    val category: String,
    val isPro: Boolean = false,
    val downloads: Int = 0,
    val stack: List<EditOp> = emptyList(),
    val previewUri: String? = null
)

@Serializable
data class BatchJob(
    val id: String,
    val name: String,
    val presetId: String,
    val inputCount: Int,
    val status: String,
    val progress: Float = 0f
)

@Serializable
data class ExportJob(
    val id: String,
    val projectId: String,
    val format: String,
    val quality: Int,
    val fileSize: Long = 0
)
KT

# ---------- DATA ----------
mkdir -p $ROOT/core/data/src/main/java/ai/pixelforge/core/data/local
cat > $ROOT/core/data/src/main/java/ai/pixelforge/core/data/local/Entities.kt <<'KT'
package ai.pixelforge.core.data.local

import androidx.room.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import ai.pixelforge.core.domain.model.*

@Entity(tableName = "projects")
data class ProjectEntity(
    @PrimaryKey val id: String,
    val title: String,
    val thumbUri: String?,
    val width: Int,
    val height: Int,
    val status: String,
    val isFavorite: Boolean,
    val tagsCsv: String,
    val updatedAt: Long
)

fun ProjectEntity.toDomain() = Project(id, title, thumbUri, width, height, status, isFavorite, tagsCsv.split(",").filter{it.isNotBlank()}, updatedAt)
fun Project.toEntity() = ProjectEntity(id, title, thumbUri, width, height, status, isFavorite, tags.joinToString(","), updatedAt)

@Entity(tableName = "presets")
data class PresetEntity(
    @PrimaryKey val id: String,
    val name: String,
    val category: String,
    val isPro: Boolean,
    val downloads: Int,
    val stackJson: String,
    val previewUri: String?
)

@Entity(tableName = "edits")
data class EditEntity(
    @PrimaryKey val id: String,
    val projectId: String,
    val stackJson: String,
    val version: Int
)

@Dao
interface ProjectDao {
    @Query("SELECT * FROM projects ORDER BY updatedAt DESC")
    suspend fun getAll(): List<ProjectEntity>
    @Query("SELECT * FROM projects WHERE id = :id")
    suspend fun get(id: String): ProjectEntity?
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(p: ProjectEntity)
    @Query("DELETE FROM projects WHERE id = :id")
    suspend fun delete(id: String)
    @Query("UPDATE projects SET isFavorite = :fav WHERE id = :id")
    suspend fun favorite(id: String, fav: Boolean)
}

@Dao
interface PresetDao {
    @Query("SELECT * FROM presets ORDER BY downloads DESC")
    suspend fun all(): List<PresetEntity>
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(list: List<PresetEntity>)
}

@Database(entities = [ProjectEntity::class, PresetEntity::class, EditEntity::class], version = 1, exportSchema = false)
abstract class PixelForgeDb: RoomDatabase() {
    abstract fun projects(): ProjectDao
    abstract fun presets(): PresetDao
}
KT

# Supabase client
mkdir -p $ROOT/core/data/src/main/java/ai/pixelforge/core/data/remote
cat > $ROOT/core/data/src/main/java/ai/pixelforge/core/data/remote/SupabaseClient.kt <<'KT'
package ai.pixelforge.core.data.remote

import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.storage.Storage
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.functions.Functions
import io.ktor.client.engine.okhttp.OkHttp

object Supabase {
    // TODO: replace with your sb_publishable_ key (Supabase 2026 keys)
    private const val URL = "https://xyzcompany.supabase.co"
    private const val KEY = "sb_publishable_XXXXXXXXXXXXXXXX"

    val client = createSupabaseClient(
        supabaseUrl = URL,
        supabaseKey = KEY
    ) {
        install(Auth) {
            scheme = "pixelforge"
            host = "auth"
        }
        install(Postgrest)
        install(Storage)
        install(Realtime)
        install(Functions)
        httpEngine = OkHttp.create()
    }
}
KT

# Repositories
mkdir -p $ROOT/core/data/src/main/java/ai/pixelforge/core/data/repo
cat > $ROOT/core/data/src/main/java/ai/pixelforge/core/data/repo/ProjectRepository.kt <<'KT'
package ai.pixelforge.core.data.repo

import ai.pixelforge.core.data.local.*
import ai.pixelforge.core.domain.model.Project
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProjectRepository @Inject constructor(
    private val db: PixelForgeDb
) {
    private val _projects = MutableStateFlow<List<Project>>(emptyList())
    val projects: StateFlow<List<Project>> = _projects

    suspend fun refresh() {
        _projects.value = db.projects().getAll().map { it.toDomain() }
    }
    suspend fun toggleFavorite(id: String) {
        val p = db.projects().get(id) ?: return
        db.projects().favorite(id, !p.isFavorite)
        refresh()
    }
    suspend fun delete(id: String) {
        db.projects().delete(id)
        refresh()
    }
    suspend fun upsert(p: Project) {
        db.projects().upsert(p.toEntity())
        refresh()
    }
}
KT

# Hilt modules
mkdir -p $ROOT/core/data/src/main/java/ai/pixelforge/core/data/di
cat > $ROOT/core/data/src/main/java/ai/pixelforge/core/data/di/DataModule.kt <<'KT'
package ai.pixelforge.core.data.di

import android.content.Context
import androidx.room.Room
import ai.pixelforge.core.data.local.PixelForgeDb
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DataModule {
    @Provides @Singleton
    fun provideDb(@ApplicationContext ctx: Context): PixelForgeDb =
        Room.databaseBuilder(ctx, PixelForgeDb::class.java, "pixelforge.db")
            // Transition hardening: destructive migrations disabled for Beta+
            .build()
}
KT

# ---------- FEATURE: DASHBOARD ----------
mkdir -p $ROOT/feature/dashboard/src/main/java/ai/pixelforge/feature/dashboard
cat > $ROOT/feature/dashboard/src/main/java/ai/pixelforge/feature/dashboard/DashboardScreen.kt <<'KT'
package ai.pixelforge.feature.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.unit.dp
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
    val repo: ProjectRepository
): ViewModel() {
    val projects = repo.projects
    init { viewModelScope.launch { 
        if (repo.projects.value.isEmpty()) SeedData.seed(repo)
        repo.refresh() 
    }}
}

@Composable
fun DashboardScreen(onOpenProject: (String)->Unit, onOpenAuth: ()->Unit, vm: DashboardViewModel = hiltViewModel()) {
    val projects by vm.projects.collectAsState()
    Scaffold(topBar = {
        TopAppBar(title = { Text("PixelForge") }, actions = {
            TextButton(onClick = onOpenAuth) { Text("Sign in") }
        })
    }, floatingActionButton = {
        ExtendedFloatingActionButton(onClick = { /* import */ }, text = { Text("Enhance +") })
    }) { pad ->
        if (projects.isEmpty()) {
            EmptyState(pad)
        } else {
            Column(Modifier.padding(pad).padding(16.dp)) {
                StatsRow(projects)
                Spacer(Modifier.height(16.dp))
                Text("Recent projects", style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.height(8.dp))
                LazyVerticalGrid(columns = GridCells.Adaptive(160.dp), verticalArrangement = Arrangement.spacedBy(12.dp), horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxSize()) {
                    items(projects.size) { i ->
                        ProjectCard(projects[i], onOpenProject, vm)
                    }
                }
            }
        }
    }
}

@Composable
fun StatsRow(projects: List<Project>) {
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
        ElevatedCard(Modifier.weight(1f)) { Column(Modifier.padding(16.dp)) { Text("${projects.size}", style = MaterialTheme.typography.headlineSmall); Text("Projects") } }
        ElevatedCard(Modifier.weight(1f)) { Column(Modifier.padding(16.dp)) { Text("24", style = MaterialTheme.typography.headlineSmall); Text("Presets") } }
        ElevatedCard(Modifier.weight(1f)) { Column(Modifier.padding(16.dp)) { Text("3", style = MaterialTheme.typography.headlineSmall); Text("Batches") } }
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
            Text("✦", style = MaterialTheme.typography.displayLarge)
            Text("No projects yet", style = MaterialTheme.typography.titleLarge)
            Text("Import a photo to start enhancing", style = MaterialTheme.typography.bodyMedium)
            Spacer(Modifier.height(12.dp))
            Button(onClick = {}) { Text("Import Image") }
        }
    }
}

object SeedData {
    suspend fun seed(repo: ProjectRepository) {
        val demo = listOf(
            Project("p1","Portrait NYC",null,4000,6000,"exported",true,listOf("portrait","ai")),
            Project("p2","Kyoto Temple",null,5472,3648,"draft",false,listOf("travel")),
            Project("p3","Food Flatlay",null,3024,3024,"processing",false,listOf("food")),
            Project("p4","Astro Milky Way",null,6000,4000,"exported",true,listOf("astro","denoise")),
            Project("p5","Product Sneaker",null,4500,4500,"draft",false,listOf("product")),
            Project("p6","B&W Street",null,2400,3600,"exported",false,listOf("bw"))
        )
        demo.forEach { repo.upsert(it) }
    }
}
KT

# Gallery
cat > $ROOT/feature/gallery/src/main/java/ai/pixelforge/feature/gallery/GalleryScreen.kt <<'KT'
package ai.pixelforge.feature.gallery

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import ai.pixelforge.feature.dashboard.DashboardViewModel

@Composable
fun GalleryScreen(onOpen: (String)->Unit, vm: DashboardViewModel = hiltViewModel()) {
    val projects by vm.repo.projects.collectAsState()
    Scaffold(topBar = { TopAppBar(title = { Text("Gallery") }) }) { pad ->
        if (projects.isEmpty()) {
            Box(Modifier.fillMaxSize().padding(pad), contentAlignment = Alignment.Center) {
                Text("Empty gallery — pull to refresh")
            }
        } else {
            LazyVerticalGrid(columns = GridCells.Adaptive(140.dp), contentPadding = pad, modifier = Modifier.padding(12.dp)) {
                items(projects.size) { i ->
                    ElevatedCard(onClick = { onOpen(projects[i].id) }, modifier = Modifier.padding(6.dp).fillMaxWidth().height(160.dp)) {
                        Box(Modifier.fillMaxSize().padding(12.dp), contentAlignment = Alignment.Center) {
                            Text(projects[i].title)
                        }
                    }
                }
            }
        }
    }
}
KT

# Editor
cat > $ROOT/feature/editor/src/main/java/ai/pixelforge/feature/editor/EditorScreen.kt <<'KT'
package ai.pixelforge.feature.editor

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.unit.dp
import ai.pixelforge.core.domain.model.*
import ai.pixelforge.processor.RenderEngine

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditorScreen(projectId: String, onBack: ()->Unit) {
    var stack by remember { mutableStateOf(listOf(
        EditOp("1", OpType.EXPOSURE, params = mapOf("ev" to 0.2f)),
        EditOp("2", OpType.CONTRAST, params = mapOf("amount" to 1.1f))
    ))}
    var selected by remember { mutableStateOf<OpType?>(OpType.BRIGHTNESS) }
    val engine = remember { RenderEngine() }

    Scaffold(
        topBar = { TopAppBar(title = { Text("Editor · $projectId") }, navigationIcon = { TextButton(onClick = onBack){ Text("←") } }, actions = {
            TextButton(onClick = {}) { Text("Export") }
        })},
        bottomBar = {
            BottomAppBar {
                LazyRow(contentPadding = PaddingValues(horizontal = 12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(OpType.entries) { op ->
                        val isPro = op.name.startsWith("AI_") || op in listOf(OpType.SUPER_RES, OpType.HDR_TONE_MAP, OpType.LUT_3D, OpType.LIQUIFY, OpType.OIL_PAINT, OpType.GLITCH, OpType.DOUBLE_EXPOSURE)
                        FilterChip(
                            selected = selected == op,
                            onClick = { 
                                selected = op
                                if (stack.none { it.type == op }) stack = stack + EditOp((stack.size+1).toString(), op)
                            },
                            label = { Text(op.name.take(10) + if(isPro) " •Pro" else "") }
                        )
                    }
                }
            }
        }
    ) { pad ->
        Column(Modifier.padding(pad).padding(16.dp).fillMaxSize()) {
            // Before/after preview
            ElevatedCard(Modifier.fillMaxWidth().height(320.dp)) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("Live Preview\n${stack.size} ops\n${engine.describe(stack)}", style = MaterialTheme.typography.bodyLarge)
                }
            }
            Spacer(Modifier.height(12.dp))
            // Op stack
            Text("Non-destructive stack", style = MaterialTheme.typography.titleSmall)
            stack.forEachIndexed { idx, op ->
                ListItem(
                    headlineContent = { Text(op.type.name) },
                    supportingContent = { Text("opacity ${(op.opacity*100).toInt()}% · ${op.blend}") },
                    trailingContent = {
                        Row {
                            Switch(checked = op.enabled, onCheckedChange = {
                                stack = stack.toMutableList().also { it[idx] = op.copy(enabled = itc) }
                            })
                            IconButton(onClick = { stack = stack.filterIndexed { i,_ -> i!=idx } }) { Text("×") }
                        }
                    }
                )
                Divider()
            }
            Spacer(Modifier.height(12.dp))
            selected?.let {
                Text("Adjust ${it.name}", style = MaterialTheme.typography.titleSmall)
                var v by remember(it) { mutableFloatStateOf(0.5f) }
                Slider(value = v, onValueChange = { v = it })
                Text("value: ${"%.2f".format(v)}")
            }
        }
    }
}
fun <T> MutableList<T>.setCopy(i:Int, transform: (T)->T) { this[i]=transform(this[i]) }
KT

# Batch
cat > $ROOT/feature/batch/src/main/java/ai/pixelforge/feature/batch/BatchScreen.kt <<'KT'
package ai.pixelforge.feature.batch

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.unit.dp

@Composable
fun BatchScreen() {
    val jobs = remember { listOf(
        Triple("Summer Vacation","preset_cinematic",0.62f),
        Triple("Product Drop","preset_clean",1f),
        Triple("Portrait Set","preset_ai_pop",0.14f)
    )}
    Scaffold(topBar = { TopAppBar(title = { Text("Batch") }) }, floatingActionButton = { FloatingActionButton(onClick = {}) { Text("+") } }) { pad ->
        Column(Modifier.padding(pad).padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            jobs.forEach { (name, preset, p) ->
                ElevatedCard(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(16.dp)) {
                        Text(name, style = MaterialTheme.typography.titleMedium)
                        Text(preset, style = MaterialTheme.typography.bodySmall)
                        Spacer(Modifier.height(8.dp))
                        LinearProgressIndicator(progress = { p }, modifier = Modifier.fillMaxWidth())
                        Text("${(p*100).toInt()}%")
                    }
                }
            }
            if (jobs.isEmpty()) {
                Text("Empty state – create your first batch")
            }
        }
    }
}
KT

# Presets
mkdir -p $ROOT/feature/presets/src/main/java/ai/pixelforge/feature/presets
cat > $ROOT/feature/presets/src/main/java/ai/pixelforge/feature/presets/PresetsScreen.kt <<'KT'
package ai.pixelforge.feature.presets

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.unit.dp

@Composable
fun PresetsScreen() {
    val presets = remember { listOf(
        "Cinematic Teal-Orange" to false,
        "Portra 400" to false,
        "Clean Product" to false,
        "AI Portrait Pop" to true,
        "Vintage Fade" to false,
        "Astro Denoise Pro" to true,
        "Fuji 400H" to false,
        "HDR Punch" to true
    )}
    Scaffold(topBar = { TopAppBar(title = { Text("Presets") }) }) { pad ->
        LazyVerticalGrid(columns = GridCells.Adaptive(160.dp), contentPadding = pad, modifier = Modifier.padding(12.dp)) {
            items(presets.size) { i ->
                val (name, pro) = presets[i]
                ElevatedCard(Modifier.padding(6.dp).fillMaxWidth().height(120.dp)) {
                    Column(Modifier.padding(12.dp)) {
                        Text(name, style = MaterialTheme.typography.titleSmall)
                        if (pro) AssistChip(onClick = {}, label = { Text("Pro") })
                        Spacer(Modifier.weight(1f))
                        TextButton(onClick = {}) { Text("Apply") }
                    }
                }
            }
        }
    }
}

@Composable
fun ExportsScreen() {
    Scaffold(topBar = { TopAppBar(title = { Text("Exports") }) }) { pad ->
        Column(Modifier.padding(pad).padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            repeat(6) {
                ListItem(headlineContent = { Text("export_${it+1}.avif") }, supportingContent = { Text("4.2 MB · AVIF Q92") }, trailingContent = { TextButton(onClick = {}) { Text("Open") } })
                Divider()
            }
        }
    }
}
KT

# Auth
cat > $ROOT/feature/auth/src/main/java/ai/pixelforge/feature/auth/AuthScreen.kt <<'KT'
package ai.pixelforge.feature.auth

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.*

@Composable
fun AuthScreen(onSignedIn: ()->Unit) {
    var email by remember { mutableStateOf("demo@pixelforge.app") }
    var loading by remember { mutableStateOf(false) }
    var sent by remember { mutableStateOf(false) }
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email") }, modifier = Modifier.fillMaxWidth())
        Button(onClick = {
            loading = true
            // Supabase.auth.signInWith(OTP) { email = email }
            // magic link -> pixelforge://auth
            CoroutineScope(Dispatchers.Main).launch {
                delay(900); sent = true; loading = false; delay(600); onSignedIn()
            }
        }, enabled = !loading, modifier = Modifier.fillMaxWidth()) {
            if (loading) CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp) else Text(if (sent) "Check email…" else "Send magic link")
        }
        Text("Supabase Magic Link · OTP · sb_publishable_xxx", style = MaterialTheme.typography.bodySmall)
        Text("Auth later: currently anonymous local mode with full CRUD.", style = MaterialTheme.typography.bodySmall)
    }
}
KT

# Processor RenderEngine
cat > $ROOT/processor/src/main/java/ai/pixelforge/processor/RenderEngine.kt <<'KT'
package ai.pixelforge.processor

import ai.pixelforge.core.domain.model.EditOp
import ai.pixelforge.core.domain.model.OpType

class RenderEngine {
    fun describe(stack: List<EditOp>): String {
        return stack.joinToString(" → ") { it.type.name.lowercase() }
    }
    // TODO: implement GPU shader chain:
    //  - ColorMatrix ops (brightness, contrast, saturation...)
    //  - OpenCV NLM denoise, unsharp, inpaint
    //  - TFLite Real-ESRGAN x2/x4 GPU delegate
    //  - U2Net background remove
    //  - GFPGAN face restore
    //  - MediaPipe segmentation sky/portrait
    //  - 3D LUT .cube
    // All 63 ops enumerated in OpType
    suspend fun render(inputUri: String, stack: List<EditOp>): String {
        // placeholder – real NDK pipeline here
        return inputUri
    }
}
KT

echo "features done"
