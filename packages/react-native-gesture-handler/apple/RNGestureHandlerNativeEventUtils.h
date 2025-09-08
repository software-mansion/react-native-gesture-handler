#import <react/renderer/components/rngesturehandler_codegen/EventEmitters.h>

#import "RNGestureHandlerEvents.h"

@interface RNGestureHandlerEvent (NativeEvent)

- (facebook::react::RNGestureHandlerDetectorEventEmitter::OnGestureHandlerEvent)getNativeEvent;
<<<<<<< HEAD
=======

- (facebook::react::RNGestureHandlerDetectorEventEmitter::OnGestureHandlerReanimatedEvent)getReanimatedNativeEvent;

>>>>>>> next
@end

@interface RNGestureHandlerStateChange (NativeEvent)

- (facebook::react::RNGestureHandlerDetectorEventEmitter::OnGestureHandlerStateChange)getNativeEvent;
<<<<<<< HEAD
=======

- (facebook::react::RNGestureHandlerDetectorEventEmitter::OnGestureHandlerReanimatedStateChange)
    getReanimatedNativeEvent;

>>>>>>> next
@end
