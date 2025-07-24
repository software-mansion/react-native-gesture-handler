#include <jni.h>
#include <jsi/jsi.h>

#include <react/renderer/uimanager/primitives.h>

using namespace facebook;
using namespace react;

void decorateRuntime(jsi::Runtime &runtime) {
  auto isViewFlatteningDisabled = jsi::Function::createFromHostFunction(
      runtime,
      jsi::PropNameID::forAscii(runtime, "isViewFlatteningDisabled"),
      1,
      [](jsi::Runtime &runtime,
         const jsi::Value &thisValue,
         const jsi::Value *arguments,
         size_t count) -> jsi::Value {
        if (!arguments[0].isObject()) {
          return jsi::Value::null();
        }

#if REACT_NATIVE_MINOR_VERSION >= 81
        auto shadowNode = Bridging<std::shared_ptr<const ShadowNode>>::fromJs(
            runtime, arguments[0]);
#else
        auto shadowNode = shadowNodeFromValue(runtime, arguments[0]);
#endif

        bool isViewFlatteningDisabled = shadowNode->getTraits().check(
            ShadowNodeTraits::FormsStackingContext);

        // This is done using component names instead of type checking because
        // of duplicate symbols for RN types, which prevent RTTI from working.
        const char *componentName = shadowNode->getComponentName();
        bool isTextComponent = strcmp(componentName, "Paragraph") == 0 ||
            strcmp(componentName, "Text") == 0;

        return jsi::Value(isViewFlatteningDisabled || isTextComponent);
      });
  runtime.global().setProperty(
      runtime, "isViewFlatteningDisabled", std::move(isViewFlatteningDisabled));
}

extern "C" JNIEXPORT void JNICALL
Java_com_swmansion_gesturehandler_react_RNGestureHandlerModule_decorateRuntime(
    JNIEnv *env,
    jobject clazz,
    jlong jsiPtr) {
  jsi::Runtime *runtime = reinterpret_cast<jsi::Runtime *>(jsiPtr);
  if (runtime) {
    decorateRuntime(*runtime);
  }
}
