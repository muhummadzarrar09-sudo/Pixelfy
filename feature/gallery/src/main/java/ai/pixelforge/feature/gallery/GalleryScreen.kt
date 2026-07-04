package ai.pixelforge.feature.gallery

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import ai.pixelforge.feature.dashboard.DashboardViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GalleryScreen(onOpen: (String)->Unit, vm: DashboardViewModel = hiltViewModel()) {
    val projects by vm.repo.projects.collectAsState()
    Scaffold(topBar = { TopAppBar(title = { Text("✨ Pixelfy Studio") }, colors = TopAppBarDefaults.topAppBarColors(titleContentColor = MaterialTheme.colorScheme.primary)) }) { pad ->
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
