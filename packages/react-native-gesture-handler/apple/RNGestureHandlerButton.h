//
//  RNGestureHandlerButton.h
//  RNGestureHandler
//
//  Created by Krzysztof Magiera on 12/10/2017.
//  Copyright © 2017 Software Mansion. All rights reserved.
//

#import "RNGestureHandler.h"

typedef NS_ENUM(NSInteger, RNGHButtonEventType) {
  RNGHButtonEventTypePress,
  RNGHButtonEventTypePressIn,
  RNGHButtonEventTypePressOut,
  RNGHButtonEventTypeLongPress,
  RNGHButtonEventTypeInteractionFinished,
};

/*
 * Receives press events produced by the button's state machine so that they can
 * be dispatched through the component's event emitter.
 */
@protocol RNGHButtonPressEventDelegate <NSObject>

- (void)dispatchButtonEvent:(RNGHButtonEventType)type
              withExtraData:(nullable RNGestureHandlerEventExtraData *)extraData;

@end

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
@property (nonatomic) BOOL userEnabled;
@property (nonatomic, assign) RNGestureHandlerPointerEvents pointerEvents;

@property (nonatomic, assign) NSInteger tapAnimationInDuration;
@property (nonatomic, assign) NSInteger tapAnimationOutDuration;
@property (nonatomic, assign) NSInteger longPressDuration;
@property (nonatomic, assign) NSInteger longPressAnimationOutDuration;
@property (nonatomic, assign) CGFloat activeOpacity;
@property (nonatomic, assign) CGFloat defaultOpacity;
@property (nonatomic, assign) CGFloat activeScale;
@property (nonatomic, assign) CGFloat defaultScale;
@property (nonatomic, assign) CGFloat defaultUnderlayOpacity;
@property (nonatomic, assign) CGFloat activeUnderlayOpacity;
@property (nonatomic, assign) NSInteger hoverAnimationInDuration;
@property (nonatomic, assign) NSInteger hoverAnimationOutDuration;
@property (nonatomic, assign) CGFloat hoverOpacity;
@property (nonatomic, assign) CGFloat hoverScale;
@property (nonatomic, assign) CGFloat hoverUnderlayOpacity;
@property (nonatomic, strong, nullable) RNGHColor *underlayColor;
@property (nonatomic, assign) BOOL hasLongPressHandler;

/**
 * Tag of the gesture handler managed by the button component. The press event
 * state machine runs only while it's set.
 */
@property (nonatomic, strong, nullable) NSNumber *managedHandlerTag;

@property (nonatomic, weak, nullable) id<RNGHButtonPressEventDelegate> pressEventDelegate;

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

#if TARGET_OS_TV
- (void)handleAnimatePressIn;
- (void)handleAnimatePressOut;
- (void)onHoverIn;
- (void)onHoverOut;
#endif // TARGET_OS_TV

/**
 * Resets all transient press/animation state so the button can be safely reused
 * by Fabric view recycling. Cancels pending press-out blocks, removes in-flight
 * animations, and unconditionally restores the animation target's transform/alpha
 * and the underlay opacity to neutral values.
 */
- (void)prepareForRecycle;

/**
 * Updates the underlay layer's corner radii with separate horizontal/vertical
 * components per corner, supporting elliptical inner corners when border widths
 * are uneven. Handles both uniform and per-corner (CAShapeLayer mask) cases.
 */
- (void)setUnderlayCornerRadiiWithTopLeftHorizontal:(CGFloat)topLeftHorizontal
                                    topLeftVertical:(CGFloat)topLeftVertical
                                 topRightHorizontal:(CGFloat)topRightHorizontal
                                   topRightVertical:(CGFloat)topRightVertical
                               bottomLeftHorizontal:(CGFloat)bottomLeftHorizontal
                                 bottomLeftVertical:(CGFloat)bottomLeftVertical
                              bottomRightHorizontal:(CGFloat)bottomRightHorizontal
                                bottomRightVertical:(CGFloat)bottomRightVertical;

/**
 * Sets the border insets so the underlay is clipped to the padding box
 * (inside the border).
 */
- (void)setUnderlayBorderInsetsWithTop:(CGFloat)top right:(CGFloat)right bottom:(CGFloat)bottom left:(CGFloat)left;

#if TARGET_OS_OSX
- (void)mountChildComponentView:(RNGHUIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index;
- (void)unmountChildComponentView:(RNGHUIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index;
- (void)updateLayoutMetrics:(const facebook::react::LayoutMetrics &)layoutMetrics
           oldLayoutMetrics:(const facebook::react::LayoutMetrics &)oldLayoutMetrics;
#endif

@end
