//
//  RNGestureHandlerButton.h
//  RNGestureHandler
//
//  Created by Krzysztof Magiera on 12/10/2017.
//  Copyright © 2017 Software Mansion. All rights reserved.
//

#import "RNGestureHandler.h"

#if TARGET_OS_OSX

#include <react/renderer/core/LayoutMetrics.h>

@protocol RCTComponentViewProtocol;

@interface RNGestureHandlerButton : NSControl

#else
@interface RNGestureHandlerButton : UIControl
#endif // TARGET_OS_OSX

/**
 *  Insets used when hit testing inside this view.
 */
@property (nonatomic, assign) UIEdgeInsets hitTestEdgeInsets;
@property (nonatomic, assign) CGFloat borderRadius;
@property (nonatomic) BOOL userEnabled;

#if TARGET_OS_OSX
- (void)mountChildComponentView:(RNGHUIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index;
- (void)unmountChildComponentView:(RNGHUIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index;
- (void)updateLayoutMetrics:(const facebook::react::LayoutMetrics &)layoutMetrics
           oldLayoutMetrics:(const facebook::react::LayoutMetrics &)oldLayoutMetrics;
#endif

@end
