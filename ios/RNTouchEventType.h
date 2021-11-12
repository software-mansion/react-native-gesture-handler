#import <Foundation/Foundation.h>

typedef NS_ENUM(NSInteger, RNTouchEventType) {
  RNTouchEventTypeUndetermined = 0,
  RNTouchEventTypeTouchesDown,
  RNTouchEventTypeTouchesMove,
  RNTouchEventTypeTouchesUp,
  RNTouchEventTypeCancelled,
};
