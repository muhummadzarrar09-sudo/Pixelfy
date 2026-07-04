package ai.pixelforge.core.data.remote

import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.functions.Functions
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.storage.Storage
import io.ktor.client.engine.okhttp.OkHttp

object Supabase {
    // Transition Phase 3: client uses publishable key only. Never ship service_role/sb_secret keys.
    // TODO before Cloud Sync beta: move these to BuildConfig fields sourced from local.properties/CI env.
    private const val URL = "https://xyzcompany.supabase.co"
    private const val KEY = "sb_publishable_XXXXXXXXXXXXXXXX"

    val isConfigured: Boolean
        get() = URL.startsWith("https://") &&
            !URL.contains("xyzcompany") &&
            KEY.startsWith("sb_publishable_") &&
            !KEY.contains("XXXX")

    val client = createSupabaseClient(
        supabaseUrl = URL,
        supabaseKey = KEY
    ) {
        install(Auth) {
            scheme = "pixelfy"
            host = "auth"
        }
        install(Postgrest)
        install(Storage)
        install(Realtime)
        install(Functions)
        httpEngine = OkHttp.create()
    }
}
