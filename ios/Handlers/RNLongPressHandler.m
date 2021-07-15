//
//  RNLongPressHandler.m
//  RNGestureHandler
//
//  Created by Krzysztof Magiera on 12/10/2017.
//  Copyright © 2017 Software Mansion. All rights reserved.
//

#import "RNLongPressHandler.h"

#import <UIKit/UIGestureRecognizerSubclass.h>

#import <React/RCTConvert.h>

@interface RNBetterLongPressGestureRecognizer : UILongPressGestureRecognizer {
  double startTime;
}

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler;
- (void)handle:(UIGestureRecognizer *)recognizer;
- (NSUInteger) getDuration;

@end

@implementation RNBetterLongPressGestureRecognizer {
  __weak RNGestureHandler *_gestureHandler;
}

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler
{
  if ((self = [super initWithTarget:self action:@selector(handle:)])) {
    _gestureHandler = gestureHandler;
  }
  return self;
}

- (void)handle:(UIGestureRecognizer *)recognizer
{
  if (recognizer.state == UIGestureRecognizerStateBegan) {
    startTime = [NSDate timeIntervalSinceReferenceDate];
  }

  [_gestureHandler handleGesture:recognizer];
}

- (void)touchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesMoved:touches withEvent:event];
  if (_gestureHandler.shouldCancelWhenOutside && ![_gestureHandler containsPointInView]) {
    self.enabled = NO;
    self.enabled = YES;
  }
}

- (NSUInteger)getDuration
{
  return (NSUInteger)(([NSDate timeIntervalSinceReferenceDate] - startTime + self.minimumPressDuration) * 1000);
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
  UILongPressGestureRecognizer *recognizer = (UILongPressGestureRecognizer *)_recognizer;
  
  recognizer.minimumPressDuration = 0.5;
  recognizer.allowableMovement = 10;
}

- (void)configure:(NSDictionary *)config
{
  [super configure:config];
  UILongPressGestureRecognizer *recognizer = (UILongPressGestureRecognizer *)_recognizer;
  
  id prop = config[@"minDurationMs"];
  if (prop != nil) {
    recognizer.minimumPressDuration = [RCTConvert CGFloat:prop] / 1000.0;
  }
  
  prop = config[@"maxDist"];
  if (prop != nil) {
    recognizer.allowableMovement = [RCTConvert CGFloat:prop];
  }
}

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

- (RNGestureHandlerEventExtraData *)eventExtraData:(UIGestureRecognizer *)recognizer
{
    return [RNGestureHandlerEventExtraData
            forPosition:[recognizer locationInView:recognizer.view]
            withAbsolutePosition:[recognizer locationInView:recognizer.view.window]
            withNumberOfTouches:recognizer.numberOfTouches
            withDuration:[(RNBetterLongPressGestureRecognizer*)recognizer getDuration]];
}
@end

