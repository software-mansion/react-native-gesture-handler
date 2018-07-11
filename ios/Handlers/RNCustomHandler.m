#import "RNCustomHandler.h"
#import <UIKit/UIGestureRecognizerSubclass.h>
#import "RNGestureHandlerState.h"
#import <React/RCTConvert.h>

@interface RNCustomGestureRecognizer : UIGestureRecognizer

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler;
@property (nonatomic) UIGestureRecognizerState stateToBeSet;
@end


@implementation RNCustomGestureRecognizer {
  __weak RNGestureHandler *_gestureHandler;
}

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler
{
  if ((self = [super initWithTarget:gestureHandler action:@selector(handleGesture:)])) {
    _gestureHandler = gestureHandler;
    _stateToBeSet = UIGestureRecognizerStatePossible;
  }
  return self;
}

- (void)manageState
{
  if (_stateToBeSet != self.state) {
    self.state = _stateToBeSet;
  }
}

- (void)triggerAction
{
  if (_stateToBeSet != self.state) {
    self.state = _stateToBeSet;
  }
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
  [super touchesMoved:touches withEvent:event];
  if (_gestureHandler.shouldCancelWhenOutside) {
    CGPoint pt = [self locationInView:self.view];
    if (!CGRectContainsPoint(self.view.bounds, pt)) {
      self.enabled = NO;
      self.enabled = YES;
    }
  }
  [self triggerAction];
}



- (void)touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesEnded:touches withEvent:event];
}

- (void)reset
{
  self.enabled = YES;
  self.stateToBeSet = UIGestureRecognizerStatePossible;
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
  ((RNCustomGestureRecognizer *)_recognizer).stateToBeSet = [self converToNativeState:[RCTConvert NSInteger:state]];
  if (self.state == RNGestureHandlerStateCancelled || self.state == RNGestureHandlerStateFailed)
  {
 // [(RNCustomGestureRecognizer *)_recognizer triggerAction];
  }
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
