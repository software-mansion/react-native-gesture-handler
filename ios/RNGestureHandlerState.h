#import <Foundation/Foundation.h>

typedef NS_ENUM(NSInteger, RNGestureHandlerState) {
    RNGestureHandlerStateFailed = 1,
    RNGestureHandlerStateBegan,
    RNGestureHandlerStateCancelled,
    RNGestureHandlerStateActive,
    RNGestureHandlerStateEnd,
};
