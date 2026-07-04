package ai.pixelforge.core.data.sync

import androidx.room.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.UUID

@Entity(tableName = "sync_outbox")
data class OutboxEntry(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val entity: String, // "projects","edits","presets"
    val entityId: String,
    val operation: String, // upsert / delete
    val payloadJson: String,
    val attempts: Int = 0,
    val createdAt: Long = System.currentTimeMillis(),
    val lastError: String? = null
)

@Dao
interface OutboxDao {
    @Query("SELECT * FROM sync_outbox ORDER BY createdAt ASC LIMIT 50")
    suspend fun peek(): List<OutboxEntry>

    @Insert
    suspend fun enqueue(e: OutboxEntry)

    @Query("DELETE FROM sync_outbox WHERE id = :id")
    suspend fun ack(id: String)

    @Query("UPDATE sync_outbox SET attempts = attempts + 1, lastError = :err WHERE id = :id")
    suspend fun fail(id: String, err: String)
}

// Extend PixelForgeDb — add outbox in next migration (v2)
// For Phase 1 seed we use v1 — migration stub provided in SyncModule
