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
              withActionType:(RNGestureHandlerActionType)actionType;
- (void)attachHandlerWithTag:(nonnull NSNumber *)handlerTag
                      toView:(nonnull RNGHUIView *)view
              withActionType:(RNGestureHandlerActionType)actionType
            withHostDetector:(nonnull RNGHUIView *)hostDetector;
- (void)detachHandlerWithTag:(nonnull NSNumber *)handlerTag;
- (void)dropHandlerWithTag:(nonnull NSNumber *)handlerTag;
- (void)dropAllHandlers;

@end
