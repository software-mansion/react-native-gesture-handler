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
  CALayer *_underlayLayer;
}

- (void)commonInit
{
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
  _underlayColor = nil;
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

#if !TARGET_OS_OSX
- (void)layoutSubviews
{
  [super layoutSubviews];
  _underlayLayer.frame = self.bounds;
  [self.layer insertSublayer:_underlayLayer atIndex:0];
}
#else
- (void)layout
{
  [super layout];
  _underlayLayer.frame = self.bounds;
  [self.layer insertSublayer:_underlayLayer atIndex:0];
}
#endif

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

#if !TARGET_OS_OSX

- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesBegan:touches withEvent:event];
  UITouch *touch = [touches anyObject];
  if (touch.view != self) {
    [self sendActionsForControlEvents:UIControlEventTouchDown];
  }
}

- (void)touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesEnded:touches withEvent:event];
  UITouch *touch = [touches anyObject];
  if (touch.view != self) {
    [self sendActionsForControlEvents:UIControlEventTouchUpInside];
  }
}

- (void)touchesCancelled:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesCancelled:touches withEvent:event];
  UITouch *touch = [touches anyObject];
  if (touch.view != self) {
    [self sendActionsForControlEvents:UIControlEventTouchCancel];
  }
}

#endif

- (void)handleAnimatePressIn
{
  RNGHUIView *target = self.animationTarget ?: self;
  [self animateTarget:target toOpacity:_activeOpacity scale:_activeScale];
  if (_activeUnderlayOpacity != _defaultUnderlayOpacity) {
    [self animateUnderlayToOpacity:_activeUnderlayOpacity];
  }
}

- (void)handleAnimatePressOut
{
  RNGHUIView *target = self.animationTarget ?: self;
  [self animateTarget:target toOpacity:_defaultOpacity scale:_defaultScale];
  if (_activeUnderlayOpacity != _defaultUnderlayOpacity) {
    [self animateUnderlayToOpacity:_defaultUnderlayOpacity];
  }
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

- (void)setBorderRadius:(CGFloat)radius
{
  if (_borderRadius == radius) {
    return;
  }

  _borderRadius = radius;
  [self.layer setNeedsDisplay];
}

- (void)displayLayer:(CALayer *)layer
{
  if (CGSizeEqualToSize(layer.bounds.size, CGSizeZero)) {
    return;
  }

  const CGFloat radius = MAX(0, _borderRadius);
  const CGSize size = self.bounds.size;
  const CGFloat scaleFactor = RCTZeroIfNaN(MIN(1, size.width / (2 * radius)));
  const CGFloat currentBorderRadius = radius * scaleFactor;
  layer.cornerRadius = currentBorderRadius;
  _underlayLayer.cornerRadius = currentBorderRadius;
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
