#ifdef RCT_NEW_ARCH_ENABLED

#import "RNGestureHandlerDetector.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rngesturehandler_codegen/ComponentDescriptors.h>
#import <react/renderer/components/rngesturehandler_codegen/EventEmitters.h>
#import <react/renderer/components/rngesturehandler_codegen/Props.h>
#import <react/renderer/components/rngesturehandler_codegen/RCTComponentViewHelpers.h>

using namespace facebook::react;

@interface RNGestureHandlerDetector () <RCTRNGestureHandlerDetectorViewProtocol>
@end

@implementation RNGestureHandlerDetector

#if TARGET_OS_OSX
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
    static const auto defaultProps = std::make_shared<const RNGestureHandlerDetectorProps>();
    _props = defaultProps;
  }

  return self;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNGestureHandlerDetectorComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const RNGestureHandlerDetectorProps>(props);

  [super updateProps:props oldProps:oldProps];
}
@end

Class<RCTComponentViewProtocol> RNGestureHandlerDetectorCls(void)
{
  return RNGestureHandlerDetector.class;
}

#endif // RCT_NEW_ARCH_ENABLED
