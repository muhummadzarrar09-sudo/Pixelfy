package ai.pixelforge.core.data.local

import androidx.room.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import ai.pixelforge.core.domain.model.*

@Entity(tableName = "projects")
data class ProjectEntity(
    @PrimaryKey val id: String,
    val title: String,
    val thumbUri: String?,
    val width: Int,
    val height: Int,
    val status: String,
    val isFavorite: Boolean,
    val tagsCsv: String,
    val updatedAt: Long
)

fun ProjectEntity.toDomain() = Project(id, title, thumbUri, width, height, status, isFavorite, tagsCsv.split(",").filter{it.isNotBlank()}, updatedAt)
fun Project.toEntity() = ProjectEntity(id, title, thumbUri, width, height, status, isFavorite, tags.joinToString(","), updatedAt)

@Entity(tableName = "presets")
data class PresetEntity(
    @PrimaryKey val id: String,
    val name: String,
    val category: String,
    val isPro: Boolean,
    val downloads: Int,
    val stackJson: String,
    val previewUri: String?
)

@Entity(tableName = "edits")
data class EditEntity(
    @PrimaryKey val id: String,
    val projectId: String,
    val stackJson: String,
    val version: Int
)

@Dao
interface ProjectDao {
    @Query("SELECT * FROM projects ORDER BY updatedAt DESC")
    suspend fun getAll(): List<ProjectEntity>
    @Query("SELECT * FROM projects WHERE id = :id")
    suspend fun get(id: String): ProjectEntity?
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(p: ProjectEntity)
    @Query("DELETE FROM projects WHERE id = :id")
    suspend fun delete(id: String)
    @Query("UPDATE projects SET isFavorite = :fav WHERE id = :id")
    suspend fun favorite(id: String, fav: Boolean)
}

@Dao
interface PresetDao {
    @Query("SELECT * FROM presets ORDER BY downloads DESC")
    suspend fun all(): List<PresetEntity>
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(list: List<PresetEntity>)
}

import ai.pixelforge.core.data.sync.OutboxDao
import ai.pixelforge.core.data.sync.OutboxEntry

@Database(
    entities = [ProjectEntity::class, PresetEntity::class, EditEntity::class, OutboxEntry::class],
    version = 2,
    exportSchema = false
)
abstract class PixelForgeDb: RoomDatabase() {
    abstract fun projects(): ProjectDao
    abstract fun presets(): PresetDao
    abstract fun outbox(): OutboxDao
}
