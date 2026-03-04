//
//  RNGestureHandlerRegistry.m
//  RNGestureHandler
//
//  Created by Krzysztof Magiera on 12/10/2017.
//  Copyright © 2017 Software Mansion. All rights reserved.
//

#import "RNGestureHandlerRegistry.h"

#import <React/RCTAssert.h>

@implementation RNGestureHandlerRegistry {
  NSMutableDictionary<NSNumber *, RNGestureHandler *> *_handlers;
}

- (instancetype)init
{
  if ((self = [super init])) {
    _handlers = [NSMutableDictionary new];
  }
  return self;
}

- (NSDictionary<NSNumber *, RNGestureHandler *> *)handlers
{
  @synchronized(_handlers) {
    return _handlers;
  }
}

- (RNGestureHandler *)handlerWithTag:(NSNumber *)handlerTag
{
  @synchronized(_handlers) {
    return _handlers[handlerTag];
  }
}

- (void)registerGestureHandler:(RNGestureHandler *)gestureHandler
{
  @synchronized(_handlers) {
    _handlers[gestureHandler.tag] = gestureHandler;
  }
}

- (void)attachHandlerWithTag:(NSNumber *)handlerTag
                      toView:(RNGHUIView *)view
              withActionType:(RNGestureHandlerActionType)actionType
            withHostDetector:(nullable RNGHUIView *)hostDetector
{
  RNGestureHandler *handler;

  @synchronized(_handlers) {
    handler = _handlers[handlerTag];
  }

  RCTAssert(handler != nil, @"Handler for tag %@ does not exists", handlerTag);
  [handler unbindFromView];
  handler.actionType = actionType;
  [handler bindToView:view];

  if (hostDetector != nil) {
    handler.hostDetectorView = hostDetector;
  }
}

- (void)detachHandlerWithTag:(NSNumber *)handlerTag fromHostDetector:(RNGHUIView *)hostDetectorView
{
  RNGestureHandler *handler;

  @synchronized(_handlers) {
    handler = _handlers[handlerTag];
  }

  if (handler.hostDetectorView != hostDetectorView) {
    return;
  }

  [handler unbindFromView];
}

- (void)dropHandlerWithTag:(NSNumber *)handlerTag
{
  RNGestureHandler *handler;

  @synchronized(_handlers) {
    handler = _handlers[handlerTag];
    [_handlers removeObjectForKey:handlerTag];
  }

  [handler unbindFromView];
}

- (void)dropAllHandlers
{
  NSArray<RNGestureHandler *> *handlers;

  @synchronized(_handlers) {
    handlers = [_handlers allValues];
    [_handlers removeAllObjects];
  }

  for (RNGestureHandler *handler in handlers) {
    [handler unbindFromView];
  }
}

@end
