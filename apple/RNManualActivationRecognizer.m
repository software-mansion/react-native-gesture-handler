#import "RNManualActivationRecognizer.h"
#import "RNGestureHandler.h"

@implementation RNManualActivationRecognizer {
  RNGestureHandler *_handler;
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
    self.state = UIGestureRecognizerStateEnded;
    [self reset];
  }
}

#if TARGET_OS_OSX
- (void)mouseUp:(NSEvent *)event
{
  [super mouseUp:event];

  _activePointers -= 1;
}

- (void)mouseDown:(NSEvent *)event
{
  [super mouseDown:event];

  _activePointers += 1;

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
  [self reset];
}

#endif

- (void)reset
{
  self.enabled = YES;
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

@end
