//
//  RNRotationHandler.m
//  RNGestureHandler
//
//  Created by Krzysztof Magiera on 12/10/2017.
//  Copyright © 2017 Software Mansion. All rights reserved.
//

#import "RNRotationHandler.h"

#if !TARGET_OS_TV

#if TARGET_OS_OSX
@interface RNBetterRotationRecognizer : NSRotationGestureRecognizer {
  CGFloat prevRotation;
  NSTimeInterval prevTime;
}

@property (nonatomic, readonly) CGFloat velocity;
#else
@interface RNBetterRotationRecognizer : UIRotationGestureRecognizer
#endif

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler;

@end

@implementation RNBetterRotationRecognizer {
  __weak RNGestureHandler *_gestureHandler;
}

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler
{
  if ((self = [super initWithTarget:self action:@selector(handleGesture:fromReset:)])) {
    _gestureHandler = gestureHandler;
  }
#if TARGET_OS_OSX
  prevRotation = 0;
  prevTime = 0;
#endif
  return self;
}

- (void)handleGesture:(UIGestureRecognizer *)recognizer fromReset:(BOOL)fromReset
{
  if (self.state == UIGestureRecognizerStatePossible && ![self.delegate gestureRecognizerShouldBegin:self]) {
    self.state = UIGestureRecognizerStateFailed;
    return;
  }
  if (self.state == UIGestureRecognizerStateBegan) {
    self.rotation = 0;
  }
  [_gestureHandler handleGesture:recognizer fromReset:fromReset];
}

- (void)interactionsBegan:(NSSet *)touches withEvent:(UIEvent *)event
{
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
- (void)rotateWithEvent:(NSEvent *)event
{
  [super rotateWithEvent:event];

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

  _velocity = (self.rotation - prevRotation) / ((event.timestamp - prevTime) * 1000);
  prevRotation = self.rotation;
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

@implementation RNRotationGestureHandler

- (instancetype)initWithTag:(NSNumber *)tag
{
  if ((self = [super initWithTag:tag])) {
#if !TARGET_OS_TV
    _recognizer = [[RNBetterRotationRecognizer alloc] initWithGestureHandler:self];
#endif
  }
  return self;
}

#if !TARGET_OS_TV

#if TARGET_OS_OSX
- (RNGestureHandlerEventExtraData *)eventExtraData:(NSRotationGestureRecognizer *)recognizer
{
  return [RNGestureHandlerEventExtraData forRotation:-recognizer.rotation
                                     withAnchorPoint:[recognizer locationInView:recognizer.view]
                                        withVelocity:((RNBetterRotationRecognizer *)recognizer).velocity
                                 withNumberOfTouches:2
                                     withPointerType:RNGestureHandlerMouse];
}
#else
- (RNGestureHandlerEventExtraData *)eventExtraData:(UIRotationGestureRecognizer *)recognizer
{
  return [RNGestureHandlerEventExtraData forRotation:recognizer.rotation
                                     withAnchorPoint:[recognizer locationInView:recognizer.view]
                                        withVelocity:recognizer.velocity
                                 withNumberOfTouches:recognizer.numberOfTouches
                                     withPointerType:_pointerType];
}
#endif
#endif // !TARGET_OS_TV

@end
