//
//  RNGestureHandlerButton.m
//  RNGestureHandler
//
//  Created by Krzysztof Magiera on 12/10/2017.
//  Copyright © 2017 Software Mansion. All rights reserved.
//

#import "RNGestureHandlerButton.h"

#if !TARGET_OS_OSX
#import <UIKit/UIKit.h>
#else
#import <QuartzCore/QuartzCore.h>
#import <React/RCTUIKit.h>
#endif

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

/**
 * Gesture Handler Button components overrides standard mechanism used by RN
 * to determine touch target, which normally would reurn the UIView that is placed
 * as the deepest element in the view hierarchy.
 * It's done this way as it allows for the actual target determination to run in JS
 * where we can travers up the view ierarchy to find first element that want to became
 * JS responder.
 *
 * Since we want to use native button (or actually a `UIControl`) we need to determine
 * the target in native. This makes it impossible for JS responder based components to
 * function as a subviews of the button component. Here we override `hitTest:withEvent:`
 * method and we only determine the target to be either a subclass of `UIControl` or a
 * view that has gesture recognizers registered.
 *
 * This "default" behaviour of target determinator should be sufficient in most of the
 * cases as in fact it is not that common UI pattern to have many nested buttons (usually
 * there are just two levels e.g. when you have clickable table cells with additional
 * buttons). In cases when the default behaviour is insufficient it is recommended to use
 * `TapGestureHandler` instead of a button which gives much better flexibility as far as
 * controlling the touch flow.
 */
@implementation RNGestureHandlerButton {
  BOOL _isTouchInsideBounds;
  CALayer *_underlayLayer;
  CGFloat _underlayCornerRadii[8]; // [tlH, tlV, trH, trV, blH, blV, brH, brV] outer radii in points
  UIEdgeInsets _underlayBorderInsets; // border widths for padding-box inset
  NSTimeInterval _pressInTimestamp;
  BOOL _pendingPressOut;
}

- (void)commonInit
{
  _isTouchInsideBounds = NO;
  _hitTestEdgeInsets = UIEdgeInsetsZero;
  _userEnabled = YES;
  _pointerEvents = RNGestureHandlerPointerEventsAuto;
  _animationDuration = 100;
  _activeOpacity = 1.0;
  _defaultOpacity = 1.0;
  _activeScale = 1.0;
  _defaultScale = 1.0;
  _activeUnderlayOpacity = 0.0;
  _defaultUnderlayOpacity = 0.0;
  _minimumAnimationDuration = 0;
  _underlayColor = nil;
  _pressInTimestamp = 0;
  _pendingPressOut = NO;
#if TARGET_OS_OSX
  self.wantsLayer = YES; // Crucial for macOS layer-backing
#endif

  _underlayLayer = [CALayer new];
  _underlayLayer.opacity = 0;
  _underlayLayer.backgroundColor = [RNGHColor blackColor].CGColor;

  [self.layer insertSublayer:_underlayLayer atIndex:0];

#if !TARGET_OS_TV && !TARGET_OS_OSX
  [self setExclusiveTouch:YES];
  [self addTarget:self action:@selector(handleAnimatePressIn) forControlEvents:UIControlEventTouchDown];
  [self addTarget:self
                action:@selector(handleAnimatePressOut)
      forControlEvents:UIControlEventTouchUpInside | UIControlEventTouchUpOutside | UIControlEventTouchDragExit |
      UIControlEventTouchCancel];
#endif
}

- (instancetype)init
{
  if (self = [super init]) {
    [self commonInit];
  }
  return self;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    [self commonInit];
  }
  return self;
}

- (void)setUnderlayColor:(RNGHColor *)underlayColor
{
  _underlayColor = underlayColor;
  _underlayLayer.backgroundColor = underlayColor.CGColor;
}

#if TARGET_OS_OSX
// Flip the macOS coordinate system so y=0 is at the top, matching iOS
// and React Native's layout expectations.
- (BOOL)isFlipped
{
  return YES;
}
#endif

#if !TARGET_OS_OSX
- (void)layoutSubviews
{
  [super layoutSubviews];
#else
- (void)layout
{
  [super layout];
#endif
  _underlayLayer.frame = UIEdgeInsetsInsetRect(self.bounds, _underlayBorderInsets);
  [self.layer insertSublayer:_underlayLayer atIndex:0];
  [self applyUnderlayCornerRadii];
}

- (BOOL)shouldHandleTouch:(RNGHUIView *)view
{
  if ([view isKindOfClass:[RNGestureHandlerButton class]]) {
    RNGestureHandlerButton *button = (RNGestureHandlerButton *)view;
    return button.userEnabled;
  }

  // Certain subviews such as RCTViewComponentView have been observed to have disabled
  // accessibility gesture recognizers such as _UIAccessibilityHUDGateGestureRecognizer,
  // ostensibly set by iOS. Such gesture recognizers cause this function to return YES
  // even when the passed view is static text and does not respond to touches. This in
  // turn prevents the button from receiving touches, breaking functionality. To handle
  // such case, we can count only the enabled gesture recognizers when determining
  // whether a view should receive touches.
  NSPredicate *isEnabledPredicate = [NSPredicate predicateWithFormat:@"isEnabled == YES"];
  NSArray *enabledGestureRecognizers = [view.gestureRecognizers filteredArrayUsingPredicate:isEnabledPredicate];

#if !TARGET_OS_OSX
  return [view isKindOfClass:[UIControl class]] || [enabledGestureRecognizers count] > 0;
#else
  return [view isKindOfClass:[NSControl class]] || [enabledGestureRecognizers count] > 0;
#endif
}

- (void)animateUnderlayToOpacity:(float)toOpacity
{
  CABasicAnimation *anim = [CABasicAnimation animationWithKeyPath:@"opacity"];
  anim.fromValue = @([_underlayLayer.presentationLayer opacity]);
  anim.toValue = @(toOpacity);
  anim.duration = _animationDuration / 1000.0;
  anim.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut];
  _underlayLayer.opacity = toOpacity;
  [_underlayLayer addAnimation:anim forKey:@"opacity"];
}

#if TARGET_OS_OSX
static CATransform3D RNGHCenterScaleTransform(NSRect bounds, CGFloat scale)
{
  CGFloat midX = NSMidX(bounds);
  CGFloat midY = NSMidY(bounds);

  // translate to center, scale, and translate back
  CATransform3D transform = CATransform3DIdentity;
  transform = CATransform3DTranslate(transform, midX, midY, 0);
  transform = CATransform3DScale(transform, scale, scale, 1.0);
  transform = CATransform3DTranslate(transform, -midX, -midY, 0);

  return transform;
}
#endif

- (void)applyStartAnimationState
{
  RNGHUIView *target = self.animationTarget ?: self;
  _underlayLayer.opacity = _defaultUnderlayOpacity;

#if !TARGET_OS_OSX
  if (_activeOpacity != 1.0 || _defaultOpacity != 1.0) {
    target.alpha = _defaultOpacity;
  }
  if (_activeScale != 1.0 || _defaultScale != 1.0) {
    target.layer.transform = CATransform3DMakeScale(_defaultScale, _defaultScale, 1.0);
  }
#else
  target.wantsLayer = YES;
  if (_activeOpacity != 1.0 || _defaultOpacity != 1.0) {
    target.alphaValue = _defaultOpacity;
  }
  if (_activeScale != 1.0 || _defaultScale != 1.0) {
    target.layer.transform = RNGHCenterScaleTransform(target.bounds, _defaultScale);
  }
#endif
}

- (void)animateTarget:(RNGHUIView *)target toOpacity:(CGFloat)opacity scale:(CGFloat)scale
{
  NSTimeInterval duration = _animationDuration / 1000.0;

#if !TARGET_OS_OSX
  [UIView animateWithDuration:duration
                        delay:0
                      options:UIViewAnimationOptionCurveEaseInOut | UIViewAnimationOptionBeginFromCurrentState
                   animations:^{
                     if (_activeOpacity != 1.0 || _defaultOpacity != 1.0) {
                       target.alpha = opacity;
                     }
                     if (_activeScale != 1.0 || _defaultScale != 1.0) {
                       target.layer.transform = CATransform3DMakeScale(scale, scale, 1.0);
                     }
                   }
                   completion:nil];
#else
  target.wantsLayer = YES;
  [NSAnimationContext
      runAnimationGroup:^(NSAnimationContext *context) {
        context.allowsImplicitAnimation = YES;
        context.duration = duration;
        context.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut];
        if (_activeOpacity != 1.0 || _defaultOpacity != 1.0) {
          target.animator.alphaValue = opacity;
        }
        if (_activeScale != 1.0 || _defaultScale != 1.0) {
          target.layer.transform = RNGHCenterScaleTransform(target.bounds, scale);
        }
      }
      completionHandler:nil];
#endif
}

- (void)handleAnimatePressIn
{
  _pendingPressOut = NO;
  _pressInTimestamp = CACurrentMediaTime();
  RNGHUIView *target = self.animationTarget ?: self;
  [self animateTarget:target toOpacity:_activeOpacity scale:_activeScale];
  if (_activeUnderlayOpacity != _defaultUnderlayOpacity) {
    [self animateUnderlayToOpacity:_activeUnderlayOpacity];
  }
}

- (void)handleAnimatePressOut
{
  NSTimeInterval elapsed = (CACurrentMediaTime() - _pressInTimestamp) * 1000.0;
  NSTimeInterval remaining = MIN(_animationDuration, _minimumAnimationDuration) - elapsed;

  if (remaining <= 0) {
    RNGHUIView *target = self.animationTarget ?: self;
    [self animateTarget:target toOpacity:_defaultOpacity scale:_defaultScale];
    if (_activeUnderlayOpacity != _defaultUnderlayOpacity) {
      [self animateUnderlayToOpacity:_defaultUnderlayOpacity];
    }
  } else {
    _pendingPressOut = YES;
    __weak auto weakSelf = self;
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(remaining * NSEC_PER_MSEC)), dispatch_get_main_queue(), ^{
      __strong auto strongSelf = weakSelf;
      if (strongSelf && strongSelf->_pendingPressOut) {
        strongSelf->_pendingPressOut = NO;
        RNGHUIView *target = strongSelf.animationTarget ?: strongSelf;
        [strongSelf animateTarget:target toOpacity:strongSelf->_defaultOpacity scale:strongSelf->_defaultScale];
        if (strongSelf->_activeUnderlayOpacity != strongSelf->_defaultUnderlayOpacity) {
          [strongSelf animateUnderlayToOpacity:strongSelf->_defaultUnderlayOpacity];
        }
      }
    });
  }
}

- (void)applyUnderlayCornerRadii
{
  CGRect rect = _underlayLayer.bounds;
  CGFloat w = rect.size.width;
  CGFloat h = rect.size.height;

  const CGFloat *outerTL = &_underlayCornerRadii[0];
  const CGFloat *outerTR = &_underlayCornerRadii[2];
  const CGFloat *outerBL = &_underlayCornerRadii[4];
  const CGFloat *outerBR = &_underlayCornerRadii[6];
  CGFloat borderTop = _underlayBorderInsets.top;
  CGFloat borderBottom = _underlayBorderInsets.bottom;
  CGFloat borderLeft = _underlayBorderInsets.left;
  CGFloat borderRight = _underlayBorderInsets.right;

  // Inner border radii: outer radius minus adjacent border width per axis, clamped to 0.
  CGFloat topLeftHorizontal = MAX(0, outerTL[0] - borderLeft);
  CGFloat topLeftVertical = MAX(0, outerTL[1] - borderTop);
  CGFloat topRightHorizontal = MAX(0, outerTR[0] - borderRight);
  CGFloat topRightVertical = MAX(0, outerTR[1] - borderTop);
  CGFloat bottomLeftHorizontal = MAX(0, outerBL[0] - borderLeft);
  CGFloat bottomLeftVertical = MAX(0, outerBL[1] - borderBottom);
  CGFloat bottomRightHorizontal = MAX(0, outerBR[0] - borderRight);
  CGFloat bottomRightVertical = MAX(0, outerBR[1] - borderBottom);

  // CSS border-radius proportional scaling: if adjacent radii on any edge
  // exceed that edge's length, scale all radii down by the same factor.
  CGFloat f = 1.0;
  if (topLeftHorizontal + topRightHorizontal > 0)
    f = MIN(f, w / (topLeftHorizontal + topRightHorizontal));
  if (bottomLeftHorizontal + bottomRightHorizontal > 0)
    f = MIN(f, w / (bottomLeftHorizontal + bottomRightHorizontal));
  if (topLeftVertical + bottomLeftVertical > 0)
    f = MIN(f, h / (topLeftVertical + bottomLeftVertical));
  if (topRightVertical + bottomRightVertical > 0)
    f = MIN(f, h / (topRightVertical + bottomRightVertical));

  if (f < 1.0) {
    topLeftHorizontal *= f;
    topLeftVertical *= f;
    topRightHorizontal *= f;
    topRightVertical *= f;
    bottomLeftHorizontal *= f;
    bottomLeftVertical *= f;
    bottomRightHorizontal *= f;
    bottomRightVertical *= f;
  }

  // Snap sub-pixel radii to 0 to avoid degenerate curves that cause
  // anti-aliasing artifacts at what should be sharp corners.
  if (topLeftHorizontal < 0.5)
    topLeftHorizontal = 0;
  if (topLeftVertical < 0.5)
    topLeftVertical = 0;
  if (topRightHorizontal < 0.5)
    topRightHorizontal = 0;
  if (topRightVertical < 0.5)
    topRightVertical = 0;
  if (bottomLeftHorizontal < 0.5)
    bottomLeftHorizontal = 0;
  if (bottomLeftVertical < 0.5)
    bottomLeftVertical = 0;
  if (bottomRightHorizontal < 0.5)
    bottomRightHorizontal = 0;
  if (bottomRightVertical < 0.5)
    bottomRightVertical = 0;

  if (topLeftHorizontal == 0 && topLeftVertical == 0 && topRightHorizontal == 0 && topRightVertical == 0 &&
      bottomLeftHorizontal == 0 && bottomLeftVertical == 0 && bottomRightHorizontal == 0 && bottomRightVertical == 0) {
    _underlayLayer.cornerRadius = 0;
    _underlayLayer.mask = nil;
    return;
  }

  // Uniform circular — simple cornerRadius is enough
  if (topLeftHorizontal == topLeftVertical && topRightHorizontal == topRightVertical &&
      bottomLeftHorizontal == bottomLeftVertical && bottomRightHorizontal == bottomRightVertical &&
      topLeftHorizontal == topRightHorizontal && topRightHorizontal == bottomLeftHorizontal &&
      bottomLeftHorizontal == bottomRightHorizontal) {
    _underlayLayer.cornerRadius = topLeftHorizontal;
    _underlayLayer.mask = nil;
    return;
  }

  // Non-uniform or elliptical — build a CAShapeLayer mask using cubic
  // Bezier approximation for quarter-ellipse arcs (kappa ≈ 0.5523).
  _underlayLayer.cornerRadius = 0;
  if (CGRectIsEmpty(rect)) {
    return;
  }

  CGMutablePathRef path = CGPathCreateMutable();
  const CGFloat k = 0.5522847498;
  BOOL hasTL = topLeftHorizontal > 0 && topLeftVertical > 0;
  BOOL hasTR = topRightHorizontal > 0 && topRightVertical > 0;
  BOOL hasBR = bottomRightHorizontal > 0 && bottomRightVertical > 0;
  BOOL hasBL = bottomLeftHorizontal > 0 && bottomLeftVertical > 0;

  // Start at the top edge (after top-left corner if rounded)
  CGPathMoveToPoint(path, NULL, hasTL ? topLeftHorizontal : 0, 0);

  // Top edge → top-right corner
  if (hasTR) {
    CGPathAddLineToPoint(path, NULL, w - topRightHorizontal, 0);
    CGPathAddCurveToPoint(
        path,
        NULL,
        w - topRightHorizontal + topRightHorizontal * k,
        0,
        w,
        topRightVertical - topRightVertical * k,
        w,
        topRightVertical);
  } else {
    CGPathAddLineToPoint(path, NULL, w, 0);
  }

  // Right edge → bottom-right corner
  if (hasBR) {
    CGPathAddLineToPoint(path, NULL, w, h - bottomRightVertical);
    CGPathAddCurveToPoint(
        path,
        NULL,
        w,
        h - bottomRightVertical + bottomRightVertical * k,
        w - bottomRightHorizontal + bottomRightHorizontal * k,
        h,
        w - bottomRightHorizontal,
        h);
  } else {
    CGPathAddLineToPoint(path, NULL, w, h);
  }

  // Bottom edge → bottom-left corner
  if (hasBL) {
    CGPathAddLineToPoint(path, NULL, bottomLeftHorizontal, h);
    CGPathAddCurveToPoint(
        path,
        NULL,
        bottomLeftHorizontal - bottomLeftHorizontal * k,
        h,
        0,
        h - bottomLeftVertical + bottomLeftVertical * k,
        0,
        h - bottomLeftVertical);
  } else {
    CGPathAddLineToPoint(path, NULL, 0, h);
  }

  // Left edge → top-left corner
  if (hasTL) {
    CGPathAddLineToPoint(path, NULL, 0, topLeftVertical);
    CGPathAddCurveToPoint(
        path,
        NULL,
        0,
        topLeftVertical - topLeftVertical * k,
        topLeftHorizontal - topLeftHorizontal * k,
        0,
        topLeftHorizontal,
        0);
  }
  // closePath returns to the start point — (0,0) if no TL curve

  CGPathCloseSubpath(path);

  CAShapeLayer *mask = [CAShapeLayer new];
  mask.path = path;
  CGPathRelease(path);
  _underlayLayer.mask = mask;
}

- (void)setUnderlayCornerRadiiWithTopLeftHorizontal:(CGFloat)topLeftHorizontal
                                    topLeftVertical:(CGFloat)topLeftVertical
                                 topRightHorizontal:(CGFloat)topRightHorizontal
                                   topRightVertical:(CGFloat)topRightVertical
                               bottomLeftHorizontal:(CGFloat)bottomLeftHorizontal
                                 bottomLeftVertical:(CGFloat)bottomLeftVertical
                              bottomRightHorizontal:(CGFloat)bottomRightHorizontal
                                bottomRightVertical:(CGFloat)bottomRightVertical
{
  _underlayCornerRadii[0] = topLeftHorizontal;
  _underlayCornerRadii[1] = topLeftVertical;
  _underlayCornerRadii[2] = topRightHorizontal;
  _underlayCornerRadii[3] = topRightVertical;
  _underlayCornerRadii[4] = bottomLeftHorizontal;
  _underlayCornerRadii[5] = bottomLeftVertical;
  _underlayCornerRadii[6] = bottomRightHorizontal;
  _underlayCornerRadii[7] = bottomRightVertical;
  [self applyUnderlayCornerRadii];
}

- (void)setUnderlayBorderInsetsWithTop:(CGFloat)top right:(CGFloat)right bottom:(CGFloat)bottom left:(CGFloat)left
{
  _underlayBorderInsets = UIEdgeInsetsMake(top, left, bottom, right);
#if !TARGET_OS_OSX
  [self setNeedsLayout];
#else
  [self setNeedsLayout:YES];
#endif
}

#if TARGET_OS_OSX
- (void)mouseDown:(NSEvent *)event
{
  [self handleAnimatePressIn];
  [super mouseDown:event];
}

- (void)mouseUp:(NSEvent *)event
{
  [self handleAnimatePressOut];
  [super mouseUp:event];
}

- (void)mouseDragged:(NSEvent *)event
{
  NSPoint locationInWindow = [event locationInWindow];
  NSPoint locationInView = [self convertPoint:locationInWindow fromView:nil];

  if (!NSPointInRect(locationInView, self.bounds)) {
    [self handleAnimatePressOut];
  }
}
#endif

#if !TARGET_OS_OSX
- (BOOL)pointInside:(CGPoint)point withEvent:(UIEvent *)event
{
  if (UIEdgeInsetsEqualToEdgeInsets(self.hitTestEdgeInsets, UIEdgeInsetsZero)) {
    return [super pointInside:point withEvent:event];
  }
  CGRect hitFrame = UIEdgeInsetsInsetRect(self.bounds, self.hitTestEdgeInsets);
  return CGRectContainsPoint(hitFrame, point);
}

- (BOOL)beginTrackingWithTouch:(UITouch *)touch withEvent:(UIEvent *)event
{
  _isTouchInsideBounds = YES;
  return [super beginTrackingWithTouch:touch withEvent:event];
}

- (BOOL)continueTrackingWithTouch:(UITouch *)touch withEvent:(UIEvent *)event
{
  // DO NOT call super. We are entirely taking over the drag event generation.

  CGPoint location = [touch locationInView:self];
  CGRect hitFrame = UIEdgeInsetsInsetRect(self.bounds, self.hitTestEdgeInsets);
  BOOL currentlyInside = CGRectContainsPoint(hitFrame, location);

  if (currentlyInside) {
    if (!_isTouchInsideBounds) {
      [self sendActionsForControlEvents:UIControlEventTouchDragEnter];
      _isTouchInsideBounds = YES;
    }

    // Targets may call `cancelTrackingWithEvent:` in response to DragEnter.
    if (self.tracking) {
      [self sendActionsForControlEvents:UIControlEventTouchDragInside];
    }
  } else {
    if (_isTouchInsideBounds) {
      [self sendActionsForControlEvents:UIControlEventTouchDragExit];
      _isTouchInsideBounds = NO;
    }

    // Targets may call `cancelTrackingWithEvent:` in response to DragExit.
    if (self.tracking) {
      [self sendActionsForControlEvents:UIControlEventTouchDragOutside];
    }
  }

  // If `cancelTrackingWithEvent` was called, `self.tracking` will be NO.
  return self.tracking;
}

- (void)endTrackingWithTouch:(UITouch *)touch withEvent:(UIEvent *)event
{
  // Also bypass super here so that the final "up" event respects the
  // strict bounds, rather than Apple's 70-point.

  if (touch != nil) {
    CGPoint location = [touch locationInView:self];
    CGRect hitFrame = UIEdgeInsetsInsetRect(self.bounds, self.hitTestEdgeInsets);
    if (CGRectContainsPoint(hitFrame, location)) {
      [self sendActionsForControlEvents:UIControlEventTouchUpInside];
    } else {
      [self sendActionsForControlEvents:UIControlEventTouchUpOutside];
    }
  }

  _isTouchInsideBounds = NO;
}

- (RNGHUIView *)hitTest:(CGPoint)point withEvent:(UIEvent *)event
{
  RNGestureHandlerPointerEvents pointerEvents = _pointerEvents;

  if (pointerEvents == RNGestureHandlerPointerEventsNone) {
    return nil;
  }

  if (pointerEvents == RNGestureHandlerPointerEventsBoxNone) {
    for (UIView *subview in [self.subviews reverseObjectEnumerator]) {
      if (!subview.isHidden && subview.alpha > 0) {
        CGPoint convertedPoint = [subview convertPoint:point fromView:self];
        UIView *hitView = [subview hitTest:convertedPoint withEvent:event];
        if (hitView != nil && [self shouldHandleTouch:hitView]) {
          return hitView;
        }
      }
    }
    return nil;
  }

  if (pointerEvents == RNGestureHandlerPointerEventsBoxOnly) {
    return [self pointInside:point withEvent:event] ? self : nil;
  }

  RNGHUIView *inner = [super hitTest:point withEvent:event];
  while (inner && ![self shouldHandleTouch:inner]) {
    inner = inner.superview;
  }
  return inner;
}

- (NSString *)accessibilityLabel
{
  NSString *label = super.accessibilityLabel;
  if (label) {
    return label;
  }
  return RNGHRecursiveAccessibilityLabel(self);
}

// Vendored from RCTView.m to infer accessibility label from children
static NSString *RNGHRecursiveAccessibilityLabel(UIView *view)
{
  NSMutableString *str = nil;
  for (UIView *subview in view.subviews) {
    NSString *label = subview.accessibilityLabel;
    if (!label) {
      label = RNGHRecursiveAccessibilityLabel(subview);
    }
    if (label && label.length > 0) {
      if (str == nil) {
        str = [NSMutableString string];
      }
      if (str.length > 0) {
        [str appendString:@" "];
      }
      [str appendString:label];
    }
  }

  return str;
}

#else

- (void)mountChildComponentView:(RNGHUIView *)childComponentView index:(NSInteger)index
{
  if (childComponentView.superview != nil) {
    return;
  }

  if (index < [[self subviews] count]) {
    // Get the view currently at your desired index
    NSView *existingView = [[self subviews] objectAtIndex:index];

    // Now use this to insert your new view above the existing one
    [self addSubview:childComponentView positioned:NSWindowAbove relativeTo:existingView];
  } else {
    // if the index is out of bounds, add the new subview at the end
    [self addSubview:childComponentView];
  }
}

- (void)unmountChildComponentView:(RNGHUIView *)childComponentView index:(NSInteger)index
{
  [childComponentView removeFromSuperview];
}

- (void)updateLayoutMetrics:(const facebook::react::LayoutMetrics &)layoutMetrics
           oldLayoutMetrics:(const facebook::react::LayoutMetrics &)oldLayoutMetrics
{
  bool forceUpdate = oldLayoutMetrics == facebook::react::EmptyLayoutMetrics;

  if (forceUpdate || (layoutMetrics.frame != oldLayoutMetrics.frame)) {
    CGRect frame = RCTCGRectFromRect(layoutMetrics.frame);

    if (!std::isfinite(frame.origin.x) || !std::isfinite(frame.origin.y) || !std::isfinite(frame.size.width) ||
        !std::isfinite(frame.size.height)) {
      // CALayer will crash if we pass NaN or Inf values.
      // It's unclear how to detect this case on cross-platform manner holistically, so we have to do it on the mounting
      // layer as well. NaN/Inf is a kinda valid result of some math operations. Even if we can (and should) detect (and
      // report early) incorrect (NaN and Inf) values which come from JavaScript side, we sometimes cannot backtrace the
      // sources of a calculation that produced an incorrect/useless result.
      RCTLogWarn(
          @"-[UIView(ComponentViewProtocol) updateLayoutMetrics:oldLayoutMetrics:]: Received invalid layout metrics (%@) for a view (%@).",
          NSStringFromCGRect(frame),
          self);
    } else {
      self.frame = frame;
      self.bounds = CGRect{CGPointZero, frame.size};
    }
  }

  if (forceUpdate || (layoutMetrics.displayType != oldLayoutMetrics.displayType)) {
    self.hidden = layoutMetrics.displayType == facebook::react::DisplayType::None;
  }
}

#endif

@end
