#import <Foundation/Foundation.h>

#ifndef RNGestureHandlerDirection_h
#define RNGestureHandlerDirection_h

typedef NS_ENUM(NSInteger, RNGestureHandlerDirection) {
  RNGestureHandlerDirectionRight = 1,
  RNGestureHandlerDirectionLeft = 2,
  RNGestureHandlerDirectionUp = 4,
  RNGestureHandlerDirectionDown = 8,
  RNGestureHandlerDirectionUpLeft = RNGestureHandlerDirectionUp | RNGestureHandlerDirectionLeft,
  RNGestureHandlerDirectionUpRight = RNGestureHandlerDirectionUp | RNGestureHandlerDirectionRight,
  RNGestureHandlerDirectionDownLeft = RNGestureHandlerDirectionDown | RNGestureHandlerDirectionLeft,
  RNGestureHandlerDirectionDownRight = RNGestureHandlerDirectionDown | RNGestureHandlerDirectionRight,
};

static NSInteger axialDirections[] = {
    RNGestureHandlerDirectionRight,
    RNGestureHandlerDirectionLeft,
    RNGestureHandlerDirectionUp,
    RNGestureHandlerDirectionDown,
};

static NSInteger diagonalDirections[] = {
    RNGestureHandlerDirectionUpLeft,
    RNGestureHandlerDirectionUpRight,
    RNGestureHandlerDirectionDownLeft,
    RNGestureHandlerDirectionDownRight,
};

static NSInteger directionsSize = 4;

#endif
