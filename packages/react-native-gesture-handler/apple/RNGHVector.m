//
//  RNGHVector.m
//  DoubleConversion
//
//  Created by Michał Bert on 05/08/2024.
//

#import "RNGHVector.h"
#import <Foundation/Foundation.h>

@implementation Vector

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

+ (Vector *)fromDirection:(RNGestureHandlerDirection)direction
{
  switch (direction) {
    case RNGestureHandlerDirectionRight:
      return [[Vector alloc] initWithX:1 withY:0];
    case RNGestureHandlerDirectionLeft:
      return [[Vector alloc] initWithX:-1 withY:0];
    case RNGestureHandlerDirectionUp:
      return [[Vector alloc] initWithX:0 withY:1];
    case RNGestureHandlerDirectionDown:
      return [[Vector alloc] initWithX:0 withY:-1];
    case RNGestureHandlerDirectionUpLeft:
      return [[Vector alloc] initWithX:-1 withY:1];
    case RNGestureHandlerDirectionUpRight:
      return [[Vector alloc] initWithX:1 withY:1];
    case RNGestureHandlerDirectionDownLeft:
      return [[Vector alloc] initWithX:-1 withY:-1];
    case RNGestureHandlerDirectionDownRight:
      return [[Vector alloc] initWithX:1 withY:-1];
    default:
      return [[Vector alloc] initWithX:0 withY:0];
  }
}

+ (Vector *)fromVelocityX:(double)vx withVelocityY:(double)vy;
{
  return [[Vector alloc] initWithX:vx withY:vy];
}

- (double)computeSimilarity:(Vector *)other
{
  return self.unitX * other.unitX + self.unitY * other.unitY;
}

- (BOOL)isSimilar:(Vector *)other withThreshold:(double)threshold
{
  return [self computeSimilarity:other] > threshold;
}

@end
