#pragma once

#if __has_include(<React-Codegen/rngesturehandler_codegenJSI.h>) // CocoaPod headers on Apple
#include <React-Codegen/rngesturehandler_codegenJSI.h>
#elif __has_include("rngesturehandler_codegenJSI.h") // CMake headers on Android
#include "rngesturehandler_codegenJSI.h"
#endif
#include <memory>
#include <string>

namespace facebook::react {

void RNGHdecorateRuntime(jsi::Runtime &runtime);

class RNGHTurboCppModule : public NativeRNGHTurboCppModuleCxxSpec<RNGHTurboCppModule> {
 public:
  RNGHTurboCppModule(std::shared_ptr<CallInvoker> jsInvoker);

  bool installBridgeless(jsi::Runtime& rt);
};


} // namespace facebook::react

