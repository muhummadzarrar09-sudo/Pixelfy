package ai.pixelforge.core.data.di

import android.content.Context
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import ai.pixelforge.core.data.local.PixelForgeDb
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DataModule {
    /**
     * Transition hardening:
     * - No destructive fallback for Beta+.
     * - WAL journaling for crash resilience.
     * - Explicit v1 -> v2 migration for the sync outbox.
     */
    @Provides
    @Singleton
    fun provideDb(@ApplicationContext ctx: Context): PixelForgeDb =
        Room.databaseBuilder(ctx, PixelForgeDb::class.java, "pixelforge.db")
            .addMigrations(MIGRATION_1_2)
            .setJournalMode(RoomDatabase.JournalMode.WRITE_AHEAD_LOGGING)
            .build()

    private val MIGRATION_1_2 = object : Migration(1, 2) {
        override fun migrate(db: SupportSQLiteDatabase) {
            db.execSQL(
                """
                CREATE TABLE IF NOT EXISTS `sync_outbox` (
                    `id` TEXT NOT NULL,
                    `entity` TEXT NOT NULL,
                    `entityId` TEXT NOT NULL,
                    `operation` TEXT NOT NULL,
                    `payloadJson` TEXT NOT NULL,
                    `attempts` INTEGER NOT NULL DEFAULT 0,
                    `createdAt` INTEGER NOT NULL,
                    `lastError` TEXT,
                    PRIMARY KEY(`id`)
                )
                """.trimIndent()
            )
            db.execSQL("CREATE INDEX IF NOT EXISTS `index_sync_outbox_createdAt` ON `sync_outbox` (`createdAt`)")
        }
    }
}
