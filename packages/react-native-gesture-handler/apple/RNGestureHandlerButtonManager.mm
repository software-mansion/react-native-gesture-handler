#import "RNGestureHandlerButtonManager.h"
#import "RNGestureHandlerButton.h"

static NSString *RCTPointerEventsToString(RCTPointerEvents pointerEvents)
{
  switch (pointerEvents) {
    case RCTPointerEventsNone:
      return @"none";
    case RCTPointerEventsBoxNone:
      return @"box-none";
    case RCTPointerEventsBoxOnly:
      return @"box-only";
    default:
      return @"auto";
  }
}

@implementation RNGestureHandlerButtonManager

RCT_EXPORT_MODULE(RNGestureHandlerButton)

RCT_CUSTOM_VIEW_PROPERTY(enabled, BOOL, RNGestureHandlerButton)
{
  view.userEnabled = json == nil ? YES : [RCTConvert BOOL:json];
}

#if !TARGET_OS_TV && !TARGET_OS_OSX
RCT_CUSTOM_VIEW_PROPERTY(exclusive, BOOL, RNGestureHandlerButton)
{
  [view setExclusiveTouch:json == nil ? YES : [RCTConvert BOOL:json]];
}
#endif

RCT_CUSTOM_VIEW_PROPERTY(hitSlop, UIEdgeInsets, RNGestureHandlerButton)
{
  if (json) {
    UIEdgeInsets hitSlopInsets = [RCTConvert UIEdgeInsets:json];
    view.hitTestEdgeInsets =
        UIEdgeInsetsMake(-hitSlopInsets.top, -hitSlopInsets.left, -hitSlopInsets.bottom, -hitSlopInsets.right);
  } else {
    view.hitTestEdgeInsets = defaultView.hitTestEdgeInsets;
  }
}

RCT_CUSTOM_VIEW_PROPERTY(pointerEvents, RCTPointerEvents, RNGestureHandlerButton)
{
  if (json) {
    RCTPointerEvents pointerEvents = [RCTConvert RCTPointerEvents:json];
    view.pointerEvents = RCTPointerEventsToString(pointerEvents);
  } else {
    view.pointerEvents = @"auto";
  }
}

- (RNGHUIView *)view
{
  return (RNGHUIView *)[RNGestureHandlerButton new];
}

@end
