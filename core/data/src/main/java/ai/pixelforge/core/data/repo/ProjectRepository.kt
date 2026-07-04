package ai.pixelforge.core.data.repo

import android.content.Context
import ai.pixelforge.core.data.local.PixelForgeDb
import ai.pixelforge.core.data.local.toDomain
import ai.pixelforge.core.data.local.toEntity
import ai.pixelforge.core.data.sync.OutboxEntry
import ai.pixelforge.core.data.sync.SyncWorker
import ai.pixelforge.core.domain.model.Project
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
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

    suspend fun getProject(id: String): Project? = db.projects().get(id)?.toDomain()

    suspend fun toggleFavorite(id: String) {
        val current = db.projects().get(id) ?: return
        db.projects().favorite(id, !current.isFavorite)
        val updated = db.projects().get(id)?.toDomain() ?: return
        enqueueUpsert("projects", id, updated)
        refresh()
    }

    suspend fun delete(id: String) {
        db.projects().delete(id)
        db.outbox().enqueue(
            OutboxEntry(
                entity = "delete",
                entityId = "projects:$id",
                operation = "delete",
                payloadJson = "{}"
            )
        )
        SyncWorker.oneShot(context)
        refresh()
    }

    suspend fun upsert(p: Project) {
        db.projects().upsert(p.toEntity())
        enqueueUpsert("projects", p.id, p)
        refresh()
    }

    /** Local-only write used for demo data and auth-standby experiences. */
    suspend fun upsertLocal(p: Project) {
        db.projects().upsert(p.toEntity())
        refresh()
    }

    private suspend fun enqueueUpsert(entity: String, id: String, payload: Project) {
        db.outbox().enqueue(
            OutboxEntry(
                entity = entity,
                entityId = id,
                operation = "upsert",
                payloadJson = Json.encodeToString(payload)
            )
        )
        SyncWorker.oneShot(context)
    }
}
