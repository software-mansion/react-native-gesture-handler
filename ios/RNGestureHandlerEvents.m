 #import "RNGestureHandlerEvents.h"

@implementation RNGestureHandlerEvent
{
    NSNumber *_handlerTag;
    RNGestureHandlerState _state;
    CGPoint _position;
    CGPoint _translation;
}

@synthesize viewTag = _viewTag;
@synthesize coalescingKey = _coalescingKey;

- (instancetype)initWithRactTag:(NSNumber *)reactTag
                     handlerTag:(NSNumber *)handlerTag
                          state:(RNGestureHandlerState)state
                       position:(CGPoint)position
                    translation:(CGPoint)translation
{
    static uint16_t coalescingKey = 0;
    if ((self = [super init])) {
        _viewTag = reactTag;
        _handlerTag = handlerTag;
        _state = state;
        _position = position;
        _translation = translation;
        _coalescingKey = coalescingKey++;
    }
    return self;
}

RCT_NOT_IMPLEMENTED(- (instancetype)init)

- (NSString *)eventName
{
    return @"onGestureHandlerEvent";
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
    NSMutableDictionary *body = [NSMutableDictionary dictionaryWithObjectsAndKeys:_viewTag, @"target",
                                 _handlerTag, @"handlerTag",
                                 @(_state), @"state",
                                 @(_position.x), @"x",
                                 @(_position.y), @"y", nil];
    if (!isnan(_translation.x) && !isnan(_translation.y)) {
        [body setObject:@(_translation.x) forKey:@"translationX"];
        [body setObject:@(_translation.y) forKey:@"translationY"];
    }
    return @[self.viewTag, @"topGestureHandlerEvent", body];
}

@end


@implementation RNGestureHandlerStateChange
{
    NSNumber *_handlerTag;
    RNGestureHandlerState _state;
    RNGestureHandlerState _prevState;
    CGPoint _position;
    CGPoint _translation;
}

@synthesize viewTag = _viewTag;
@synthesize coalescingKey = _coalescingKey;

- (instancetype)initWithRactTag:(NSNumber *)reactTag
                     handlerTag:(NSNumber *)handlerTag
                          state:(RNGestureHandlerState)state
                          prevState:(RNGestureHandlerState)prevState
                       position:(CGPoint)position
                    translation:(CGPoint)translation
{
    static uint16_t coalescingKey = 0;
    if ((self = [super init])) {
        _viewTag = reactTag;
        _handlerTag = handlerTag;
        _state = state;
        _prevState = prevState;
        _position = position;
        _translation = translation;
        _coalescingKey = coalescingKey++;
    }
    return self;
}

RCT_NOT_IMPLEMENTED(- (instancetype)init)

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
    NSMutableDictionary *body = [NSMutableDictionary dictionaryWithObjectsAndKeys:_viewTag, @"target",
                                 _handlerTag, @"handlerTag",
                                 @(_state), @"state",
                                 @(_prevState), @"oldState",
                                 @(_position.x), @"lastX",
                                 @(_position.y), @"lastY", nil];
    if (!isnan(_translation.x) && !isnan(_translation.y)) {
        [body setObject:@(_translation.x) forKey:@"lastTranslationX"];
        [body setObject:@(_translation.y) forKey:@"lastTranslationY"];
    }
    return @[self.viewTag, @"topGestureHandlerStateChange", body];
}

@end
