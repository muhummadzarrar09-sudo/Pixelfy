package ai.pixelforge.core.data.remote

import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.storage.Storage
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.functions.Functions
import io.ktor.client.engine.okhttp.OkHttp

object Supabase {
    // TODO: replace with your sb_publishable_ key (Supabase 2026 keys)
    private const val URL = "https://xyzcompany.supabase.co"
    private const val KEY = "sb_publishable_XXXXXXXXXXXXXXXX"

    val client = createSupabaseClient(
        supabaseUrl = URL,
        supabaseKey = KEY
    ) {
        install(Auth) {
            scheme = "pixelforge"
            host = "auth"
        }
        install(Postgrest)
        install(Storage)
        install(Realtime)
        install(Functions)
        httpEngine = OkHttp.create()
    }
}
