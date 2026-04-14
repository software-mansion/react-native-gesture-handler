//
//  RNGestureHandlerRegistry.h
//  RNGestureHandler
//
//  Created by Krzysztof Magiera on 12/10/2017.
//  Copyright © 2017 Software Mansion. All rights reserved.
//

#import "RNGestureHandler.h"

@interface RNGestureHandlerRegistry : NSObject

- (nullable RNGestureHandler *)handlerWithTag:(nonnull NSNumber *)handlerTag;
- (void)registerGestureHandler:(nonnull RNGestureHandler *)gestureHandler;
- (void)attachHandlerWithTag:(nonnull NSNumber *)handlerTag
                      toView:(nonnull RNGHUIView *)view
              withActionType:(RNGestureHandlerActionType)actionType
            withHostDetector:(nullable RNGHUIView *)hostDetector;
- (void)detachHandlerWithTag:(nonnull NSNumber *)handlerTag;
- (void)detachHandlerWithTag:(nonnull NSNumber *)handlerTag fromHostDetector:(nonnull RNGHUIView *)hostDetectorView;
- (void)dropHandlerWithTag:(nonnull NSNumber *)handlerTag;
- (void)dropAllHandlers;

@property (nonatomic, readonly, nonnull) NSDictionary<NSNumber *, RNGestureHandler *> *handlers;

@end
