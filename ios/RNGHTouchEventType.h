#import <Foundation/Foundation.h>

typedef NS_ENUM(NSInteger, RNGHTouchEventType) {
  RNTouchEventTypeUndetermined = 0,
  RNTouchEventTypePointerDown,
  RNTouchEventTypePointerMove,
  RNTouchEventTypePointerUp,
  RNTouchEventTypeCancelled,
};
