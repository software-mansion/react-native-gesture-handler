#import <Foundation/Foundation.h>

typedef NS_ENUM(NSInteger, RNGestureHandlerActionType) {
  RNGestureHandlerActionTypeNone = 0, // Handler managed by a native component, doesn't dispatch events to JS
  RNGestureHandlerActionTypeReanimatedWorklet = 1, // Reanimated worklet
  RNGestureHandlerActionTypeNativeAnimatedEvent, // Animated.event with useNativeDriver: true
  RNGestureHandlerActionTypeJSFunctionOldAPI, // JS function or Animated.event with useNativeDriver: false using old
                                              // RNGH API
  RNGestureHandlerActionTypeJSFunctionNewAPI, // JS function or Animated.event with useNativeDriver: false using new
                                              // RNGH API
  RNGestureHandlerActionTypeNativeDetector,
  RNGestureHandlerActionTypeVirtualDetector,
};
