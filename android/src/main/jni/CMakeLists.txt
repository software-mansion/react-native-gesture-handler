project(GestureHandler)
cmake_minimum_required(VERSION 3.9.0)

set (PACKAGE_NAME "react-native-gesture-handler")
set (CMAKE_VERBOSE_MAKEFILE ON)
set (CMAKE_CXX_STANDARD 17)

add_library(rngesturehandler_modules # Library name
  SHARED
  cpp-adapter.cpp
)

set(APP_BUILD_DIR "${CMAKE_SOURCE_DIR}/../FabricExample/android/app/build")  # TODO: client side build
set(REACT_COMMON_DIR "${NODE_MODULES_DIR}/react-native/ReactCommon")
set(REACT_NDK_EXPORT_DIR "/Users/tomekzaw/RNOS/react-native-gesture-handler/FabricExample/android/app/build/react-ndk/exported")

## jsi
add_library(jsi SHARED IMPORTED GLOBAL)
set_target_properties(jsi
        PROPERTIES
        IMPORTED_LOCATION
        ${REACT_NDK_EXPORT_DIR}/${ANDROID_ABI}/libjsi.so)
target_include_directories(jsi INTERFACE ${REACT_COMMON_DIR}/jsi)

## react_render_uimanager
add_library(react_render_uimanager SHARED IMPORTED GLOBAL)
set_target_properties(react_render_uimanager
        PROPERTIES
        IMPORTED_LOCATION
        ${REACT_NDK_EXPORT_DIR}/${ANDROID_ABI}/libreact_render_uimanager.so)
target_include_directories(react_render_uimanager INTERFACE ${REACT_COMMON_DIR}/react/renderer/uimanager)

target_link_libraries(
  rngesturehandler_modules
  jsi
  react_render_uimanager
)
