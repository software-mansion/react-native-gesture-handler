#include <react/renderer/uimanager/primitives.h>
#include <RuntimeDecorator.h>

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
                RuntimeDecorator::installJSRuntimeBindings(runtime, [&](int handlerTag, int state) {
                    this->setGestureState(handlerTag, state);
                });
            })
        );
    }

    void RNGestureHandlerModule::setGestureState(int handlerTag, int state) {
        static const auto method = javaClassLocal()->getMethod<void(jint, jint)>("setGestureHandlerState");

        method(this->javaPart_, handlerTag, state);
    }

    bool RNGestureHandlerModule::decorateUIRuntime() {
        // TODO: make sure we are on JS?
        return RuntimeDecorator::installUIRuntimeBindings(*rnRuntime, [&](int handlerTag, int state) {
          this->setGestureState(handlerTag, state);
        });
    }
} // namespace gesturehandler
