#pragma once
#include <jsi/jsi.h>

#include <memory>

namespace gesturehandler {
using namespace facebook;

struct ResolvedUIRuntime {
  jsi::Runtime *runtime = nullptr;
  // Keeps the runtime owner alive for as long as `runtime` is used. Empty
  // when the runtime is owned externally.
  std::shared_ptr<void> retainer;
};

class RNGHRuntimeDecorator {
 public:
  static void installRNRuntimeBindings(
      jsi::Runtime &rnRuntime,
      int moduleId,
      std::function<void(int, int)> &&setGestureState);
  static void installUIRuntimeBindings(
      jsi::Runtime &uiRuntime,
      std::function<void(int, int)> &&setGestureState);
  static ResolvedUIRuntime tryFindUIRuntime(jsi::Runtime &rnRuntime);
};

} // namespace gesturehandler
