project(GestureHandler)
cmake_minimum_required(VERSION 3.9.0)

set(CMAKE_VERBOSE_MAKEFILE ON)
if(${REACT_NATIVE_MINOR_VERSION} GREATER_EQUAL 73)
    set(CMAKE_CXX_STANDARD 20)
else()
    set(CMAKE_CXX_STANDARD 17)
endif()

set(PACKAGE_NAME "gesturehandler")
set(REACT_ANDROID_DIR "${REACT_NATIVE_DIR}/ReactAndroid")

include(${REACT_ANDROID_DIR}/cmake-utils/folly-flags.cmake)
add_compile_options(${folly_FLAGS})

file(GLOB tm_SRC CONFIGURE_DEPENDS ${REACT_ANDROID_DIR}/../../../node_modules/react-native-gesture-handler/common/cpp/*.cpp)
file(GLOB tm_generated_SRC CONFIGURE_DEPENDS *.cpp ${CMAKE_CURRENT_SOURCE_DIR}/../../../build/generated/source/codegen/jni/react/renderer/components/rngesturehandler_codegen/rngesturehandler_codegenJSI-generated.cpp)

add_library(${PACKAGE_NAME}
  SHARED
  cpp-adapter.cpp
  ${tm_SRC}
  ${tm_generated_SRC}
)

target_include_directories(
  ${PACKAGE_NAME}
  PUBLIC
  "${CMAKE_CURRENT_SOURCE_DIR}/../../../../common/cpp"
  "${CMAKE_CURRENT_SOURCE_DIR}/../../../build/generated/source/codegen/jni/react/renderer/components/rngesturehandler_codegen"
  "${REACT_NATIVE_DIR}/ReactCommon"
)

find_package(ReactAndroid REQUIRED CONFIG)
find_package(fbjni REQUIRED CONFIG)

target_link_libraries(
  gesturehandler
  ReactAndroid::react_render_core
  ReactAndroid::react_render_uimanager
  ReactAndroid::react_render_graphics
  ReactAndroid::jsi
  ReactAndroid::react_nativemodule_core
  fbjni::fbjni
  ReactAndroid::turbomodulejsijni
  ReactAndroid::react_newarchdefaults
)
