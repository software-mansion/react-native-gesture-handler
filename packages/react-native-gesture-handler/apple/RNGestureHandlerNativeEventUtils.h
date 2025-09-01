#import <react/renderer/components/rngesturehandler_codegen/EventEmitters.h>

#import "RNGestureHandlerEvents.h"

@interface RNGestureHandlerEvent (NativeEvent)

- (facebook::react::RNGestureHandlerDetectorEventEmitter::OnGestureHandlerEvent)getNativeEvent;
- (facebook::react::RNGestureHandlerDetectorEventEmitter::OnGestureHandlerLogicEvent)getNativeLogicEvent:
    (NSNumber *)childTag;
@end

@interface RNGestureHandlerStateChange (NativeEvent)

- (facebook::react::RNGestureHandlerDetectorEventEmitter::OnGestureHandlerStateChange)getNativeEvent;
- (facebook::react::RNGestureHandlerDetectorEventEmitter::OnGestureHandlerLogicStateChange)getNativeLogicEvent:
    (NSNumber *)childTag;
@end
