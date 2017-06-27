#import <React/RCTEventDispatcher.h>

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#import "RNGestureHandlerState.h"

static const CGPoint RNGestureHandlerTranslationUndefined = { NAN, NAN };

@interface RNGestureHandlerEvent : NSObject <RCTEvent>

- (instancetype)initWithRactTag:(NSNumber *)reactTag
                     handlerTag:(NSNumber *)handlerTag
                          state:(RNGestureHandlerState)state
                       position:(CGPoint)position
                    translation:(CGPoint)translation NS_DESIGNATED_INITIALIZER;

@end


@interface RNGestureHandlerStateChange : NSObject <RCTEvent>

- (instancetype)initWithRactTag:(NSNumber *)reactTag
                     handlerTag:(NSNumber *)handlerTag
                          state:(RNGestureHandlerState)state
                      prevState:(RNGestureHandlerState)prevState
                       position:(CGPoint)position
                    translation:(CGPoint)translation NS_DESIGNATED_INITIALIZER;

@end
