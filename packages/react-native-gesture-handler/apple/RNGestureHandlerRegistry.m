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
  NSMutableDictionary<NSNumber *, NSMapTable<id, RNGestureHandlerReadyBlock> *> *_observers;
}

- (instancetype)init
{
  if ((self = [super init])) {
    _handlers = [NSMutableDictionary new];
    _observers = [NSMutableDictionary new];
  }
  return self;
}

- (NSDictionary<NSNumber *, RNGestureHandler *> *)handlers
{
  return _handlers;
}

- (RNGestureHandler *)handlerWithTag:(NSNumber *)handlerTag
{
  @synchronized(_handlers) {
    return _handlers[handlerTag];
  }
}

- (void)registerGestureHandler:(RNGestureHandler *)gestureHandler
{
  NSArray<RNGestureHandlerReadyBlock> *observers = nil;

  @synchronized(_handlers) {
    _handlers[gestureHandler.tag] = gestureHandler;

    NSMapTable *table = _observers[gestureHandler.tag];
    if (table != nil) {
      observers = [[table objectEnumerator] allObjects];
    }
  }

  for (RNGestureHandlerReadyBlock block in observers) {
    block(gestureHandler);
  }
}

- (void)observeHandlerWithTag:(NSNumber *)handlerTag owner:(id)owner withCallback:(RNGestureHandlerReadyBlock)callback
{
  RNGestureHandler *existing = nil;

  @synchronized(_handlers) {
    NSMapTable *table = _observers[handlerTag];
    if (table == nil) {
      table =
          [NSMapTable mapTableWithKeyOptions:NSPointerFunctionsWeakMemory | NSPointerFunctionsObjectPointerPersonality
                                valueOptions:NSPointerFunctionsStrongMemory];
      _observers[handlerTag] = table;
    }

    [table setObject:[callback copy] forKey:owner];
    existing = _handlers[handlerTag];
  }

  if (existing != nil) {
    callback(existing);
  }
}

- (void)cancelObservationForTag:(NSNumber *)handlerTag owner:(id)owner
{
  @synchronized(_handlers) {
    NSMapTable *table = _observers[handlerTag];
    [table removeObjectForKey:owner];
    if (table.count == 0) {
      [_observers removeObjectForKey:handlerTag];
    }
  }
}

- (void)cancelAllObservationsForOwner:(id)owner
{
  @synchronized(_handlers) {
    NSArray<NSNumber *> *tags = [_observers allKeys];
    for (NSNumber *tag in tags) {
      NSMapTable *table = _observers[tag];
      [table removeObjectForKey:owner];
      if (table.count == 0) {
        [_observers removeObjectForKey:tag];
      }
    }
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
