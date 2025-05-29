pluginManagement {
    repositories {
        google()
        mavenCentral()
    }
    plugins {
        id("com.android.library") version "8.5"
        id("org.jetbrains.kotlin.android") version "2.0.21"
    }
}

include("lib")
