// swift-tools-version: 6.0

import Foundation
import PackageDescription

let packageDirectory = Context.packageDirectory

func rnWorkletsPackageExists() -> Bool {
    let url = URL(fileURLWithPath: packageDirectory)
        .appendingPathComponent("../RNWorklets/Package.swift")
    return FileManager.default.fileExists(atPath: url.path)
}

let useWorklets = rnWorkletsPackageExists()

let reactHeaders: [Target.Dependency] = [
    .product(name: "ReactHeaders", package: "ReactNative"),
    .product(name: "ReactNativeHeaders", package: "ReactNative"),
    .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
    .product(name: "ReactAppHeaders", package: "React-GeneratedCode"),
]

var packageDependencies: [Package.Dependency] = [
    .package(name: "ReactNative", path: "../../../../xcframeworks"),
    .package(name: "React-GeneratedCode", path: "../../../ios"),
]

var targetDependencies: [Target.Dependency] = reactHeaders

if useWorklets {
    packageDependencies.append(.package(name: "RNWorklets", path: "../RNWorklets"))
    targetDependencies.append(.product(name: "RNWorklets", package: "RNWorklets"))
}

var cSettings: [CSetting] = [
    .headerSearchPath("apple"),
    .headerSearchPath("shared/runtime"),
    .headerSearchPath("shared/shadowNodes"),
    .headerSearchPath(
        "shared/shadowNodes/react/renderer/components/rngesturehandler_codegen"),
    .define("DEBUG", .when(configuration: .debug)),
    .define("NDEBUG", .when(configuration: .release)),
]

var cxxSettings: [CXXSetting] = [
    .headerSearchPath("apple"),
    .headerSearchPath("shared/runtime"),
    .headerSearchPath("shared/shadowNodes"),
    .headerSearchPath(
        "shared/shadowNodes/react/renderer/components/rngesturehandler_codegen"),
    .define("DEBUG", .when(configuration: .debug)),
    .define("NDEBUG", .when(configuration: .release)),
]

if useWorklets {
    cxxSettings.append(.define("RNGH_USE_WORKLETS", to: "1"))
}

let package = Package(
    name: "RNGestureHandler",
    platforms: [.iOS(.v15)],
    products: [
        .library(name: "RNGestureHandler", targets: ["RNGestureHandler"]),
    ],
    dependencies: packageDependencies,
    targets: [
        .target(
            name: "RNGestureHandler",
            dependencies: targetDependencies,
            path: ".",
            exclude: ["apple/RNGestureHandler.xcodeproj"],
            sources: ["apple", "shared"],
            publicHeadersPath: "apple",
            cSettings: cSettings,
            cxxSettings: cxxSettings,
            linkerSettings: [
                .linkedFramework("UIKit"),
                .linkedFramework("Foundation"),
            ]
        ),
    ],
    cxxLanguageStandard: .cxx20
)
