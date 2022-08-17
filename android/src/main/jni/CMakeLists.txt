cmake_minimum_required(VERSION 3.9.0)

set (PACKAGE_NAME "react-native-gesture-handler")
set (CMAKE_VERBOSE_MAKEFILE ON)
set (CMAKE_CXX_STANDARD 17)

add_library(rngesturehandler_modules # Library name
  SHARED
  cpp-adapter.cpp
)

# TODO: fix this path
set (RN_SO_DIR "${CMAKE_SOURCE_DIR}/../../../../FabricExample/android/app/build/react-ndk/exported")
file (GLOB LIBRN_DIR "${RN_SO_DIR}/${ANDROID_ABI}")

target_include_directories(
  rngesturehandler_modules
  PRIVATE
  "${NODE_MODULES_DIR}/react-native/React"
  "${NODE_MODULES_DIR}/react-native/React/Base"
  "${NODE_MODULES_DIR}/react-native/ReactCommon"
  "${NODE_MODULES_DIR}/react-native/ReactCommon/jsi"
)

find_library(
  JSI_LIB
  jsi
  PATHS ${LIBRN_DIR}
  NO_CMAKE_FIND_ROOT_PATH
)

find_library(
  JSI_LIB
  jsi
  PATHS ${LIBRN_DIR}
  NO_CMAKE_FIND_ROOT_PATH
)

target_link_libraries(
  rngesturehandler_modules
  ${JSI_LIB}
)
