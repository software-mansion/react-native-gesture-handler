cmake_minimum_required(VERSION 3.13)
project(GestureHandlerCodegen)

set(CMAKE_VERBOSE_MAKEFILE on)
set(CMAKE_CXX_STANDARD 20)

file(GLOB_RECURSE rn_gesture_handler_SRCS CONFIGURE_DEPENDS ../shared/shadowNodes/*.cpp)
file(GLOB_RECURSE rn_gesture_handler_codegen_SRCS CONFIGURE_DEPENDS ./build/generated/source/codegen/jni/*.cpp)

add_library(
  react_codegen_rngesturehandler_codegen
  SHARED
  ${rn_gesture_handler_SRCS}
  ${rn_gesture_handler_codegen_SRCS}
)

if(ReactAndroid_VERSION_MINOR GREATER_EQUAL 80)
  target_compile_reactnative_options(react_codegen_rngesturehandler_codegen PRIVATE)
endif()

target_include_directories(react_codegen_rngesturehandler_codegen PUBLIC ../shared/shadowNodes)
target_include_directories(react_codegen_rngesturehandler_codegen PUBLIC ./build/generated/source/codegen/jni)

target_link_libraries(
  react_codegen_rngesturehandler_codegen
  fbjni
  jsi
  reactnative
)
