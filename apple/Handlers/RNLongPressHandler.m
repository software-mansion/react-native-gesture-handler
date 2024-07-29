//
//  RNLongPressHandler.m
//  RNGestureHandler
//
//  Created by Krzysztof Magiera on 12/10/2017.
//  Copyright © 2017 Software Mansion. All rights reserved.
//

#import "RNLongPressHandler.h"

#if !TARGET_OS_OSX

#import <UIKit/UIGestureRecognizerSubclass.h>

#import <React/RCTConvert.h>

@interface RNBetterLongPressGestureRecognizer : UILongPressGestureRecognizer {
#else
@interface RNBetterLongPressGestureRecognizer : NSGestureRecognizer {
  dispatch_block_t block;
#endif

  CFTimeInterval startTime;
  CFTimeInterval previousTime;
}

#if TARGET_OS_OSX
@property (nonatomic, assign) double minimumPressDuration;
@property (nonatomic, assign) double allowableMovement;
#endif

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler;
- (NSUInteger)getDuration;

#if !TARGET_OS_OSX
- (void)handleGesture:(UIGestureRecognizer *)recognizer;
#else
- (void)handleGesture:(NSGestureRecognizer *)recognizer;
#endif

@end

@implementation RNBetterLongPressGestureRecognizer {
  __weak RNGestureHandler *_gestureHandler;
  CGPoint _initPosition;
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
  previousTime = CACurrentMediaTime();
  [_gestureHandler handleGesture:recognizer];
}

- (void)triggerAction
{
  [self handleGesture:self];
}

- (CGPoint)translationInView
{
  CGPoint currentPosition = [self locationInView:self.view];
  return CGPointMake(currentPosition.x - _initPosition.x, currentPosition.y - _initPosition.y);
}

#if !TARGET_OS_OSX

- (void)touchesBegan:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
  [_gestureHandler setCurrentPointerType:event];
  [super touchesBegan:touches withEvent:event];
  [_gestureHandler.pointerTracker touchesBegan:touches withEvent:event];

  _initPosition = [self locationInView:self.view];
  startTime = CACurrentMediaTime();
  [_gestureHandler reset];
  [self triggerAction];
}

- (void)touchesMoved:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesMoved:touches withEvent:event];
  [_gestureHandler.pointerTracker touchesMoved:touches withEvent:event];

  CGPoint trans = [self translationInView];
  if ((_gestureHandler.shouldCancelWhenOutside && ![_gestureHandler containsPointInView]) ||
      (TEST_MAX_IF_NOT_NAN(
          fabs(trans.y * trans.y + trans.x * trans.x), self.allowableMovement * self.allowableMovement))) {
    self.enabled = NO;
    self.enabled = YES;
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
  self.state = NSGestureRecognizerStateBegan;
  startTime = CACurrentMediaTime();

  [_gestureHandler.pointerTracker touchesBegan:[NSSet setWithObject:event] withEvent:event];

  _initPosition = [self locationInView:self.view];

  __weak typeof(self) weakSelf = self;

  block = dispatch_block_create(0, ^{
    __strong typeof(self) strongSelf = weakSelf;

    if (strongSelf) {
      strongSelf.state = NSGestureRecognizerStateChanged;
      strongSelf.state = NSGestureRecognizerStateEnded;
    }
  });

  dispatch_after(
      dispatch_time(DISPATCH_TIME_NOW, (int64_t)(self.minimumPressDuration * NSEC_PER_SEC)),
      dispatch_get_main_queue(),
      block);
}

- (void)mouseDragged:(NSEvent *)event
{
  [_gestureHandler.pointerTracker touchesMoved:[NSSet setWithObject:event] withEvent:event];

  if (block == nil) {
    return;
  }

  CGPoint trans = [self translationInView];

  if ((_gestureHandler.shouldCancelWhenOutside && ![_gestureHandler containsPointInView]) ||
      (TEST_MAX_IF_NOT_NAN(
          fabs(trans.y * trans.y + trans.x * trans.x), self.allowableMovement * self.allowableMovement))) {
    dispatch_block_cancel(block);
    block = nil;

    [self failOrCancelGesture];
  }
}

- (void)mouseUp:(NSEvent *)event
{
  [_gestureHandler.pointerTracker touchesEnded:[NSSet setWithObject:event] withEvent:event];

  if (block) {
    dispatch_block_cancel(block);
    block = nil;
  }

  [self failOrCancelGesture];
}

- (void)failOrCancelGesture
{
  if (self.state == NSGestureRecognizerStateChanged) {
    self.state = NSGestureRecognizerStateCancelled;
  } else {
    self.state = NSGestureRecognizerStateFailed;
  }
}

#endif

- (void)reset
{
  if (self.state == UIGestureRecognizerStateFailed) {
    [self triggerAction];
  }

  [_gestureHandler.pointerTracker reset];

  [super reset];
  [_gestureHandler reset];
}

- (NSUInteger)getDuration
{
  return (previousTime - startTime) * 1000;
}

@end

@implementation RNLongPressGestureHandler

- (instancetype)initWithTag:(NSNumber *)tag
{
  if ((self = [super initWithTag:tag])) {
    _recognizer = [[RNBetterLongPressGestureRecognizer alloc] initWithGestureHandler:self];
  }
  return self;
}

- (void)resetConfig
{
  [super resetConfig];
  RNBetterLongPressGestureRecognizer *recognizer = (RNBetterLongPressGestureRecognizer *)_recognizer;

  recognizer.minimumPressDuration = 0.5;
  recognizer.allowableMovement = 10;
}

- (void)configure:(NSDictionary *)config
{
  [super configure:config];
  RNBetterLongPressGestureRecognizer *recognizer = (RNBetterLongPressGestureRecognizer *)_recognizer;

  id prop = config[@"minDurationMs"];
  if (prop != nil) {
    recognizer.minimumPressDuration = [RCTConvert CGFloat:prop] / 1000.0;
  }

  prop = config[@"maxDist"];
  if (prop != nil) {
    recognizer.allowableMovement = [RCTConvert CGFloat:prop];
  }
}

#if !TARGET_OS_OSX

- (RNGestureHandlerState)state
{
  // For long press recognizer we treat "Began" state as "active"
  // as it changes its state to "Began" as soon as the the minimum
  // hold duration timeout is reached, whereas state "Changed" is
  // only set after "Began" phase if there is some movement.
  if (_recognizer.state == UIGestureRecognizerStateBegan) {
    return RNGestureHandlerStateActive;
  }
  return [super state];
}

- (BOOL)gestureRecognizerShouldBegin:(UIGestureRecognizer *)gestureRecognizer
{
  // same as TapGH, this needs to be unified when all handlers are updated
  RNGestureHandlerState savedState = _lastState;
  BOOL shouldBegin = [super gestureRecognizerShouldBegin:gestureRecognizer];
  _lastState = savedState;

  return shouldBegin;
}

- (RNGestureHandlerEventExtraData *)eventExtraData:(UIGestureRecognizer *)recognizer
{
  return [RNGestureHandlerEventExtraData forPosition:[recognizer locationInView:recognizer.view]
                                withAbsolutePosition:[recognizer locationInView:recognizer.view.window]
                                 withNumberOfTouches:recognizer.numberOfTouches
                                        withDuration:[(RNBetterLongPressGestureRecognizer *)recognizer getDuration]
                                     withPointerType:_pointerType];
}

#else

- (RNGestureHandlerEventExtraData *)eventExtraData:(NSGestureRecognizer *)recognizer
{
  return [RNGestureHandlerEventExtraData forPosition:[recognizer locationInView:recognizer.view]
                                withAbsolutePosition:[recognizer locationInView:recognizer.view.window.contentView]
                                 withNumberOfTouches:1
                                        withDuration:[(RNBetterLongPressGestureRecognizer *)recognizer getDuration]
                                     withPointerType:RNGestureHandlerMouse];
}

#endif
@end
