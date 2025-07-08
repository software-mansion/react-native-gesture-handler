//
//  RNGHVector.m
//  DoubleConversion
//
//  Created by Michał Bert on 05/08/2024.
//

#import "RNGHVector.h"
#import <Foundation/Foundation.h>

@implementation RNGHVector

- (id)initWithX:(double)x withY:(double)y
{
  if (self = [super init]) {
    _x = x;
    _y = y;

    _magnitude = hypot(x, y);

    _unitX = self.magnitude > MINIMAL_RECOGNIZABLE_MAGNITUDE ? x / self.magnitude : 0;
    _unitY = self.magnitude > MINIMAL_RECOGNIZABLE_MAGNITUDE ? y / self.magnitude : 0;
  }

  return self;
}

+ (RNGHVector *)fromDirection:(RNGestureHandlerDirection)direction
{
  switch (direction) {
    case RNGestureHandlerDirectionRight:
      return [[RNGHVector alloc] initWithX:1 withY:0];
    case RNGestureHandlerDirectionLeft:
      return [[RNGHVector alloc] initWithX:-1 withY:0];
    case RNGestureHandlerDirectionUp:
      return [[RNGHVector alloc] initWithX:0 withY:1];
    case RNGestureHandlerDirectionDown:
      return [[RNGHVector alloc] initWithX:0 withY:-1];
    case RNGestureHandlerDirectionUpLeft:
      return [[RNGHVector alloc] initWithX:-1 withY:1];
    case RNGestureHandlerDirectionUpRight:
      return [[RNGHVector alloc] initWithX:1 withY:1];
    case RNGestureHandlerDirectionDownLeft:
      return [[RNGHVector alloc] initWithX:-1 withY:-1];
    case RNGestureHandlerDirectionDownRight:
      return [[RNGHVector alloc] initWithX:1 withY:-1];
    default:
      return [[RNGHVector alloc] initWithX:0 withY:0];
  }
}

+ (RNGHVector *)fromVelocityX:(double)vx withVelocityY:(double)vy;
{
  return [[RNGHVector alloc] initWithX:vx withY:vy];
}

- (double)computeSimilarity:(RNGHVector *)other
{
  return self.unitX * other.unitX + self.unitY * other.unitY;
}

- (BOOL)isSimilar:(RNGHVector *)other withThreshold:(double)threshold
{
  return [self computeSimilarity:other] > threshold;
}

@end
