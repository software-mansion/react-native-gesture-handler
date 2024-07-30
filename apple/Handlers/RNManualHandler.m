#import "RNManualHandler.h"

#if !TARGET_OS_OSX
@interface RNManualRecognizer : UIGestureRecognizer
#else
@interface RNManualRecognizer : NSGestureRecognizer
#endif
- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler;

@end

@implementation RNManualRecognizer {
  __weak RNGestureHandler *_gestureHandler;
  BOOL _shouldSendBeginEvent;
}

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler
{
  if ((self = [super initWithTarget:gestureHandler action:@selector(handleGesture:)])) {
    _gestureHandler = gestureHandler;
    _shouldSendBeginEvent = YES;
  }

  return self;
}

#if !TARGET_OS_OSX
- (void)touchesBegan:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
  [_gestureHandler setCurrentPointerType:event];
  [super touchesBegan:touches withEvent:event];
  [_gestureHandler.pointerTracker touchesBegan:touches withEvent:event];

  if (_shouldSendBeginEvent) {
    [_gestureHandler handleGesture:self];
    _shouldSendBeginEvent = NO;
  }
}

- (void)touchesMoved:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesMoved:touches withEvent:event];
  [_gestureHandler.pointerTracker touchesMoved:touches withEvent:event];

  if ([self shouldFail]) {
    self.state = (self.state == UIGestureRecognizerStatePossible) ? UIGestureRecognizerStateFailed
                                                                  : UIGestureRecognizerStateCancelled;

    [self reset];
  }
}

- (void)touchesEnded:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesEnded:touches withEvent:event];
  [_gestureHandler.pointerTracker touchesEnded:touches withEvent:event];
}

- (void)touchesCancelled:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesCancelled:touches withEvent:event];
  [_gestureHandler.pointerTracker touchesCancelled:touches withEvent:event];
  [self reset];
}

#else

- (void)mouseDown:(NSEvent *)event
{
  [_gestureHandler setCurrentPointerTypeToMouse];
  [_gestureHandler.pointerTracker touchesBegan:[NSSet setWithObject:event] withEvent:event];

  if (_shouldSendBeginEvent) {
    [_gestureHandler handleGesture:self];
    self.state = NSGestureRecognizerStateBegan;
    _shouldSendBeginEvent = NO;
  }
}

- (void)mouseDragged:(NSEvent *)event
{
  [_gestureHandler.pointerTracker touchesMoved:[NSSet setWithObject:event] withEvent:event];
  [_gestureHandler handleGesture:self];

  if ([self shouldFail]) {
    self.state = (self.state == UIGestureRecognizerStatePossible) ? UIGestureRecognizerStateFailed
                                                                  : UIGestureRecognizerStateCancelled;

    [self reset];
  }
}

- (void)mouseUp:(NSEvent *)event
{
  [_gestureHandler.pointerTracker touchesEnded:[NSSet setWithObject:event] withEvent:event];
  [_gestureHandler handleGesture:self];
}

#endif

- (void)reset
{
  [_gestureHandler.pointerTracker reset];
  [super reset];
  [_gestureHandler reset];

  _shouldSendBeginEvent = YES;
}

- (BOOL)shouldFail
{
  return _gestureHandler.shouldCancelWhenOutside && ![_gestureHandler containsPointInView];
}

@end

@implementation RNManualGestureHandler

- (instancetype)initWithTag:(NSNumber *)tag
{
  if ((self = [super initWithTag:tag])) {
    _recognizer = [[RNManualRecognizer alloc] initWithGestureHandler:self];
  }

  return self;
}

@end
