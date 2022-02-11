//#pragma once
//
//#include <react/renderer/components/rngesturehandler/EventEmitters.h>
//#include <react/renderer/components/rngesturehandler/Props.h>
//#include <react/renderer/components/view/ConcreteViewShadowNode.h>
//
//#include "RNGestureHandlerRootViewState.h"
//
//namespace facebook {
//namespace react {
//
//using RNGestureHandlerRootViewEventEmitter = ViewEventEmitter;
//
//extern const char RNGestureHandlerRootViewComponentName[];
//
//class RNGestureHandlerRootViewShadowNode final : public ConcreteViewShadowNode<
//                                          RNGestureHandlerRootViewComponentName,
//                                          RNGestureHandlerRootViewProps,
//                                          RNGestureHandlerRootViewEventEmitter,
//                                          RNGestureHandlerRootViewState> {
// public:
//  using ConcreteViewShadowNode::ConcreteViewShadowNode;
//
//  static ShadowNodeTraits BaseTraits() {
//    auto traits = ConcreteViewShadowNode::BaseTraits();
//    traits.set(ShadowNodeTraits::Trait::RootNodeKind);
//    return traits;
//  }
//};
//
//} // namespace react
//} // namespace facebook
