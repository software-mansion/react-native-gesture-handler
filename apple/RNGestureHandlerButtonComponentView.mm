#ifdef RCT_NEW_ARCH_ENABLED

#import "RNGestureHandlerButtonComponentView.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rngesturehandler_codegen/ComponentDescriptors.h>
#import <react/renderer/components/rngesturehandler_codegen/EventEmitters.h>
#import <react/renderer/components/rngesturehandler_codegen/Props.h>
#import <react/renderer/components/rngesturehandler_codegen/RCTComponentViewHelpers.h>

#import "RNGestureHandlerButton.h"

using namespace facebook::react;

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

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const RNGestureHandlerButtonProps>(props);

  _buttonView.userEnabled = newProps.enabled;
#if !TARGET_OS_TV && !TARGET_OS_OSX
  _buttonView.exclusiveTouch = newProps.exclusive;
#endif
  _buttonView.hitTestEdgeInsets = UIEdgeInsetsMake(
      -newProps.hitSlop.top, -newProps.hitSlop.left, -newProps.hitSlop.bottom, -newProps.hitSlop.right);

  [super updateProps:props oldProps:oldProps];
}
@end

Class<RCTComponentViewProtocol> RNGestureHandlerButtonCls(void)
{
  return RNGestureHandlerButtonComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
