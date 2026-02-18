#import "RNGestureHandlerButtonManager.h"
#import "RNGestureHandlerButton.h"

static RNGestureHandlerPointerEvents RCTPointerEventsToEnum(RCTPointerEvents pointerEvents)
{
  switch (pointerEvents) {
    case RCTPointerEventsNone:
      return RNGestureHandlerPointerEventsNone;
    case RCTPointerEventsBoxNone:
      return RNGestureHandlerPointerEventsBoxNone;
    case RCTPointerEventsBoxOnly:
      return RNGestureHandlerPointerEventsBoxOnly;
    default:
      return RNGestureHandlerPointerEventsAuto;
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
    view.pointerEvents = RCTPointerEventsToEnum(pointerEvents);
  } else {
    view.pointerEvents = RNGestureHandlerPointerEventsAuto;
  }
}

- (RNGHUIView *)view
{
  return (RNGHUIView *)[RNGestureHandlerButton new];
}

@end
