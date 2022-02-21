#import <Foundation/Foundation.h>

typedef NS_ENUM(NSInteger, RNGestureHandlerActionType) {
    RNGestureHandlerActionTypeReanimatedWorklet = 1,
    RNGestureHandlerActionTypeNativeAnimatedEvent,
    RNGestureHandlerActionTypeJSFunction,
};
