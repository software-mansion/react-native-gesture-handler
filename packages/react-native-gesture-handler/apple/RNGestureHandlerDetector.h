#if !TARGET_OS_OSX
#import <UIKit/UIKit.h>
#else
#import <React/RCTUIKit.h>
#endif

#import <React/RCTViewComponentView.h>

#import <react/renderer/components/rngesturehandler_codegen/EventEmitters.h>

using namespace facebook::react;

NS_ASSUME_NONNULL_BEGIN

@interface RNGestureHandlerDetector : RCTViewComponentView

- (void)dispatchStateChangeEvent:(RNGestureHandlerDetectorEventEmitter::OnGestureHandlerStateChange)event;

- (void)dispatchGestureEvent:(RNGestureHandlerDetectorEventEmitter::OnGestureHandlerEvent)event;

- (void)dispatchTouchEvent:(RNGestureHandlerDetectorEventEmitter::OnGestureHandlerTouchEvent)event;

- (void)tryAttachNativeHandlersToChildView;

- (void)detachNativeGestureHandlers;

- (BOOL)shouldAttachGestureToSubview:(nonnull NSNumber *)handlerTag;

@end

NS_ASSUME_NONNULL_END
