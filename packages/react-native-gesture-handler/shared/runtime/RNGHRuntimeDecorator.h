#pragma once
#include <jsi/jsi.h>

namespace gesturehandler {
using namespace facebook;

class RNGHRuntimeDecorator {
 public:
  static void installRNRuntimeBindings(
      jsi::Runtime &rnRuntime,
      int moduleId,
      std::function<void(int, int)> &&setGestureState);
  static void installUIRuntimeBindings(
      jsi::Runtime &uiRuntime,
      std::function<void(int, int)> &&setGestureState);
  static jsi::Runtime *tryFindUIRuntime(jsi::Runtime &rnRuntime);
};

} // namespace gesturehandler
