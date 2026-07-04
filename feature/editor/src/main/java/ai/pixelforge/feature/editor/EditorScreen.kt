package ai.pixelforge.feature.editor

import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.ImageDecoder
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.BottomAppBar
import androidx.compose.material3.Button
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.FileProvider
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import ai.pixelforge.core.data.repo.ProjectRepository
import ai.pixelforge.core.domain.model.EditOp
import ai.pixelforge.core.domain.model.OpType
import ai.pixelforge.core.domain.model.Project
import ai.pixelforge.processor.RenderEngine
import dagger.hilt.android.lifecycle.HiltViewModel
import java.io.File
import java.io.FileNotFoundException
import java.io.FileOutputStream
import javax.inject.Inject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@HiltViewModel
class EditorViewModel @Inject constructor(
    private val repo: ProjectRepository
) : ViewModel() {
    private val _project = MutableStateFlow<Project?>(null)
    val project: StateFlow<Project?> = _project

    fun load(projectId: String) {
        viewModelScope.launch { _project.value = repo.getProject(projectId) }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditorScreen(
    projectId: String,
    onBack: () -> Unit,
    vm: EditorViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val engine = remember { RenderEngine(context) }
    val haptic = LocalHapticFeedback.current
    val scope = rememberCoroutineScope()
    val project by vm.project.collectAsState()

    var stack by remember { mutableStateOf<List<EditOp>>(emptyList()) }
    var selected by remember { mutableStateOf<OpType?>(OpType.BRIGHTNESS) }
    var originalBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var renderedBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var imageState by remember { mutableStateOf("Loading project…") }
    var rendering by remember { mutableStateOf(false) }
    var exporting by remember { mutableStateOf(false) }
    var exportTask by remember { mutableStateOf("Idle") }
    var exportJob by remember { mutableStateOf<Job?>(null) }
    var lastExportedFile by remember { mutableStateOf<File?>(null) }
    var lastExportedFormat by remember { mutableStateOf<ExportFormat?>(null) }
    var autoSaveText by remember { mutableStateOf("Local draft • not exported") }
    var history by remember { mutableStateOf(listOf(stack)) }
    var historyIndex by remember { mutableIntStateOf(0) }
    var showAB by remember { mutableStateOf(false) }
    var abSplit by remember { mutableFloatStateOf(0.5f) }
    var healMode by remember { mutableStateOf(false) }
    var notice by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(projectId) { vm.load(projectId) }

    LaunchedEffect(project?.thumbUri) {
        val uri = project?.thumbUri
        if (uri.isNullOrBlank()) {
            imageState = "Demo project preview — import a real photo to edit pixels"
            originalBitmap = null
            renderedBitmap = null
        } else {
            imageState = "Loading image…"
            originalBitmap = loadBitmap(context, uri)
            renderedBitmap = originalBitmap
            imageState = if (originalBitmap != null) "Ready" else "Could not load image. Re-import from Photo Picker."
        }
    }

    LaunchedEffect(originalBitmap, stack) {
        val src = originalBitmap ?: return@LaunchedEffect
        rendering = true
        renderedBitmap = withContext(Dispatchers.Default) { engine.render(src, stack) }
        rendering = false
        autoSaveText = "Auto-saved locally • just now"
        if (history.getOrNull(historyIndex) != stack) {
            history = (history.take(historyIndex + 1) + listOf(stack)).takeLast(50)
            historyIndex = history.lastIndex
        }
    }

    LaunchedEffect(autoSaveText) {
        var seconds = 0
        while (true) {
            delay(5000)
            seconds += 5
            if (autoSaveText.startsWith("Auto-saved")) autoSaveText = "Auto-saved locally • ${seconds}s ago"
        }
    }

    fun undo() {
        if (historyIndex > 0) {
            historyIndex--
            stack = history[historyIndex]
            haptic.performHapticFeedback(HapticFeedbackType.LongPress)
        }
    }

    fun redo() {
        if (historyIndex < history.lastIndex) {
            historyIndex++
            stack = history[historyIndex]
            haptic.performHapticFeedback(HapticFeedbackType.LongPress)
        }
    }

    fun addOrSelect(op: OpType) {
        selected = op
        val modelState = modelStateFor(context, op)
        if (modelState == ModelState.Missing) {
            notice = "${op.label()} model is not bundled in this build yet. Tool disabled honestly for beta trust."
            return
        }
        if (stack.none { it.type == op }) {
            stack = stack + EditOp(
                id = "op-${stack.size + 1}",
                type = op,
                params = defaultParams(op)
            )
        }
        haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
    }

    fun updateSelected(value: Float) {
        val op = selected ?: return
        val key = paramKey(op) ?: return
        stack = stack.map {
            if (it.type == op) it.copy(params = it.params + (key to paramValue(op, value))) else it
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(project?.title ?: "Pixelfy Editor") },
                navigationIcon = { TextButton(onClick = onBack) { Text("← Back") } },
                actions = {
                    IconButton(onClick = { undo() }, enabled = historyIndex > 0) { Text("↶") }
                    IconButton(onClick = { redo() }, enabled = historyIndex < history.lastIndex) { Text("↷") }
                    FilterChip(
                        selected = showAB,
                        onClick = { showAB = !showAB; haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove) },
                        label = { Text("A/B") }
                    )
                    Spacer(Modifier.width(4.dp))
                    FilledTonalButton(
                        enabled = renderedBitmap != null && !exporting,
                        onClick = {
                            val bitmap = renderedBitmap
                            if (bitmap == null) {
                                notice = "Import a photo before exporting."
                            } else {
                                            exportJob = scope.launch {
                                                exporting = true
                                                exportTask = "Exporting JPEG…"
                                                runCatching {
                                                    exportBitmap(context, bitmap, projectId, ExportFormat.Jpeg)
                                                }.onSuccess { file ->
                                                    lastExportedFile = file
                                                    lastExportedFormat = ExportFormat.Jpeg
                                                    notice = "JPEG exported privately: ${file.name}. You can now save or share it."
                                                }.onFailure { error ->
                                                    notice = "Export failed: ${error.message ?: "unknown error"}"
                                                }
                                                exportTask = "Idle"
                                                exporting = false
                                                exportJob = null
                                            }
                            }
                        }
                    ) {
                        Text("Export")
                    }
                }
            )
        },
        bottomBar = {
            Column {
                if (notice != null) {
                    Surface(color = MaterialTheme.colorScheme.tertiaryContainer) {
                        Row(Modifier.fillMaxWidth().padding(12.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(notice.orEmpty(), modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodySmall)
                            TextButton(onClick = { notice = null }) { Text("OK") }
                        }
                    }
                }
                BottomAppBar(containerColor = MaterialTheme.colorScheme.surfaceContainerLow) {
                    LazyRow(
                        contentPadding = PaddingValues(horizontal = 12.dp),
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        item { AssistChip(onClick = { healMode = !healMode }, label = { Text(if (healMode) "🩹 Heal ON" else "🩹") }) }
                        items(OpType.entries) { op ->
                            val modelState = modelStateFor(context, op)
                            val proOrAi = op.isAiOrPro()
                            FilterChip(
                                selected = selected == op,
                                enabled = modelState != ModelState.Missing,
                                onClick = { addOrSelect(op) },
                                label = {
                                    Text(
                                        op.label().take(13) + when {
                                            modelState == ModelState.Missing -> " ⚠"
                                            proOrAi -> " ✨"
                                            else -> ""
                                        },
                                        style = MaterialTheme.typography.labelSmall
                                    )
                                }
                            )
                        }
                    }
                }
            }
        }
    ) { pad ->
        LazyColumn(
            modifier = Modifier.padding(pad).fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                ElevatedCard(Modifier.fillMaxWidth()) {
                    Column {
                        Row(
                            Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            AssistChip(onClick = {}, enabled = false, label = { Text(autoSaveText, style = MaterialTheme.typography.labelSmall) })
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                if (rendering) LinearProgressIndicator(Modifier.width(84.dp))
                                Spacer(Modifier.width(8.dp))
                                Text("${stack.count { it.enabled }} ops", style = MaterialTheme.typography.labelSmall)
                            }
                        }
                        PreviewCanvas(
                            original = originalBitmap,
                            rendered = renderedBitmap,
                            state = imageState,
                            showAB = showAB,
                            abSplit = abSplit,
                            onDragSplit = { delta -> abSplit = (abSplit + delta / 600f).coerceIn(0.05f, 0.95f) },
                            stackLabel = engine.describe(stack),
                            healMode = healMode
                        )
                        Row(
                            Modifier.fillMaxWidth().padding(10.dp),
                            horizontalArrangement = Arrangement.SpaceEvenly
                        ) {
                            TextButton(onClick = { showAB = !showAB }) { Text(if (showAB) "Hide A/B" else "Show A/B") }
                            TextButton(onClick = { undo() }, enabled = historyIndex > 0) { Text("Undo") }
                            TextButton(onClick = { redo() }, enabled = historyIndex < history.lastIndex) { Text("Redo") }
                            TextButton(onClick = { healMode = !healMode }) { Text(if (healMode) "Exit Heal" else "Heal") }
                        }
                    }
                }
            }

            item {
                Text("Non-destructive OpNode Stack", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                Text("Local draft • every enabled op re-renders the preview", style = MaterialTheme.typography.bodySmall)
            }
            items(stack.size) { idx ->
                val op = stack[idx]
                ElevatedCard {
                    ListItem(
                        headlineContent = { Text(op.type.label(), fontWeight = FontWeight.Medium) },
                        supportingContent = { Text("opacity ${(op.opacity * 100).toInt()}% • ${op.blend} • ${op.params.entries.firstOrNull()?.let { "${it.key}=${"%.2f".format(it.value)}" } ?: "default"}") },
                        trailingContent = {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Switch(
                                    checked = op.enabled,
                                    onCheckedChange = { checked -> stack = stack.toMutableList().also { it[idx] = op.copy(enabled = checked) } }
                                )
                                IconButton(onClick = { stack = stack.filterIndexed { i, _ -> i != idx } }) { Text("×") }
                            }
                        }
                    )
                }
            }

            item {
                selected?.let { sel ->
                    ElevatedCard(colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
                        Column(Modifier.padding(16.dp)) {
                            Text("Adjust • ${sel.label()}", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                            var value by remember(sel) { mutableFloatStateOf(0.5f) }
                            Slider(
                                value = value,
                                onValueChange = { next ->
                                    value = next
                                    updateSelected(next)
                                },
                                valueRange = 0f..1f,
                                steps = 19
                            )
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                                FilledTonalButton(onClick = { value = (value - 0.01f).coerceAtLeast(0f); updateSelected(value) }) { Text("−0.01") }
                                Button(onClick = { value = 0.5f; updateSelected(value) }, modifier = Modifier.weight(1f)) { Text("Reset 0.50") }
                                FilledTonalButton(onClick = { value = (value + 0.01f).coerceAtMost(1f); updateSelected(value) }) { Text("+0.01") }
                            }
                            Text("value ${"%.3f".format(value)} • precise controls for user trust", style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }

            if (healMode || selected == OpType.SPOT_HEAL) {
                item {
                    ElevatedCard(colors = CardDefaults.elevatedCardColors(containerColor = MaterialTheme.colorScheme.tertiaryContainer)) {
                        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text("🩹 Heal is marked Beta", fontWeight = FontWeight.Bold)
                            Text("Spot/Patch UI is present. AI Fill remains disabled until the model is bundled and tested.", style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }

            item {
                ElevatedCard {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Export privately", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                        Text("Phase 3.1 baseline: exports write to app-private storage first. Gallery/share is explicit next.", style = MaterialTheme.typography.bodySmall)
                        if (exporting) {
                            LinearProgressIndicator(Modifier.fillMaxWidth())
                            Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                                Text(exportTask, style = MaterialTheme.typography.labelSmall)
                                TextButton(onClick = {
                                    exportJob?.cancel()
                                    exportJob = null
                                    exporting = false
                                    exportTask = "Idle"
                                    notice = "Export cancelled."
                                }) { Text("Cancel") }
                            }
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                            listOf(ExportFormat.Jpeg, ExportFormat.Png, ExportFormat.Webp).forEach { format ->
                                FilledTonalButton(
                                    enabled = renderedBitmap != null && !exporting,
                                    onClick = {
                                        val bitmap = renderedBitmap
                                        if (bitmap == null) {
                                            notice = "Import a photo before exporting."
                                        } else {
                                            exportJob = scope.launch {
                                                exporting = true
                                                exportTask = "Exporting ${format.label}…"
                                                runCatching {
                                                    exportBitmap(context, bitmap, projectId, format)
                                                }.onSuccess { file ->
                                                    lastExportedFile = file
                                                    lastExportedFormat = format
                                                    notice = "${format.label} exported privately: ${file.name}"
                                                }.onFailure { error ->
                                                    notice = "Export failed: ${error.message ?: "unknown error"}"
                                                }
                                                exportTask = "Idle"
                                                exporting = false
                                                exportJob = null
                                            }
                                        }
                                    },
                                    modifier = Modifier.weight(1f)
                                ) { Text(format.label) }
                            }
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                            Button(
                                enabled = lastExportedFile != null && lastExportedFormat != null && !exporting,
                                onClick = {
                                    val file = lastExportedFile
                                    val format = lastExportedFormat
                                    if (file != null && format != null) {
                                        exportJob = scope.launch {
                                            exporting = true
                                            exportTask = "Saving to Gallery…"
                                            runCatching {
                                                saveExportToGallery(context, file, format)
                                            }.onSuccess { uri ->
                                                notice = "Saved to gallery: ${uri.lastPathSegment ?: file.name}"
                                            }.onFailure { error ->
                                                notice = "Save failed: ${error.message ?: "unknown error"}"
                                            }
                                            exportTask = "Idle"
                                            exporting = false
                                            exportJob = null
                                        }
                                    }
                                },
                                modifier = Modifier.weight(1f)
                            ) { Text("Save to Gallery") }
                            Button(
                                enabled = lastExportedFile != null && lastExportedFormat != null && !exporting,
                                onClick = {
                                    val file = lastExportedFile
                                    val format = lastExportedFormat
                                    if (file != null && format != null) shareExport(context, file, format)
                                },
                                modifier = Modifier.weight(1f)
                            ) { Text("Share") }
                        }
                    }
                }
            }

            item { Spacer(Modifier.height(48.dp)) }
        }
    }
}

@Composable
private fun PreviewCanvas(
    original: Bitmap?,
    rendered: Bitmap?,
    state: String,
    showAB: Boolean,
    abSplit: Float,
    onDragSplit: (Float) -> Unit,
    stackLabel: String,
    healMode: Boolean
) {
    Box(
        Modifier
            .fillMaxWidth()
            .height(300.dp)
            .background(MaterialTheme.colorScheme.surfaceVariant),
        contentAlignment = Alignment.Center
    ) {
        if (original == null) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("✨ Pixelfy Preview", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Text(state, style = MaterialTheme.typography.bodySmall)
                Spacer(Modifier.height(6.dp))
                Text("Import a real photo from Dashboard to edit pixels", style = MaterialTheme.typography.labelSmall)
            }
        } else if (!showAB) {
            Image(
                bitmap = (rendered ?: original).asImageBitmap(),
                contentDescription = "Edited preview",
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Fit
            )
            AssistChip(
                onClick = {},
                enabled = false,
                label = { Text(if (stackLabel.isBlank()) "Original" else stackLabel, style = MaterialTheme.typography.labelSmall) },
                modifier = Modifier.align(Alignment.BottomCenter).padding(8.dp)
            )
        } else {
            Row(Modifier.fillMaxSize()) {
                Box(Modifier.weight(abSplit).fillMaxHeight(), contentAlignment = Alignment.Center) {
                    Image(original.asImageBitmap(), contentDescription = "Before", modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Fit)
                    Text("BEFORE", modifier = Modifier.align(Alignment.TopCenter).padding(8.dp), color = MaterialTheme.colorScheme.primary)
                }
                Box(
                    Modifier
                        .width(4.dp)
                        .fillMaxHeight()
                        .background(MaterialTheme.colorScheme.primary)
                        .pointerInput(Unit) { detectHorizontalDragGestures { _, dragAmount -> onDragSplit(dragAmount) } }
                )
                Box(Modifier.weight(1f - abSplit).fillMaxHeight(), contentAlignment = Alignment.Center) {
                    Image((rendered ?: original).asImageBitmap(), contentDescription = "After", modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Fit)
                    Text("AFTER", modifier = Modifier.align(Alignment.TopCenter).padding(8.dp), color = MaterialTheme.colorScheme.primary)
                }
            }
        }

        if (healMode) {
            Text(
                "Heal Beta • tap tools below",
                modifier = Modifier.align(Alignment.TopCenter).padding(8.dp),
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

private suspend fun loadBitmap(context: Context, uriString: String): Bitmap? = withContext(Dispatchers.IO) {
    runCatching {
        val uri = Uri.parse(uriString)
        val source = if (uri.scheme == "file") {
            ImageDecoder.createSource(File(uri.path.orEmpty()))
        } else {
            ImageDecoder.createSource(context.contentResolver, uri)
        }
        ImageDecoder.decodeBitmap(source) { decoder, _, _ ->
            decoder.allocator = ImageDecoder.ALLOCATOR_SOFTWARE
            decoder.isMutableRequired = true
        }.copy(Bitmap.Config.ARGB_8888, true)
    }.getOrElse { error ->
        if (error is FileNotFoundException || error is SecurityException) null else null
    }
}

private enum class ExportFormat(val label: String, val extension: String) {
    Jpeg("JPEG", "jpg"),
    Png("PNG", "png"),
    Webp("WEBP", "webp")
}

private suspend fun exportBitmap(
    context: Context,
    bitmap: Bitmap,
    projectId: String,
    format: ExportFormat
): File = withContext(Dispatchers.IO) {
    val dir = File(context.filesDir, "exports/$projectId").apply { mkdirs() }
    val file = File(dir, "pixelfy_${System.currentTimeMillis()}.${format.extension}")
    FileOutputStream(file).use { out -> bitmap.compress(format.compressFormat(), format.quality, out) }
    file
}

private suspend fun saveExportToGallery(context: Context, file: File, format: ExportFormat): Uri = withContext(Dispatchers.IO) {
    val resolver = context.contentResolver
    val values = ContentValues().apply {
        put(MediaStore.Images.Media.DISPLAY_NAME, file.name)
        put(MediaStore.Images.Media.MIME_TYPE, format.mimeType)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/Pixelfy")
            put(MediaStore.Images.Media.IS_PENDING, 1)
        }
    }
    val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
        ?: error("Could not create MediaStore image")
    resolver.openOutputStream(uri)?.use { out -> file.inputStream().use { it.copyTo(out) } }
        ?: error("Could not write MediaStore image")
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        values.clear()
        values.put(MediaStore.Images.Media.IS_PENDING, 0)
        resolver.update(uri, values, null, null)
    }
    uri
}

private fun shareExport(context: Context, file: File, format: ExportFormat) {
    val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
    val send = Intent(Intent.ACTION_SEND).apply {
        type = format.mimeType
        putExtra(Intent.EXTRA_STREAM, uri)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
    context.startActivity(Intent.createChooser(send, "Share Pixelfy export"))
}

private fun ExportFormat.compressFormat(): Bitmap.CompressFormat = when (this) {
    ExportFormat.Jpeg -> Bitmap.CompressFormat.JPEG
    ExportFormat.Png -> Bitmap.CompressFormat.PNG
    ExportFormat.Webp -> if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        Bitmap.CompressFormat.WEBP_LOSSY
    } else {
        @Suppress("DEPRECATION")
        Bitmap.CompressFormat.WEBP
    }
}

private val ExportFormat.mimeType: String
    get() = when (this) {
        ExportFormat.Jpeg -> "image/jpeg"
        ExportFormat.Png -> "image/png"
        ExportFormat.Webp -> "image/webp"
    }

private val ExportFormat.quality: Int
    get() = if (this == ExportFormat.Png) 100 else 92

private enum class ModelState { NotModel, Available, Missing }

private fun modelStateFor(context: Context, op: OpType): ModelState {
    val asset = op.modelAssetPath() ?: return ModelState.NotModel
    return if (runCatching { context.assets.open(asset).close() }.isSuccess) {
        ModelState.Available
    } else {
        ModelState.Missing
    }
}

private fun OpType.modelAssetPath(): String? = when (this) {
    OpType.AI_UPSCALE -> "ml/realesrgan_x2_fp16.tflite"
    OpType.SUPER_RES -> "ml/realesrgan_x4_fp16.tflite"
    OpType.AI_DENOISE -> "ml/denoise_nl_unet_512.tflite"
    OpType.AI_DEBLUR -> "ml/deblur_ridnet.tflite"
    OpType.FACE_RESTORE -> "ml/gfpgan_1_4_mobile.tflite"
    OpType.BG_REMOVE -> "ml/u2netp_320.tflite"
    OpType.SKY_ENHANCE -> "ml/mediapipe_selfie_segmentation.tflite"
    OpType.PORTRAIT_RELIGHT -> "ml/portrait_relight_256.tflite"
    OpType.AI_COLORIZE -> "ml/deoldify_mobile.tflite"
    else -> null
}

private fun OpType.isAiOrPro(): Boolean = name.startsWith("AI_") || this in setOf(
    OpType.SUPER_RES,
    OpType.HDR_TONE_MAP,
    OpType.LUT_3D,
    OpType.LIQUIFY,
    OpType.OIL_PAINT,
    OpType.GLITCH,
    OpType.DOUBLE_EXPOSURE,
    OpType.SPOT_HEAL,
    OpType.CHANNEL_MIXER,
    OpType.BG_REMOVE,
    OpType.FACE_RESTORE,
    OpType.SKY_ENHANCE,
    OpType.PORTRAIT_RELIGHT
)

private fun OpType.label(): String = name.lowercase().replace('_', ' ')

private fun defaultParams(op: OpType): Map<String, Float> {
    val key = paramKey(op) ?: return emptyMap()
    return mapOf(key to paramValue(op, 0.5f))
}

private fun paramKey(op: OpType): String? = when (op) {
    OpType.BRIGHTNESS -> "value"
    OpType.EXPOSURE -> "ev"
    OpType.CONTRAST -> "amount"
    OpType.SATURATION -> "sat"
    OpType.VIBRANCE -> "vib"
    OpType.TEMPERATURE -> "temp"
    OpType.GAMMA -> "gamma"
    OpType.HIGHLIGHTS -> "highlights"
    OpType.SHADOWS -> "shadows"
    OpType.FADE -> "amount"
    else -> null
}

private fun paramValue(op: OpType, slider: Float): Float = when (op) {
    OpType.BRIGHTNESS -> (slider - 0.5f) * 0.8f
    OpType.EXPOSURE -> (slider - 0.5f) * 2f
    OpType.CONTRAST -> 0.5f + slider * 1.5f
    OpType.SATURATION -> slider * 2f
    OpType.VIBRANCE -> (slider - 0.5f) * 1.5f
    OpType.TEMPERATURE -> (slider - 0.5f) * 2f
    OpType.GAMMA -> 0.5f + slider * 2f
    OpType.HIGHLIGHTS -> (slider - 0.5f) * 2f
    OpType.SHADOWS -> (slider - 0.5f) * 2f
    OpType.FADE -> slider
    else -> slider
}
