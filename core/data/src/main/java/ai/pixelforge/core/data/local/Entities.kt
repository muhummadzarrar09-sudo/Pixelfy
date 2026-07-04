package ai.pixelforge.core.data.local

import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.RoomDatabase
import ai.pixelforge.core.data.sync.OutboxDao
import ai.pixelforge.core.data.sync.OutboxEntry
import ai.pixelforge.core.domain.model.Preset
import ai.pixelforge.core.domain.model.Project
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

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

fun ProjectEntity.toDomain() = Project(
    id = id,
    title = title,
    thumbUri = thumbUri,
    width = width,
    height = height,
    status = status,
    isFavorite = isFavorite,
    tags = tagsCsv.split(",").filter { it.isNotBlank() },
    updatedAt = updatedAt
)

fun Project.toEntity() = ProjectEntity(
    id = id,
    title = title,
    thumbUri = thumbUri,
    width = width,
    height = height,
    status = status,
    isFavorite = isFavorite,
    tagsCsv = tags.joinToString(","),
    updatedAt = updatedAt
)

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

fun PresetEntity.toDomain() = Preset(
    id = id,
    name = name,
    category = category,
    isPro = isPro,
    downloads = downloads,
    stack = Json.decodeFromString(stackJson),
    previewUri = previewUri
)

fun Preset.toEntity() = PresetEntity(
    id = id,
    name = name,
    category = category,
    isPro = isPro,
    downloads = downloads,
    stackJson = Json.encodeToString(stack),
    previewUri = previewUri
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

@Database(
    entities = [ProjectEntity::class, PresetEntity::class, EditEntity::class, OutboxEntry::class],
    version = 2,
    exportSchema = true
)
abstract class PixelForgeDb : RoomDatabase() {
    abstract fun projects(): ProjectDao
    abstract fun presets(): PresetDao
    abstract fun outbox(): OutboxDao
}
