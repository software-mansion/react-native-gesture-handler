#include <fbjni/fbjni.h>
#include "RNGestureHandlerModule.h"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *) {
  return facebook::jni::initialize(
      vm, [] { gesturehandler::RNGestureHandlerModule::registerNatives(); });
}
