#import "RNCustomHandler.h"
#import <UIKit/UIGestureRecognizerSubclass.h>
#import "RNGestureHandlerState.h"
#import <React/RCTConvert.h>


@implementation RNCustomGestureRecognizer {
  __weak RNGestureHandler *_gestureHandler;
  NSSet<UITouch *> *_lastTouches;
  UIEvent *_lastEvent;
}

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler
{
  if ((self = [super initWithTarget:gestureHandler action:@selector(handleGesture:)])) {
    _gestureHandler = gestureHandler;
  }
  return self;
}

- (void)manageState:(UIGestureRecognizerState)state;
{
  self.state = state;
  [self triggerAction];
}

- (void)triggerAction
{
  [_gestureHandler handleGesture:self];
  [_gestureHandler emitCustomEvent:self];
}

- (void) setState:(UIGestureRecognizerState)state {
  _fallbackState = state;
  [super setState:state];
}

- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  _lastEvent = event;
  _lastTouches = touches;
  [super touchesBegan:touches withEvent:event];
  self.state = UIGestureRecognizerStatePossible;
  [self triggerAction];
}

- (void)touchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  _lastEvent = event;
  _lastTouches = touches;
  [self triggerAction];
  [super touchesMoved:touches withEvent:event];
  if (_gestureHandler.shouldCancelWhenOutside) {
    CGPoint pt = [self locationInView:self.view];
    if (!CGRectContainsPoint(self.view.bounds, pt)) {
      self.state = UIGestureRecognizerStateFailed;
      [self triggerAction];
      [self reset];
      return;
    }
  }
}



- (void)touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  _lastEvent = event;
  _lastTouches = touches;
  [super touchesEnded:touches withEvent:event];
  if (self.state == UIGestureRecognizerStateChanged || self.state == UIGestureRecognizerStatePossible) {
    self.state = UIGestureRecognizerStateFailed;
  }
  
  [self triggerAction];
}

- (void)reset
{
  self.enabled = YES;
  [super reset];
  
}
@end

@implementation RNCustomGestureHandler
- (UIGestureRecognizerState) converToNativeState:(NSInteger) state
{
  switch (state) {
    case RNGestureHandlerStateCancelled:
      return UIGestureRecognizerStateCancelled;
    case RNGestureHandlerStateActive:
      return UIGestureRecognizerStateChanged;
    case RNGestureHandlerStateFailed:
      return UIGestureRecognizerStateFailed;
    case RNGestureHandlerStateEnd:
      return UIGestureRecognizerStateEnded;
    default:
      RCTLogError(@"It's not possible to set this state manually");
      return UIGestureRecognizerStatePossible; // not to be reached
  }
}

- (void)setState:(NSNumber *)state {
  @synchronized(self) {
    [((RNCustomGestureRecognizer *)_recognizer) manageState:[self converToNativeState:[RCTConvert NSInteger:state]]];
  }
}

- (void)handleGesture:(UIGestureRecognizer *)recognizer {
  [super handleGesture:recognizer];
}

- (instancetype)initWithTag:(NSNumber *)tag
{
  if ((self = [super initWithTag:tag])) {
    _recognizer = [[RNCustomGestureRecognizer alloc] initWithGestureHandler:self];
  }
  return self;
}

- (void)configure:(NSDictionary *)config
{
  [super configure:config];
}


@end
