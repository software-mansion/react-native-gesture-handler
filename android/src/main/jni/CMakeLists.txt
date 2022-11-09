project(GestureHandler)
cmake_minimum_required(VERSION 3.9.0)

set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 17)

# SET(folly_FLAGS
#         -DFOLLY_NO_CONFIG=1
#         -DFOLLY_HAVE_CLOCK_GETTIME=1
#         -DFOLLY_USE_LIBCPP=1
#         -DFOLLY_MOBILE=1
#         -DFOLLY_HAVE_RECVMMSG=1
#         -DFOLLY_HAVE_PTHREAD=1
#         # Once we target android-23 above, we can comment
#         # the following line. NDK uses GNU style stderror_r() after API 23.
#         -DFOLLY_HAVE_XSI_STRERROR_R=1
#         )

# # We use an interface target to propagate flags to all the generated targets
# # such as the folly flags or others.
# add_library(common_flags INTERFACE)
# target_compile_options(common_flags INTERFACE ${folly_FLAGS})
# target_link_libraries(gesturehandler INTERFACE common_flags)

add_compile_options(-DFOLLY_NO_CONFIG=1
-DFOLLY_HAVE_CLOCK_GETTIME=1
-DFOLLY_USE_LIBCPP=1
-DFOLLY_MOBILE=1
-DFOLLY_HAVE_RECVMMSG=1
-DFOLLY_HAVE_PTHREAD=1
# Once we target android-23 above, we can comment
# the following line. NDK uses GNU style stderror_r() after API 23.
-DFOLLY_HAVE_XSI_STRERROR_R=1 -fexceptions -frtti -std=c++17 -Wall -Werror -DANDROID)

# set (CMAKE_CXX_FLAGS "-DFOLLY_NO_CONFIG=1 -DFOLLY_HAVE_CLOCK_GETTIME=1 -DFOLLY_HAVE_MEMRCHR=1 -DFOLLY_USE_LIBCPP=1 -DFOLLY_MOBILE=1 -DFOLLY_HAVE_RECVMMSG=1 -DFOLLY_HAVE_PTHREAD=1  -fexceptions -fno-omit-frame-pointer -frtti -Wno-sign-compare -std=c++17 -Wall -Werror")

add_library(gesturehandler
  SHARED
  cpp-adapter.cpp
)

# set(REACT_ANDROID_DIR "${REACT_NATIVE_DIR}/ReactAndroid")
# set(REACT_COMMON_DIR "${REACT_NATIVE_DIR}/ReactCommon")
# set(REACT_NDK_EXPORT_DIR "${APP_BUILD_DIR}/intermediates/merged_native_libs/debug/out/lib")

# copied from react-native/ReactAndroid/cmake-utils/Android-prebuilt.cmake

## jsi
# add_library(jsi SHARED IMPORTED GLOBAL)
# set_target_properties(jsi
#         PROPERTIES
#         IMPORTED_LOCATION
#         ${REACT_NDK_EXPORT_DIR}/${ANDROID_ABI}/libjsi.so)
# target_include_directories(jsi INTERFACE ${REACT_COMMON_DIR}/jsi)

# ## react_render_core
# add_library(react_render_core SHARED IMPORTED GLOBAL)
# set_target_properties(react_render_core
#         PROPERTIES
#         IMPORTED_LOCATION
#         ${REACT_NDK_EXPORT_DIR}/${ANDROID_ABI}/libreact_render_core.so)
# target_include_directories(react_render_core
#         INTERFACE
#         ${REACT_COMMON_DIR}
#         ${REACT_COMMON_DIR}/react/renderer/core)

# ## react_render_uimanager
# add_library(react_render_uimanager SHARED IMPORTED GLOBAL)
# set_target_properties(react_render_uimanager
#         PROPERTIES
#         IMPORTED_LOCATION
#         ${REACT_NDK_EXPORT_DIR}/${ANDROID_ABI}/libreact_render_uimanager.so)
# target_include_directories(react_render_uimanager INTERFACE ${REACT_COMMON_DIR}/react/renderer/uimanager)

# target_include_directories(
#   gesturehandler
#   PRIVATE
#   "${REACT_ANDROID_DIR}/build/third-party-ndk/boost/boost_1_76_0"
#   "${REACT_ANDROID_DIR}/build/third-party-ndk/double-conversion"
#   "${REACT_ANDROID_DIR}/build/third-party-ndk/folly"
# )

find_package(ReactAndroid REQUIRED CONFIG)
find_package(fbjni REQUIRED CONFIG)

target_link_libraries(
  gesturehandler
        ReactAndroid::react_render_debug
        ReactAndroid::turbomodulejsijni
        ReactAndroid::runtimeexecutor
        ReactAndroid::react_codegen_rncore
        ReactAndroid::react_debug
        ReactAndroid::react_render_componentregistry
        ReactAndroid::react_newarchdefaults
        ReactAndroid::react_render_core
        ReactAndroid::react_render_graphics
        ReactAndroid::rrc_view
        ReactAndroid::jsi
        ReactAndroid::glog
        ReactAndroid::fabricjni
        ReactAndroid::react_render_mapbuffer
        ReactAndroid::yoga
        ReactAndroid::folly_runtime
        ReactAndroid::react_nativemodule_core
        ReactAndroid::react_render_imagemanager
        ReactAndroid::rrc_image
        ReactAndroid::react_codegen_rncore
        fbjni::fbjni
  android
)
