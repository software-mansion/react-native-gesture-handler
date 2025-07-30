#import <React/RCTEventDispatcher.h>

#import <Foundation/Foundation.h>

#import "RNGHStylusData.h"
#import "RNGHTouchEventType.h"
#import "RNGHUIKit.h"
#import "RNGestureHandlerActionType.h"
#import "RNGestureHandlerState.h"

@interface RNGestureHandlerEventExtraData : NSObject

@property (readonly) NSDictionary<NSString *, id> *data;

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
                           withPointerType:(NSInteger)pointerType
                            withStylusData:(NSDictionary *)stylusData;
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

@property (nonatomic, strong, readonly) NSNumber *reactTag;
@property (nonatomic, strong, readonly) NSNumber *handlerTag;
@property (nonatomic, strong, readonly) RNGestureHandlerEventExtraData *extraData;
@property (nonatomic, readonly) RNGestureHandlerState state;
@property (nonatomic, readonly) BOOL forAnimated;

- (instancetype)initWithReactTag:(NSNumber *)reactTag
                      handlerTag:(NSNumber *)handlerTag
                           state:(RNGestureHandlerState)state
                       extraData:(RNGestureHandlerEventExtraData *)extraData
                   forActionType:(NSInteger)actionType
                     forAnimated:(BOOL)forAnimated
                   coalescingKey:(uint16_t)coalescingKey NS_DESIGNATED_INITIALIZER;

@end

@interface RNGestureHandlerStateChange : NSObject <RCTEvent>

@property (nonatomic, strong, readonly) NSNumber *reactTag;
@property (nonatomic, strong, readonly) NSNumber *handlerTag;
@property (nonatomic, strong, readonly) RNGestureHandlerEventExtraData *extraData;
@property (nonatomic, readonly) RNGestureHandlerState state;
@property (nonatomic, readonly) RNGestureHandlerState previousState;

- (instancetype)initWithReactTag:(NSNumber *)reactTag
                      handlerTag:(NSNumber *)handlerTag
                           state:(RNGestureHandlerState)state
                       prevState:(RNGestureHandlerState)prevState
                       extraData:(RNGestureHandlerEventExtraData *)extraData NS_DESIGNATED_INITIALIZER;

@end
