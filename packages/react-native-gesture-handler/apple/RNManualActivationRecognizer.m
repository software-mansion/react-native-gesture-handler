#import "RNManualActivationRecognizer.h"
#import "RNGestureHandler.h"

@implementation RNManualActivationRecognizer {
  __weak RNGestureHandler *_handler;
  int _activePointers;
}

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler
{
  if ((self = [super initWithTarget:self action:@selector(handleGesture:)])) {
    _handler = gestureHandler;
    _activePointers = 0;
    self.delegate = self;
#if !TARGET_OS_OSX
    self.cancelsTouchesInView = NO;
#endif
  }
  return self;
}

- (void)handleGesture:(UIGestureRecognizer *)recognizer
{
  if (recognizer.state == UIGestureRecognizerStateBegan) {
#if TARGET_OS_OSX
    // On iOS, this recognizer completing is enough to deny the handler's recognizer —
    // UIKit fails a recognizer whose required-to-fail dependency recognizes. AppKit
    // does not do this reliably: completing the blocker can flush the dependent
    // recognizer's buffered recognition instead of discarding it.
    _handler.recognizer.state = UIGestureRecognizerStateFailed;
#endif
    self.state = UIGestureRecognizerStateEnded;
    [self reset];
  }
}

#if TARGET_OS_OSX
- (void)mouseDown:(NSEvent *)event
{
  [super mouseDown:event];

  _activePointers += 1;
}

- (void)mouseUp:(NSEvent *)event
{
  [super mouseUp:event];

  _activePointers -= 1;

  if (_activePointers == 0) {
    self.state = UIGestureRecognizerStateBegan;
  }
}

#else

- (void)touchesBegan:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesBegan:touches withEvent:event];

  _activePointers += touches.count;
}

- (void)touchesEnded:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesEnded:touches withEvent:event];

  _activePointers -= touches.count;

  if (_activePointers == 0) {
    self.state = UIGestureRecognizerStateBegan;
  }
}

- (void)touchesCancelled:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesCancelled:touches withEvent:event];

  _activePointers = 0;
  self.state = UIGestureRecognizerStateCancelled;
  [self reset];
}

#endif

- (void)reset
{
  self.enabled = YES;
  _activePointers = 0;
  [super reset];
}

- (void)fail
{
  self.enabled = NO;
}

- (BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer
    shouldRecognizeSimultaneouslyWithGestureRecognizer:(UIGestureRecognizer *)otherGestureRecognizer
{
  return YES;
}

- (BOOL)shouldBeRequiredToFailByGestureRecognizer:(UIGestureRecognizer *)otherGestureRecognizer
{
  RNGestureHandler *handler = [RNGestureHandler findGestureHandlerByRecognizer:otherGestureRecognizer];
  if (handler != nil) {
    if (handler.tag == _handler.tag) {
      return YES;
    }
  }

  return NO;
}

#if TARGET_OS_OSX
// On iOS the method above is a UIGestureRecognizer subclass override, called by the system
// to establish the failure requirement. NSGestureRecognizer has no such subclass hook —
// AppKit only consults the delegate, so forward the delegate callback to the shared logic.
- (BOOL)gestureRecognizer:(NSGestureRecognizer *)gestureRecognizer
    shouldBeRequiredToFailByGestureRecognizer:(NSGestureRecognizer *)otherGestureRecognizer
{
  return [self shouldBeRequiredToFailByGestureRecognizer:otherGestureRecognizer];
}
#endif

@end
