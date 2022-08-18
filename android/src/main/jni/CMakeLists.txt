project(GestureHandler)
cmake_minimum_required(VERSION 3.9.0)

set(PACKAGE_NAME "react-native-gesture-handler")
set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 17)

add_library(gesturehandler
  SHARED
  cpp-adapter.cpp
)

set(REACT_COMMON_DIR "${NODE_MODULES_DIR}/react-native/ReactCommon")
set(REACT_NDK_EXPORT_DIR "${APP_BUILD_DIR}/react-ndk/exported")

# copied from react-native/ReactAndroid/cmake-utils/Android-prebuilt.cmake

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
  gesturehandler
  jsi
  react_render_uimanager
)
