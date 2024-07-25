#import "RNManualHandler.h"

#if !TARGET_OS_OSX

@interface RNManualRecognizer : UIGestureRecognizer

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

- (void)reset
{
  [_gestureHandler.pointerTracker reset];
  [super reset];
  [_gestureHandler reset];

  _shouldSendBeginEvent = YES;
}

- (BOOL)shouldFail
{
  if (_gestureHandler.shouldCancelWhenOutside && ![_gestureHandler containsPointInView]) {
    return YES;
  } else {
    return NO;
  }
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

#else

@implementation RNManualGestureHandler

- (instancetype)initWithTag:(NSNumber *)tag
{
  RCTLogWarn(@"ManualGestureHandler is not supported on macOS");
  if ((self = [super initWithTag:tag])) {
    _recognizer = [NSGestureRecognizer alloc];
  }
  return self;
}

@end

#endif
