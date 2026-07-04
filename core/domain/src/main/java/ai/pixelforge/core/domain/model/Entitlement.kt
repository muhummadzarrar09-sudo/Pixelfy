package ai.pixelforge.core.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class Entitlement(
    val isPro: Boolean = false,
    val isOwner: Boolean = false,
    val isLocalMode: Boolean = true,
    val source: String = "local"
)

enum class Tier { FREE, PRO, STUDIO, OWNER }

fun Entitlement.tier(): Tier = when {
    isOwner -> Tier.OWNER
    isPro -> Tier.PRO
    else -> Tier.FREE
}

fun Entitlement.canUse(op: OpType): Boolean {
    if (isOwner) return true
    if (isPro) return true
    // Free tier: block 25 Pro ops
    return !setOf(
        OpType.AI_UPSCALE, OpType.AI_DENOISE, OpType.AI_DEBLUR, OpType.FACE_RESTORE,
        OpType.PORTRAIT_RELIGHT, OpType.SKY_ENHANCE, OpType.BG_REMOVE, OpType.AI_COLORIZE,
        OpType.SUPER_RES, OpType.HDR_TONE_MAP, OpType.CHANNEL_MIXER, OpType.LUT_3D,
        OpType.LENS_BLUR, OpType.CHROMATIC_FIX, OpType.LENS_DISTORT,
        OpType.SPOT_HEAL, OpType.DUST_REMOVE, OpType.RED_EYE, OpType.BLEMISH,
        OpType.LIQUIFY, OpType.CONTENT_AWARE_SCALE,
        OpType.OIL_PAINT, OpType.GLITCH, OpType.DOUBLE_EXPOSURE
    ).contains(op)
}
