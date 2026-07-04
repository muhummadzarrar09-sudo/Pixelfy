package ai.pixelforge.core.data.sync

import ai.pixelforge.core.data.local.PixelForgeDb
import ai.pixelforge.core.data.local.toEntity
import ai.pixelforge.core.domain.model.Project
import ai.pixelforge.core.data.remote.Supabase
import io.github.jan.supabase.realtime.*
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class RealtimeSync @Inject constructor(
    private val db: PixelForgeDb
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private var channel: RealtimeChannel? = null

    fun start(userId: String?) {
        if (userId == null) return
        scope.launch {
            try {
                val ch = Supabase.client.realtime.channel("projects_$userId")
                // Postgres changes
                ch.postgresChangeFlow<PostgresAction>(schema = "public") {
                    table = "projects"
                    filter = "owner=eq.$userId"
                }.onEach { action ->
                    when (action) {
                        is PostgresAction.Insert -> handleUpsert(action.record)
                        is PostgresAction.Update -> handleUpsert(action.record)
                        is PostgresAction.Delete -> handleDelete(action.oldRecord["id"].toString())
                        else -> {}
                    }
                }.launchIn(scope)

                ch.subscribe(blocking = true)
                channel = ch
            } catch (_: Exception) {}
        }
    }

    private suspend fun handleUpsert(record: Map<String, Any?>) {
        try {
            // map to Project
            val json = Json.encodeToString(record)
            val project = Json.decodeFromString<Project>(json)
            db.projects().upsert(project.toEntity())
        } catch (_: Exception) {}
    }
    private suspend fun handleDelete(id: String) {
        db.projects().delete(id)
    }

    fun stop() {
        scope.launch {
            channel?.unsubscribe()
        }
    }
}
