package ai.pixelforge.enhancer

import androidx.compose.material3.*
import androidx.compose.material3.adaptive.navigationsuite.NavigationSuiteScaffold
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.*
import ai.pixelforge.feature.dashboard.DashboardScreen
import ai.pixelforge.feature.gallery.GalleryScreen
import ai.pixelforge.feature.editor.EditorScreen
import ai.pixelforge.feature.batch.BatchScreen
import ai.pixelforge.feature.presets.PresetsScreen
import ai.pixelforge.feature.auth.AuthScreen
import ai.pixelforge.core.ui.onboarding.PixelfyOnboarding
import ai.pixelforge.core.data.billing.EntitlementRepository
import androidx.hilt.navigation.compose.hiltViewModel
import kotlinx.coroutines.launch

sealed class Dest(val route: String, val label: String, val icon: String) {
    data object Onboarding: Dest("onboarding","Onboarding","✨")
    data object Dashboard: Dest("dashboard","Home","✨")
    data object Gallery: Dest("gallery","Studio","🖼️")
    data object Editor: Dest("editor/{id}","Edit","🎨")
    data object Batch: Dest("batch","Batch","⚡")
    data object Presets: Dest("presets","Pixelfy+","💫")
    data object Exports: Dest("exports","Export","⬇️")
    data object Auth: Dest("auth","Local","🔒")
}
val topDestinations = listOf(Dest.Dashboard, Dest.Gallery, Dest.Batch, Dest.Presets, Dest.Exports)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PixelForgeNavHost(
    entitlementRepo: EntitlementRepository = hiltViewModel<ai.pixelforge.feature.dashboard.OwnerConsoleViewModel>().entitlementRepo
) {
    val navController = rememberNavController()
    val backStack by navController.currentBackStackEntryAsState()
    val currentRoute = backStack?.destination?.route ?: Dest.Dashboard.route
    var showAuth by rememberSaveable { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    // Alpha 0.9.3 — onboarding first launch
    val onboardDone by entitlementRepo.onboardingDone.collectAsState(initial = false)
    val ent by entitlementRepo.entitlement.collectAsState(initial = ai.pixelforge.core.domain.model.Entitlement(isOwner = true, isPro = true, isLocalMode = true))

    if (!onboardDone) {
        PixelfyOnboarding(
            isPro = ent.isPro || ent.isOwner,
            onFinish = {
                scope.launch { entitlementRepo.setOnboardingDone(true) }
            }
        )
        return
    }

    NavigationSuiteScaffold(
        navigationSuiteItems = {
            topDestinations.forEach { dest ->
                item(
                    selected = currentRoute.startsWith(dest.route.substringBefore("/{")),
                    onClick = { 
                        navController.navigate(dest.route.substringBefore("/{")) {
                            popUpTo(Dest.Dashboard.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    icon = { Text(dest.icon) },
                    label = { Text(dest.label) }
                )
            }
        }
    ) {
        NavHost(navController, startDestination = Dest.Dashboard.route, modifier = Modifier) {
            composable(Dest.Dashboard.route) { DashboardScreen(
                onOpenProject = { id -> navController.navigate("editor/$id") },
                onOpenAuth = { showAuth = true }
            )}
            composable(Dest.Gallery.route) { GalleryScreen(onOpen = { id -> navController.navigate("editor/$id") }) }
            composable(Dest.Batch.route) { BatchScreen() }
            composable(Dest.Presets.route) { PresetsScreen() }
            composable(Dest.Exports.route) { 
                ai.pixelforge.feature.presets.ExportsScreen() 
            }
            composable(Dest.Editor.route) { entry ->
                val id = entry.arguments?.getString("id") ?: "demo"
                EditorScreen(projectId = id, onBack = { navController.popBackStack() })
            }
        }
        if (showAuth) {
            AlertDialog(
                onDismissRequest = { showAuth = false },
                confirmButton = {},
                title = { Text("Pixelfy • Auth standby") },
                text = { AuthScreen(onSignedIn = { showAuth = false }) }
            )
        }
    }
}
