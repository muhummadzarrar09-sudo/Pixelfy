package ai.pixelforge.core.data.security

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Debug
import ai.pixelforge.core.data.BuildConfig
import dagger.hilt.android.qualifiers.ApplicationContext
import java.io.File
import java.security.MessageDigest
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Transition Phase 3 RASP baseline.
 *
 * Principle: collect signals and gate high-value actions later; never crash the app on detection.
 * Owner/local mode remains usable. Pro purchase/cloud sync can require a clean score in Phase 3.1.
 */
data class SecuritySignals(
    val rooted: Boolean,
    val emulator: Boolean,
    val debugger: Boolean,
    val hookingSuspected: Boolean,
    val tampered: Boolean
) {
    val dirtyCount: Int = listOf(rooted, emulator, debugger, hookingSuspected, tampered).count { it }
    val isCleanEnoughForCloudSync: Boolean = dirtyCount <= 1
    val requiresStepUpForProAction: Boolean = dirtyCount >= 2
}

@Singleton
class SecurityModule @Inject constructor(
    @ApplicationContext private val context: Context
) {
    fun collectSignals(): SecuritySignals = SecuritySignals(
        rooted = isRootLikely(),
        emulator = isProbablyEmulator(),
        debugger = Debug.isDebuggerConnected() || Debug.waitingForDebugger(),
        hookingSuspected = isHookingLikely(),
        tampered = isSignatureUnexpected()
    )

    private fun isRootLikely(): Boolean {
        val paths = listOf(
            "/system/app/Superuser.apk",
            "/sbin/su",
            "/system/bin/su",
            "/system/xbin/su",
            "/data/local/xbin/su",
            "/data/local/bin/su",
            "/system/sd/xbin/su",
            "/system/bin/failsafe/su",
            "/data/local/su",
            "/data/adb/magisk"
        )
        return paths.any { File(it).exists() }
    }

    private fun isProbablyEmulator(): Boolean =
        Build.FINGERPRINT.contains("generic", ignoreCase = true) ||
            Build.FINGERPRINT.contains("unknown", ignoreCase = true) ||
            Build.MODEL.contains("Emulator", ignoreCase = true) ||
            Build.MODEL.contains("Android SDK built for", ignoreCase = true) ||
            Build.MANUFACTURER.contains("Genymotion", ignoreCase = true) ||
            Build.BRAND.startsWith("generic", ignoreCase = true) ||
            Build.DEVICE.startsWith("generic", ignoreCase = true) ||
            Build.PRODUCT.contains("sdk", ignoreCase = true)

    private fun isHookingLikely(): Boolean {
        val suspiciousFiles = listOf(
            "/data/local/tmp/frida-server",
            "/data/local/tmp/frida",
            "/system/framework/XposedBridge.jar"
        )
        val suspiciousClassPresent = runCatching {
            Class.forName("de.robv.android.xposed.XposedBridge")
            true
        }.getOrDefault(false)
        return suspiciousFiles.any { File(it).exists() } || suspiciousClassPresent
    }

    private fun isSignatureUnexpected(): Boolean {
        val expected = BuildConfig.EXPECTED_CERT_SHA256
        if (expected.isBlank()) return false // Not pinned for local/owner alpha builds yet.

        return runCatching {
            val info = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                context.packageManager.getPackageInfo(
                    context.packageName,
                    PackageManager.GET_SIGNING_CERTIFICATES
                ).signingInfo.apkContentsSigners.firstOrNull()?.toByteArray()
            } else {
                @Suppress("DEPRECATION")
                context.packageManager.getPackageInfo(
                    context.packageName,
                    PackageManager.GET_SIGNATURES
                ).signatures.firstOrNull()?.toByteArray()
            } ?: return true

            val actual = MessageDigest.getInstance("SHA-256")
                .digest(info)
                .joinToString(":") { "%02X".format(it) }
            !actual.equals(expected, ignoreCase = true)
        }.getOrDefault(false)
    }
}
