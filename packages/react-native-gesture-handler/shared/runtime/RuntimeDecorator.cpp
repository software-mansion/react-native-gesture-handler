#ifndef ANDROID
#include <react/renderer/components/text/ParagraphShadowNode.h>
#include <react/renderer/components/text/TextShadowNode.h>
#endif

#include <react/renderer/uimanager/primitives.h>

#include "RNGHRuntimeDecorator.h"

namespace gesturehandler {

using namespace facebook;
using namespace facebook::react;

void RNGHRuntimeDecorator::installRNRuntimeBindings(
    jsi::Runtime &rnRuntime,
    std::function<void(int, int)> &&setGestureState) {
  const auto isViewFlatteningDisabled = jsi::Function::createFromHostFunction(
      rnRuntime,
      jsi::PropNameID::forAscii(rnRuntime, "_isViewFlatteningDisabled"),
      1,
      [](jsi::Runtime &runtime,
         const jsi::Value &,
         const jsi::Value *args,
         size_t count) -> jsi::Value {
        if (!args[0].isObject()) {
          return jsi::Value::null();
        }

        const auto shadowNode = shadowNodeFromValue(runtime, args[0]);

#ifndef ANDROID
        if (dynamic_pointer_cast<const ParagraphShadowNode>(shadowNode)) {
          return jsi::Value(true);
        }

        if (dynamic_pointer_cast<const TextShadowNode>(shadowNode)) {
          return jsi::Value(true);
        }
#endif

        const auto isFormsStackingContext = shadowNode->getTraits().check(
            ShadowNodeTraits::FormsStackingContext);

        // This is done using component names instead of type checking because
        // of duplicate symbols for RN types, which prevent RTTI from working.
        const auto &componentName = shadowNode->getComponentName();
        const auto isTextOrParagraphComponent =
            strcmp(componentName, "Paragraph") == 0 ||
            strcmp(componentName, "Text") == 0;

        return jsi::Value(isFormsStackingContext || isTextOrParagraphComponent);
      });

  rnRuntime.global().setProperty(
      rnRuntime,
      "_isViewFlatteningDisabled",
      std::move(isViewFlatteningDisabled));

  auto setGestureStateAsync = jsi::Function::createFromHostFunction(
      rnRuntime,
      jsi::PropNameID::forAscii(rnRuntime, "_setGestureStateAsync"),
      2,
      [setGestureState](
          jsi::Runtime &rt,
          const jsi::Value &,
          const jsi::Value *args,
          size_t count) -> jsi::Value {
        if (count == 2) {
          const auto handlerTag = static_cast<int>(args[0].asNumber());
          const auto state = static_cast<int>(args[1].asNumber());

          setGestureState(handlerTag, state);
        }
        return jsi::Value::undefined();
      });

  rnRuntime.global().setProperty(
      rnRuntime, "_setGestureStateAsync", std::move(setGestureStateAsync));
}

bool RNGHRuntimeDecorator::installUIRuntimeBindings(
    jsi::Runtime &rnRuntime,
    std::function<void(int, int)> &&setGestureState) {
  const auto runtimeHolder =
      rnRuntime.global().getProperty(rnRuntime, "_WORKLET_RUNTIME");

  if (runtimeHolder.isUndefined()) {
    return false;
  }

  const auto arrayBufferValue =
      runtimeHolder.getObject(rnRuntime).getArrayBuffer(rnRuntime).data(
          rnRuntime);
  const auto uiRuntimeAddress =
      reinterpret_cast<uintptr_t *>(&arrayBufferValue[0]);
  jsi::Runtime &uiRuntime =
      *reinterpret_cast<jsi::Runtime *>(*uiRuntimeAddress);

  auto setGestureStateSync = jsi::Function::createFromHostFunction(
      uiRuntime,
      jsi::PropNameID::forAscii(uiRuntime, "_setGestureStateSync"),
      2,
      [setGestureState](
          jsi::Runtime &rt,
          const jsi::Value &,
          const jsi::Value *args,
          size_t count) -> jsi::Value {
        if (count == 2) {
          const auto handlerTag = static_cast<int>(args[0].asNumber());
          const auto state = static_cast<int>(args[1].asNumber());

          setGestureState(handlerTag, state);
        }
        return jsi::Value::undefined();
      });

  uiRuntime.global().setProperty(
      uiRuntime, "_setGestureStateSync", std::move(setGestureStateSync));

  return true;
}

} // namespace gesturehandler
