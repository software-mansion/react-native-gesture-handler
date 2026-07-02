#include <RNGHRuntimeDecorator.h>
#include <react/renderer/uimanager/primitives.h>

#include "RNGestureHandlerModule.h"

#ifdef RNGH_USE_WORKLETS
#include <worklets/android/WorkletsModule.h>
#endif

namespace gesturehandler {
using namespace facebook;
using namespace facebook::react;

RNGestureHandlerModule::RNGestureHandlerModule(
    jni::alias_ref<RNGestureHandlerModule::javaobject> jThis)
    : javaPart_(jni::make_global(jThis)) {}

RNGestureHandlerModule::~RNGestureHandlerModule() {}

void RNGestureHandlerModule::registerNatives() {
  registerHybrid(
      {makeNativeMethod("initHybrid", RNGestureHandlerModule::initHybrid),
       makeNativeMethod(
           "getBindingsInstallerCxx",
           RNGestureHandlerModule::getBindingsInstallerCxx),
       makeNativeMethod(
           "decorateUIRuntime", RNGestureHandlerModule::decorateUIRuntime),
       makeNativeMethod(
           "decorateUIRuntimeWithWorklets",
           RNGestureHandlerModule::decorateUIRuntimeWithWorklets),
       makeNativeMethod(
           "invalidateNative", RNGestureHandlerModule::invalidateNative)});
}

jni::local_ref<RNGestureHandlerModule::jhybriddata>
RNGestureHandlerModule::initHybrid(jni::alias_ref<jhybridobject> jThis) {
  return makeCxxInstance(jThis);
}

jni::local_ref<BindingsInstallerHolder::javaobject>
RNGestureHandlerModule::getBindingsInstallerCxx() {
  return jni::make_local(BindingsInstallerHolder::newObjectCxxArgs(
      [&, this](jsi::Runtime &runtime) {
        this->rnRuntime_ = &runtime;
        RNGHRuntimeDecorator::installRNRuntimeBindings(
            runtime, getModuleId(), [&](int handlerTag, int state) {
              setGestureState(handlerTag, state);
            });
      }));
}

void RNGestureHandlerModule::setGestureState(
    const int handlerTag,
    const int state) {
  static const auto method =
      javaClassLocal()->getMethod<void(jint, jint)>("setGestureHandlerState");

  method(this->javaPart_, handlerTag, state);
}

bool RNGestureHandlerModule::decorateUIRuntime() {
  return RNGHRuntimeDecorator::installUIRuntimeBindings(
      *rnRuntime_, getModuleId(), [&](int handlerTag, int state) {
        this->setGestureState(handlerTag, state);
      });
}

bool RNGestureHandlerModule::decorateUIRuntimeWithWorklets(
    jni::alias_ref<jobject> workletsModule) {
#ifdef RNGH_USE_WORKLETS
  if (!workletsModule) {
    return false;
  }

  const auto jWorkletsModule =
      jni::static_ref_cast<worklets::WorkletsModule::javaobject>(
          workletsModule);
  const auto workletsModuleProxy =
      jWorkletsModule->cthis()->getWorkletsModuleProxy();
  if (!workletsModuleProxy) {
    return false;
  }

  const auto uiWorkletRuntime = workletsModuleProxy->getUIWorkletRuntime();
  if (!uiWorkletRuntime) {
    return false;
  }

  RNGHRuntimeDecorator::decorateUIRuntime(
      uiWorkletRuntime->getJSIRuntime(), [&](int handlerTag, int state) {
        this->setGestureState(handlerTag, state);
      });

  return true;
#else
  (void)workletsModule;
  return false;
#endif
}

void RNGestureHandlerModule::invalidateNative() {
  // This is called when the module is being destroyed, so we need to clear
  // the reference to the java part to avoid memory leaks.
  javaPart_ = nullptr;
}

int RNGestureHandlerModule::getModuleId() {
  auto jthis = javaPart_;

  auto cls = jthis->getClass();
  auto fieldId = cls->getField<jint>("moduleId");

  jint value = jthis->getFieldValue(fieldId);
  return value;
}

} // namespace gesturehandler
