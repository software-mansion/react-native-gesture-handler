//
//  RNGestureHandlerNativeEventUtils.cpp
//  RNGestureHandler
//
//  Created by Jakub Piasecki on 02/07/2025.
//

#include "RNGestureHandlerNativeEventUtils.h"

static folly::dynamic rngh_dynamicFromId(id value);

static folly::dynamic rngh_dynamicFromDictionary(NSDictionary<NSString *, id> *dictionary)
{
  folly::dynamic data = folly::dynamic::object;

  for (NSString *key in dictionary) {
    id value = dictionary[key];
    std::string cppKey = [key UTF8String];
    data[cppKey] = rngh_dynamicFromId(value);
  }

  return data;
}

folly::dynamic rngh_dynamicFromArray(NSArray *array)
{
  folly::dynamic result = folly::dynamic::array;

  for (id value in array) {
    result.push_back(rngh_dynamicFromId(value));
  }

  return result;
}

static folly::dynamic rngh_dynamicFromId(id value)
{
  if ([value isKindOfClass:[NSNumber class]]) {
    return [(NSNumber *)value doubleValue];
  } else if ([value isKindOfClass:[NSArray class]]) {
    return rngh_dynamicFromArray((NSArray *)value);
  } else if ([value isKindOfClass:[NSDictionary class]]) {
    return rngh_dynamicFromDictionary((NSDictionary *)value);
  }

  @throw [NSException exceptionWithName:@"FailedToBuildEventException"
                                 reason:@"Encountered a unknown value type"
                               userInfo:nil];
}

@implementation RNGestureHandlerEvent (NativeEvent)

- (facebook::react::RNGestureHandlerDetectorEventEmitter::OnGestureEvent)getNativeEvent
{
  folly::dynamic handlerData = rngh_dynamicFromId(self.extraData.data);

  facebook::react::RNGestureHandlerDetectorEventEmitter::OnGestureEvent nativeEvent = {
      .handlerTag = [self.handlerTag intValue],
      .state = static_cast<int>(self.state),
      .handlerData = handlerData,
  };

  return nativeEvent;
}

@end

@implementation RNGestureHandlerStateChange (NativeEvent)

- (facebook::react::RNGestureHandlerDetectorEventEmitter::OnGestureHandlerStateChange)getNativeEvent
{
  folly::dynamic handlerData = rngh_dynamicFromId(self.extraData.data);

  facebook::react::RNGestureHandlerDetectorEventEmitter::OnGestureHandlerStateChange nativeEvent = {
      .handlerTag = [self.handlerTag intValue],
      .state = static_cast<int>(self.state),
      .oldState = static_cast<int>(self.previousState),
      .handlerData = handlerData,
  };

  return nativeEvent;
}

@end
