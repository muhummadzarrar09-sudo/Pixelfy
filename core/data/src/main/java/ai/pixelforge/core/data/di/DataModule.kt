package ai.pixelforge.core.data.di

import android.content.Context
import androidx.room.Room
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
    @Provides @Singleton
    fun provideDb(@ApplicationContext ctx: Context): PixelForgeDb =
        Room.databaseBuilder(ctx, PixelForgeDb::class.java, "pixelforge.db")
            .fallbackToDestructiveMigration()
            .build()
}
