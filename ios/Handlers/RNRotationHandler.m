//
//  RNRotationHandler.m
//  RNGestureHandler
//
//  Created by Krzysztof Magiera on 12/10/2017.
//  Copyright © 2017 Software Mansion. All rights reserved.
//

#import "RNRotationHandler.h"

@interface RNRotationGestureRecognizer : UIRotationGestureRecognizer

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler;

@end

@implementation RNRotationGestureRecognizer {
  __weak RNGestureHandler *_gestureHandler;
}
  
  - (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler
  {
    if ((self = [super initWithTarget:gestureHandler action:@selector(handleGesture:)])) {
      _gestureHandler = gestureHandler;
    }
    return self;
  }
  -(void) setState:(UIGestureRecognizerState)state {
    [super setState:state];
    [_gestureHandler handleGestureStateTransition:self];
  }

@end

@implementation RNRotationGestureHandler

- (instancetype)initWithTag:(NSNumber *)tag
{
    if ((self = [super initWithTag:tag])) {
        _recognizer = [[RNRotationGestureRecognizer alloc] initWithGestureHandler:self];
    }
    return self;
}

- (RNGestureHandlerEventExtraData *)eventExtraData:(UIRotationGestureRecognizer *)recognizer
{
    return [RNGestureHandlerEventExtraData
            forRotation:recognizer.rotation
            withAnchorPoint:[recognizer locationInView:recognizer.view]
            withVelocity:recognizer.velocity
            withNumberOfTouches:recognizer.numberOfTouches];
}

@end

