pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }

    plugins {
        id("com.android.library") version "8.5.0"
        id("org.jetbrains.kotlin.android") version "2.0.21"
    }
}

dependencyResolutionManagement {    
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

include("lib")
project(":lib").projectDir.mkdirs()