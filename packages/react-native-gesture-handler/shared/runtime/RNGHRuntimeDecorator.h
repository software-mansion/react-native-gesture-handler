#pragma once
#include <jsi/jsi.h>

namespace gesturehandler {
using namespace facebook;

class RNGHRuntimeDecorator {
 public:
  static void installRNRuntimeBindings(
      jsi::Runtime &rnRuntime,
      std::function<void(int, int)> &&setGestureState);
  static bool installUIRuntimeBindings(
      jsi::Runtime &rnRuntime,
      std::function<void(int, int)> &&setGestureState);
};

} // namespace gesturehandler
