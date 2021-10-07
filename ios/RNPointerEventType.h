#import <Foundation/Foundation.h>

typedef NS_ENUM(NSInteger, RNPointerEventType) {
  RNPointerEventTypeUndetermined = 0,
  RNPointerEventTypePointerDown,
  RNPointerEventTypePointerMove,
  RNPointerEventTypePointerUp,
  RNPointerEventTypeCancelled,
};
