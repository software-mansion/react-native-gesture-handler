#import "RNCustomHandler.h"
#import <UIKit/UIGestureRecognizerSubclass.h>
#import "RNGestureHandlerState.h"
#import <React/RCTConvert.h>

@interface RNCustomGestureRecognizer : UIGestureRecognizer

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler;
- (void)manageState:(UIGestureRecognizerState)state;
@end


@implementation RNCustomGestureRecognizer {
  __weak RNGestureHandler *_gestureHandler;
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

- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesBegan:touches withEvent:event];
  self.state = UIGestureRecognizerStatePossible;
  [self triggerAction];
}

- (void)touchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [self triggerAction];
  [super touchesMoved:touches withEvent:event];
  if (_gestureHandler.shouldCancelWhenOutside) {
    CGPoint pt = [self locationInView:self.view];
    if (!CGRectContainsPoint(self.view.bounds, pt)) {
      self.enabled = NO;
      self.enabled = YES;
    }
  }
}



- (void)touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
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
    case RNGestureHandlerStateBegan:
      return UIGestureRecognizerStateBegan;
    case RNGestureHandlerStateCancelled:
      return UIGestureRecognizerStateCancelled;
    case RNGestureHandlerStateActive:
      return UIGestureRecognizerStateChanged;
    case RNGestureHandlerStateFailed:
      return UIGestureRecognizerStateFailed;
    case RNGestureHandlerStateEnd:
      return UIGestureRecognizerStateEnded;
    default:
      return UIGestureRecognizerStatePossible; // not to be reached
  }
}

- (void)setState:(NSNumber *)state {
  [((RNCustomGestureRecognizer *)_recognizer) manageState:[self converToNativeState:[RCTConvert NSInteger:state]]];
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
