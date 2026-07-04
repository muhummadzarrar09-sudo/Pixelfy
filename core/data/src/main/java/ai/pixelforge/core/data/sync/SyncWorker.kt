package ai.pixelforge.core.data.sync

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.*
import ai.pixelforge.core.data.local.PixelForgeDb
import ai.pixelforge.core.data.remote.Supabase
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import io.github.jan.supabase.postgrest.from
import kotlinx.coroutines.delay
import kotlinx.serialization.json.Json
import java.util.concurrent.TimeUnit

@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted ctx: Context,
    @Assisted params: WorkerParameters,
    private val db: PixelForgeDb
) : CoroutineWorker(ctx, params) {

    override suspend fun doWork(): Result {
        val outbox = db.outbox()
        val batch = outbox.peek()
        if (batch.isEmpty()) return Result.success()

        var allOk = true
        for (entry in batch) {
            try {
                // Supabase Postgrest upsert
                when (entry.entity) {
                    "projects" -> {
                        Supabase.client.from("projects").upsert(Json.decodeFromString(entry.payloadJson))
                    }
                    "edits" -> {
                        Supabase.client.from("edits").upsert(Json.decodeFromString(entry.payloadJson))
                    }
                    "presets" -> {
                        Supabase.client.from("presets").upsert(Json.decodeFromString(entry.payloadJson))
                    }
                    "delete" -> {
                        // generic delete
                        val parts = entry.entityId.split(":")
                        if (parts.size == 2) {
                            Supabase.client.from(parts[0]).delete { filter { eq("id", parts[1]) } }
                        }
                    }
                }
                outbox.ack(entry.id)
            } catch (e: Exception) {
                outbox.fail(entry.id, e.message ?: "unknown")
                allOk = false
                if (entry.attempts >= 5) {
                    outbox.ack(entry.id) // dead-letter after 5
                }
            }
        }
        return if (allOk) Result.success() else Result.retry()
    }

    companion object {
        const val UNIQUE = "pixelforge_sync"
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
                UNIQUE, ExistingPeriodicWorkPolicy.KEEP, req
            )
        }
        fun oneShot(context: Context) {
            val req = OneTimeWorkRequestBuilder<SyncWorker>()
                .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
                .build()
            WorkManager.getInstance(context).enqueue(req)
        }
    }
}
