package ai.pixelforge.feature.batch

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BatchScreen() {
    val jobs = remember { listOf(
        Triple("Summer Vacation","preset_cinematic",0.62f),
        Triple("Product Drop","preset_clean",1f),
        Triple("Portrait Set","preset_ai_pop",0.14f)
    )}
    Scaffold(topBar = { TopAppBar(title = { Text("⚡ Pixelfy Batch") }) }, floatingActionButton = { FloatingActionButton(onClick = {}, containerColor = MaterialTheme.colorScheme.tertiaryContainer) { Text("+") } }) { pad ->
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
