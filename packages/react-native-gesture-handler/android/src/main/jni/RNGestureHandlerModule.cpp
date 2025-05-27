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
                this->rnRuntime = &runtime;
                decorateRuntime(runtime);
            })
        );
    }

    void RNGestureHandlerModule::setGestureState(int handlerTag, int state) {
        static const auto method = javaClassLocal()->getMethod<void(jint, jint)>("setGestureHandlerState");

        method(this->javaPart_, handlerTag, state);
    }

    void RNGestureHandlerModule::decorateRuntime(jsi::Runtime& rnRuntime) {
        auto isViewFlatteningDisabled = jsi::Function::createFromHostFunction(
            rnRuntime,
            jsi::PropNameID::forAscii(rnRuntime, "isViewFlatteningDisabled"),
            1,
            [](jsi::Runtime &runtime,
               const jsi::Value &,
               const jsi::Value *args,
               size_t count) -> jsi::Value {
                if (!args[0].isObject()) {
                    return jsi::Value::null();
                }

                const auto shadowNode = shadowNodeFromValue(runtime, args[0]);
                const auto isViewFlatteningDisabled = shadowNode->getTraits().check(ShadowNodeTraits::FormsStackingContext);
                
                // This is done using component names instead of type checking because
                // of duplicate symbols for RN types, which prevent RTTI from working.
                const auto componentName = shadowNode->getComponentName();
                const auto isTextComponent = strcmp(componentName, "Paragraph") == 0 || strcmp(componentName, "Text") == 0;

                return jsi::Value(isViewFlatteningDisabled || isTextComponent);
            });

        rnRuntime.global().setProperty(
            rnRuntime, "isViewFlatteningDisabled", std::move(isViewFlatteningDisabled));
    }

    bool RNGestureHandlerModule::decorateUIRuntime() {
        // TODO: make sure we are on JS?
        jsi::Runtime &rt = *rnRuntime;
        const auto runtimeHolder = rt.global().getProperty(rt, "_WORKLET_RUNTIME");

        if (runtimeHolder.isUndefined()) {
          return false;
        }

        const auto arrayBufferValue = runtimeHolder.getObject(rt).getArrayBuffer(rt).data(rt);
        const auto uiRuntimeAddress = reinterpret_cast<uintptr_t*>(&arrayBufferValue[0]);
        jsi::Runtime &uiRuntime = *reinterpret_cast<jsi::Runtime*>(*uiRuntimeAddress);

        auto setGestureStateNew = jsi::Function::createFromHostFunction(
                uiRuntime,
                jsi::PropNameID::forAscii(uiRuntime, "_setGestureStateModern"),
                2,
                [&](jsi::Runtime &rt, const jsi::Value &, const jsi::Value *args, size_t count) -> jsi::Value {
                    if (count == 2) {
                        const auto handlerTag = static_cast<int>(args[0].asNumber());
                        const auto state = static_cast<int>(args[1].asNumber());

                        // TODO: expose to JS and dispatch to UI thread if called on JS?
                        this->setGestureState(handlerTag, state);
                    }
                    return jsi::Value::undefined();
                });

        uiRuntime.global().setProperty(uiRuntime, "_setGestureStateModern", std::move(setGestureStateNew));
        return true;
    }
} // namespace gesturehandler
