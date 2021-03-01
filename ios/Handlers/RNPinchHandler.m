//
//  RNPinchHandler.m
//  RNGestureHandler
//
//  Created by Krzysztof Magiera on 12/10/2017.
//  Copyright © 2017 Software Mansion. All rights reserved.
//

#import "RNPinchHandler.h"

#import <UIKit/UIGestureRecognizerSubclass.h>

@interface RNBetterPinchGestureRecognizer : UIPinchGestureRecognizer

@property (nonatomic) BOOL twoPointersRequired;

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler;

@end

@implementation RNBetterPinchGestureRecognizer {
    __weak RNGestureHandler *_gestureHandler;
}

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler
{
    if ((self = [super initWithTarget:gestureHandler action:@selector(handleGesture:)])) {
        _gestureHandler = gestureHandler;
        _twoPointersRequired = NO;
    }
    return self;
}

- (void)touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
    [super touchesEnded:touches withEvent:event];

    // UIPinchGestureRecognizer ends pinching gesture when the user lifts BOTH fingers
    // from the view. If twoPointersRequired prop is true, we end the gesture when the
    // user lifts one finger from the view.
    if (_twoPointersRequired && self.state == UIGestureRecognizerStateChanged) {
        self.state = UIGestureRecognizerStateEnded;
        [self reset];
    }
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
- (void)configure:(NSDictionary *)config
{
    [super configure:config];
    RNBetterPinchGestureRecognizer *recognizer = (RNBetterPinchGestureRecognizer *)_recognizer;
    id prop = config[@"twoPointersRequired"];
    if (prop != nil) {
        recognizer.twoPointersRequired = [RCTConvert BOOL:prop];
    } else {
        recognizer.twoPointersRequired = NO;
    }
}
#endif

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

@end

