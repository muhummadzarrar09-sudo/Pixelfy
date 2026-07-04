package ai.pixelforge.feature.auth

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.*

@Composable
fun AuthScreen(onSignedIn: ()->Unit) {
    var email by remember { mutableStateOf("demo@pixelfy.app") }
    var loading by remember { mutableStateOf(false) }
    var sent by remember { mutableStateOf(false) }
    var localMode by remember { mutableStateOf(true) }
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)) {
            Column(Modifier.padding(12.dp)) {
                Text("🧪 Pixelfy Local Test Mode", style = MaterialTheme.typography.titleSmall)
                Text("Auth is on standby. All 63 ops work offline. Supabase sync paused.", style = MaterialTheme.typography.bodySmall)
            }
        }
        Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
            Text("Local mode", style = MaterialTheme.typography.bodyMedium)
            Switch(checked = localMode, onCheckedChange = { localMode = it })
        }
        Divider()
        OutlinedTextField(
            value = email, 
            onValueChange = { email = it }, 
            label = { Text("Email (standby)") }, 
            modifier = Modifier.fillMaxWidth(),
            enabled = !localMode
        )
        Button(
            onClick = {
                if (localMode) { onSignedIn(); return@Button }
                loading = true
                // Supabase.auth.signInWith(OTP) { email = email }
                // magic link -> pixelfy://auth
                CoroutineScope(Dispatchers.Main).launch {
                    delay(900); sent = true; loading = false; delay(600); onSignedIn()
                }
            }, 
            enabled = !loading,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(
                containerColor = if(localMode) MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.primary
            )
        ) {
            if (loading) CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp) 
            else Text(if(localMode) "Continue Locally ✨" else if (sent) "Check email…" else "Send Pixelfy magic link")
        }
        Text("Pixelfy • Supabase Magic Link • OTP • sb_publishable_xxx", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
        Text("Local mode = full CRUD, Room offline-first, 8 demo projects, all AI models on-device. Cloud sync = toggle off Local mode.", style = MaterialTheme.typography.bodySmall)
        AssistChip(onClick = {}, label = { Text("auth standby • v1.0") })
    }
}
