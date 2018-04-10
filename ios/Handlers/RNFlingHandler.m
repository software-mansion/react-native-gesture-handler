//
//  RNFlingHandler.m
//  RNGestureHandler
//
//  Created by Michał Osadnik on 10/04/2018.
//  Copyright © 2018 Software Mansion. All rights reserved.
//


#import "RNFlingHandler.h"

@implementation RNFlingGestureHandler

- (instancetype)initWithTag:(NSNumber *)tag
{
    if ((self = [super initWithTag:tag])) {
        _recognizer = [[UISwipeGestureRecognizer alloc] initWithTarget:self action:@selector(handleGesture:)];
        
    }
    return self;
}

- (void)configure:(NSDictionary *)config
{
    [super configure:config];
    UISwipeGestureRecognizer *recognizer = (UISwipeGestureRecognizer *)_recognizer;

    
    id prop = config[@"direction"];
    if (prop != nil) {
        
        NSInteger direction = [RCTConvert NSInteger:prop];
        switch (direction) {
            case 0:
                recognizer.direction = UISwipeGestureRecognizerDirectionRight;
                break;
            case 1:
                recognizer.direction = UISwipeGestureRecognizerDirectionLeft;
                break;
            case 2:
                recognizer.direction = UISwipeGestureRecognizerDirectionUp;
                break;
            case 3:
                recognizer.direction = UISwipeGestureRecognizerDirectionDown;
                break;
            default:
                break;
        }
    }
    
    prop = config[@"minNumberOfTouches"];
    if (prop != nil) {
        recognizer.numberOfTouchesRequired = [RCTConvert NSInteger:prop];
    }
}



- (RNGestureHandlerEventExtraData *)eventExtraData:(UISwipeGestureRecognizer *)recognizer
{
    return [RNGestureHandlerEventExtraData
            withNumberOfTouches:recognizer.numberOfTouches
            withDirection:recognizer.direction];
}

@end

