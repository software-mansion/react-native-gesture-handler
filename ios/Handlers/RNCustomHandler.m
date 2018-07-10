//
//  RNCustomHandler.m
//  RNGestureHandler
//
//  Created by Michał Osadnik on 10.07.2018.
//  Copyright © 2018 Software Mansion. All rights reserved.
//

#import "RNCustomHandler.h"
#import <UIKit/UIGestureRecognizerSubclass.h>

@interface RNCustomGestureRecognizer : UIPanGestureRecognizer

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler;

@end


@implementation RNCustomGestureRecognizer {
  __weak RNGestureHandler *_gestureHandler;
}

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler
{
  if ((self = [super initWithTarget:gestureHandler action:@selector(handleGesture:)])) {
    _gestureHandler = gestureHandler;
  }
  return self;
}

- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  super.minimumNumberOfTouches = 20; // prevent "normal" activating
  [super touchesBegan:touches withEvent:event];
  self.state = -1; // undetermined
}

- (void)touchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [_gestureHandler emitCustomEvent:self];
  [super touchesMoved:touches withEvent:event];
  if (_gestureHandler.shouldCancelWhenOutside) {
    CGPoint pt = [self locationInView:self.view];
    if (!CGRectContainsPoint(self.view.bounds, pt)) {
      self.enabled = NO;
      self.enabled = YES;
    }
  }
  
}



- (void)touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesEnded:touches withEvent:event];
}

- (void)reset
{
  self.enabled = YES;
  [super reset];
}
@end

@implementation RNCustomGestureHandler
- (void)setState:(NSNumber *)state {
  
}
- (instancetype)initWithTag:(NSNumber *)tag
{
  if ((self = [super initWithTag:tag])) {
    _recognizer = [[RNCustomGestureRecognizer alloc] initWithGestureHandler:self];
  }
  return self;
}

- (void)configure:(NSDictionary *)config
{
  [super configure:config];
}


@end
