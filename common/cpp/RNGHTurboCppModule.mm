#include "RNGHTurboCppModule.h"

#include <RNGestureHandler/RNGestureHandlerModule.h>

namespace facebook::react {

RNGHTurboCppModule::RNGHTurboCppModule(std::shared_ptr<CallInvoker> jsInvoker)
    : NativeRNGHTurboCppModuleCxxSpec(std::move(jsInvoker)) {}

bool RNGHTurboCppModule::installBridgeless(jsi::Runtime& rt) {
  [RNGestureHandlerModule installWithRuntime:&rt];
  return YES;
}

} // namespace facebook::react
