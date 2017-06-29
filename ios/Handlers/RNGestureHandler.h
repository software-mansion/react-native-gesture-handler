#import "RNGestureHandlerState.h"
#import "RNGestureHandlerEvents.h"

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>


@protocol RNGestureHandlerEventEmitter

- (void)sendTouchEvent:(RNGestureHandlerEvent *)event;

- (void)sendStateChangeEvent:(RNGestureHandlerStateChange *)event;

@end


@interface RNGestureHandler : NSObject {

@protected UIGestureRecognizer *_recognizer;
@protected RNGestureHandlerState _lastState;
    
}

- (instancetype)initWithTag:(NSNumber *)tag
                     config:(NSDictionary<NSString *, id> *)config NS_DESIGNATED_INITIALIZER;

@property (nonatomic, readonly) NSNumber *tag;
@property (nonatomic, weak) id<RNGestureHandlerEventEmitter> emitter;
@property (nonatomic, readonly) UIGestureRecognizer *recognizer;

- (void)bindToView:(UIView *)view;
- (void)unbindFromView;
- (void)handleGesture:(id)recognizer;
- (RNGestureHandlerState)state;
- (RNGestureHandlerEventExtraData *)eventExtraData:(id)recognizer;

@end

  
@interface RNPanGestureHandler : RNGestureHandler
@end

@interface RNTapGestureHandler : RNGestureHandler
@end

@interface RNLongPressGestureHandler : RNGestureHandler
@end

@interface RNNativeViewGestureHandler : RNGestureHandler
@end

@interface RNPinchGestureHandler : RNGestureHandler
@end
