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

@property (atomic, readonly, assign) double x;
@property (atomic, readonly, assign) double y;
@property (atomic, readonly, assign) double unitX;
@property (atomic, readonly, assign) double unitY;
@property (atomic, readonly, assign) double magnitude;

+ (Vector *_Nonnull)fromDirection:(RNGestureHandlerDirection)direction;
+ (Vector *_Nonnull)fromVelocityX:(double)vx withVelocityY:(double)vy;
- (nonnull instancetype)initWithX:(double)x withY:(double)y;
- (double)computeSimilarity:(Vector *_Nonnull)other;
- (BOOL)isSimilar:(Vector *_Nonnull)other withThreshold:(double)threshold;

@end

static double MINIMAL_RECOGNIZABLE_MAGNITUDE = 0.1;

#endif /* RNGHVector_h */
