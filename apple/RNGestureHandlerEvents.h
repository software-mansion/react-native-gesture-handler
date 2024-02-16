#import <React/RCTEventDispatcher.h>

#import <Foundation/Foundation.h>

#import "RNGHTouchEventType.h"
#import "RNGHUIKit.h"
#import "RNGestureHandlerState.h"

@interface RNGestureHandlerEventExtraData : NSObject

@property (readonly) NSDictionary *data;

- (instancetype)initWithData:(NSDictionary *)data;

+ (RNGestureHandlerEventExtraData *)forPosition:(CGPoint)position
                           withAbsolutePosition:(CGPoint)absolutePosition
                                withPointerType:(NSInteger)pointerType;
+ (RNGestureHandlerEventExtraData *)forPosition:(CGPoint)position
                           withAbsolutePosition:(CGPoint)absolutePosition
                            withNumberOfTouches:(NSUInteger)numberOfTouches
                                withPointerType:(NSInteger)pointerType;
+ (RNGestureHandlerEventExtraData *)forPosition:(CGPoint)position
                           withAbsolutePosition:(CGPoint)absolutePosition
                            withNumberOfTouches:(NSUInteger)numberOfTouches
                                   withDuration:(NSUInteger)duration
                                withPointerType:(NSInteger)pointerType;
+ (RNGestureHandlerEventExtraData *)forPan:(CGPoint)position
                      withAbsolutePosition:(CGPoint)absolutePosition
                           withTranslation:(CGPoint)translation
                              withVelocity:(CGPoint)velocity
                       withNumberOfTouches:(NSUInteger)numberOfTouches
                           withPointerType:(NSInteger)pointerType;
+ (RNGestureHandlerEventExtraData *)forForce:(CGFloat)force
                                 forPosition:(CGPoint)position
                        withAbsolutePosition:(CGPoint)absolutePosition
                         withNumberOfTouches:(NSUInteger)numberOfTouches
                             withPointerType:(NSInteger)pointerType;
+ (RNGestureHandlerEventExtraData *)forPinch:(CGFloat)scale
                              withFocalPoint:(CGPoint)focalPoint
                                withVelocity:(CGFloat)velocity
                         withNumberOfTouches:(NSUInteger)numberOfTouches
                             withPointerType:(NSInteger)pointerType;
+ (RNGestureHandlerEventExtraData *)forRotation:(CGFloat)rotation
                                withAnchorPoint:(CGPoint)anchorPoint
                                   withVelocity:(CGFloat)velocity
                            withNumberOfTouches:(NSUInteger)numberOfTouches
                                withPointerType:(NSInteger)pointerType;
+ (RNGestureHandlerEventExtraData *)forEventType:(RNGHTouchEventType)eventType
                             withChangedPointers:(NSArray<NSDictionary *> *)changedPointers
                                 withAllPointers:(NSArray<NSDictionary *> *)allPointers
                             withNumberOfTouches:(NSUInteger)numberOfTouches
                                 withPointerType:(NSInteger)pointerType;
+ (RNGestureHandlerEventExtraData *)forPointerInside:(BOOL)pointerInside withPointerType:(NSInteger)pointerType;
@end

@interface RNGestureHandlerEvent : NSObject <RCTEvent>

- (instancetype)initWithReactTag:(NSNumber *)reactTag
                      handlerTag:(NSNumber *)handlerTag
                           state:(RNGestureHandlerState)state
                       extraData:(RNGestureHandlerEventExtraData *)extraData
                   coalescingKey:(uint16_t)coalescingKey NS_DESIGNATED_INITIALIZER;

@end

@interface RNGestureHandlerStateChange : NSObject <RCTEvent>

- (instancetype)initWithReactTag:(NSNumber *)reactTag
                      handlerTag:(NSNumber *)handlerTag
                           state:(RNGestureHandlerState)state
                       prevState:(RNGestureHandlerState)prevState
                       extraData:(RNGestureHandlerEventExtraData *)extraData NS_DESIGNATED_INITIALIZER;

@end
