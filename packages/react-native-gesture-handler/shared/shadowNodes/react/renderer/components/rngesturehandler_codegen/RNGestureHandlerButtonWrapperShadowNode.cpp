
#include <react/renderer/components/rngesturehandler_codegen/ShadowNodes.h>

#include "RNGestureHandlerButtonWrapperShadowNode.h"

namespace facebook::react {

extern const char RNGestureHandlerButtonWrapperComponentName[] =
    "RNGestureHandlerButtonWrapper";

void RNGestureHandlerButtonWrapperShadowNode::initialize() {
  // When the button wrapper is cloned and has a child node, the child node
  // should be cloned as well to ensure it is mutable.
  if (!getChildren().empty()) {
    prepareChildren();
  }
}

void RNGestureHandlerButtonWrapperShadowNode::prepareChildren() {
  const auto &children = getChildren();
  react_native_assert(
      children.size() == 1 &&
      "RNGestureHandlerButtonWrapper received more than one child");

  const auto directChild = children[0];
  react_native_assert(
      directChild->getChildren().size() == 1 &&
      "RNGestureHandlerButtonWrapper received more than one grandchild");

  const auto clonedChild = directChild->clone({});

  const auto childWithProtectedAccess =
      std::static_pointer_cast<RNGestureHandlerButtonWrapperShadowNode>(
          clonedChild);
  childWithProtectedAccess->traits_.unset(ShadowNodeTraits::ForceFlattenView);

  replaceChild(*directChild, clonedChild);

  const auto grandChild = clonedChild->getChildren()[0];
  const auto clonedGrandChild = grandChild->clone({});
  clonedChild->replaceChild(*grandChild, clonedGrandChild);
}

void RNGestureHandlerButtonWrapperShadowNode::appendChild(
    const std::shared_ptr<const ShadowNode> &child) {
  YogaLayoutableShadowNode::appendChild(child);
  prepareChildren();
}

void RNGestureHandlerButtonWrapperShadowNode::layout(
    LayoutContext layoutContext) {
  react_native_assert(getChildren().size() == 1);
  react_native_assert(getChildren()[0]->getChildren().size() == 1);

  auto child = std::static_pointer_cast<const YogaLayoutableShadowNode>(
      getChildren()[0]);
  auto grandChild = std::static_pointer_cast<const YogaLayoutableShadowNode>(
      child->getChildren()[0]);

  auto gradChildWithProtectedAccess =
      std::static_pointer_cast<const RNGestureHandlerButtonWrapperShadowNode>(
          grandChild);

  auto shouldSkipCustomLayout =
      !gradChildWithProtectedAccess->yogaNode_.getHasNewLayout();

  YogaLayoutableShadowNode::layout(layoutContext);

  child->ensureUnsealed();
  grandChild->ensureUnsealed();

  auto mutableChild = std::const_pointer_cast<YogaLayoutableShadowNode>(child);
  auto mutableGrandChild =
      std::const_pointer_cast<YogaLayoutableShadowNode>(grandChild);

  // The grand child node did not have its layout changed, we can reuse previous
  // values
  if (shouldSkipCustomLayout) {
    react_native_assert(previousGrandChildLayoutMetrics_.has_value());
    mutableChild->setLayoutMetrics(previousGrandChildLayoutMetrics_.value());

    auto metricsNoOrigin = previousGrandChildLayoutMetrics_.value();
    metricsNoOrigin.frame.origin = Point{};
    mutableGrandChild->setLayoutMetrics(metricsNoOrigin);
    return;
  }

  auto metrics = grandChild->getLayoutMetrics();
  previousGrandChildLayoutMetrics_ = metrics;

  setLayoutMetrics(metrics);

  auto metricsNoOrigin = grandChild->getLayoutMetrics();
  metricsNoOrigin.frame.origin = Point{};

  mutableChild->setLayoutMetrics(metricsNoOrigin);
  mutableGrandChild->setLayoutMetrics(metricsNoOrigin);
}

} // namespace facebook::react
