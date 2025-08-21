//
//  RNGHEventTarget.h
//  Pods
//
//  Created by Michał Bert on 21/08/2025.
//

#import <Foundation/Foundation.h>

typedef NS_ENUM(NSInteger, RNGestureHandlerEventTarget) {
  RNGestureHandlerEventTargetJS = 0,
  RNGestureHandlerEventTargetReanimated,
  RNGestureHandlerEventTargetAnimated
};
