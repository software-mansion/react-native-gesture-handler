#import "RNFlingHandler.h"

#if !TARGET_OS_OSX

@interface RNBetterSwipeGestureRecognizer : UISwipeGestureRecognizer

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler;

@end

@implementation RNBetterSwipeGestureRecognizer {
  __weak RNGestureHandler *_gestureHandler;
  CGPoint _lastPoint; // location of the most recently updated touch, relative to the view
  bool _hasBegan; // whether the `BEGAN` event has been sent
}

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler
{
  if ((self = [super initWithTarget:gestureHandler action:@selector(handleGesture:)])) {
    _gestureHandler = gestureHandler;
    _lastPoint = CGPointZero;
    _hasBegan = NO;
  }
  return self;
}

- (void)touchesBegan:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
  [_gestureHandler setCurrentPointerType:event];
  _lastPoint = [[[touches allObjects] objectAtIndex:0] locationInView:_gestureHandler.recognizer.view];
  [_gestureHandler reset];
  [super touchesBegan:touches withEvent:event];
  [_gestureHandler.pointerTracker touchesBegan:touches withEvent:event];

  // self.numberOfTouches doesn't work for this because in case than one finger is required,
  // when holding one finger on the screen and tapping with the second one, numberOfTouches is equal
  // to 2 only for the first tap but 1 for all the following ones
  if (!_hasBegan) {
    [self triggerAction];
    _hasBegan = YES;
  }
}

- (void)touchesMoved:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
  _lastPoint = [[[touches allObjects] objectAtIndex:0] locationInView:_gestureHandler.recognizer.view];
  [super touchesMoved:touches withEvent:event];
  [_gestureHandler.pointerTracker touchesMoved:touches withEvent:event];
}

- (void)touchesEnded:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
  _lastPoint = [[[touches allObjects] objectAtIndex:0] locationInView:_gestureHandler.recognizer.view];
  [super touchesEnded:touches withEvent:event];
  [_gestureHandler.pointerTracker touchesEnded:touches withEvent:event];
}

- (void)touchesCancelled:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
  _lastPoint = [[[touches allObjects] objectAtIndex:0] locationInView:_gestureHandler.recognizer.view];
  [super touchesCancelled:touches withEvent:event];
  [_gestureHandler.pointerTracker touchesCancelled:touches withEvent:event];
  [self reset];
}

- (void)triggerAction
{
  [_gestureHandler handleGesture:self];
}

- (void)reset
{
  [self triggerAction];
  [_gestureHandler.pointerTracker reset];
  _hasBegan = NO;
  [super reset];
  [_gestureHandler reset];
}

- (CGPoint)getLastLocation
{
  // I think keeping the location of only one touch is enough since it would be used to determine the direction
  // of the movement, and if it's wrong the recognizer fails anyway.
  // In case the location of all touches is required, touch events are the way to go
  return _lastPoint;
}

@end

#else

@interface RNBetterSwipeGestureRecognizer : NSGestureRecognizer {
  dispatch_block_t failFlingAction;
  int maxDuration;
  int minVelocity;
  double defaultAlignmentCone;
  double axialDeviationCosine;
  double diagonalDeviationCosine;
}

@property (atomic, assign) RNGestureHandlerDirection direction;
@property (atomic, assign) int numberOfTouchesRequired;

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler;

@end

@implementation RNBetterSwipeGestureRecognizer {
  __weak RNGestureHandler *_gestureHandler;

  NSPoint startPosition;
  double startTime;
}

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler
{
  if ((self = [super initWithTarget:self action:@selector(handleGesture:)])) {
    _gestureHandler = gestureHandler;

    maxDuration = 1.0;
    minVelocity = 700;

    defaultAlignmentCone = 30;
    axialDeviationCosine = [self coneToDeviation:defaultAlignmentCone];
    diagonalDeviationCosine = [self coneToDeviation:(90 - defaultAlignmentCone)];
  }
  return self;
}

- (void)handleGesture:(NSPanGestureRecognizer *)gestureRecognizer
{
  [_gestureHandler handleGesture:self];
}

- (void)mouseDown:(NSEvent *)event
{
  [super mouseDown:event];

  startPosition = [self locationInView:self.view];
  startTime = CACurrentMediaTime();

  self.state = NSGestureRecognizerStatePossible;

  __weak typeof(self) weakSelf = self;

  failFlingAction = dispatch_block_create(0, ^{
    __strong typeof(self) strongSelf = weakSelf;

    if (strongSelf) {
      strongSelf.state = NSGestureRecognizerStateFailed;
    }
  });

  dispatch_after(
      dispatch_time(DISPATCH_TIME_NOW, (int64_t)(maxDuration * NSEC_PER_SEC)),
      dispatch_get_main_queue(),
      failFlingAction);
}

- (void)mouseDragged:(NSEvent *)event
{
  [super mouseDragged:event];

  NSPoint currentPosition = [self locationInView:self.view];
  double currentTime = CACurrentMediaTime();

  NSPoint distance;
  distance.x = currentPosition.x - startPosition.x;
  distance.y = startPosition.y - currentPosition.y;

  double timeDelta = currentTime - startTime;

  Vector *velocityVector = [Vector fromVelocityX:(distance.x / timeDelta) withVelocityY:(distance.y / timeDelta)];

  [self tryActivate:velocityVector];
}

- (void)mouseUp:(NSEvent *)event
{
  [super mouseUp:event];

  dispatch_block_cancel(failFlingAction);

  self.state =
      self.state == NSGestureRecognizerStateChanged ? NSGestureRecognizerStateEnded : NSGestureRecognizerStateFailed;
}

- (void)tryActivate:(Vector *)velocityVector
{
  bool isAligned = NO;

  for (int i = 0; i < directionsSize; ++i) {
    if ([self getAlignment:axialDirections[i]
            withMinimalAlignmentCosine:axialDeviationCosine
                    withVelocityVector:velocityVector]) {
      isAligned = YES;
      break;
    }
  }

  if (!isAligned) {
    for (int i = 0; i < directionsSize; ++i) {
      if ([self getAlignment:diagonalDirections[i]
              withMinimalAlignmentCosine:diagonalDeviationCosine
                      withVelocityVector:velocityVector]) {
        isAligned = YES;
        break;
      }
    }
  }

  bool isFastEnough = velocityVector.magnitude >= minVelocity;

  if (isAligned && isFastEnough) {
    self.state = NSGestureRecognizerStateChanged;
  }
}

- (BOOL)getAlignment:(RNGestureHandlerDirection)direction
    withMinimalAlignmentCosine:(double)minimalAlignmentCosine
            withVelocityVector:(Vector *)velocityVector
{
  Vector *directionVector = [Vector fromDirection:direction];
  return ((self.direction & direction) == direction) &&
      [velocityVector isSimilar:directionVector withThreshold:minimalAlignmentCosine];
}

- (double)coneToDeviation:(double)degrees
{
  double radians = (degrees * M_PI) / 180;
  return cos(radians / 2);
}

@end

#endif

@implementation RNFlingGestureHandler

- (instancetype)initWithTag:(NSNumber *)tag
{
  if ((self = [super initWithTag:tag])) {
    _recognizer = [[RNBetterSwipeGestureRecognizer alloc] initWithGestureHandler:self];
  }
  return self;
}

- (void)resetConfig
{
  [super resetConfig];
  RNBetterSwipeGestureRecognizer *recognizer = (RNBetterSwipeGestureRecognizer *)_recognizer;
  recognizer.direction = RNGestureHandlerDirectionRight;
#if !TARGET_OS_TV
  recognizer.numberOfTouchesRequired = 1;
#endif
}

- (void)configure:(NSDictionary *)config
{
  [super configure:config];
  RNBetterSwipeGestureRecognizer *recognizer = (RNBetterSwipeGestureRecognizer *)_recognizer;

  id prop = config[@"direction"];
  if (prop != nil) {
    recognizer.direction = [RCTConvert NSInteger:prop];
  }

#if !TARGET_OS_TV
  prop = config[@"numberOfPointers"];
  if (prop != nil) {
    recognizer.numberOfTouchesRequired = [RCTConvert NSInteger:prop];
  }
#endif
}

#if !TARGET_OS_OSX
- (BOOL)gestureRecognizerShouldBegin:(UIGestureRecognizer *)gestureRecognizer
{
  RNGestureHandlerState savedState = _lastState;
  BOOL shouldBegin = [super gestureRecognizerShouldBegin:gestureRecognizer];
  _lastState = savedState;

  return shouldBegin;
}

- (RNGestureHandlerEventExtraData *)eventExtraData:(id)_recognizer
{
  // For some weird reason [recognizer locationInView:recognizer.view.window] returns (0, 0).
  // To calculate the correct absolute position, first calculate the absolute position of the
  // view inside the root view controller (https://stackoverflow.com/a/7448573) and then
  // add the relative touch position to it.

  RNBetterSwipeGestureRecognizer *recognizer = (RNBetterSwipeGestureRecognizer *)_recognizer;

  CGPoint viewAbsolutePosition = [recognizer.view convertPoint:recognizer.view.bounds.origin
                                                        toView:RCTKeyWindow().rootViewController.view];
  CGPoint locationInView = [recognizer getLastLocation];

  return [RNGestureHandlerEventExtraData
               forPosition:locationInView
      withAbsolutePosition:CGPointMake(
                               viewAbsolutePosition.x + locationInView.x, viewAbsolutePosition.y + locationInView.y)
       withNumberOfTouches:recognizer.numberOfTouches
           withPointerType:_pointerType];
}
#endif

@end
