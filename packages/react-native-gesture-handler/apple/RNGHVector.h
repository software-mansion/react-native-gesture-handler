//
//  RNGHVector.h
//  Pods
//
//  Created by Michał Bert on 05/08/2024.
//

#import "RNGestureHandlerDirection.h"

#ifndef RNGHVector_h
#define RNGHVector_h

@interface RNGHVector : NSObject

@property (atomic, readonly, assign) double x;
@property (atomic, readonly, assign) double y;
@property (atomic, readonly, assign) double unitX;
@property (atomic, readonly, assign) double unitY;
@property (atomic, readonly, assign) double magnitude;

+ (RNGHVector *_Nonnull)fromDirection:(RNGestureHandlerDirection)direction;
+ (RNGHVector *_Nonnull)fromVelocityX:(double)vx withVelocityY:(double)vy;
- (nonnull instancetype)initWithX:(double)x withY:(double)y;
- (double)computeSimilarity:(RNGHVector *_Nonnull)other;
- (BOOL)isSimilar:(RNGHVector *_Nonnull)other withThreshold:(double)threshold;

@end

static double MINIMAL_RECOGNIZABLE_MAGNITUDE = 0.1;

#endif /* RNGHVector_h */
