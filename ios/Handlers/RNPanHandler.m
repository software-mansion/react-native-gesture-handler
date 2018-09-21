//
//  RNPanHandler.m
//  RNGestureHandler
//
//  Created by Krzysztof Magiera on 12/10/2017.
//  Copyright © 2017 Software Mansion. All rights reserved.
//

#import "RNPanHandler.h"

#import <UIKit/UIGestureRecognizerSubclass.h>

@interface RNBetterPanGestureRecognizer : UIPanGestureRecognizer

@property (nonatomic) CGFloat minDistSq;
@property (nonatomic) CGFloat minVelocityX;
@property (nonatomic) CGFloat minVelocityY;
@property (nonatomic) CGFloat minVelocitySq;
@property (nonatomic) CGFloat minOffsetRangeStartX;
@property (nonatomic) CGFloat minOffsetRangeEndX;
@property (nonatomic) CGFloat maxOffsetRangeStartX;
@property (nonatomic) CGFloat maxOffsetRangeEndX;
@property (nonatomic) CGFloat minOffsetRangeStartY;
@property (nonatomic) CGFloat minOffsetRangeEndY;
@property (nonatomic) CGFloat maxOffsetRangeStartY;
@property (nonatomic) CGFloat maxOffsetRangeEndY;


- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler;

@end


@implementation RNBetterPanGestureRecognizer {
  __weak RNGestureHandler *_gestureHandler;
  NSUInteger _realMinimumNumberOfTouches;
  BOOL _hasCustomActivationCriteria;
}

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler
{
  if ((self = [super initWithTarget:gestureHandler action:@selector(handleGesture:)])) {
    _gestureHandler = gestureHandler;
    _minDistSq = NAN;
    _minVelocityX = NAN;
    _minVelocityY = NAN;
    _minVelocitySq = NAN;
    _minOffsetRangeStartX = NAN;
    _minOffsetRangeEndX = NAN;
    _maxOffsetRangeStartX = NAN;
    _maxOffsetRangeEndX = NAN;
    _minOffsetRangeStartY = NAN;
    _minOffsetRangeEndY = NAN;
    _maxOffsetRangeStartY = NAN;
    _maxOffsetRangeEndY = NAN;
    _hasCustomActivationCriteria = NO;
    _realMinimumNumberOfTouches = self.minimumNumberOfTouches;
  }
  return self;
}

- (void)setMinimumNumberOfTouches:(NSUInteger)minimumNumberOfTouches
{
  _realMinimumNumberOfTouches = minimumNumberOfTouches;
}

- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  if (_hasCustomActivationCriteria) {
    // We use "minimumNumberOfTouches" property to prevent pan handler from recognizing
    // the gesture too early before we are sure that all criteria (e.g. minimum distance
    // etc. are met)
    super.minimumNumberOfTouches = 20;
  } else {
    super.minimumNumberOfTouches = _realMinimumNumberOfTouches;
  }
  [super touchesBegan:touches withEvent:event];
}

- (void)touchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesMoved:touches withEvent:event];
  if (self.state == UIGestureRecognizerStatePossible && [self shouldFailUnderCustomCriteria]) {
    self.state = UIGestureRecognizerStateFailed;
    return;
  }
  if ((self.state == UIGestureRecognizerStatePossible || self.state == UIGestureRecognizerStateChanged) && _gestureHandler.shouldCancelWhenOutside) {
    CGPoint pt = [self locationInView:self.view];
    if (!CGRectContainsPoint(self.view.bounds, pt)) {
      // If the previous recognizer state is UIGestureRecognizerStateChanged
      // then UIGestureRecognizer's sate machine will only transition to
      // UIGestureRecognizerStateCancelled even if you set the state to
      // UIGestureRecognizerStateFailed here. Making the behavior explicit.
      self.state = (self.state == UIGestureRecognizerStatePossible)
      ? UIGestureRecognizerStateFailed
      : UIGestureRecognizerStateCancelled;
      [self reset];
      return;
    }
  }
  if (_hasCustomActivationCriteria && self.state == UIGestureRecognizerStatePossible && [self shouldActivateUnderCustomCriteria]) {
    super.minimumNumberOfTouches = _realMinimumNumberOfTouches;
    if ([self numberOfTouches] >= _realMinimumNumberOfTouches) {
      self.state = UIGestureRecognizerStateBegan;
      [self setTranslation:CGPointMake(0, 0) inView:self.view];
    }
  }
}

- (void)reset
{
  self.enabled = YES;
  [super reset];
}

- (void)updateHasCustomActivationCriteria
{
  _hasCustomActivationCriteria = !isnan(_minDistSq)
  || !isnan(_minVelocityX) || !isnan(_minVelocityY) || !isnan(_minVelocitySq)
  || !isnan(_minOffsetRangeStartX) || !isnan(_minOffsetRangeEndX) || !isnan(_maxOffsetRangeStartX)
  || !isnan(_maxOffsetRangeEndX) || !isnan(_minOffsetRangeStartY) || !isnan(_minOffsetRangeEndY)
  || !isnan(_maxOffsetRangeStartY) || !isnan(_maxOffsetRangeEndY);
}

- (BOOL)shouldFailUnderCustomCriteria
{
  CGPoint trans = [self translationInView:self.view];
  
  if (TEST_MIN_IF_NOT_NAN(trans.x, _maxOffsetRangeStartX)) {
    return YES;
  }
  if (TEST_MAX_IF_NOT_NAN(trans.x, _maxOffsetRangeEndX)) {
    return YES;
  }
  if (TEST_MIN_IF_NOT_NAN(trans.y, _maxOffsetRangeStartY)) {
    return YES;
  }
  if (TEST_MAX_IF_NOT_NAN(trans.y, _maxOffsetRangeEndY)) {
    return YES;
  }
  
  
  return NO;
}

- (BOOL)shouldActivateUnderCustomCriteria
{
  CGPoint trans = [self translationInView:self.view];
  if (TEST_MIN_IF_NOT_NAN(trans.x, _minOffsetRangeStartX)) {
    return YES;
  }
  if (TEST_MAX_IF_NOT_NAN(trans.x, _minOffsetRangeEndX)) {
    return YES;
  }
  if (TEST_MIN_IF_NOT_NAN(trans.y, _minOffsetRangeStartY)) {
    return YES;
  }
  if (TEST_MAX_IF_NOT_NAN(trans.y, _minOffsetRangeEndY)) {
    return YES;
  }
  
  if (TEST_MIN_IF_NOT_NAN(VEC_LEN_SQ(trans), _minDistSq)) {
    return YES;
  }
  
  CGPoint velocity = [self velocityInView:self.view];
  if (TEST_MIN_IF_NOT_NAN(velocity.x, _minVelocityX)) {
    return YES;
  }
  if (TEST_MIN_IF_NOT_NAN(velocity.y, _minVelocityY)) {
    return YES;
  }
  if (TEST_MIN_IF_NOT_NAN(VEC_LEN_SQ(velocity), _minVelocitySq)) {
    return YES;
  }
  
  return NO;
}

@end

@implementation RNPanGestureHandler

- (instancetype)initWithTag:(NSNumber *)tag
{
  if ((self = [super initWithTag:tag])) {
    _recognizer = [[RNBetterPanGestureRecognizer alloc] initWithGestureHandler:self];
  }
  return self;
}

- (void)configure:(NSDictionary *)config
{
  [super configure:config];
  RNBetterPanGestureRecognizer *recognizer = (RNBetterPanGestureRecognizer *)_recognizer;
  
  APPLY_FLOAT_PROP(minVelocityX);
  APPLY_FLOAT_PROP(minVelocityY);
  APPLY_FLOAT_PROP(minOffsetRangeStartX);
  APPLY_FLOAT_PROP(minOffsetRangeEndX);
  APPLY_FLOAT_PROP(maxOffsetRangeStartX);
  APPLY_FLOAT_PROP(maxOffsetRangeEndX);
  APPLY_FLOAT_PROP(minOffsetRangeStartY);
  APPLY_FLOAT_PROP(minOffsetRangeEndY);
  APPLY_FLOAT_PROP(maxOffsetRangeStartY);
  APPLY_FLOAT_PROP(maxOffsetRangeEndY);
  
  
  APPLY_NAMED_INT_PROP(minimumNumberOfTouches, @"minPointers");
  APPLY_NAMED_INT_PROP(maximumNumberOfTouches, @"maxPointers");
  
  id prop = config[@"minDist"];
  if (prop != nil) {
    CGFloat dist = [RCTConvert CGFloat:prop];
    recognizer.minDistSq = dist * dist;
  }
  
  prop = config[@"minVelocity"];
  if (prop != nil) {
    CGFloat velocity = [RCTConvert CGFloat:prop];
    recognizer.minVelocitySq = velocity * velocity;
  }
  [recognizer updateHasCustomActivationCriteria];
}

- (RNGestureHandlerEventExtraData *)eventExtraData:(UIPanGestureRecognizer *)recognizer
{
  return [RNGestureHandlerEventExtraData
          forPan:[recognizer locationInView:recognizer.view]
          withAbsolutePosition:[recognizer locationInView:recognizer.view.window]
          withTranslation:[recognizer translationInView:recognizer.view]
          withVelocity:[recognizer velocityInView:recognizer.view.window]
          withNumberOfTouches:recognizer.numberOfTouches];
}

@end

