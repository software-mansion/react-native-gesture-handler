//
//  RNGestureHandlerRegistry.h
//  RNGestureHandler
//
//  Created by Krzysztof Magiera on 12/10/2017.
//  Copyright © 2017 Software Mansion. All rights reserved.
//

#import "RNGestureHandler.h"

typedef void (^RNGestureHandlerReadyBlock)(RNGestureHandler *_Nonnull handler);

@interface RNGestureHandlerRegistry : NSObject

- (nullable RNGestureHandler *)handlerWithTag:(nonnull NSNumber *)handlerTag;
- (void)registerGestureHandler:(nonnull RNGestureHandler *)gestureHandler;
- (void)attachHandlerWithTag:(nonnull NSNumber *)handlerTag
                      toView:(nonnull RNGHUIView *)view
              withActionType:(RNGestureHandlerActionType)actionType
            withHostDetector:(nullable RNGHUIView *)hostDetector;
- (void)detachHandlerWithTag:(nonnull NSNumber *)handlerTag fromHostDetector:(nonnull RNGHUIView *)hostDetectorView;
- (void)dropHandlerWithTag:(nonnull NSNumber *)handlerTag;
- (void)dropAllHandlers;

// Invokes `block` every time a handler with `handlerTag` is registered. If the handler already
// exists at the time this method is called, `block` is also invoked synchronously before returning.
// The observation persists until explicitly cancelled (or until `owner` is deallocated, provided
// the block does not strongly capture `owner`). `owner` is held weakly and acts as the cancellation
// key; observing the same tag twice with the same `owner` replaces the previous block.
- (void)observeHandlerWithTag:(nonnull NSNumber *)handlerTag
                        owner:(nonnull id)owner
                   usingBlock:(nonnull RNGestureHandlerReadyBlock)block;

- (void)cancelObservationForTag:(nonnull NSNumber *)handlerTag owner:(nonnull id)owner;
- (void)cancelAllObservationsForOwner:(nonnull id)owner;

@property (nonatomic, readonly, nonnull) NSDictionary<NSNumber *, RNGestureHandler *> *handlers;

@end
