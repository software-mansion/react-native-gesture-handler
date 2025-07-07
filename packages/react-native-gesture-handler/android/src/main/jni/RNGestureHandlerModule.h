#pragma once
#include <ReactCommon/BindingsInstallerHolder.h>
#include <fbjni/fbjni.h>
#include <string>

namespace gesturehandler {
using namespace facebook;
using namespace facebook::jni;
using namespace facebook::react;

class RNGestureHandlerModule : public jni::HybridClass<RNGestureHandlerModule> {
 public:
  static auto constexpr kJavaDescriptor =
      "Lcom/swmansion/gesturehandler/react/RNGestureHandlerModule;";
  static jni::local_ref<jhybriddata> initHybrid(
      jni::alias_ref<jhybridobject> jThis);
  static void registerNatives();
  ~RNGestureHandlerModule();

 private:
  friend HybridBase;
  jsi::Runtime *rnRuntime_ = nullptr;

  jni::global_ref<RNGestureHandlerModule::javaobject> javaPart_;
  explicit RNGestureHandlerModule(
      jni::alias_ref<RNGestureHandlerModule::javaobject> jThis);
  jni::local_ref<BindingsInstallerHolder::javaobject> getBindingsInstallerCxx();

  void setGestureState(const int handlerTag, const int state);
  bool decorateUIRuntime();
  void invalidateNative();
  int getModuleId();
};
} // namespace gesturehandler
