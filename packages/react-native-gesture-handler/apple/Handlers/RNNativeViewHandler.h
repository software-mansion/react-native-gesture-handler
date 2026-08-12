//
//  RNNativeViewHandler.h
//  RNGestureHandler
//
//  Created by Krzysztof Magiera on 12/10/2017.
//  Copyright © 2017 Software Mansion. All rights reserved.
//

#import "RNGestureHandler.h"

@interface RNDummyGestureRecognizer : UIGestureRecognizer
@end

/*
 * Views bound to a `RNNativeViewGestureHandler` may conform to this protocol to
 * be notified about the handler's updates and state changes.
 */
@protocol RNGHNativeViewHandlerStateObserver <NSObject>

/*
 * Called when the handler dispatches a new update event in the ACTIVE state.
 */
- (void)onHandlerUpdate:(nonnull RNGestureHandlerEventExtraData *)extraData;

/*
 * Called when the handler moves to a new state.
 */
- (void)onHandlerStateChange:(RNGestureHandlerState)newState
                   prevState:(RNGestureHandlerState)prevState
                   extraData:(nonnull RNGestureHandlerEventExtraData *)extraData;

@end

@interface RNNativeViewGestureHandler : RNGestureHandler
@end
