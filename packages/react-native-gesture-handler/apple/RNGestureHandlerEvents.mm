#import "RNGestureHandlerEvents.h"

#define SAFE_VELOCITY(velocity) @(isnan(velocity) ? 0 : velocity)

@implementation RNGestureHandlerEventExtraData

- (instancetype)initWithData:(NSDictionary *)data;
{
  if ((self = [super init])) {
    _data = data;
  }
  return self;
}

+ (RNGestureHandlerEventExtraData *)forPosition:(CGPoint)position
                           withAbsolutePosition:(CGPoint)absolutePosition
                                withPointerType:(NSInteger)pointerType
{
  return [[RNGestureHandlerEventExtraData alloc] initWithData:@{
    @"x" : @(position.x),
    @"y" : @(position.y),
    @"absoluteX" : @(absolutePosition.x),
    @"absoluteY" : @(absolutePosition.y),
    @"pointerType" : @(pointerType)
  }];
}

+ (RNGestureHandlerEventExtraData *)forPosition:(CGPoint)position
                           withAbsolutePosition:(CGPoint)absolutePosition
                            withNumberOfTouches:(NSUInteger)numberOfTouches
                                withPointerType:(NSInteger)pointerType
{
  return [[RNGestureHandlerEventExtraData alloc] initWithData:@{
    @"x" : @(position.x),
    @"y" : @(position.y),
    @"absoluteX" : @(absolutePosition.x),
    @"absoluteY" : @(absolutePosition.y),
    @"numberOfPointers" : @(numberOfTouches),
    @"pointerType" : @(pointerType)
  }];
}

+ (RNGestureHandlerEventExtraData *)forPosition:(CGPoint)position
                           withAbsolutePosition:(CGPoint)absolutePosition
                            withNumberOfTouches:(NSUInteger)numberOfTouches
                                   withDuration:(NSUInteger)duration
                                withPointerType:(NSInteger)pointerType
{
  return [[RNGestureHandlerEventExtraData alloc] initWithData:@{
    @"x" : @(position.x),
    @"y" : @(position.y),
    @"absoluteX" : @(absolutePosition.x),
    @"absoluteY" : @(absolutePosition.y),
    @"numberOfPointers" : @(numberOfTouches),
    @"duration" : @(duration),
    @"pointerType" : @(pointerType)
  }];
}

+ (RNGestureHandlerEventExtraData *)forPan:(CGPoint)position
                      withAbsolutePosition:(CGPoint)absolutePosition
                           withTranslation:(CGPoint)translation
                              withVelocity:(CGPoint)velocity
                       withNumberOfTouches:(NSUInteger)numberOfTouches
                           withPointerType:(NSInteger)pointerType
                            withStylusData:(NSDictionary *)stylusData
{
  NSMutableDictionary *data = [@{
    @"x" : @(position.x),
    @"y" : @(position.y),
    @"absoluteX" : @(absolutePosition.x),
    @"absoluteY" : @(absolutePosition.y),
    @"translationX" : @(translation.x),
    @"translationY" : @(translation.y),
    @"velocityX" : SAFE_VELOCITY(velocity.x),
    @"velocityY" : SAFE_VELOCITY(velocity.y),
    @"numberOfPointers" : @(numberOfTouches),
    @"pointerType" : @(pointerType),
  } mutableCopy];

  // Add the stylusData to the dictionary only if necessary
  if (stylusData != nil) {
    data[@"stylusData"] = stylusData;
  }

  return [[RNGestureHandlerEventExtraData alloc] initWithData:data];
}

+ (RNGestureHandlerEventExtraData *)forForce:(CGFloat)force
                                 forPosition:(CGPoint)position
                        withAbsolutePosition:(CGPoint)absolutePosition
                         withNumberOfTouches:(NSUInteger)numberOfTouches
                             withPointerType:(NSInteger)pointerType
{
  return [[RNGestureHandlerEventExtraData alloc] initWithData:@{
    @"x" : @(position.x),
    @"y" : @(position.y),
    @"absoluteX" : @(absolutePosition.x),
    @"absoluteY" : @(absolutePosition.y),
    @"force" : @(force),
    @"numberOfPointers" : @(numberOfTouches),
    @"pointerType" : @(pointerType)
  }];
}

+ (RNGestureHandlerEventExtraData *)forPinch:(CGFloat)scale
                              withFocalPoint:(CGPoint)focalPoint
                                withVelocity:(CGFloat)velocity
                         withNumberOfTouches:(NSUInteger)numberOfTouches
                             withPointerType:(NSInteger)pointerType
{
  return [[RNGestureHandlerEventExtraData alloc] initWithData:@{
    @"scale" : @(scale),
    @"focalX" : @(focalPoint.x),
    @"focalY" : @(focalPoint.y),
    @"velocity" : SAFE_VELOCITY(velocity),
    @"numberOfPointers" : @(numberOfTouches),
    @"pointerType" : @(pointerType)
  }];
}

+ (RNGestureHandlerEventExtraData *)forRotation:(CGFloat)rotation
                                withAnchorPoint:(CGPoint)anchorPoint
                                   withVelocity:(CGFloat)velocity
                            withNumberOfTouches:(NSUInteger)numberOfTouches
                                withPointerType:(NSInteger)pointerType
{
  return [[RNGestureHandlerEventExtraData alloc] initWithData:@{
    @"rotation" : @(rotation),
    @"anchorX" : @(anchorPoint.x),
    @"anchorY" : @(anchorPoint.y),
    @"velocity" : SAFE_VELOCITY(velocity),
    @"numberOfPointers" : @(numberOfTouches),
    @"pointerType" : @(pointerType)
  }];
}

+ (RNGestureHandlerEventExtraData *)forEventType:(RNGHTouchEventType)eventType
                             withChangedPointers:(NSArray<NSDictionary *> *)changedPointers
                                 withAllPointers:(NSArray<NSDictionary *> *)allPointers
                             withNumberOfTouches:(NSUInteger)numberOfTouches
                                 withPointerType:(NSInteger)pointerType
{
  if (changedPointers == nil || allPointers == nil) {
    changedPointers = @[];
    allPointers = @[];
    eventType = RNGHTouchEventTypeUndetermined;
  }

  return [[RNGestureHandlerEventExtraData alloc] initWithData:@{
    @"eventType" : @(eventType),
    @"changedTouches" : changedPointers,
    @"allTouches" : allPointers,
    @"numberOfTouches" : @(numberOfTouches),
    @"pointerType" : @(pointerType)
  }];
}

+ (RNGestureHandlerEventExtraData *)forPointerInside:(BOOL)pointerInside withPointerType:(NSInteger)pointerType
{
  return [[RNGestureHandlerEventExtraData alloc]
      initWithData:@{@"pointerInside" : @(pointerInside), @"pointerType" : @(pointerType)}];
}

@end

@implementation RNGestureHandlerEvent {
  NSInteger _actionType;
}

@synthesize viewTag = _viewTag;
@synthesize coalescingKey = _coalescingKey;

- (instancetype)initWithReactTag:(NSNumber *)reactTag
                      handlerTag:(NSNumber *)handlerTag
                           state:(RNGestureHandlerState)state
                       extraData:(RNGestureHandlerEventExtraData *)extraData
                   forActionType:(NSInteger)actionType
                   coalescingKey:(uint16_t)coalescingKey
{
  if ((self = [super init])) {
    _viewTag = reactTag;
    _handlerTag = handlerTag;
    _state = state;
    _extraData = extraData;
    _coalescingKey = coalescingKey;
    _actionType = actionType;
  }
  return self;
}

RCT_NOT_IMPLEMENTED(-(instancetype)init)

- (NSString *)eventName
{
  return @"onGestureHandlerEvent";
}

- (BOOL)canCoalesce
{
  return YES;
}

- (id<RCTEvent>)coalesceWithEvent:(id<RCTEvent>)newEvent;
{
  return newEvent;
}

+ (NSString *)moduleDotMethod
{
  return @"RCTEventEmitter.receiveEvent";
}

- (NSArray *)arguments
{
  if (_actionType == RNGestureHandlerActionTypeNativeDetectorAnimatedEvent) {
    NSMutableDictionary *body = [[NSMutableDictionary alloc] init];
    [body setObject:_viewTag forKey:@"target"];
    [body setObject:_handlerTag forKey:@"handlerTag"];
    [body setObject:@(_state) forKey:@"state"];
    [body setObject:_extraData.data forKey:@"handlerData"];
    return @[ self.viewTag, @"onGestureHandlerEvent", body ];
  } else {
    NSMutableDictionary *body = [NSMutableDictionary dictionaryWithDictionary:_extraData.data];
    [body setObject:_viewTag forKey:@"target"];
    [body setObject:_handlerTag forKey:@"handlerTag"];
    [body setObject:@(_state) forKey:@"state"];
    return @[ self.viewTag, @"onGestureHandlerEvent", body ];
  }
}

@end

@implementation RNGestureHandlerStateChange

@synthesize viewTag = _viewTag;
@synthesize coalescingKey = _coalescingKey;

- (instancetype)initWithReactTag:(NSNumber *)reactTag
                      handlerTag:(NSNumber *)handlerTag
                           state:(RNGestureHandlerState)state
                       prevState:(RNGestureHandlerState)prevState
                       extraData:(RNGestureHandlerEventExtraData *)extraData
{
  static uint16_t coalescingKey = 0;
  if ((self = [super init])) {
    _viewTag = reactTag;
    _handlerTag = handlerTag;
    _state = state;
    _previousState = prevState;
    _extraData = extraData;
    _coalescingKey = coalescingKey++;
  }
  return self;
}

RCT_NOT_IMPLEMENTED(-(instancetype)init)

- (NSString *)eventName
{
  return @"onGestureHandlerStateChange";
}

- (BOOL)canCoalesce
{
  // TODO: event coalescing
  return NO;
}

- (id<RCTEvent>)coalesceWithEvent:(id<RCTEvent>)newEvent;
{
  return newEvent;
}

+ (NSString *)moduleDotMethod
{
  return @"RCTEventEmitter.receiveEvent";
}

- (NSArray *)arguments
{
  NSMutableDictionary *body = [NSMutableDictionary dictionaryWithDictionary:_extraData.data];
  [body setObject:_viewTag forKey:@"target"];
  [body setObject:_handlerTag forKey:@"handlerTag"];
  [body setObject:@(_state) forKey:@"state"];
  [body setObject:@(_previousState) forKey:@"oldState"];
  return @[ self.viewTag, @"onGestureHandlerStateChange", body ];
}

@end
