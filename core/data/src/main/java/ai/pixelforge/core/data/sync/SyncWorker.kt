package ai.pixelforge.core.data.sync

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.BackoffPolicy
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import ai.pixelforge.core.data.local.PixelForgeDb
import ai.pixelforge.core.data.remote.Supabase
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import io.github.jan.supabase.postgrest.from
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import java.util.concurrent.TimeUnit

@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted ctx: Context,
    @Assisted params: WorkerParameters,
    private val db: PixelForgeDb
) : CoroutineWorker(ctx, params) {

    override suspend fun doWork(): Result {
        // Transition hardening: Local Mode/Auth Standby means no placeholder network calls.
        if (!Supabase.isConfigured) return Result.success()

        val outbox = db.outbox()
        val batch = outbox.peek()
        if (batch.isEmpty()) return Result.success()

        var allOk = true
        for (entry in batch) {
            try {
                when (entry.entity) {
                    "projects" -> Supabase.client.from("projects").upsert(json(entry.payloadJson))
                    "edits" -> Supabase.client.from("edits").upsert(json(entry.payloadJson))
                    "presets" -> Supabase.client.from("presets").upsert(json(entry.payloadJson))
                    "delete" -> deleteRemote(entry.entityId)
                }
                outbox.ack(entry.id)
            } catch (e: Exception) {
                allOk = false
                if (entry.attempts + 1 >= MAX_ATTEMPTS) {
                    // TODO Phase 3.1: persist to a dead-letter table visible in Owner Console.
                    outbox.ack(entry.id)
                } else {
                    outbox.fail(entry.id, e.message ?: "unknown")
                }
            }
        }
        return if (allOk) Result.success() else Result.retry()
    }

    private fun json(payload: String): JsonElement = Json.parseToJsonElement(payload)

    private suspend fun deleteRemote(entityId: String) {
        val parts = entityId.split(":", limit = 2)
        if (parts.size == 2) {
            Supabase.client.from(parts[0]).delete {
                filter { eq("id", parts[1]) }
            }
        }
    }

    companion object {
        const val UNIQUE = "pixelforge_sync"
        private const val MAX_ATTEMPTS = 5

        fun enqueue(context: Context) {
            val req = PeriodicWorkRequestBuilder<SyncWorker>(15, TimeUnit.MINUTES)
                .setConstraints(
                    Constraints.Builder()
                        .setRequiredNetworkType(NetworkType.CONNECTED)
                        .build()
                )
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
                .build()
            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                UNIQUE,
                ExistingPeriodicWorkPolicy.KEEP,
                req
            )
        }

        fun oneShot(context: Context) {
            val req = OneTimeWorkRequestBuilder<SyncWorker>()
                .setConstraints(
                    Constraints.Builder()
                        .setRequiredNetworkType(NetworkType.CONNECTED)
                        .build()
                )
                .build()
            WorkManager.getInstance(context).enqueue(req)
        }
    }
}
