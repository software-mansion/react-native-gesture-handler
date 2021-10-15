//
//  RNPinchHandler.m
//  RNGestureHandler
//
//  Created by Krzysztof Magiera on 12/10/2017.
//  Copyright © 2017 Software Mansion. All rights reserved.
//

#import "RNPinchHandler.h"

@interface RNBetterPinchGestureRecognizer : UIPinchGestureRecognizer

@property (nonatomic) BOOL endOnFingerRelease;

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler;

@end

@implementation RNBetterPinchGestureRecognizer {
  __weak RNGestureHandler* _gestureHandler;
  uint _pointers;
}

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler
{
  if (self == [super initWithTarget:gestureHandler action:@selector(handleGesture:)]) {
    _gestureHandler = gestureHandler;
    _endOnFingerRelease = false;
    _pointers = 0;
  }
  
  return self;
}

- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  _pointers++;

  [super touchesBegan:touches withEvent:event];
}

- (void)touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  _pointers--;
  
  [super touchesEnded:touches withEvent:event];

  if (_pointers < 2 && _endOnFingerRelease) {
    if (self.state == UIGestureRecognizerStateChanged) {
      self.state = UIGestureRecognizerStateEnded;
    }
    [self reset];
  }
}

- (void)reset
{
  [super reset];
  _pointers = 0;
}

@end


@implementation RNPinchGestureHandler

- (instancetype)initWithTag:(NSNumber *)tag
{
    if ((self = [super initWithTag:tag])) {
#if !TARGET_OS_TV
        _recognizer = [[RNBetterPinchGestureRecognizer alloc] initWithGestureHandler:self];
#endif
    }
    return self;
}

#if !TARGET_OS_TV
- (RNGestureHandlerEventExtraData *)eventExtraData:(UIPinchGestureRecognizer *)recognizer
{
    return [RNGestureHandlerEventExtraData
            forPinch:recognizer.scale
            withFocalPoint:[recognizer locationInView:recognizer.view]
            withVelocity:recognizer.velocity
            withNumberOfTouches:recognizer.numberOfTouches];
}
#endif

- (void)resetConfig
{
  [super resetConfig];
  RNBetterPinchGestureRecognizer *recognizer = (RNBetterPinchGestureRecognizer *)_recognizer;
  recognizer.endOnFingerRelease = false;
}

- (void)configure:(NSDictionary *)config
{
  [super configure:config];
  RNBetterPinchGestureRecognizer *recognizer = (RNBetterPinchGestureRecognizer *)_recognizer;

  bool endOnFingerRelease = [RCTConvert BOOL:config[@"endOnFingerRelease"]];
  recognizer.endOnFingerRelease = endOnFingerRelease;
}

@end

