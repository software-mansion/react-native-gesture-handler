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
@property (nonatomic, assign) RNGestureHandlerPointerEvents pointerEvents;

@property (nonatomic, assign) NSInteger animationDuration;
@property (nonatomic, assign) CGFloat activeOpacity;
@property (nonatomic, assign) CGFloat startOpacity;
@property (nonatomic, assign) CGFloat activeScale;
@property (nonatomic, assign) CGFloat startScale;
@property (nonatomic, assign) CGFloat startUnderlayOpacity;
@property (nonatomic, assign) CGFloat activeUnderlayOpacity;
@property (nonatomic, strong, nullable) RNGHColor *underlayColor;

/**
 * The view that press animations are applied to. Defaults to self; set by the
 * Fabric component view to its own instance so animations affect the full wrapper.
 */
@property (nonatomic, weak, nullable) RNGHUIView *animationTarget;

/**
 * Immediately applies the start* values to the animation target and underlay layer.
 * Call after props are updated to ensure the idle visual state is correct.
 */
- (void)applyStartAnimationState;

#if TARGET_OS_OSX
- (void)mountChildComponentView:(RNGHUIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index;
- (void)unmountChildComponentView:(RNGHUIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index;
- (void)updateLayoutMetrics:(const facebook::react::LayoutMetrics &)layoutMetrics
           oldLayoutMetrics:(const facebook::react::LayoutMetrics &)oldLayoutMetrics;
#endif

@end
