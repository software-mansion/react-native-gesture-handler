project(GestureHandler)
cmake_minimum_required(VERSION 3.9.0)

set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 20)

set(PACKAGE_NAME "gesturehandler")
set(RNGH_DIR "${CMAKE_SOURCE_DIR}/../../../../")
set(REACT_ANDROID_DIR "${REACT_NATIVE_DIR}/ReactAndroid")

file(GLOB_RECURSE gesture_handler_SRCS CONFIGURE_DEPENDS ./*.cpp)
file(GLOB_RECURSE gesture_handler_shared_SRCS CONFIGURE_DEPENDS "${RNGH_DIR}/shared/runtime/*.cpp")

include(${REACT_ANDROID_DIR}/cmake-utils/folly-flags.cmake)
add_compile_options(${folly_FLAGS})

include(${REACT_NATIVE_DIR}/ReactCommon/cmake-utils/react-native-flags.cmake)

add_library(${PACKAGE_NAME}
  SHARED
  ${gesture_handler_SRCS}
  ${gesture_handler_shared_SRCS}
)

target_include_directories(
  ${PACKAGE_NAME}
  PUBLIC
  "${CMAKE_SOURCE_DIR}"
  "${RNGH_DIR}/shared/runtime"
  PRIVATE
  "${REACT_NATIVE_DIR}/ReactCommon"
)

find_package(ReactAndroid REQUIRED CONFIG)
find_package(fbjni REQUIRED CONFIG)

target_compile_reactnative_options(${PACKAGE_NAME} PRIVATE)

target_link_libraries(
  ${PACKAGE_NAME}
  ReactAndroid::reactnative
  ReactAndroid::jsi
  fbjni::fbjni
)

if(RNGH_USE_WORKLETS)
  find_package(react-native-worklets REQUIRED CONFIG)
  target_compile_definitions(${PACKAGE_NAME} PRIVATE RNGH_USE_WORKLETS=1)
  target_link_libraries(${PACKAGE_NAME} react-native-worklets::worklets)
endif()
