#include <react/renderer/uimanager/primitives.h>

#include "RNGestureHandlerModule.h"

namespace gesturehandler {
    using namespace facebook;
    using namespace facebook::react;

    RNGestureHandlerModule::RNGestureHandlerModule(jni::alias_ref<RNGestureHandlerModule::javaobject> jThis)
            : javaPart_(jni::make_global(jThis)) {
    }

    RNGestureHandlerModule::~RNGestureHandlerModule() {}

    void RNGestureHandlerModule::registerNatives() {
        registerHybrid(
                {makeNativeMethod("initHybrid", RNGestureHandlerModule::initHybrid),
                 makeNativeMethod("getBindingsInstallerCxx", RNGestureHandlerModule::getBindingsInstallerCxx),
                 makeNativeMethod("decorateUIRuntime", RNGestureHandlerModule::decorateUIRuntime)});
    }

    jni::local_ref<RNGestureHandlerModule::jhybriddata> RNGestureHandlerModule::initHybrid(jni::alias_ref<jhybridobject> jThis) {
        return makeCxxInstance(jThis);
    }

    jni::local_ref<BindingsInstallerHolder::javaobject> RNGestureHandlerModule::getBindingsInstallerCxx() {
        return jni::make_local(
            BindingsInstallerHolder::newObjectCxxArgs([&](jsi::Runtime& runtime) {
                this->runtime = &runtime;
                decorateRuntime(runtime);
            })
        );
    }

    void RNGestureHandlerModule::setGestureState(int handlerTag, int state) {
        static const auto method = javaClassLocal()->getMethod<void(jint, jint)>("setGestureHandlerState");

        method(this->javaPart_, handlerTag, state);
    }

    void RNGestureHandlerModule::decorateRuntime(jsi::Runtime& runtime) {
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

                auto shadowNode = shadowNodeFromValue(runtime, arguments[0]);
                bool isViewFlatteningDisabled = shadowNode->getTraits().check(ShadowNodeTraits::FormsStackingContext);
                
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

    void RNGestureHandlerModule::decorateUIRuntime() {
        // TODO: make sure we are on JS?
        auto arrayBufferValue = runtime->global().getProperty(*runtime, "_WORKLET_RUNTIME").getObject(*runtime).getArrayBuffer(*runtime).data(*runtime);
        uintptr_t* uiAddr = reinterpret_cast<uintptr_t*>(&arrayBufferValue[0]);
        jsi::Runtime* uiRuntime = reinterpret_cast<jsi::Runtime*>(*uiAddr);

        auto setGestureStateNew = jsi::Function::createFromHostFunction(
                *uiRuntime,
                jsi::PropNameID::forAscii(*uiRuntime, "_setGestureStateNew"),
                2,
                [&](jsi::Runtime &rt, const jsi::Value &thisValue, const jsi::Value *arguments, size_t count) -> jsi::Value {
                    if (count == 2) {
                        auto handlerTag = (int)arguments[0].asNumber();
                        auto state = (int)arguments[1].asNumber();

                        // TODO: expose to JS and dispatch to UI thread if called on JS?
                        this->setGestureState(handlerTag, state);
                    }
                    return jsi::Value::undefined();
                });

        uiRuntime->global().setProperty(*uiRuntime, "_setGestureStateNew", std::move(setGestureStateNew));
    }
} // namespace gesturehandler
