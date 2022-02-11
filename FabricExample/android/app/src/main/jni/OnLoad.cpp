#include <fbjni/fbjni.h>
#include "MainApplicationTurboModuleManagerDelegate.h"
#include "MainComponentsRegistry.h"
// #include "RNGestureHandlerComponentsRegistry.h"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *) {
  return facebook::jni::initialize(vm, [] {
    facebook::react::MainApplicationTurboModuleManagerDelegate::
        registerNatives();
    facebook::react::MainComponentsRegistry::registerNatives();
    // facebook::react::RNGestureHandlerComponentsRegistry::registerNatives();
  });
}
