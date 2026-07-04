pluginManagement {
  repositories {
    google(); mavenCentral(); gradlePluginPortal()
  }
}
dependencyResolutionManagement {
  repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
  repositories { google(); mavenCentral() }
}
rootProject.name = "PixelForge"
include(":app")
include(":core:ui")
include(":core:data")
include(":core:domain")
include(":feature:dashboard")
include(":feature:gallery")
include(":feature:editor")
include(":feature:batch")
include(":feature:presets")
include(":feature:auth")
include(":processor")
