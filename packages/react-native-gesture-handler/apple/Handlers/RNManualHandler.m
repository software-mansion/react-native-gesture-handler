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
  if ((self = [super initWithTarget:gestureHandler action:@selector(handleGesture:fromReset:)])) {
    _gestureHandler = gestureHandler;
    _shouldSendBeginEvent = YES;
  }

  return self;
}

- (void)interactionsBegan:(NSSet *)touches withEvent:(UIEvent *)event
{
  if (self.state == UIGestureRecognizerStatePossible && ![self.delegate gestureRecognizerShouldBegin:self]) {
    self.state = UIGestureRecognizerStateFailed;
    return;
  }

  [_gestureHandler.pointerTracker touchesBegan:touches withEvent:event];

  if (_shouldSendBeginEvent) {
    [_gestureHandler handleGesture:self fromReset:NO];
#if TARGET_OS_OSX
    self.state = NSGestureRecognizerStateBegan;
#endif
    _shouldSendBeginEvent = NO;
  }
}

- (void)interactionsMoved:(NSSet *)touches withEvent:(UIEvent *)event
{
  [_gestureHandler.pointerTracker touchesMoved:touches withEvent:event];
  [_gestureHandler handleGesture:self fromReset:NO];

  if ([self shouldFail]) {
    self.state = (self.state == UIGestureRecognizerStatePossible) ? UIGestureRecognizerStateFailed
                                                                  : UIGestureRecognizerStateCancelled;

    [self reset];
  }
}

- (void)interactionsEnded:(NSSet *)touches withEvent:(UIEvent *)event
{
  [_gestureHandler.pointerTracker touchesEnded:touches withEvent:event];
  [_gestureHandler handleGesture:self fromReset:NO];
}

#if !TARGET_OS_OSX
- (void)touchesBegan:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
  [_gestureHandler setCurrentPointerType:event];
  [super touchesBegan:touches withEvent:event];

  [self interactionsBegan:touches withEvent:event];
}

- (void)touchesMoved:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesMoved:touches withEvent:event];
  [self interactionsMoved:touches withEvent:event];
}

- (void)touchesEnded:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesEnded:touches withEvent:event];
  [self interactionsEnded:touches withEvent:event];
}

- (void)touchesCancelled:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesCancelled:touches withEvent:event];
  [_gestureHandler.pointerTracker touchesCancelled:touches withEvent:event];
}

#else

- (void)mouseDown:(NSEvent *)event
{
  [_gestureHandler setCurrentPointerTypeToMouse];
  [self interactionsBegan:[NSSet setWithObject:event] withEvent:event];
}

- (void)mouseDragged:(NSEvent *)event
{
  [self interactionsMoved:[NSSet setWithObject:event] withEvent:event];
}

- (void)mouseUp:(NSEvent *)event
{
  [self interactionsEnded:[NSSet setWithObject:event] withEvent:event];
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
