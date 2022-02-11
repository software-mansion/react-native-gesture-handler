// #pragma once

// #include <react/renderer/components/rngesturehandler/EventEmitters.h>
// #include <react/renderer/components/rngesturehandler/Props.h>
// #include <react/renderer/components/view/ConcreteViewShadowNode.h>

// #include "RNGestureHandlerButtonState.h"

// namespace facebook {
// namespace react {

// using RNGestureHandlerButtonEventEmitter = ViewEventEmitter;

// extern const char RNGestureHandlerButtonComponentName[];

// class RNGestureHandlerButtonShadowNode final : public ConcreteViewShadowNode<
//                                          RNGestureHandlerButtonComponentName,
//                                          RNGestureHandlerButtonProps,
//                                          RNGestureHandlerButtonEventEmitter,
//                                          RNGestureHandlerButtonState> {
// public:
//  using ConcreteViewShadowNode::ConcreteViewShadowNode;

//  static ShadowNodeTraits BaseTraits() {
//    auto traits = ConcreteViewShadowNode::BaseTraits();
//    traits.set(ShadowNodeTraits::Trait::RootNodeKind);
//    return traits;
//  }
// };

// } // namespace react
// } // namespace facebook
