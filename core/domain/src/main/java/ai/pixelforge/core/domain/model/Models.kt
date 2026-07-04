package ai.pixelforge.core.domain.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Serializable
data class Project(
    val id: String,
    val title: String,
    val thumbUri: String? = null,
    val width: Int = 0,
    val height: Int = 0,
    val status: String = "draft",
    val isFavorite: Boolean = false,
    val tags: List<String> = emptyList(),
    val updatedAt: Long = System.currentTimeMillis()
)

@Serializable
data class EditOp(
    val id: String,
    val type: OpType,
    val enabled: Boolean = true,
    val opacity: Float = 1f,
    val blend: BlendMode = BlendMode.Normal,
    val params: Map<String, Float> = emptyMap()
)

@Serializable
enum class OpType {
    // Free 38
    BRIGHTNESS, CONTRAST, EXPOSURE, HIGHLIGHTS, SHADOWS, WHITES, BLACKS,
    SATURATION, VIBRANCE, TEMPERATURE, TINT, GAMMA, CURVES, LEVELS,
    SHARPEN, CLARITY, TEXTURE, DEHAZE,
    VIGNETTE, GRAIN, BLOOM,
    HSL, COLOR_MIXER, SPLIT_TONE, GRADIENT_MAP,
    CROP, ROTATE, STRAIGHTEN, PERSPECTIVE, FLIP,
    BLUR_GAUSSIAN, BLUR_MOTION, BLUR_RADIAL,
    INVERT, SEPIA, BLACK_WHITE, FADE,
    // Pro 25
    AI_UPSCALE, AI_DENOISE, AI_DEBLUR, FACE_RESTORE, PORTRAIT_RELIGHT,
    SKY_ENHANCE, BG_REMOVE, AI_COLORIZE,
    SUPER_RES, HDR_TONE_MAP, CHANNEL_MIXER, LUT_3D,
    LENS_BLUR, CHROMATIC_FIX, LENS_DISTORT,
    SPOT_HEAL, DUST_REMOVE, RED_EYE, BLEMISH,
    LIQUIFY, CONTENT_AWARE_SCALE, SEAM_CARVE,
    OIL_PAINT, GLITCH, DOUBLE_EXPOSURE
}

@Serializable
enum class BlendMode { Normal, Multiply, Screen, Overlay, SoftLight, HardLight, Luminosity, Color }

@Serializable
data class Preset(
    val id: String,
    val name: String,
    val category: String,
    val isPro: Boolean = false,
    val downloads: Int = 0,
    val stack: List<EditOp> = emptyList(),
    val previewUri: String? = null
)

@Serializable
data class BatchJob(
    val id: String,
    val name: String,
    val presetId: String,
    val inputCount: Int,
    val status: String,
    val progress: Float = 0f
)

@Serializable
data class ExportJob(
    val id: String,
    val projectId: String,
    val format: String,
    val quality: Int,
    val fileSize: Long = 0
)
