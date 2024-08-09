//
//  RNGHVector.h
//  Pods
//
//  Created by Michał Bert on 05/08/2024.
//

#import "RNGestureHandlerDirection.h"

#ifndef RNGHVector_h
#define RNGHVector_h

@interface Vector : NSObject

@property (atomic, assign) double x;
@property (atomic, assign) double y;
@property (atomic, assign) double unitX;
@property (atomic, assign) double unitY;
@property (atomic, assign) double magnitude;

+ (Vector *)fromDirection:(RNGestureHandlerDirection)direction;
+ (Vector *)fromVelocity:(NSPoint)velocity;
- initWithX:(double)x withY:(double)y;
- (double)computeSimilarity:(Vector *)other;
- (BOOL)isSimilar:(Vector *)other withThreshold:(double)threshold;

@end

#endif /* RNGHVector_h */
