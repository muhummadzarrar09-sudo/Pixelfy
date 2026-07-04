package ai.pixelforge.core.data.billing

import android.content.Context
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import ai.pixelforge.core.domain.model.Entitlement
import ai.pixelforge.core.domain.model.OpType
import ai.pixelforge.core.domain.model.canUse
import ai.pixelforge.enhancer.BuildConfig
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.*
import javax.inject.Inject
import javax.inject.Singleton

private val Context.pixelfyPrefs by preferencesDataStore("pixelfy_entitlement")

@Singleton
class EntitlementRepository @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val OWNER_KEY = "PXFY-OWNER-2026-UNLIMITED"

    private val KEY_PRO = booleanPreferencesKey("pro")
    private val KEY_OWNER = booleanPreferencesKey("owner_flag")
    private val KEY_LOCAL = booleanPreferencesKey("local_mode")
    private val KEY_TAP_COUNT = intPreferencesKey("easter_tap")
    private val KEY_FORCE_FREE = booleanPreferencesKey("force_free_test")
    private val KEY_ONBOARD_DONE = booleanPreferencesKey("onboard_done_v1")
    private val KEY_ONBOARD_VERSION = intPreferencesKey("onboard_version")

    // Owner override: BuildConfig.IS_OWNER == true in owner/debug builds
    private val buildOwner = try {
        BuildConfig::class.java.getField("IS_OWNER").get(null) as Boolean
    } catch (_: Exception) { true } // default owner ON for local testing — per request

    val entitlement: Flow<Entitlement> = context.pixelfyPrefs.data.map { p ->
        val ownerFlag = p[KEY_OWNER] ?: buildOwner
        val forceFree = p[KEY_FORCE_FREE] ?: false
        val pro = if (forceFree) false else (p[KEY_PRO] ?: ownerFlag)
        Entitlement(
            isPro = pro || ownerFlag,
            isOwner = ownerFlag,
            isLocalMode = p[KEY_LOCAL] ?: true,
            source = when {
                ownerFlag -> "owner"
                pro -> "pro"
                else -> "free"
            }
        )
    }.distinctUntilChanged()

    suspend fun setPro(v: Boolean) {
        context.pixelfyPrefs.edit { it[KEY_PRO] = v }
    }
    suspend fun setLocalMode(v: Boolean) {
        context.pixelfyPrefs.edit { it[KEY_LOCAL] = v }
    }
    suspend fun setForceFreeTest(v: Boolean) {
        context.pixelfyPrefs.edit { it[KEY_FORCE_FREE] = v }
    }
    suspend fun setOwner(v: Boolean) {
        context.pixelfyPrefs.edit { it[KEY_OWNER] = v }
    }

    // 7-tap easter egg
    suspend fun tapEaster(): Int {
        var count = 0
        context.pixelfyPrefs.edit { prefs ->
            count = (prefs[KEY_TAP_COUNT] ?: 0) + 1
            if (count >= 7) {
                // unlock owner console
                prefs[KEY_OWNER] = !(prefs[KEY_OWNER] ?: buildOwner)
                count = 0
            }
            prefs[KEY_TAP_COUNT] = count
        }
        return count
    }

    suspend fun canUse(op: OpType): Boolean {
        return entitlement.first().canUse(op)
    }

    // Onboarding — Alpha 0.9.3
    val onboardingDone: Flow<Boolean> = context.pixelfyPrefs.data.map { it[KEY_ONBOARD_DONE] ?: false }
    suspend fun setOnboardingDone(done: Boolean = true) {
        context.pixelfyPrefs.edit { 
            it[KEY_ONBOARD_DONE] = done
            it[KEY_ONBOARD_VERSION] = 1 // 0.9.3
        }
    }
    suspend fun resetOnboarding() {
        context.pixelfyPrefs.edit { 
            it.remove(KEY_ONBOARD_DONE)
            it.remove(KEY_ONBOARD_VERSION)
        }
    }
}
