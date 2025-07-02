#import <react/renderer/components/rngesturehandler_codegen/EventEmitters.h>

#import "RNGestureHandlerEvents.h"

@interface RNGestureHandlerEvent (NativeEvent)

- (facebook::react::RNGestureHandlerDetectorEventEmitter::OnGestureEvent)getNativeEvent;

@end

@interface RNGestureHandlerStateChange (NativeEvent)

- (facebook::react::RNGestureHandlerDetectorEventEmitter::OnGestureHandlerStateChange)getNativeEvent;

@end
