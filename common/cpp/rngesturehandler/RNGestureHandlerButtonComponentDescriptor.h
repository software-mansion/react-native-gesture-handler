// #pragma once

// #include <react/debug/react_native_assert.h>
// #include "./RNGestureHandlerButtonShadowNode.h"
// #include <react/renderer/core/ConcreteComponentDescriptor.h>

// namespace facebook {
// namespace react {

// /*
// * Descriptor for <RNGestureHandlerButton> component.
// */

// class RNGestureHandlerButtonComponentDescriptor final
//    : public ConcreteComponentDescriptor<RNGestureHandlerButtonShadowNode> {
// public:
//  using ConcreteComponentDescriptor::ConcreteComponentDescriptor;

//  void adopt(ShadowNode::Unshared const &shadowNode) const override {
//    react_native_assert(
//        std::dynamic_pointer_cast<RNGestureHandlerButtonShadowNode>(shadowNode));
//    auto screenShadowNode =
//        std::static_pointer_cast<RNGestureHandlerButtonShadowNode>(shadowNode);

//    react_native_assert(
//        std::dynamic_pointer_cast<YogaLayoutableShadowNode>(screenShadowNode));
//    auto layoutableShadowNode =
//        std::static_pointer_cast<YogaLayoutableShadowNode>(screenShadowNode);

//    auto state =
//        std::static_pointer_cast<const RNGestureHandlerButtonShadowNode::ConcreteState>(
//            shadowNode->getState());
//    auto stateData = state->getData();

//    if (stateData.frameSize.width != 0 && stateData.frameSize.height != 0) {
//      layoutableShadowNode->setSize(
//          Size{stateData.frameSize.width, stateData.frameSize.height});
//    }

//    ConcreteComponentDescriptor::adopt(shadowNode);
//  }
// };

// } // namespace react
// } // namespace facebook
