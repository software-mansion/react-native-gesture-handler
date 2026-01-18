#ifdef RCT_NEW_ARCH_ENABLED

#import "RNGestureHandlerButtonComponentView.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rngesturehandler_codegen/ComponentDescriptors.h>
#import <react/renderer/components/rngesturehandler_codegen/EventEmitters.h>
#import <react/renderer/components/rngesturehandler_codegen/Props.h>
#import <react/renderer/components/rngesturehandler_codegen/RCTComponentViewHelpers.h>
#import <react/renderer/components/view/ViewProps.h>

#import "RNGestureHandlerButton.h"

using namespace facebook::react;

static NSString *RCTPointerEventsToString(facebook::react::PointerEventsMode pointerEvents)
{
  switch (pointerEvents) {
    case facebook::react::PointerEventsMode::None:
      return @"none";
    case facebook::react::PointerEventsMode::BoxNone:
      return @"box-none";
    case facebook::react::PointerEventsMode::BoxOnly:
      return @"box-only";
    case facebook::react::PointerEventsMode::Auto:
    default:
      return @"auto";
  }
}

@interface RNGestureHandlerButtonComponentView () <RCTRNGestureHandlerButtonViewProtocol>
@end

@implementation RNGestureHandlerButtonComponentView {
  RNGestureHandlerButton *_buttonView;
}

#if TARGET_OS_OSX
// Here we want to disable view recycling on buttons. Listeners are not removed from views when they're being unmounted,
// therefore after navigating through other screens buttons may have different actions then they are supposed to have.
+ (BOOL)shouldBeRecycled
{
  return NO;
}
#endif

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load
{
  [super load];
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNGestureHandlerButtonProps>();
    _props = defaultProps;
    _buttonView = [[RNGestureHandlerButton alloc] initWithFrame:self.bounds];

    self.contentView = _buttonView;
  }

  return self;
}

- (void)mountChildComponentView:(RNGHUIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  [_buttonView mountChildComponentView:childComponentView index:index];
}

- (void)unmountChildComponentView:(RNGHUIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  [_buttonView unmountChildComponentView:childComponentView index:index];
}

- (LayoutMetrics)buildWrapperMetrics:(const LayoutMetrics &)metrics
{
  LayoutMetrics result = metrics;
  result.borderWidth = EdgeInsets::ZERO;
  result.contentInsets = EdgeInsets::ZERO;
  return result;
}

- (LayoutMetrics)buildButtonMetrics:(const LayoutMetrics &)metrics
{
  LayoutMetrics result = metrics;
  result.frame.origin = {0, 0};
  return result;
}

- (void)updateLayoutMetrics:(const facebook::react::LayoutMetrics &)layoutMetrics
           oldLayoutMetrics:(const facebook::react::LayoutMetrics &)oldLayoutMetrics
{
  // due to nested structure of Button and ComponentView, layout metrics for both
  // need to be modified:
  // - wrapper shouldn't have any insets as they should be applied to the button
  //   so that it can intercept touches on padding and borders, applying them
  //   twice breaks expected layout
  // - frame origin needs to be zeroes on metrics of the button as it should fill
  //   the entirety of the wrapper component
  const LayoutMetrics wrapperMetrics = [self buildWrapperMetrics:layoutMetrics];
  const LayoutMetrics oldWrapperMetrics = [self buildWrapperMetrics:oldLayoutMetrics];

  const LayoutMetrics buttonMetrics = [self buildButtonMetrics:layoutMetrics];
  const LayoutMetrics oldbuttonMetrics = [self buildButtonMetrics:oldLayoutMetrics];

  [super updateLayoutMetrics:wrapperMetrics oldLayoutMetrics:oldWrapperMetrics];
  [_buttonView updateLayoutMetrics:buttonMetrics oldLayoutMetrics:oldbuttonMetrics];
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNGestureHandlerButtonComponentDescriptor>();
}

#if TARGET_OS_IOS
// Taken from
// https://github.com/facebook/react-native/blob/b226049a4a28ea3f7f32266269fb76340c324d42/packages/react-native/React/Fabric/Mounting/ComponentViews/View/RCTViewComponentView.mm#L343
- (void)setAccessibilityProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &oldButtonProps = *std::static_pointer_cast<const RNGestureHandlerButtonProps>(oldProps);
  const auto &newButtonProps = *std::static_pointer_cast<const RNGestureHandlerButtonProps>(props);

  if (!oldProps || oldButtonProps.accessible != newButtonProps.accessible) {
    _buttonView.isAccessibilityElement = newButtonProps.accessible;
  }

  if (!oldProps || oldButtonProps.accessibilityLabel != newButtonProps.accessibilityLabel) {
    _buttonView.accessibilityLabel = RCTNSStringFromStringNilIfEmpty(newButtonProps.accessibilityLabel);
  }

  if (!oldProps || oldButtonProps.accessibilityLanguage != newButtonProps.accessibilityLanguage) {
    _buttonView.accessibilityLanguage = RCTNSStringFromStringNilIfEmpty(newButtonProps.accessibilityLanguage);
  }

  if (!oldProps || oldButtonProps.accessibilityHint != newButtonProps.accessibilityHint) {
    _buttonView.accessibilityHint = RCTNSStringFromStringNilIfEmpty(newButtonProps.accessibilityHint);
  }

  if (!oldProps || oldButtonProps.accessibilityViewIsModal != newButtonProps.accessibilityViewIsModal) {
    _buttonView.accessibilityViewIsModal = newButtonProps.accessibilityViewIsModal;
  }

  if (!oldProps || oldButtonProps.accessibilityElementsHidden != newButtonProps.accessibilityElementsHidden) {
    _buttonView.accessibilityElementsHidden = newButtonProps.accessibilityElementsHidden;
  }

  if (!oldProps ||
      oldButtonProps.accessibilityShowsLargeContentViewer != newButtonProps.accessibilityShowsLargeContentViewer) {
    if (@available(iOS 13.0, *)) {
      if (newButtonProps.accessibilityShowsLargeContentViewer) {
        _buttonView.showsLargeContentViewer = YES;
        UILargeContentViewerInteraction *interaction = [[UILargeContentViewerInteraction alloc] init];
        [_buttonView addInteraction:interaction];
      } else {
        _buttonView.showsLargeContentViewer = NO;
      }
    }
  }

  if (!oldProps || oldButtonProps.accessibilityLargeContentTitle != newButtonProps.accessibilityLargeContentTitle) {
    if (@available(iOS 13.0, *)) {
      _buttonView.largeContentTitle = RCTNSStringFromStringNilIfEmpty(newButtonProps.accessibilityLargeContentTitle);
    }
  }

  if (!oldProps || oldButtonProps.accessibilityTraits != newButtonProps.accessibilityTraits) {
    _buttonView.accessibilityTraits =
        RCTUIAccessibilityTraitsFromAccessibilityTraits(newButtonProps.accessibilityTraits);
  }

  if (!oldProps || oldButtonProps.accessibilityState != newButtonProps.accessibilityState) {
    _buttonView.accessibilityTraits &= ~(UIAccessibilityTraitNotEnabled | UIAccessibilityTraitSelected);
    const auto accessibilityState = newButtonProps.accessibilityState.value_or(AccessibilityState{});
    if (accessibilityState.selected) {
      _buttonView.accessibilityTraits |= UIAccessibilityTraitSelected;
    }
    if (accessibilityState.disabled) {
      _buttonView.accessibilityTraits |= UIAccessibilityTraitNotEnabled;
    }
  }

  if (!oldProps || oldButtonProps.accessibilityIgnoresInvertColors != newButtonProps.accessibilityIgnoresInvertColors) {
    _buttonView.accessibilityIgnoresInvertColors = newButtonProps.accessibilityIgnoresInvertColors;
  }

  if (!oldProps || oldButtonProps.accessibilityValue != newButtonProps.accessibilityValue) {
    if (newButtonProps.accessibilityValue.text.has_value()) {
      _buttonView.accessibilityValue = RCTNSStringFromStringNilIfEmpty(newButtonProps.accessibilityValue.text.value());
    } else if (
        newButtonProps.accessibilityValue.now.has_value() && newButtonProps.accessibilityValue.min.has_value() &&
        newButtonProps.accessibilityValue.max.has_value()) {
      CGFloat val = (CGFloat)(newButtonProps.accessibilityValue.now.value()) /
          (newButtonProps.accessibilityValue.max.value() - newButtonProps.accessibilityValue.min.value());
      _buttonView.accessibilityValue = [NSNumberFormatter localizedStringFromNumber:@(val)
                                                                        numberStyle:NSNumberFormatterPercentStyle];
      ;
    } else {
      _buttonView.accessibilityValue = nil;
    }
  }

  if (!oldProps || oldButtonProps.testId != newButtonProps.testId) {
    UIView *accessibilityView = (UIView *)_buttonView;
    accessibilityView.accessibilityIdentifier = RCTNSStringFromString(newButtonProps.testId);
  }
}
#endif

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const RNGestureHandlerButtonProps>(props);

  _buttonView.userEnabled = newProps.enabled;
#if !TARGET_OS_TV && !TARGET_OS_OSX
  _buttonView.exclusiveTouch = newProps.exclusive;
  [self setAccessibilityProps:props oldProps:oldProps];
#endif
  _buttonView.hitTestEdgeInsets = UIEdgeInsetsMake(
      -newProps.hitSlop.top, -newProps.hitSlop.left, -newProps.hitSlop.bottom, -newProps.hitSlop.right);

  if (!oldProps) {
    _buttonView.pointerEvents = RCTPointerEventsToString(newProps.pointerEvents);
  } else {
    const auto &oldButtonProps = *std::static_pointer_cast<const RNGestureHandlerButtonProps>(oldProps);
    if (oldButtonProps.pointerEvents != newProps.pointerEvents) {
      _buttonView.pointerEvents = RCTPointerEventsToString(newProps.pointerEvents);
    }
  }

  [super updateProps:props oldProps:oldProps];
}

#if !TARGET_OS_OSX
// Override hitTest to forward touches to _buttonView
// This is necessary because RCTViewComponentView's hitTest might handle pointerEvents
// from ViewProps and prevent touches from reaching _buttonView (which is the contentView).
// Since _buttonView has its own pointerEvents handling, we always forward to it.
- (UIView *)hitTest:(CGPoint)point withEvent:(UIEvent *)event
{
  if (![self pointInside:point withEvent:event]) {
    return nil;
  }

  CGPoint buttonPoint = [self convertPoint:point toView:_buttonView];

  UIView *hitView = [_buttonView hitTest:buttonPoint withEvent:event];

  return hitView;
}
#endif

@end

Class<RCTComponentViewProtocol> RNGestureHandlerButtonCls(void)
{
  return RNGestureHandlerButtonComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
