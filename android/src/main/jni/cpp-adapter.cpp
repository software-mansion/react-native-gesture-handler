#include <jni.h>
#include <jsi/jsi.h>
#include "RNGHTurboCppModule.h"
#include <DefaultTurboModuleManagerDelegate.h>
#include <fbjni/fbjni.h>

std::function<std::shared_ptr<facebook::react::TurboModule>(
        const std::string&,
        const std::shared_ptr<facebook::react::CallInvoker>&)> cxxModuleProviderHolder;

namespace facebook::react {


extern "C" JNIEXPORT void JNICALL
Java_com_swmansion_gesturehandler_react_RNGestureHandlerModule_decorateRuntime(
        JNIEnv *env,
        jobject clazz,
        jlong jsiPtr) {
    jsi::Runtime *runtime = reinterpret_cast<jsi::Runtime *>(jsiPtr);
    if (runtime) {
        RNGHdecorateRuntime(*runtime);
    }
}

std::shared_ptr<TurboModule> cxxModuleProvider(
        const std::string& name,
        const std::shared_ptr<CallInvoker>& jsInvoker) {
    if (name == "RNGHTurboCppModule") {
        return std::make_shared<facebook::react::RNGHTurboCppModule>(jsInvoker);
    }
    return cxxModuleProviderHolder(name, jsInvoker);
}

} // namespace facebook::react

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
    cxxModuleProviderHolder = facebook::react::DefaultTurboModuleManagerDelegate::cxxModuleProvider;
    return facebook::jni::initialize(vm, [] {
        facebook::react::DefaultTurboModuleManagerDelegate::cxxModuleProvider =
                &facebook::react::cxxModuleProvider;
    });
}