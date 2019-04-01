//
//  RNPinchHandler.m
//  RNGestureHandler
//
//  Created by Krzysztof Magiera on 12/10/2017.
//  Copyright © 2017 Software Mansion. All rights reserved.
//

#import "RNPinchHandler.h"

@implementation RNPinchGestureHandler {
  CGPoint _focalPoint;
}

- (instancetype)initWithTag:(NSNumber *)tag
{
    if ((self = [super initWithTag:tag])) {
#if !TARGET_OS_TV
        _recognizer = [[UIPinchGestureRecognizer alloc] initWithTarget:self action:@selector(handleGesture:)];
#endif
    }
    return self;
}

#if !TARGET_OS_TV
- (RNGestureHandlerEventExtraData *)eventExtraData:(UIPinchGestureRecognizer *)recognizer
{
    if (recognizer.numberOfTouches > 1) {
      _focalPoint = [recognizer locationInView:recognizer.view];
    }
    return [RNGestureHandlerEventExtraData
            forPinch:recognizer.scale
            withFocalPoint:_focalPoint
            withVelocity:recognizer.velocity
            withNumberOfTouches:recognizer.numberOfTouches];
}
#endif

@end

