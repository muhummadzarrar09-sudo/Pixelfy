package ai.pixelforge.feature.presets

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PresetsScreen() {
    val presets = remember { listOf(
        "Pixelfy Cinematic" to false,
        "Portra 400 • Pixelfy" to false,
        "Clean Product Pro" to false,
        "AI Portrait Pop ✨" to true,
        "Vintage Fade" to false,
        "Astro Denoise Pro" to true,
        "Fuji 400H" to false,
        "HDR Punch • Pixelfy" to true,
        "Pixelfy Glow" to false,
        "Teal-Orange Pop" to true
    )}
    Scaffold(topBar = { TopAppBar(title = { Text("💫 Pixelfy+ Presets") }, colors = TopAppBarDefaults.topAppBarColors(titleContentColor = MaterialTheme.colorScheme.tertiary)) }) { pad ->
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

@OptIn(ExperimentalMaterial3Api::class)
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
