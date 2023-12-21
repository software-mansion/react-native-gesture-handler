cmake_minimum_required(VERSION 3.13)
set(CMAKE_VERBOSE_MAKEFILE on)
set(PACKAGE_NAME "gesturehandler")

add_compile_options(
        -fexceptions
        -frtti
        -std=c++20)

file(GLOB tm_SRC CONFIGURE_DEPENDS *.cpp)
add_library(tm STATIC ${tm_SRC})

target_include_directories(tm PUBLIC .)
target_include_directories(react_codegen_rngesturehandler_codegen PUBLIC .)

target_include_directories(
  tm
  PRIVATE
  "${REACT_NATIVE_DIR}/ReactCommon"
)

find_package(ReactAndroid REQUIRED CONFIG)

target_link_libraries(
        tm
        ReactAndroid::react_render_core
        ReactAndroid::react_render_uimanager
        ReactAndroid::react_render_graphics
        ReactAndroid::jsi
        ReactAndroid::react_nativemodule_core
        react_codegen_rngesturehandler_codegen
        )
