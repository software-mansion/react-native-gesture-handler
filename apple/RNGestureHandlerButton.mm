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
#import <React/RCTUIKit.h>
#endif

#if RCT_NEW_ARCH_ENABLED

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#endif

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
@implementation RNGestureHandlerButton

- (instancetype)init
{
  self = [super init];
  if (self) {
    _hitTestEdgeInsets = UIEdgeInsetsZero;
    _userEnabled = YES;
#if !TARGET_OS_TV && !TARGET_OS_OSX
    [self setExclusiveTouch:YES];
#endif
  }
  return self;
}

- (BOOL)shouldHandleTouch:(RNGHUIView *)view
{
  if ([view isKindOfClass:[RNGestureHandlerButton class]]) {
    RNGestureHandlerButton *button = (RNGestureHandlerButton *)view;
    return button.userEnabled;
  }

#if !TARGET_OS_OSX
  return [view isKindOfClass:[UIControl class]] || [view.gestureRecognizers count] > 0;
#else
  return [view isKindOfClass:[NSControl class]] || [view.gestureRecognizers count] > 0;
#endif
}

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
  NSMutableString *str = [NSMutableString stringWithString:@""];
  for (UIView *subview in view.subviews) {
    NSString *label = subview.accessibilityLabel;
    if (!label) {
      label = RNGHRecursiveAccessibilityLabel(subview);
    }
    if (label && label.length > 0) {
      if (str.length > 0) {
        [str appendString:@" "];
      }
      [str appendString:label];
    }
  }
  return str.length == 0 ? nil : str;
}
#endif

#if TARGET_OS_OSX && RCT_NEW_ARCH_ENABLED
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
