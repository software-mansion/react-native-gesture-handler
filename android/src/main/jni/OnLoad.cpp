#include <fbjni/fbjni.h>

#include "RNGestureHandlerComponentsRegistry.h"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *) {
  return facebook::jni::initialize(vm, [] {
    facebook::react::RNGestureHandlerComponentsRegistry::registerNatives();
  });
}
