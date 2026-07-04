package ai.pixelforge.core.ui.brand

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

val PixelfyGradient = Brush.horizontalGradient(
    listOf(Color(0xFF8B5CF6), Color(0xFF06FFA5), Color(0xFFFF3B9A))
)

@Composable
fun PixelfyLogo(modifier: Modifier = Modifier, size: Int = 48) {
    Box(
        modifier
            .size(size.dp)
            .background(PixelfyGradient, RoundedCornerShape(16.dp)),
        contentAlignment = Alignment.Center
    ) {
        Text("P", color = Color.White, fontSize = (size*0.5).sp, fontWeight = FontWeight.Black)
    }
}

@Composable
fun PixelfyBrandingHeader() {
    Row(verticalAlignment = Alignment.CenterVertically) {
        PixelfyLogo()
        Spacer(Modifier.width(12.dp))
        Column {
            Text("Pixelfy", style = MaterialTheme.typography.headlineSmall, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.ExtraBold)
            Text("AI Image Enhancement", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
fun PixelfyProBadge() {
    Surface(
        color = MaterialTheme.colorScheme.tertiaryContainer,
        shape = RoundedCornerShape(50),
        tonalElevation = 2.dp
    ) {
        Text(
            "✨ Pro",
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onTertiaryContainer,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
fun PixelfyLocalModeChip(onClick: () -> Unit = {}) {
    AssistChip(
        onClick = onClick,
        label = { Text("🔒 Local • Auth standby") },
        colors = AssistChipDefaults.assistChipColors(
            containerColor = MaterialTheme.colorScheme.secondaryContainer
        )
    )
}
