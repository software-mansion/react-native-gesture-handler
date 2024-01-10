

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
@interface RNBetterPinchRecognizer : NSMagnificationGestureRecognizer
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
  if ((self = [super initWithTarget:self action:@selector(handleGesture:)])) {
    _gestureHandler = gestureHandler;
  }
  return self;
}

- (void)handleGesture:(UIGestureRecognizer *)recognizer
{
  if (self.state == UIGestureRecognizerStateBegan) {
#if TARGET_OS_OSX
    self.magnification = 1;
#else
    self.scale = 1;
#endif
  }
  [_gestureHandler handleGesture:recognizer];
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
- (void)touchesBeganWithEvent:(NSEvent *)event
{
  [super touchesBeganWithEvent:event];
  [self interactionsBegan:[NSSet setWithObject:event] withEvent:event];
}

- (void)touchesMovedWithEvent:(NSEvent *)event
{
  [super touchesMovedWithEvent:event];
  [self interactionsMoved:[NSSet setWithObject:event] withEvent:event];
}

- (void)touchesEndedWithEvent:(NSEvent *)event
{
  [super touchesEndedWithEvent:event];
  [self interactionsEnded:[NSSet setWithObject:event] withEvent:event];
}

- (void)touchesCancelledWithEvent:(NSEvent *)event
{
  [super touchesCancelledWithEvent:event];
  [self interactionsCancelled:[NSSet setWithObject:event] withEvent:event];
}
#else
- (void)touchesBegan:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
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
                                     withVelocity:1
                              withNumberOfTouches:2];
}
#else
- (RNGestureHandlerEventExtraData *)eventExtraData:(UIPinchGestureRecognizer *)recognizer
{
  return [RNGestureHandlerEventExtraData forPinch:recognizer.scale
                                   withFocalPoint:[recognizer locationInView:recognizer.view]
                                     withVelocity:recognizer.velocity
                              withNumberOfTouches:recognizer.numberOfTouches];
}
#endif
#endif // !TARGET_OS_TV

@end
