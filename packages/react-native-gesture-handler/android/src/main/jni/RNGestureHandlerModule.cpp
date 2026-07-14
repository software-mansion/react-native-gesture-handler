#include <RNGHRuntimeDecorator.h>
#include <react/renderer/uimanager/primitives.h>

#include "RNGestureHandlerModule.h"

#ifdef RNGH_USE_WORKLETS
#include <worklets/Compat/StableApi.h>
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
           "installUIRuntimeBindingsNative",
           RNGestureHandlerModule::installUIRuntimeBindings),
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

bool RNGestureHandlerModule::installUIRuntimeBindings() {
  jsi::Runtime *uiRuntime = nullptr;

#ifdef RNGH_USE_WORKLETS
  std::shared_ptr<worklets::WorkletRuntime> uiWorkletRuntime;
  const auto runtimeHolder = rnRuntime_->global().getProperty(
      *rnRuntime_, "__RNGH_UI_WORKLET_RUNTIME_HOLDER");

  if (runtimeHolder.isObject()) {
    uiWorkletRuntime = worklets::getWorkletRuntimeFromHolder(
        *rnRuntime_, runtimeHolder.asObject(*rnRuntime_));

    if (uiWorkletRuntime) {
      uiRuntime = &worklets::getJSIRuntimeFromWorkletRuntime(uiWorkletRuntime);
    }
  }
#endif

  if (uiRuntime == nullptr) {
    uiRuntime = RNGHRuntimeDecorator::tryFindUIRuntime(*rnRuntime_);
  }

  if (uiRuntime == nullptr) {
    return false;
  }

  RNGHRuntimeDecorator::installUIRuntimeBindings(
      *uiRuntime, [&](int handlerTag, int state) {
        this->setGestureState(handlerTag, state);
      });

  return true;
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
