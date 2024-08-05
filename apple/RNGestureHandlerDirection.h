#import <Foundation/Foundation.h>

typedef NS_ENUM(NSInteger, RNGestureHandlerDirection) {
  RNGestureHandlerDirectionRight = 1,
  RNGestureHandlerDirectionLeft = 2,
  RNGestureHandlerDirectionUp = 4,
  RNGestureHandlerDirectionDown = 8,
  RNGestureHandlerDirectionUpLeft = 16,
  RNGestureHandlerDirectionUpRight = 32,
  RNGestureHandlerDirectionDownLeft = 64,
  RNGestureHandlerDirectionDownRight = 128,
};
