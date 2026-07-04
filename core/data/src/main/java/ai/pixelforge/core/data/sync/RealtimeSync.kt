package ai.pixelforge.core.data.sync

import ai.pixelforge.core.data.local.PixelForgeDb
import ai.pixelforge.core.data.local.toEntity
import ai.pixelforge.core.data.remote.Supabase
import ai.pixelforge.core.domain.model.Project
import io.github.jan.supabase.realtime.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class RealtimeSync @Inject constructor(
    private val db: PixelForgeDb
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private var channel: RealtimeChannel? = null

    fun start(userId: String?) {
        if (userId == null || !Supabase.isConfigured) return
        scope.launch {
            try {
                val ch = Supabase.client.realtime.channel("projects_$userId")
                ch.postgresChangeFlow<PostgresAction>(schema = "public") {
                    table = "projects"
                    filter = "owner=eq.$userId"
                }.onEach { action ->
                    when (action) {
                        is PostgresAction.Insert -> handleUpsert(action.record)
                        is PostgresAction.Update -> handleUpsert(action.record)
                        is PostgresAction.Delete -> handleDelete(action.oldRecord["id"].toString().trim('"'))
                        else -> Unit
                    }
                }.launchIn(scope)

                ch.subscribe(blocking = true)
                channel = ch
            } catch (_: Exception) {
                // Auth standby/local-first: realtime failures must never break app launch.
            }
        }
    }

    private suspend fun handleUpsert(record: Map<String, Any?>) {
        val id = record["id"]?.toString()?.trim('"') ?: return
        val project = Project(
            id = id,
            title = record["title"]?.toString()?.trim('"') ?: "Untitled",
            thumbUri = record["thumb_uri"]?.toString()?.trim('"'),
            width = record["width"]?.toString()?.toIntOrNull() ?: 0,
            height = record["height"]?.toString()?.toIntOrNull() ?: 0,
            status = record["status"]?.toString()?.trim('"') ?: "draft",
            isFavorite = record["is_favorite"]?.toString()?.toBooleanStrictOrNull() ?: false,
            tags = emptyList(),
            updatedAt = System.currentTimeMillis()
        )
        db.projects().upsert(project.toEntity())
    }

    private suspend fun handleDelete(id: String) {
        db.projects().delete(id)
    }

    fun stop() {
        scope.launch { channel?.unsubscribe() }
    }
}
