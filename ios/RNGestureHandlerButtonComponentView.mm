#ifdef RN_FABRIC_ENABLED

#import "RNGestureHandlerButtonComponentView.h"

#import <React/RCTConversions.h>

#import <react/renderer/components/rngesturehandler/ComponentDescriptors.h>
#import <react/renderer/components/rngesturehandler/EventEmitters.h>
#import <react/renderer/components/rngesturehandler/Props.h>
#import <react/renderer/components/rngesturehandler/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "RNGestureHandlerButton.h"

using namespace facebook::react;

@interface RNGestureHandlerButtonComponentView () <RCTRNGestureHandlerButtonViewProtocol>
@end

@implementation RNGestureHandlerButtonComponentView

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNGestureHandlerButtonProps>();
    _props = defaultProps;
    
    self.contentView = [[RNGestureHandlerButton alloc] initWithFrame:self.bounds];
  }

  return self;
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNGestureHandlerButtonComponentDescriptor>();
}

@end

Class<RCTComponentViewProtocol> RNGestureHandlerButtonCls(void)
{
  return RNGestureHandlerButtonComponentView.class;
}

#endif // RN_FABRIC_ENABLED
