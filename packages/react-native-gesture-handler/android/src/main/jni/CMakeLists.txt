project(GestureHandler)
cmake_minimum_required(VERSION 3.9.0)

string(
  APPEND
  CMAKE_CXX_FLAGS
  " -DREACT_NATIVE_MINOR_VERSION=${REACT_NATIVE_MINOR_VERSION}")

set(CMAKE_VERBOSE_MAKEFILE ON)
if(${REACT_NATIVE_MINOR_VERSION} GREATER_EQUAL 73)
    set(CMAKE_CXX_STANDARD 20)
else()
    set(CMAKE_CXX_STANDARD 17)
endif()

set(PACKAGE_NAME "gesturehandler")
set(RNGH_DIR "${CMAKE_SOURCE_DIR}/../../../../")
set(REACT_ANDROID_DIR "${REACT_NATIVE_DIR}/ReactAndroid")

file(GLOB_RECURSE gesture_handler_SRCS CONFIGURE_DEPENDS ./*.cpp)
file(GLOB_RECURSE gesture_handler_shared_SRCS CONFIGURE_DEPENDS "${RNGH_DIR}/shared/runtime/*.cpp")

include(${REACT_ANDROID_DIR}/cmake-utils/folly-flags.cmake)
add_compile_options(${folly_FLAGS})

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

if(ReactAndroid_VERSION_MINOR GREATER_EQUAL 80)
  target_compile_reactnative_options(${LIB_TARGET_NAME} PRIVATE)
endif()

find_package(ReactAndroid REQUIRED CONFIG)
find_package(fbjni REQUIRED CONFIG)

target_link_libraries(
  ${PACKAGE_NAME}
  ReactAndroid::reactnative
  ReactAndroid::jsi
  fbjni::fbjni
)
