package ai.pixelforge.enhancer

import android.app.Application
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import ai.pixelforge.core.data.sync.SyncWorker
import ai.pixelforge.core.data.sync.RealtimeSync
import dagger.hilt.android.HiltAndroidApp
import javax.inject.Inject

@HiltAndroidApp
class PixelfyApp: Application(), Configuration.Provider {
    @Inject lateinit var workerFactory: HiltWorkerFactory
    @Inject lateinit var realtimeSync: RealtimeSync

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()

    override fun onCreate() {
        super.onCreate()
        // Pixelfy — LOCAL MODE (Auth standby)
        // SyncWorker is registered but idle until auth enabled
        // realtimeSync.start(userId = null) // standby
        // Uncomment to enable cloud sync:
        // SyncWorker.enqueue(this)
        // realtimeSync.start(userId = "local_demo")
    }
}
