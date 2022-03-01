#pragma once

#include <ComponentFactory.h>
#include <fbjni/fbjni.h>
#include <react/renderer/componentregistry/ComponentDescriptorProviderRegistry.h>
#include <react/renderer/componentregistry/ComponentDescriptorRegistry.h>

namespace facebook {
namespace react {

class RNGestureHandlerComponentsRegistry
    : public facebook::jni::HybridClass<RNGestureHandlerComponentsRegistry> {
 public:
  constexpr static auto kJavaDescriptor =
      "Lcom/swmansion/gesturehandler/react/RNGestureHandlerComponentsRegistry;";

  static void registerNatives();

  RNGestureHandlerComponentsRegistry(ComponentFactory *delegate);

 private:
  friend HybridBase;

  static std::shared_ptr<ComponentDescriptorProviderRegistry const> sharedProviderRegistry();

  const ComponentFactory *delegate_;

  static jni::local_ref<jhybriddata> initHybrid(
      jni::alias_ref<jclass>,
      ComponentFactory *delegate);
};

} // namespace react
} // namespace facebook
