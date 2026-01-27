#pragma once

#include <jsi/jsi.h>
#include <react/renderer/components/rngesturehandler_codegen/EventEmitters.h>
#include <react/renderer/components/rngesturehandler_codegen/Props.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/core/LayoutContext.h>

#include "RNGestureHandlerButtonWrapperState.h"

namespace facebook::react {

JSI_EXPORT extern const char RNGestureHandlerButtonWrapperComponentName[];

/*
 * `ShadowNode` for <RNGestureHandlerButtonWrapper> component.
 */
class RNGestureHandlerButtonWrapperShadowNode final
    : public ConcreteViewShadowNode<
          RNGestureHandlerButtonWrapperComponentName,
          RNGestureHandlerButtonWrapperProps,
          RNGestureHandlerButtonWrapperEventEmitter,
          RNGestureHandlerButtonWrapperState> {
 public:
  RNGestureHandlerButtonWrapperShadowNode(
      const ShadowNodeFragment &fragment,
      const ShadowNodeFamily::Shared &family,
      ShadowNodeTraits traits)
      : ConcreteViewShadowNode(fragment, family, traits) {
    initialize();
  }

  RNGestureHandlerButtonWrapperShadowNode(
      const ShadowNode &sourceShadowNode,
      const ShadowNodeFragment &fragment)
      : ConcreteViewShadowNode(sourceShadowNode, fragment) {
    const auto &sourceWrapperNode =
        static_cast<const RNGestureHandlerButtonWrapperShadowNode &>(
            sourceShadowNode);
    previousGrandChildLayoutMetrics_ =
        sourceWrapperNode.previousGrandChildLayoutMetrics_;

    initialize();
  }

  void layout(LayoutContext layoutContext) override;
  void appendChild(const std::shared_ptr<const ShadowNode> &child) override;

 private:
  void initialize();
  void prepareChildren();

  std::optional<LayoutMetrics> previousGrandChildLayoutMetrics_;
};

} // namespace facebook::react
