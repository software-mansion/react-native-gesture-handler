#include <jni.h>
#include <jsi/jsi.h>

#include <react/renderer/uimanager/UIManager.h>
#include <react/renderer/uimanager/primitives.h>

using namespace facebook;
using namespace react;

// ShadowNodeWrapper::~ShadowNodeWrapper() = default;

void decorateRuntime(jsi::Runtime &runtime) {
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
        (void)shadowNode;
        // bool isFormsStackingContext = shadowNode->getTraits().check(
        //     ShadowNodeTraits::FormsStackingContext);

        // return jsi::Value(isFormsStackingContext);
        return jsi::Value(false);
      });
  runtime.global().setProperty(
      runtime, "isFormsStackingContext", std::move(isFormsStackingContext));
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
