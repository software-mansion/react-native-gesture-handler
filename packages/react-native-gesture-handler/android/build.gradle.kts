import java.util.Properties
import java.io.File

plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
    id("com.diffplug.spotless") version "7.0.4"
}

if (isNewArchitectureEnabled()) {
    apply(plugin = "com.facebook.react")
}

fun safeExtGet(prop: String, fallback: Any?): Any? =
    if (rootProject.extra.has(prop)) rootProject.extra[prop] else fallback

fun isNewArchitectureEnabled(): Boolean =
    project.hasProperty("newArchEnabled") && project.property("newArchEnabled") == "true"

fun isGHExampleApp(): Boolean =
    safeExtGet("isGHExampleApp", false) as Boolean

fun resolveReactNativeDirectory(): File {
    val reactNativeLocation = safeExtGet("REACT_NATIVE_NODE_MODULES_DIR", null)

    if (reactNativeLocation != null) {
        return file(reactNativeLocation)
    }

    // Fallback to node resolver for custom directory structures like monorepos.
    val reactNativePackage = file(
        ProcessBuilder("node", "--print", "require.resolve('react-native/package.json')")
            .directory(rootDir)
            .redirectOutput(ProcessBuilder.Redirect.PIPE)
            .start()
            .inputStream.bufferedReader().readText().trim()
    )

    if (reactNativePackage.exists()) {
        return reactNativePackage.parentFile
    }

    throw IllegalStateException(
        "[react-native-gesture-handler] Unable to resolve react-native location in node_modules. " +
        "You should add project extension property (in app/build.gradle) `REACT_NATIVE_NODE_MODULES_DIR` " +
        "with path to react-native, or run this project from the root of the react-native monorepo."
    )
}

val REACT_NATIVE_DIR = resolveReactNativeDirectory()
val REACT_PROPERTIES = Properties().apply {
    File(REACT_NATIVE_DIR, "ReactAndroid/gradle.properties").inputStream().use { load(it) }
}
val REACT_NATIVE_VERSION = REACT_PROPERTIES.getProperty("VERSION_NAME")
val REACT_NATIVE_MINOR_VERSION = if (REACT_NATIVE_VERSION.startsWith("0.0.0-")) 1000 else REACT_NATIVE_VERSION.split(".")[1].toInt()


android {
    compileSdk = safeExtGet("compileSdkVersion", 33) as Int
    namespace = "com.swmansion.gesturehandler"
    buildFeatures {
        buildConfig = true
        prefab = true
    }

    // Used to override the NDK path/version on internal CI or by allowing
    // users to customize the NDK path/version from their root project (e.g. for M1 support)
    if (rootProject.hasProperty("ndkPath")) {
        ndkPath = rootProject.extra["ndkPath"] as String
    }
    if (rootProject.hasProperty("ndkVersion")) {
        ndkVersion = rootProject.extra["ndkVersion"] as String
    }

    defaultConfig {
        minSdk = safeExtGet("minSdkVersion", 21) as Int
        buildConfigField("boolean", "IS_NEW_ARCHITECTURE_ENABLED", isNewArchitectureEnabled().toString())
        buildConfigField("int", "REACT_NATIVE_MINOR_VERSION", REACT_NATIVE_MINOR_VERSION.toString())

        if (isNewArchitectureEnabled()) {
            externalNativeBuild {
                cmake {
                    cppFlags.addAll(listOf("-O2", "-frtti", "-fexceptions", "-Wall", "-Werror", "-std=c++20", "-DANDROID"))
                    arguments.addAll(listOf(
                        "-DREACT_NATIVE_DIR=$REACT_NATIVE_DIR",
                        "-DREACT_NATIVE_MINOR_VERSION=$REACT_NATIVE_MINOR_VERSION",
                        "-DANDROID_STL=c++_shared",
                        "-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON"
                    ))
                    abiFilters.addAll(reactNativeArchitectures())
                }
            }
        }
    }

    testOptions {
        targetSdk = safeExtGet("targetSdkVersion", 33) as Int
    }

    lint {
        targetSdk = safeExtGet("targetSdkVersion", 33) as Int
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }

    if (isNewArchitectureEnabled()) {
        externalNativeBuild {
            cmake {
                path = file("src/main/jni/CMakeLists.txt")
            }
        }
    }

    packaging {
        jniLibs {
            // For some reason gradle only complains about the duplicated version of libreact_render libraries
            // while there are more libraries copied in intermediates folder of the lib build directory, we exclude
            // only the ones that make the build fail (ideally we should only include libgesturehandler but we
            // are only allowed to specify exclude patterns)
            excludes.addAll(listOf(
                "**/libreact_render*.so",
                "**/libreactnative.so",
                "**/libjsi.so",
                "**/libc++_shared.so"))
        }
    }

    sourceSets["main"].java.srcDirs(buildListOfJavaSrcDirs())

    if (isGHExampleApp()) {
        val androidDir = project.projectDir
        
        tasks.withType<com.android.build.gradle.tasks.ExternalNativeBuildJsonTask>().configureEach {
            doLast {
                val hashRegex = """/Debug/([^/]+)/logs""".toRegex()
                val archRegex = """/logs/([^/]+)$""".toRegex()

                val path = outputs.files.singleFile.path

                val hashResults = hashRegex.find(path)
                val hash = hashResults?.groups?.get(1)?.value

                val archResults = archRegex.find(path)
                val arch = archResults?.groups?.get(1)?.value

                val rootDir = File(androidDir, "../../..")
                val generated = File(androidDir, ".cxx/Debug/$hash/$arch/compile_commands.json")
                val output = File(rootDir, "compile_commands.json")
                output.writeText(generated.readText())

                println("Generated clangd metadata.")
            }
        }
    }
}

dependencies {
    implementation("com.facebook.react:react-native:+")

    if (shouldUseCommonInterfaceFromReanimated()) {
        implementation(project(":react-native-reanimated")) {
            exclude(group = "com.facebook.fbjni")
        }
    }
    if (shouldUseCommonInterfaceFromRNSVG()) {
        implementation(project(":react-native-svg"))
    }

    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.core:core-ktx:1.16.0")
    implementation("org.jetbrains.kotlin:kotlin-stdlib:${project.findProperty("kotlinVersion") ?: project.property("RNGH_kotlinVersion")}")
}

fun getExternalLibVersion(project: Project): Triple<Int, Int, Int> {
    val inputFile = File(project.projectDir, "../package.json")
    val json = groovy.json.JsonSlurper().parseText(inputFile.readText()) as Map<*, *>
    val libVersion = json["version"] as String
    val (major, minor, patch) = libVersion.split(".")

    return Triple(major.toInt(), minor.toInt(), patch.toInt())
}

// Check whether Reanimated 2.3 or higher is installed alongside Gesture Handler
fun shouldUseCommonInterfaceFromReanimated(): Boolean {
    val reanimated = rootProject.subprojects.find { it.name == "react-native-reanimated" } ?: return false
    val (major, minor, _) = getExternalLibVersion(reanimated)

    return (major == 2 && minor >= 3) || major >= 3
}

// Common interface compatible with react-native-svg >= 15.11.2
fun shouldUseCommonInterfaceFromRNSVG(): Boolean {
    val rnsvg = rootProject.subprojects.find { it.name == "react-native-svg" } ?: return false
    val (major, minor, patch) = getExternalLibVersion(rnsvg)

    return (major == 15 && minor == 11 && patch >= 2) ||
            (major == 15 && minor > 11) ||
            major > 15
}

fun reactNativeArchitectures(): List<String> {
    val value = project.properties["reactNativeArchitectures"] as? String
    return value?.split(",") ?: listOf("armeabi-v7a", "x86", "x86_64", "arm64-v8a")
}

fun buildListOfJavaSrcDirs(): List<String> {
    val dirs = mutableListOf<String>()

    if (shouldUseCommonInterfaceFromReanimated()) {
        dirs += "reanimated/src/main/java"
    } else {
        // Include "common/" only when it's not provided by Reanimated to mitigate
        // multiple definitions of the same class preventing build
        dirs += "common/src/main/java"
        dirs += "noreanimated/src/main/java"
    }

    if (shouldUseCommonInterfaceFromRNSVG()) {
        dirs += "svg/src/main/java"
    } else {
        dirs += "nosvg/src/main/java"
    }

    if (isNewArchitectureEnabled()) {
        dirs += "fabric/src/main/java"
    } else {
        // 'paper/src/main/java' includes files from codegen so the library can compile with
        // codegen turned off
        if (REACT_NATIVE_MINOR_VERSION > 77) {
            dirs += "paper/src/main/java"
        } else {
            dirs += "paper77/src/main/java"
        }
    }
    
    if (REACT_NATIVE_MINOR_VERSION >= 77) {
        // With RN 0.77, ViewManager related functions in the package has different signatures as they 
        // are no longer nullable
        dirs += "package77/src/main/java"
    } else {
        // TODO: Delete this block:
        // It's safe to delete this block once we drop support for RN 0.76
        dirs += "packageDeprecated/src/main/java"
    }

    return dirs
}

spotless {
    kotlin {
        target("**/*.kt")
        ktlint().editorConfigOverride(mapOf("indent_size" to "2", "max_line_length" to "120"))
        trimTrailingWhitespace()
        leadingTabsToSpaces()
        endWithNewline()
    }
}
