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

add_library(${PACKAGE_NAME}
  SHARED
  cpp-adapter.cpp
)

target_include_directories(
  ${PACKAGE_NAME}
  PRIVATE
  "${REACT_NATIVE_DIR}/ReactCommon"
)

find_package(ReactAndroid REQUIRED CONFIG)
if (ReactAndroid_VERSION_MINOR GREATER_EQUAL 76)
  target_link_libraries(
    ${PACKAGE_NAME}
    ReactAndroid::reactnative
    ReactAndroid::jsi
  )
elseif (ReactAndroid_VERSION_MINOR GREATER_EQUAL 75)
  target_link_libraries(
    ${PACKAGE_NAME}
    ReactAndroid::react_render_core
    ReactAndroid::react_render_uimanager
    ReactAndroid::react_render_graphics
    ReactAndroid::jsi
    ReactAndroid::react_nativemodule_core
  )
else ()
  message(FATAL_ERROR "react-native-gesture-handler on the New Architecture requires react-native 0.75 or newer.")
endif ()
