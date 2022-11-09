project(GestureHandler)
cmake_minimum_required(VERSION 3.9.0)

set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 17)

set(REACT_ANDROID_DIR "${REACT_NATIVE_DIR}/ReactAndroid")

include(${REACT_ANDROID_DIR}/cmake-utils/folly-flags.cmake)
add_compile_options(${folly_FLAGS})

add_library(gesturehandler
  SHARED
  cpp-adapter.cpp
)

# TODO: remove when symbols arrive
add_library(react_render_uimanager SHARED IMPORTED GLOBAL)
set_target_properties(react_render_uimanager
        PROPERTIES
        IMPORTED_LOCATION
        /Users/jakubpiasecki/libreact_render_uimanager.so)

find_package(ReactAndroid REQUIRED CONFIG)

target_link_libraries(
  gesturehandler
  react_render_uimanager # TODO: remove
  ReactAndroid::jsi
  ReactAndroid::react_nativemodule_core
  # headers
  ReactAndroid::react_debug
  ReactAndroid::react_render_core
  ReactAndroid::glog
  ReactAndroid::react_render_debug
)
