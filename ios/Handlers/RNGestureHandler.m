#import "RNGestureHandler.h"

#import <UIKit/UIGestureRecognizerSubclass.h>

#import <React/UIView+React.h>
#import <React/RCTConvert.h>

#define VEC_LEN_SQ(pt) (pt.x * pt.x + pt.y * pt.y)

@interface RNGestureHandler () <UIGestureRecognizerDelegate>

@property(nonatomic) BOOL shouldCancelWhenOutside;

@end

@implementation RNGestureHandler {
    BOOL _shouldCancelOthersWhenActivated;
    BOOL _shouldBeRequiredByOthersToFail;
    BOOL _shouldCancelWhenOutside;
}

@synthesize shouldCancelWhenOutside = _shouldCancelWhenOutside;

- (instancetype)initWithTag:(NSNumber *)tag
                     config:(NSDictionary<NSString *, id> *)config
{
    if ((self = [super init])) {
        _tag = tag;
        _lastState = RNGestureHandlerStateUndetermined;

        _shouldCancelOthersWhenActivated = [RCTConvert BOOL:config[@"shouldCancelOthersWhenActivated"]];
        _shouldBeRequiredByOthersToFail = [RCTConvert BOOL:config[@"shouldBeRequiredByOthersToFail"]];
        
        id prop = config[@"shouldCancelWhenOutside"];
        if (prop != nil) {
            _shouldCancelWhenOutside = [RCTConvert BOOL:prop];
        } else {
            _shouldCancelWhenOutside = YES;
        }
    }
    return self;
}

- (void)bindToView:(UIView *)view
{
    view.userInteractionEnabled = YES;
    self.recognizer.delegate = self;
    [view addGestureRecognizer:self.recognizer];
}

- (void)unbindFromView
{
    [self.recognizer.view removeGestureRecognizer:self.recognizer];
    self.recognizer.delegate = nil;
}

- (RNGestureHandlerEventExtraData *)eventExtraData:(id)recognizer
{
    return [RNGestureHandlerEventExtraData forPosition:[recognizer locationInView:[recognizer view]]];
}

- (void)handleGesture:(UIGestureRecognizer *)recognizer
{
    RNGestureHandlerState state = self.state;
    
    RNGestureHandlerEventExtraData *eventData = [self eventExtraData:recognizer];
    
    id touchEvent = [[RNGestureHandlerEvent alloc] initWithRactTag:recognizer.view.reactTag
                                                        handlerTag:_tag
                                                             state:state
                                                         extraData:eventData];
    [self.emitter sendTouchEvent:touchEvent];
    
    if (state != _lastState) {
        if (state == RNGestureHandlerStateEnd && _lastState != RNGestureHandlerStateActive) {
            [self.emitter sendStateChangeEvent:[[RNGestureHandlerStateChange alloc] initWithRactTag:recognizer.view.reactTag
                                                                                         handlerTag:_tag
                                                                                              state:RNGestureHandlerStateActive
                                                                                          prevState:_lastState
                                                                                          extraData:eventData]];
            _lastState = RNGestureHandlerStateActive;
        }
        id stateEvent = [[RNGestureHandlerStateChange alloc] initWithRactTag:recognizer.view.reactTag
                                                                  handlerTag:_tag
                                                                       state:state
                                                                   prevState:_lastState
                                                                   extraData:eventData];
        [self.emitter sendStateChangeEvent:stateEvent];
        _lastState = state;
    }
}

- (RNGestureHandlerState)state
{
    switch (_recognizer.state) {
        case UIGestureRecognizerStateBegan:
        case UIGestureRecognizerStatePossible:
            return RNGestureHandlerStateBegan;
        case UIGestureRecognizerStateEnded:
            return RNGestureHandlerStateEnd;
        case UIGestureRecognizerStateFailed:
            return RNGestureHandlerStateFailed;
        case UIGestureRecognizerStateCancelled:
            return RNGestureHandlerStateCancelled;
        case UIGestureRecognizerStateChanged:
            return RNGestureHandlerStateActive;
    }
    return RNGestureHandlerStateUndetermined;
}

#pragma mark UIGestureRecognizerDelegate

- (BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer
shouldBeRequiredToFailByGestureRecognizer:(UIGestureRecognizer *)otherGestureRecognizer
{
    return _shouldBeRequiredByOthersToFail;
}

- (BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer
shouldRecognizeSimultaneouslyWithGestureRecognizer:(UIGestureRecognizer *)otherGestureRecognizer;
{
    // Called when there is some other gesture recognizer that wants to recognize
    // When receiver has already recognized, we disallow simultanious recognition based on shouldCancelOtherWhenActivated,
    // which when set to true means we don't want other gesture handers to remain active, otherwise we return true
    if (_recognizer.state != UIGestureRecognizerStateBegan && _recognizer.state != UIGestureRecognizerStatePossible) {
        return !_shouldCancelOthersWhenActivated;
    }
    // If we haven't recognize just yet, we return YES and allow other gesture recognizer to remain active, if it ended
    // up recognizing, canBePreventedByGestureRecognizer will get called and we can use it to cancel that recognizer
    return YES;
}

- (BOOL)gestureRecognizerShouldBegin:(UIGestureRecognizer *)gestureRecognizer
{
    _lastState = RNGestureHandlerStateUndetermined;
    return YES;
}

@end


#pragma mark PanGestureHandler

@interface RNBetterPanGestureRecognizer : UIPanGestureRecognizer

@property (nonatomic) CGFloat minDeltaX;
@property (nonatomic) CGFloat minDeltaY;
@property (nonatomic) CGFloat minDistSq;
@property (nonatomic) CGFloat maxVelocitySq;
@property (nonatomic) BOOL active;

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler;
- (BOOL)shouldActivate;

@end


@implementation RNBetterPanGestureRecognizer {
    __weak RNGestureHandler *_gestureHandler;
    NSUInteger _tapsSoFar;
}

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler
{
    if ((self = [super initWithTarget:gestureHandler action:@selector(handleGesture:)])) {
        _gestureHandler = gestureHandler;
        _minDeltaX = NAN;
        _minDeltaY = NAN;
        _minDistSq = NAN;
        _maxVelocitySq = NAN;
    }
    return self;
}

- (BOOL)canBePreventedByGestureRecognizer:(UIGestureRecognizer *)preventingGestureRecognizer
{
    BOOL res = [super canBePreventedByGestureRecognizer:preventingGestureRecognizer];
    self.enabled = NO;
    return res;
}

- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
    self.active = NO;
    [super touchesBegan:touches withEvent:event];
}

- (void)touchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
    if (!self.active && !isnan(_maxVelocitySq)) {
        CGPoint velocity = [self velocityInView:self.view];
        if (VEC_LEN_SQ(velocity) >= _maxVelocitySq) {
            self.state = UIGestureRecognizerStateFailed;
            return;
        }
    }
    if (!self.active && [self shouldActivate]) {
        self.active = YES;
    }
    [super touchesMoved:touches withEvent:event];
    if (self.active) {
        self.state = UIGestureRecognizerStateChanged;
    }
}

- (void)reset
{
    self.enabled = YES;
    self.active = NO;
    [super reset];
}

- (BOOL)shouldActivate
{
    if (!isnan(_minDistSq) || !isnan(_minDeltaX) || !isnan(_minDeltaY)) {
        BOOL ready = NO;
        CGPoint trans = [self translationInView:self.view];
        
        if (!isnan(_minDeltaX) && trans.x >= _minDeltaX) {
            ready = YES;
        }
        if (!isnan(_minDeltaY) && trans.y >= _minDeltaY) {
            ready = YES;
        }
        if (!isnan(_minDistSq) && VEC_LEN_SQ(trans) >= _minDistSq) {
            ready = YES;
        }
        
        if (!ready) {
            return NO;
        }
    }
    return YES;
}

@end

@implementation RNPanGestureHandler

- (instancetype)initWithTag:(NSNumber *)tag
                     config:(NSDictionary<NSString *, id> *)config
{
    if ((self = [super initWithTag:tag config:config])) {
        RNBetterPanGestureRecognizer *recognizer = [[RNBetterPanGestureRecognizer alloc] initWithGestureHandler:self];
        
        id prop = config[@"minDeltaX"];
        if (prop != nil) {
            recognizer.minDeltaX = [RCTConvert CGFloat:prop];
        }
        
        prop = config[@"minDeltaY"];
        if (prop != nil) {
            recognizer.minDeltaY = [RCTConvert CGFloat:prop];
        }
        
        prop = config[@"minDist"];
        if (prop != nil) {
            CGFloat dist = [RCTConvert CGFloat:prop];
            recognizer.minDistSq = dist * dist;
        }
        
        prop = config[@"maxVelocity"];
        if (prop != nil) {
            CGFloat velocity = [RCTConvert CGFloat:prop];
            recognizer.maxVelocitySq = velocity * velocity;
        }
        
        _recognizer = recognizer;
    }
    return self;
}

- (RNGestureHandlerState)state
{
    RNGestureHandlerState state = [super state];
    RNBetterPanGestureRecognizer *recognizer = (RNBetterPanGestureRecognizer*) self.recognizer;
    if (state == RNGestureHandlerStateActive && !recognizer.active) {
        return RNGestureHandlerStateBegan;
    } else if (state == RNGestureHandlerStateEnd && !recognizer.active) {
        return RNGestureHandlerStateFailed;
    }
    return state;
}

- (RNGestureHandlerEventExtraData *)eventExtraData:(id)recognizer
{
    return [RNGestureHandlerEventExtraData
            forPan:[recognizer locationInView:[recognizer view]]
            withTranslation:[recognizer translationInView:[recognizer view]]];
}

@end


#pragma mark TapGestureHandler

@interface RNBetterTapGestureRecognizer : UIGestureRecognizer

@property (nonatomic) NSUInteger numberOfTaps;
@property (nonatomic) NSTimeInterval maxDelay;
@property (nonatomic) NSTimeInterval maxDuration;

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler;

@end

@implementation RNBetterTapGestureRecognizer {
    __weak RNGestureHandler *_gestureHandler;
    NSUInteger _tapsSoFar;
}

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler
{
    if ((self = [super initWithTarget:gestureHandler action:@selector(handleGesture:)])) {
        _gestureHandler = gestureHandler;
        _tapsSoFar = 0;
        _numberOfTaps = 1;
        _maxDelay = 0.2;
        _maxDuration = NAN;
    }
    return self;
}

- (void)triggerAction
{
    [_gestureHandler handleGesture:self];
}

- (void)cancel
{
    self.enabled = NO;
}

- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
    [super touchesBegan:touches withEvent:event];
    _tapsSoFar++;
    if (_tapsSoFar) {
        [NSObject cancelPreviousPerformRequestsWithTarget:self selector:@selector(cancel) object:nil];
    }
    if (!isnan(_maxDuration)) {
        [self performSelector:@selector(cancel) withObject:nil afterDelay:_maxDuration];
    }
    self.state = UIGestureRecognizerStatePossible;
    [self triggerAction];
}

- (void)touchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
    [super touchesMoved:touches withEvent:event];
    
    if (self.state != UIGestureRecognizerStatePossible) {
        return;
    }
    
    if (_gestureHandler.shouldCancelWhenOutside) {
        CGPoint pt = [self locationInView:self.view];
        if (pt.x < 0. || pt.y < 0. || pt.x > self.view.frame.size.width || pt.y > self.view.frame.size.height) {
            self.state = UIGestureRecognizerStateFailed;
            [self triggerAction];
            [self reset];
            return;
        }
    }
    
    self.state = UIGestureRecognizerStatePossible;
    [self triggerAction];
}

- (void)touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
    [super touchesEnded:touches withEvent:event];
    if (_numberOfTaps == _tapsSoFar) {
        self.state = UIGestureRecognizerStateEnded;
        [self reset];
    } else {
        [self performSelector:@selector(cancel) withObject:nil afterDelay:_maxDelay];
    }
}

- (void)touchesCancelled:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
    [super touchesCancelled:touches withEvent:event];
    self.state = UIGestureRecognizerStateCancelled;
    [self reset];
}

- (BOOL)canBePreventedByGestureRecognizer:(UIGestureRecognizer *)preventingGestureRecognizer
{
    BOOL res = [super canBePreventedByGestureRecognizer:preventingGestureRecognizer];
    self.enabled = NO;
    return res;
}

- (void)reset
{
    if (self.state == UIGestureRecognizerStateFailed) {
        [self triggerAction];
    }
    [NSObject cancelPreviousPerformRequestsWithTarget:self selector:@selector(cancel) object:nil];
    _tapsSoFar = 0;
    self.enabled = YES;
    [super reset];
}

@end

@implementation RNTapGestureHandler

- (instancetype)initWithTag:(NSNumber *)tag
                     config:(NSDictionary<NSString *, id> *)config
{
    if ((self = [super initWithTag:tag config:config])) {
        RNBetterTapGestureRecognizer *recognizer = [[RNBetterTapGestureRecognizer alloc] initWithGestureHandler:self];
        
        id prop = config[@"numberOfTaps"];
        if (prop != nil) {
            recognizer.numberOfTaps = [RCTConvert NSUInteger:prop];
        }
        
        prop = config[@"maxDelayMs"];
        if (prop != nil) {
            recognizer.maxDelay = [RCTConvert CGFloat:prop] / 1000.0;
        }
        
        prop = config[@"maxDurationMs"];
        if (prop != nil) {
            recognizer.maxDuration = [RCTConvert CGFloat:prop] / 1000.0;
        }
        
        _recognizer = recognizer;
    }
    return self;
}

@end


#pragma mark LongPressGestureHandler

@implementation RNLongPressGestureHandler

- (instancetype)initWithTag:(NSNumber *)tag
                     config:(NSDictionary<NSString *, id> *)config
{
    if ((self = [super initWithTag:tag config:config])) {
        UILongPressGestureRecognizer *recognizer = [[UILongPressGestureRecognizer alloc] initWithTarget:self
                                                                                                action:@selector(handleGesture:)];
        
        id prop = config[@"minDurationMs"];
        if (prop != nil) {
            recognizer.minimumPressDuration = [RCTConvert CGFloat:prop] / 1000.0;
        }
        
        _recognizer = recognizer;
    }
    return self;
}

@end


#pragma mark NativeGestureHandler

@implementation RNNativeViewGestureHandler {
    BOOL _shouldActivateOnStart;
}

- (instancetype)initWithTag:(NSNumber *)tag
                     config:(NSDictionary<NSString *,id> *)config
{
    if ((self = [super initWithTag:tag config:config])) {
        _recognizer = nil;
        _shouldActivateOnStart = [RCTConvert BOOL:config[@"shouldActivateOnStart"]];
    }
    return self;
}

- (void)bindToView:(UIView *)view
{
}

@end

#pragma mark PinchGestureHandler

@implementation RNPinchGestureHandler

- (instancetype)initWithTag:(NSNumber *)tag
                     config:(NSDictionary<NSString *, id> *)config
{
    if ((self = [super initWithTag:tag config:config])) {
        _recognizer = [[UIPinchGestureRecognizer alloc] initWithTarget:self action:@selector(handleGesture:)];
    }
    return self;
}

- (RNGestureHandlerEventExtraData *)eventExtraData:(id)recognizer
{
    return [RNGestureHandlerEventExtraData
            forPinch:[(UIPinchGestureRecognizer *)recognizer scale]
            withVelocity:[(UIPinchGestureRecognizer *)recognizer velocity]];
}

@end
