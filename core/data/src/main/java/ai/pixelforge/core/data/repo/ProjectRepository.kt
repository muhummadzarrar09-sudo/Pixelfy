package ai.pixelforge.core.data.repo

import ai.pixelforge.core.data.local.*
import ai.pixelforge.core.domain.model.Project
import ai.pixelforge.core.data.sync.OutboxEntry
import ai.pixelforge.core.data.sync.SyncWorker
import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProjectRepository @Inject constructor(
    private val db: PixelForgeDb,
    @ApplicationContext private val context: Context
) {
    private val _projects = MutableStateFlow<List<Project>>(emptyList())
    val projects: StateFlow<List<Project>> = _projects

    suspend fun refresh() {
        _projects.value = db.projects().getAll().map { it.toDomain() }
    }
    suspend fun toggleFavorite(id: String) {
        val p = db.projects().get(id) ?: return
        db.projects().favorite(id, !p.isFavorite)
        enqueueOutbox("projects", id, db.projects().get(id)!!)
        refresh()
    }
    suspend fun delete(id: String) {
        db.projects().delete(id)
        // optimistic outbox delete
        db.outbox().enqueue(
            OutboxEntry(entity = "delete", entityId = "projects:$id", operation = "delete", payloadJson = "{}")
        )
        SyncWorker.oneShot(context)
        refresh()
    }
    suspend fun upsert(p: Project) {
        db.projects().upsert(p.toEntity())
        enqueueOutbox("projects", p.id, p)
        refresh()
    }

    private suspend fun enqueueOutbox(entity: String, id: String, payload: Any) {
        val json = Json.encodeToString(payload)
        db.outbox().enqueue(
            OutboxEntry(entity = entity, entityId = id, operation = "upsert", payloadJson = json)
        )
        SyncWorker.oneShot(context)
    }
}
