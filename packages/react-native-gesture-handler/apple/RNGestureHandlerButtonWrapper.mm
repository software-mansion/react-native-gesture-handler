#import "RNGestureHandlerButtonWrapper.h"
#import "RNGestureHandlerButtonWrapperComponentDescriptor.h"
#import "RNGestureHandlerModule.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rngesturehandler_codegen/EventEmitters.h>
#import <react/renderer/components/rngesturehandler_codegen/Props.h>
#import <react/renderer/components/rngesturehandler_codegen/RCTComponentViewHelpers.h>

@interface RNGestureHandlerButtonWrapper () <RCTRNGestureHandlerButtonWrapperViewProtocol>
@end

@implementation RNGestureHandlerButtonWrapper

#if TARGET_OS_OSX
+ (BOOL)shouldBeRecycled
{
  return NO;
}
#endif

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNGestureHandlerButtonWrapperProps>();
    _props = defaultProps;
  }

  return self;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNGestureHandlerButtonWrapperComponentDescriptor>();
}

@end

Class<RCTComponentViewProtocol> RNGestureHandlerButtonWrapperCls(void)
{
  return RNGestureHandlerButtonWrapper.class;
}
