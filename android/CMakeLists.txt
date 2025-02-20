cmake_minimum_required(VERSION 3.13)
project(NewArchTricks)

set(CMAKE_VERBOSE_MAKEFILE on)
set(CMAKE_CXX_STANDARD 20)

file(GLOB_RECURSE rn_gesture_handler_SRCS CONFIGURE_DEPENDS ../shared/*.cpp)
file(GLOB_RECURSE rn_gesture_handler_codegen_SRCS CONFIGURE_DEPENDS ./build/generated/source/codegen/jni/*.cpp)

add_library(
  react_codegen_rngesturehandler_codegen
  SHARED
  ${rn_gesture_handler_SRCS}
  ${rn_gesture_handler_codegen_SRCS}
)

target_include_directories(react_codegen_rngesturehandler_codegen PUBLIC ../shared)
target_include_directories(react_codegen_rngesturehandler_codegen PUBLIC ./build/generated/source/codegen/jni)

target_link_libraries(
  react_codegen_rngesturehandler_codegen
  fbjni
  jsi
  reactnative
)
