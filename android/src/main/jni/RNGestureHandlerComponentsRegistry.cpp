#include "RNGestureHandlerComponentsRegistry.h"

#include <CoreComponentsRegistry.h>
#include <fbjni/fbjni.h>
#include <react/renderer/componentregistry/ComponentDescriptorProviderRegistry.h>
#include <react/renderer/components/rncore/ComponentDescriptors.h>
#include <react/renderer/components/rngesturehandler/ComponentDescriptors.h>

namespace facebook {
namespace react {

RNGestureHandlerComponentsRegistry::RNGestureHandlerComponentsRegistry(
    ComponentFactory *delegate)
    : delegate_(delegate) {}

std::shared_ptr<ComponentDescriptorProviderRegistry const>
RNGestureHandlerComponentsRegistry::sharedProviderRegistry() {
  auto providerRegistry = CoreComponentsRegistry::sharedProviderRegistry();

  // Gesture Handler
  providerRegistry->add(concreteComponentDescriptorProvider<RNGestureHandlerRootViewComponentDescriptor>());
  providerRegistry->add(concreteComponentDescriptorProvider<RNGestureHandlerButtonComponentDescriptor>());

  return providerRegistry;
}

jni::local_ref<RNGestureHandlerComponentsRegistry::jhybriddata>
RNGestureHandlerComponentsRegistry::initHybrid(
    jni::alias_ref<jclass>,
    ComponentFactory *delegate) {
  auto instance = makeCxxInstance(delegate);

  auto buildRegistryFunction =
      [](EventDispatcher::Weak const &eventDispatcher,
         ContextContainer::Shared const &contextContainer)
      -> ComponentDescriptorRegistry::Shared {
    auto registry = RNGestureHandlerComponentsRegistry::sharedProviderRegistry()
                        ->createComponentDescriptorRegistry(
                            {eventDispatcher, contextContainer});

    auto mutableRegistry =
        std::const_pointer_cast<ComponentDescriptorRegistry>(registry);

    mutableRegistry->setFallbackComponentDescriptor(
        std::make_shared<UnimplementedNativeViewComponentDescriptor>(
            ComponentDescriptorParameters{
                eventDispatcher, contextContainer, nullptr}));

    return registry;
  };

  delegate->buildRegistryFunction = buildRegistryFunction;
  return instance;
}

void RNGestureHandlerComponentsRegistry::registerNatives() {
  registerHybrid({
      makeNativeMethod("initHybrid", RNGestureHandlerComponentsRegistry::initHybrid),
  });
  
  // This is a temporary solution that allows components exported by gesture-handler
  // library to be added to the main component registry. This code is triggered
  // when c++ gesture-handler library is initialized and is needed because RN's autolinking
  // does not currently support Fabric components. As a consequence, users would need
  // to manually put library initialization calls in their ReactNativeHost implementation
  // which is undesirable.
  sharedProviderRegistry();
}

} // namespace react
} // namespace facebook
