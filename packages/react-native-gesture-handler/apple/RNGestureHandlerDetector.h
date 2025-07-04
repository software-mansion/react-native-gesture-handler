#ifdef RCT_NEW_ARCH_ENABLED

#if !TARGET_OS_OSX
#import <UIKit/UIKit.h>
#else
#import <React/RCTUIKit.h>
#endif

#import <React/RCTViewComponentView.h>

#import <react/renderer/components/rngesturehandler_codegen/EventEmitters.h>

NS_ASSUME_NONNULL_BEGIN

@interface RNGestureHandlerDetector : RCTViewComponentView

- (void)dispatchStateChangeEvent:
    (facebook::react::RNGestureHandlerDetectorEventEmitter::OnGestureHandlerStateChange)event;

- (void)dispatchGestureEvent:(facebook::react::RNGestureHandlerDetectorEventEmitter::OnGestureHandlerEvent)event;

- (void)dispatchTouchEvent:(facebook::react::RNGestureHandlerDetectorEventEmitter::OnGestureHandlerTouchEvent)event;

@end

NS_ASSUME_NONNULL_END

#endif // RCT_NEW_ARCH_ENABLED
