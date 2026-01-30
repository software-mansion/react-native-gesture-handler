

//
//  RNPinchHandler.m
//  RNGestureHandler
//
//  Created by Krzysztof Magiera on 12/10/2017.
//  Copyright © 2017 Software Mansion. All rights reserved.
//

#import "RNPinchHandler.h"

#if !TARGET_OS_TV

#if TARGET_OS_OSX
@interface RNBetterPinchRecognizer : NSMagnificationGestureRecognizer {
  CGFloat prevMagnification;
  NSTimeInterval prevTime;
}

@property (nonatomic, readonly) CGFloat velocity;
#else
@interface RNBetterPinchRecognizer : UIPinchGestureRecognizer
#endif

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler;

@end

@implementation RNBetterPinchRecognizer {
  __weak RNGestureHandler *_gestureHandler;
}

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler
{
  if ((self = [super initWithTarget:self action:@selector(handleGesture:fromReset:)])) {
    _gestureHandler = gestureHandler;
  }
#if TARGET_OS_OSX
  prevMagnification = 0;
  prevTime = 0;
#endif
  return self;
}

- (void)handleGesture:(UIGestureRecognizer *)recognizer fromReset:(BOOL)fromReset
{
  if (self.state == UIGestureRecognizerStateBegan) {
#if TARGET_OS_OSX
    self.magnification = 1;
#else
    self.scale = 1;
#endif
  }
  [_gestureHandler handleGesture:recognizer fromReset:fromReset];
}

- (void)interactionsBegan:(NSSet *)touches withEvent:(UIEvent *)event
{
  if (self.state == UIGestureRecognizerStatePossible && ![self.delegate gestureRecognizerShouldBegin:self]) {
    self.state = UIGestureRecognizerStateFailed;
    return;
  }

  [_gestureHandler.pointerTracker touchesBegan:touches withEvent:event];
}

- (void)interactionsMoved:(NSSet *)touches withEvent:(UIEvent *)event
{
  [_gestureHandler.pointerTracker touchesMoved:touches withEvent:event];
}

- (void)interactionsEnded:(NSSet *)touches withEvent:(UIEvent *)event
{
  [_gestureHandler.pointerTracker touchesEnded:touches withEvent:event];
}

- (void)interactionsCancelled:(NSSet *)touches withEvent:(UIEvent *)event
{
  [_gestureHandler.pointerTracker touchesCancelled:touches withEvent:event];
}

#if TARGET_OS_OSX
- (void)magnifyWithEvent:(NSEvent *)event
{
  [super magnifyWithEvent:event];

  switch (self.state) {
    case NSGestureRecognizerStateBegan:
      [_gestureHandler setCurrentPointerTypeToMouse];
      [self interactionsBegan:[NSSet setWithObject:event] withEvent:event];
      break;
    case NSGestureRecognizerStateChanged:
      [self interactionsMoved:[NSSet setWithObject:event] withEvent:event];
      break;
    case NSGestureRecognizerStateEnded:
      [self interactionsEnded:[NSSet setWithObject:event] withEvent:event];
      break;
    case NSGestureRecognizerStateCancelled:
      [self interactionsCancelled:[NSSet setWithObject:event] withEvent:event];
      break;
  }

  _velocity = (self.magnification - prevMagnification) / ((event.timestamp - prevTime) * 1000);
  prevMagnification = self.magnification;
  prevTime = event.timestamp;
}
#else
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
  [self interactionsCancelled:touches withEvent:event];
}
#endif

- (void)reset
{
  [_gestureHandler.pointerTracker reset];
  [super reset];
  [_gestureHandler reset];
}

@end
#endif

@implementation RNPinchGestureHandler

- (instancetype)initWithTag:(NSNumber *)tag
{
  if ((self = [super initWithTag:tag])) {
#if !TARGET_OS_TV
    _recognizer = [[RNBetterPinchRecognizer alloc] initWithGestureHandler:self];
#endif
  }
  return self;
}

#if !TARGET_OS_TV

#if TARGET_OS_OSX
- (RNGestureHandlerEventExtraData *)eventExtraData:(NSMagnificationGestureRecognizer *)recognizer
{
  return [RNGestureHandlerEventExtraData forPinch:recognizer.magnification
                                   withFocalPoint:[recognizer locationInView:recognizer.view]
                                     withVelocity:((RNBetterPinchRecognizer *)recognizer).velocity
                              withNumberOfTouches:2
                                  withPointerType:RNGestureHandlerMouse];
}
#else
- (RNGestureHandlerEventExtraData *)eventExtraData:(UIPinchGestureRecognizer *)recognizer
{
  CGPoint focalPoint;
  NSUInteger numberOfTouches = recognizer.numberOfTouches;

  if (numberOfTouches > 0) {
    CGPoint accumulatedPoint = CGPointZero;

    for (int i = 0; i < numberOfTouches; i++) {
      CGPoint location = [recognizer locationOfTouch:i inView:recognizer.view];
      accumulatedPoint.x += location.x;
      accumulatedPoint.y += location.y;
    }

    focalPoint = CGPointMake(accumulatedPoint.x / numberOfTouches, accumulatedPoint.y / numberOfTouches);
  } else {
    // Trackpad pinch gestures may report 0 touches - use the recognizer's location instead
    focalPoint = [recognizer locationInView:recognizer.view];
  }

  return [RNGestureHandlerEventExtraData forPinch:recognizer.scale
                                   withFocalPoint:focalPoint
                                     withVelocity:recognizer.velocity
                              withNumberOfTouches:numberOfTouches
                                  withPointerType:_pointerType];
}
#endif
#endif // !TARGET_OS_TV

@end
