#include "RNGHTurboCppModule.h"
#include <react/renderer/uimanager/primitives.h>

namespace facebook::react {

void RNGHDecorateRuntime(jsi::Runtime &runtime) {
    auto isFormsStackingContext = jsi::Function::createFromHostFunction(
            runtime,
            jsi::PropNameID::forAscii(runtime, "isFormsStackingContext"),
            1,
            [](jsi::Runtime &runtime,
               const jsi::Value &thisValue,
               const jsi::Value *arguments,
               size_t count) -> jsi::Value {
                if (!arguments[0].isObject()) {
                    return jsi::Value::null();
                }

                auto shadowNode = arguments[0]
                        .asObject(runtime)
                        .getHostObject<ShadowNodeWrapper>(runtime)
                        ->shadowNode;
                bool isFormsStackingContext = shadowNode->getTraits().check(
                        ShadowNodeTraits::FormsStackingContext);

                return jsi::Value(isFormsStackingContext);
            });
    runtime.global().setProperty(
            runtime, "isFormsStackingContext", std::move(isFormsStackingContext));
}

RNGHTurboCppModule::RNGHTurboCppModule(std::shared_ptr<CallInvoker> jsInvoker)
    : NativeRNGHTurboCppModuleCxxSpec(std::move(jsInvoker)) {}

bool RNGHTurboCppModule::installBridgeless(jsi::Runtime& runtime) {
    RNGHDecorateRuntime(runtime);
  return true;
}

} // namespace facebook::react
