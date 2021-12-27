//
//  RNRotationHandler.m
//  RNGestureHandler
//
//  Created by Krzysztof Magiera on 12/10/2017.
//  Copyright © 2017 Software Mansion. All rights reserved.
//

#import "RNRotationHandler.h"

@interface RNBetterRotationRecognizer : UIRotationGestureRecognizer

@property (nonatomic, readonly) CGFloat change;

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler;

@end

@implementation RNBetterRotationRecognizer {
  __weak RNGestureHandler *_gestureHandler;
  CGFloat _previousRotation;
}

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler
{
  if ((self = [super initWithTarget:self action:@selector(handleGesture:)])) {
    _gestureHandler = gestureHandler;
    _previousRotation = 0;
  }
  return self;
}

- (void)handleGesture:(UIGestureRecognizer *)recognizer
{
  if (self.state == UIGestureRecognizerStateBegan) {
    self.rotation = 0;
    _previousRotation = 0;
  }
  [_gestureHandler handleGesture:recognizer];
  
  _previousRotation = self.rotation;
}

- (CGFloat)change
{
  return self.rotation - _previousRotation;
}

- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesBegan:touches withEvent:event];
  [_gestureHandler.pointerTracker touchesBegan:touches withEvent:event];
}

- (void)touchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesMoved:touches withEvent:event];
  [_gestureHandler.pointerTracker touchesMoved:touches withEvent:event];
}

- (void)touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesEnded:touches withEvent:event];
  [_gestureHandler.pointerTracker touchesEnded:touches withEvent:event];
}

- (void)touchesCancelled:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesCancelled:touches withEvent:event];
  [_gestureHandler.pointerTracker touchesCancelled:touches withEvent:event];
}

- (void)reset
{
  [_gestureHandler.pointerTracker reset];
  [super reset];
  _previousRotation = 0;
}

@end

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
- (RNGestureHandlerEventExtraData *)eventExtraData:(RNBetterRotationRecognizer *)recognizer
{
    return [RNGestureHandlerEventExtraData
            forRotation:recognizer.rotation
            withRotationChange:recognizer.change
            withAnchorPoint:[recognizer locationInView:recognizer.view]
            withVelocity:recognizer.velocity
            withNumberOfTouches:recognizer.numberOfTouches];
}
#endif

@end

