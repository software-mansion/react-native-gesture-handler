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
  BOOL _suppressSuperControlActionDispatch;
  CALayer *_underlayLayer;
  CGFloat _underlayCornerRadii[8]; // [tlH, tlV, trH, trV, blH, blV, brH, brV] outer radii in points
  UIEdgeInsets _underlayBorderInsets; // border widths for padding-box inset
  NSTimeInterval _pressInTimestamp;
  dispatch_block_t _pendingPressOutBlock;
  BOOL _isHovered;
  BOOL _isPressed;
  dispatch_block_t _pendingHoverOutBlock;
#if TARGET_OS_OSX
  NSTrackingArea *_hoverTrackingArea;
#endif
}

@synthesize longPressAnimationOutDuration = _longPressAnimationOutDuration;
@synthesize hoverOpacity = _hoverOpacity;
@synthesize hoverScale = _hoverScale;
@synthesize hoverUnderlayOpacity = _hoverUnderlayOpacity;

- (void)commonInit
{
  _isTouchInsideBounds = NO;
  _hitTestEdgeInsets = UIEdgeInsetsZero;
  _userEnabled = YES;
  _pointerEvents = RNGestureHandlerPointerEventsAuto;
  _tapAnimationInDuration = 50;
  _tapAnimationOutDuration = 100;
  _longPressDuration = -1;
  _longPressAnimationOutDuration = -1;
  _activeOpacity = 1.0;
  _defaultOpacity = 1.0;
  _activeScale = 1.0;
  _defaultScale = 1.0;
  _activeUnderlayOpacity = 0.0;
  _defaultUnderlayOpacity = 0.0;
  _underlayColor = nil;
  _pressInTimestamp = 0;
  _pendingPressOutBlock = nil;
  _hoverAnimationInDuration = 50;
  _hoverAnimationOutDuration = 100;
  _hoverOpacity = -1.0;
  _hoverScale = -1.0;
  _hoverUnderlayOpacity = -1.0;
  _isHovered = NO;
  _isPressed = NO;
  _pendingHoverOutBlock = nil;
#if TARGET_OS_OSX
  self.wantsLayer = YES; // Crucial for macOS layer-backing
#endif

  _underlayLayer = [CALayer new];
  _underlayLayer.opacity = 0;
  _underlayLayer.backgroundColor = [RNGHColor blackColor].CGColor;

  [self.layer insertSublayer:_underlayLayer atIndex:0];

#if !TARGET_OS_TV && !TARGET_OS_OSX
  [self setExclusiveTouch:YES];
  [self addTarget:self
                action:@selector(handleAnimatePressIn)
      forControlEvents:UIControlEventTouchDown | UIControlEventTouchDragEnter];
  [self addTarget:self
                action:@selector(handleAnimatePressOut)
      forControlEvents:UIControlEventTouchUpInside | UIControlEventTouchUpOutside | UIControlEventTouchDragExit |
      UIControlEventTouchCancel];

  if (@available(iOS 13.4, *)) {
    UIHoverGestureRecognizer *hoverRecognizer =
        [[UIHoverGestureRecognizer alloc] initWithTarget:self action:@selector(handleHover:)];
    [self addGestureRecognizer:hoverRecognizer];
  }
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

- (void)cancelPendingPressOutAnimation
{
  if (_pendingPressOutBlock) {
    dispatch_block_cancel(_pendingPressOutBlock);
    _pendingPressOutBlock = nil;
  }
  RNGHUIView *target = self.animationTarget ?: self;
  [target.layer removeAllAnimations];
  [_underlayLayer removeAllAnimations];
}

- (void)prepareForRecycle
{
  // Fabric reuses the same wrapper + button instance across mounts. Without
  // this reset, residual press-in transform/alpha/underlay-opacity from a
  // prior use leaks into the recycled view, and `updateProps:` won't undo it
  // when defaults are unchanged between mounts.
  [self cancelPendingPressOutAnimation];
  [self cancelPendingHoverOut];

  RNGHUIView *target = self.animationTarget ?: self;
  target.layer.transform = CATransform3DIdentity;
#if !TARGET_OS_OSX
  target.alpha = 1.0;
#else
  target.alphaValue = 1.0;
#endif
  _underlayLayer.opacity = 0;

  _isTouchInsideBounds = NO;
  _suppressSuperControlActionDispatch = NO;
  _pressInTimestamp = 0;
  _isHovered = NO;
  _isPressed = NO;
}

#if TARGET_OS_OSX
- (void)viewWillMoveToWindow:(RNGHWindow *)newWindow
{
  [super viewWillMoveToWindow:newWindow];
  if (newWindow == nil) {
    [self cancelPendingPressOutAnimation];
    [self cancelPendingHoverOut];
    [self applyStartAnimationState];
    _isTouchInsideBounds = NO;
    _suppressSuperControlActionDispatch = NO;
    _pressInTimestamp = 0;
    _isHovered = NO;
    _isPressed = NO;
  }
}
#else
- (void)willMoveToWindow:(RNGHWindow *)newWindow
{
  [super willMoveToWindow:newWindow];
  if (newWindow == nil) {
    [self cancelPendingPressOutAnimation];
    [self cancelPendingHoverOut];
    [self applyStartAnimationState];
    _isTouchInsideBounds = NO;
    _suppressSuperControlActionDispatch = NO;
    _pressInTimestamp = 0;
    _isHovered = NO;
    _isPressed = NO;
  }
}
#endif

- (NSInteger)longPressAnimationOutDuration
{
  return _longPressAnimationOutDuration < 0 ? _tapAnimationOutDuration : _longPressAnimationOutDuration;
}

- (CGFloat)hoverOpacity
{
  return _hoverOpacity < 0 ? _defaultOpacity : _hoverOpacity;
}

- (CGFloat)hoverScale
{
  return _hoverScale < 0 ? _defaultScale : _hoverScale;
}

- (CGFloat)hoverUnderlayOpacity
{
  return _hoverUnderlayOpacity < 0 ? _defaultUnderlayOpacity : _hoverUnderlayOpacity;
}

- (BOOL)hasOpacityAnimation
{
  return _defaultOpacity != 1.0 || self.hoverOpacity != 1.0 || _activeOpacity != 1.0;
}

- (BOOL)hasScaleAnimation
{
  return _defaultScale != 1.0 || self.hoverScale != 1.0 || _activeScale != 1.0;
}

- (BOOL)hasUnderlayAnimation
{
  return _activeUnderlayOpacity != _defaultUnderlayOpacity || self.hoverUnderlayOpacity != _defaultUnderlayOpacity;
}

// Resting (non-pressed) animation targets. While the pointer hovers, press-out
// settles on the hover values instead of the defaults, mirroring the web
// priority order (pressed > hovered > default).
- (CGFloat)restingOpacity
{
  return _isHovered ? self.hoverOpacity : _defaultOpacity;
}

- (CGFloat)restingScale
{
  return _isHovered ? self.hoverScale : _defaultScale;
}

- (CGFloat)restingUnderlayOpacity
{
  return _isHovered ? self.hoverUnderlayOpacity : _defaultUnderlayOpacity;
}

- (void)setUserEnabled:(BOOL)userEnabled
{
  if (userEnabled == _userEnabled) {
    _userEnabled = userEnabled;
    return;
  }

  _userEnabled = userEnabled;

  // Enabled is an input to the effective hover visual: web masks hover while
  // disabled (`hovered && enabled`) and resumes it on re-enable with the
  // pointer still inside. `_isHovered` keeps tracking across the disabled
  // period, so re-evaluate the visual when enabled changes.
  if (_isHovered && !_isPressed) {
    [self applyHoverState];
  }
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

- (BOOL)shouldReduceMotion
{
#if TARGET_OS_OSX
  return [[NSWorkspace sharedWorkspace] accessibilityDisplayShouldReduceMotion];
#else
  return UIAccessibilityIsReduceMotionEnabled();
#endif
}

- (void)animateUnderlayToOpacity:(float)toOpacity duration:(NSTimeInterval)durationMs
{
  if ([self shouldReduceMotion]) {
    durationMs = 0;
  }
  // Only sync the model from the presentation layer when an animation is actually
  // in flight.
  CALayer *presentation = _underlayLayer.presentationLayer;
  BOOL hasInFlightAnimation = presentation != nil && _underlayLayer.animationKeys.count > 0;
  if (hasInFlightAnimation) {
    _underlayLayer.opacity = presentation.opacity;
  }
  [_underlayLayer removeAllAnimations];

  // CABasicAnimation with duration 0 resolves to the current CATransaction's
  // default duration (0.25s), not "no animation". Snap the value directly
  // with implicit actions disabled to get a true instant update.
  if (durationMs <= 0) {
    [CATransaction begin];
    [CATransaction setDisableActions:YES];
    _underlayLayer.opacity = toOpacity;
    [CATransaction commit];
    return;
  }

  CABasicAnimation *anim = [CABasicAnimation animationWithKeyPath:@"opacity"];
  anim.fromValue = @(_underlayLayer.opacity);
  anim.toValue = @(toOpacity);
  anim.duration = durationMs / 1000.0;
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
  if ([self hasOpacityAnimation]) {
    target.alpha = _defaultOpacity;
  }
  if ([self hasScaleAnimation]) {
    target.layer.transform = CATransform3DMakeScale(_defaultScale, _defaultScale, 1.0);
  }
#else
  target.wantsLayer = YES;
  if ([self hasOpacityAnimation]) {
    target.alphaValue = _defaultOpacity;
  }
  if ([self hasScaleAnimation]) {
    target.layer.transform = RNGHCenterScaleTransform(target.bounds, _defaultScale);
  }
#endif
}

// Duration of a single frame at the current screen's max refresh rate, in ms.
- (NSTimeInterval)minFrameDurationMs
{
#if !TARGET_OS_OSX
  UIScreen *screen = self.window.screen ?: UIScreen.mainScreen;
  NSInteger maxFps = screen.maximumFramesPerSecond;
#else
  NSScreen *screen = self.window.screen ?: NSScreen.mainScreen;
  NSInteger maxFps = 60;
  if (@available(macOS 12.0, *)) {
    maxFps = screen.maximumFramesPerSecond;
  }
#endif
  return maxFps > 0 ? 1000.0 / (NSTimeInterval)maxFps : 1000.0 / 60.0;
}

- (void)animateTarget:(RNGHUIView *)target
            toOpacity:(CGFloat)opacity
                scale:(CGFloat)scale
             duration:(NSTimeInterval)durationMs
{
  if ([self shouldReduceMotion]) {
    durationMs = 0;
  }
  CALayer *layer = target.layer;
  CALayer *presentation = layer.presentationLayer;
  NSTimeInterval snapThresholdMs = [self minFrameDurationMs];

  // Only snap to the presentation layer when an animation is in flight,
  // that's the only case where it tells us something the model layer doesn't.
  BOOL hasInFlightAnimation = presentation != nil && layer.animationKeys.count > 0;
  if (hasInFlightAnimation) {
    layer.transform = presentation.transform;
  }

#if !TARGET_OS_OSX
  if (hasInFlightAnimation) {
    target.alpha = presentation.opacity;
  }
  [layer removeAllAnimations];

  // Sub-frame durations: snap with implicit actions disabled instead of
  // routing through UIView.animate. Same rationale as animateUnderlayToOpacity.
  if (durationMs < snapThresholdMs) {
    [CATransaction begin];
    [CATransaction setDisableActions:YES];
    if ([self hasOpacityAnimation]) {
      target.alpha = opacity;
    }
    if ([self hasScaleAnimation]) {
      layer.transform = CATransform3DMakeScale(scale, scale, 1.0);
    }
    [CATransaction commit];
    return;
  }

  NSTimeInterval duration = durationMs / 1000.0;
  [UIView animateWithDuration:duration
                        delay:0
                      options:UIViewAnimationOptionCurveEaseInOut
                   animations:^{
                     if ([self hasOpacityAnimation]) {
                       target.alpha = opacity;
                     }
                     if ([self hasScaleAnimation]) {
                       target.layer.transform = CATransform3DMakeScale(scale, scale, 1.0);
                     }
                   }
                   completion:nil];
#else
  target.wantsLayer = YES;
  if (hasInFlightAnimation) {
    target.alphaValue = presentation.opacity;
  }
  [layer removeAllAnimations];

  if (durationMs < snapThresholdMs) {
    [CATransaction begin];
    [CATransaction setDisableActions:YES];
    if ([self hasOpacityAnimation]) {
      target.alphaValue = opacity;
    }
    if ([self hasScaleAnimation]) {
      layer.transform = RNGHCenterScaleTransform(target.bounds, scale);
    }
    [CATransaction commit];
    return;
  }

  NSTimeInterval duration = durationMs / 1000.0;
  [NSAnimationContext
      runAnimationGroup:^(NSAnimationContext *context) {
        context.allowsImplicitAnimation = YES;
        context.duration = duration;
        context.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut];
        if ([self hasOpacityAnimation]) {
          target.animator.alphaValue = opacity;
        }
        if ([self hasScaleAnimation]) {
          target.layer.transform = RNGHCenterScaleTransform(target.bounds, scale);
        }
      }
      completionHandler:nil];
#endif
}

- (void)handleAnimatePressIn
{
  if (_pendingPressOutBlock) {
    dispatch_block_cancel(_pendingPressOutBlock);
    _pendingPressOutBlock = nil;
  }
  // A press is starting; cancel a pending (bracketing) hover-out so the hover
  // state carries into the press and the hover -> press transition doesn't
  // flicker through the default state.
  [self cancelPendingHoverOut];
  _isPressed = YES;
  _pressInTimestamp = CACurrentMediaTime();
  RNGHUIView *target = self.animationTarget ?: self;
  [self animateTarget:target toOpacity:_activeOpacity scale:_activeScale duration:_tapAnimationInDuration];
  if ([self hasUnderlayAnimation]) {
    [self animateUnderlayToOpacity:_activeUnderlayOpacity duration:_tapAnimationInDuration];
  }
}

- (void)handleAnimatePressOut
{
  _isPressed = NO;
  if (_pendingPressOutBlock) {
    dispatch_block_cancel(_pendingPressOutBlock);
  }

  NSTimeInterval elapsed = (CACurrentMediaTime() - _pressInTimestamp) * 1000.0;

  if (_longPressDuration >= 0 && elapsed >= _longPressDuration) {
    // Long-press release - use the configured long-press out duration.
    NSInteger longPressOut = self.longPressAnimationOutDuration;
    RNGHUIView *target = self.animationTarget ?: self;
    [self animateTarget:target toOpacity:self.restingOpacity scale:self.restingScale duration:longPressOut];
    if ([self hasUnderlayAnimation]) {
      [self animateUnderlayToOpacity:self.restingUnderlayOpacity duration:longPressOut];
    }
  } else if (elapsed >= _tapAnimationInDuration) {
    // Press-in animation fully finished - release with the configured out duration.
    RNGHUIView *target = self.animationTarget ?: self;
    [self animateTarget:target toOpacity:self.restingOpacity scale:self.restingScale duration:_tapAnimationOutDuration];
    if ([self hasUnderlayAnimation]) {
      [self animateUnderlayToOpacity:self.restingUnderlayOpacity duration:_tapAnimationOutDuration];
    }
    // elapsed * 2 to ensure there is at least half of the tapAnimationOutDuration left for the animation to play
  } else if (elapsed * 2 >= _tapAnimationOutDuration) {
    // Past minimum but press-in animation still playing, animate out in elapsed time
    RNGHUIView *target = self.animationTarget ?: self;
    [self animateTarget:target toOpacity:self.restingOpacity scale:self.restingScale duration:elapsed];
    if ([self hasUnderlayAnimation]) {
      [self animateUnderlayToOpacity:self.restingUnderlayOpacity duration:elapsed];
    }
  } else {
    // Before minimum duration, finish press-in in remaining time then animate out in tapAnimationOutDuration.
    NSTimeInterval remaining = _tapAnimationInDuration - elapsed;

    RNGHUIView *target = self.animationTarget ?: self;
    [self animateTarget:target toOpacity:_activeOpacity scale:_activeScale duration:remaining];
    if ([self hasUnderlayAnimation]) {
      [self animateUnderlayToOpacity:_activeUnderlayOpacity duration:remaining];
    }

    __weak auto weakSelf = self;
    _pendingPressOutBlock = dispatch_block_create(DISPATCH_BLOCK_ASSIGN_CURRENT, ^{
      __strong auto strongSelf = weakSelf;
      if (strongSelf) {
        strongSelf->_pendingPressOutBlock = nil;
        RNGHUIView *target = strongSelf.animationTarget ?: strongSelf;
        [strongSelf animateTarget:target
                        toOpacity:strongSelf.restingOpacity
                            scale:strongSelf.restingScale
                         duration:strongSelf->_tapAnimationOutDuration];
        if ([strongSelf hasUnderlayAnimation]) {
          [strongSelf animateUnderlayToOpacity:strongSelf.restingUnderlayOpacity
                                      duration:strongSelf->_tapAnimationOutDuration];
        }
      }
    });
    NSTimeInterval scheduledDelay = [self shouldReduceMotion] ? 0 : remaining;
    dispatch_after(
        dispatch_time(DISPATCH_TIME_NOW, (int64_t)(scheduledDelay * NSEC_PER_MSEC)),
        dispatch_get_main_queue(),
        _pendingPressOutBlock);
  }
}

#if !TARGET_OS_OSX
- (void)handleHover:(UIHoverGestureRecognizer *)recognizer API_AVAILABLE(ios(13.4))
{
  switch (recognizer.state) {
    case UIGestureRecognizerStateBegan:
      [self animateHoverIn];
      break;
    case UIGestureRecognizerStateEnded:
    case UIGestureRecognizerStateCancelled:
      [self animateHoverOut];
      break;
    default:
      break;
  }
}
#endif

// Animate to the effective hover visual, mirroring web's non-pressed render
// `(hovered && enabled) ? hover : default`. The pressed state is owned by the
// press animations, so this is a no-op while pressed (the hover state is still
// recorded by the callers, and press-out reads it via resting*). Picks the
// in/out duration from the direction it settles.
- (void)applyHoverState
{
  if (_isPressed) {
    return;
  }

  RNGHUIView *target = self.animationTarget ?: self;

  if (_isHovered && _userEnabled) {
    [self animateTarget:target toOpacity:self.hoverOpacity scale:self.hoverScale duration:_hoverAnimationInDuration];

    if ([self hasUnderlayAnimation]) {
      [self animateUnderlayToOpacity:self.hoverUnderlayOpacity duration:_hoverAnimationInDuration];
    }
  } else {
    [self animateTarget:target toOpacity:_defaultOpacity scale:_defaultScale duration:_hoverAnimationOutDuration];

    if ([self hasUnderlayAnimation]) {
      [self animateUnderlayToOpacity:_defaultUnderlayOpacity duration:_hoverAnimationOutDuration];
    }
  }
}

- (void)cancelPendingHoverOut
{
  if (!_pendingHoverOutBlock) {
    return;
  }

  dispatch_block_cancel(_pendingHoverOutBlock);
  _pendingHoverOutBlock = nil;
}

- (void)animateHoverIn
{
  [self cancelPendingHoverOut];

  if (_isHovered) {
    return;
  }

  _isHovered = YES;
  [self applyHoverState];
}

- (void)animateHoverOut
{
  if (_isPressed) {
    // A genuine exit while pressed — drop hover so the release settles on the
    // default state rather than animating back to the hover values.
    _isHovered = NO;
    return;
  }

  [self cancelPendingHoverOut];

  // A pointer press is bracketed by a hover-out just before touch-down (e.g.
  // Apple Pencil). Defer the hover-out so an immediately following press
  // (which cancels it in handleAnimatePressIn) wins, keeping the hover state
  // for a flicker-free hover -> press -> hover transition. A real pointer
  // leave has no press following, so the block runs and settles to default.
  __weak auto weakSelf = self;
  _pendingHoverOutBlock = dispatch_block_create(DISPATCH_BLOCK_ASSIGN_CURRENT, ^{
    __strong auto strongSelf = weakSelf;
    if (strongSelf) {
      strongSelf->_pendingHoverOutBlock = nil;
      strongSelf->_isHovered = NO;
      [strongSelf applyHoverState];
    }
  });
  NSTimeInterval delay = [self shouldReduceMotion] ? 0 : [self minFrameDurationMs];
  dispatch_after(
      dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delay * NSEC_PER_MSEC)),
      dispatch_get_main_queue(),
      _pendingHoverOutBlock);
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
  if (topLeftHorizontal + topRightHorizontal > 0) {
    f = MIN(f, w / (topLeftHorizontal + topRightHorizontal));
  }
  if (bottomLeftHorizontal + bottomRightHorizontal > 0) {
    f = MIN(f, w / (bottomLeftHorizontal + bottomRightHorizontal));
  }
  if (topLeftVertical + bottomLeftVertical > 0) {
    f = MIN(f, h / (topLeftVertical + bottomLeftVertical));
  }
  if (topRightVertical + bottomRightVertical > 0) {
    f = MIN(f, h / (topRightVertical + bottomRightVertical));
  }

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
  if (topLeftHorizontal < 0.5) {
    topLeftHorizontal = 0;
  }
  if (topLeftVertical < 0.5) {
    topLeftVertical = 0;
  }
  if (topRightHorizontal < 0.5) {
    topRightHorizontal = 0;
  }
  if (topRightVertical < 0.5) {
    topRightVertical = 0;
  }
  if (bottomLeftHorizontal < 0.5) {
    bottomLeftHorizontal = 0;
  }
  if (bottomLeftVertical < 0.5) {
    bottomLeftVertical = 0;
  }
  if (bottomRightHorizontal < 0.5) {
    bottomRightHorizontal = 0;
  }
  if (bottomRightVertical < 0.5) {
    bottomRightVertical = 0;
  }

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
// macOS doesn't have UIHoverGestureRecognizer; instead we drive hover from an
// NSTrackingArea. NSTrackingInVisibleRect keeps it sized to the view
// automatically, and NSTrackingActiveAlways fires enter/exit even when the
// window isn't key (matching how a desktop cursor hover behaves regardless of
// focus). The area intentionally omits NSTrackingEnabledDuringMouseDrag, so
// during a press-drag the in/out tracking is handled by mouseDragged: /
// mouseUp: instead (the macOS analog of the iOS touch-bounds tracking).
- (void)updateTrackingAreas
{
  if (_hoverTrackingArea) {
    [self removeTrackingArea:_hoverTrackingArea];
  }
  _hoverTrackingArea = [[NSTrackingArea alloc]
      initWithRect:NSZeroRect
           options:NSTrackingMouseEnteredAndExited | NSTrackingActiveAlways | NSTrackingInVisibleRect
             owner:self
          userInfo:nil];
  [self addTrackingArea:_hoverTrackingArea];
  [super updateTrackingAreas];
}

- (void)mouseEntered:(NSEvent *)event
{
  [self animateHoverIn];
  [super mouseEntered:event];
}

- (void)mouseExited:(NSEvent *)event
{
  [self animateHoverOut];
  [super mouseExited:event];
}

- (void)mouseDown:(NSEvent *)event
{
  _isTouchInsideBounds = YES;
  [self handleAnimatePressIn];
  [super mouseDown:event];
}

- (void)mouseUp:(NSEvent *)event
{
  NSPoint locationInView = [self convertPoint:[event locationInWindow] fromView:nil];
  _isHovered = NSPointInRect(locationInView, self.bounds);

  [self handleAnimatePressOut];
  _isTouchInsideBounds = NO;
  [super mouseUp:event];
}

- (void)mouseDragged:(NSEvent *)event
{
  NSPoint locationInWindow = [event locationInWindow];
  NSPoint locationInView = [self convertPoint:locationInWindow fromView:nil];
  BOOL currentlyInside = NSPointInRect(locationInView, self.bounds);

  _isHovered = currentlyInside;

  if (currentlyInside && !_isTouchInsideBounds) {
    _isTouchInsideBounds = YES;
    [self handleAnimatePressIn];
  } else if (!currentlyInside && _isTouchInsideBounds) {
    _isTouchInsideBounds = NO;
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

// Whether a touch comes from a hovering input — an indirect pointer
// (trackpad / mouse) or an Apple Pencil — as opposed to a finger, which never
// hovers.
- (BOOL)isHoveringTouch:(UITouch *)touch
{
  if (@available(iOS 13.4, *)) {
    if (touch.type == UITouchTypeIndirectPointer) {
      return YES;
    }
  }
  return touch.type == UITouchTypePencil;
}

// Mirrors `sendActionsForControlEvents:` but preserves the real `UIEvent`
// so target-actions with a `forEvent:` parameter receive the touches.
// The public `sendActionsForControlEvents:` passes a nil event, which would
// make handlers reading `event.allTouches.count` observe 0 pointers.
- (void)rngh_sendActionsForControlEvents:(UIControlEvents)controlEvents withEvent:(UIEvent *)event
{
  for (id target in [self allTargets]) {
    for (NSString *actionName in [self actionsForTarget:target forControlEvent:controlEvents]) {
      [self sendAction:NSSelectorFromString(actionName) to:target forEvent:event];
    }
  }
}

// UIControl's default `touchesMoved:` / `touchesEnded:` invoke
// `{continue|end}TrackingWithTouch:` and THEN dispatch their own Drag* / Up*
// actions via `sendAction:to:forEvent:` using Apple's 70-point retention-offset
// hit-test. That double-fires our handlers (once from our manual dispatch in
// the tracking hooks, once from UIControl's retention-offset path). We swallow
// UIControl's dispatch via this override; the flag is armed by our tracking
// hooks only after our own dispatch has already run.
- (void)sendAction:(SEL)action to:(id)target forEvent:(UIEvent *)event
{
  if (_suppressSuperControlActionDispatch) {
    return;
  }
  [super sendAction:action to:target forEvent:event];
}

- (void)touchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesMoved:touches withEvent:event];
  _suppressSuperControlActionDispatch = NO;
}

- (void)touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesEnded:touches withEvent:event];
  _suppressSuperControlActionDispatch = NO;
}

- (BOOL)continueTrackingWithTouch:(UITouch *)touch withEvent:(UIEvent *)event
{
  // We take over drag event generation to enforce strict hitslop bounds
  // (bypassing Apple's retention offset). After our dispatch, set the
  // suppress flag so UIControl's default post-tracking dispatch in
  // `touchesMoved:` gets swallowed by our `sendAction:to:forEvent:` override.

  CGPoint location = [touch locationInView:self];
  CGRect hitFrame = UIEdgeInsetsInsetRect(self.bounds, self.hitTestEdgeInsets);
  BOOL currentlyInside = CGRectContainsPoint(hitFrame, location);

  // Keep `_isHovered` in sync with the drag position for a hovering pointer.
  // An Apple Pencil suppresses hover events while in contact, so the hover
  // recognizer can't track in/out transitions during a drag — this is the iOS
  // analog of the Android touch-bounds tracking, letting press-out settle on
  // the correct resting (hover vs default) state. A finger never hovers, so
  // `_isHovered` is left untouched (stays NO) for finger touches.
  if ([self isHoveringTouch:touch]) {
    _isHovered = currentlyInside;
  }

  if (currentlyInside) {
    if (!_isTouchInsideBounds) {
      [self rngh_sendActionsForControlEvents:UIControlEventTouchDragEnter withEvent:event];
      _isTouchInsideBounds = YES;
    }

    // Targets may call `cancelTrackingWithEvent:` in response to DragEnter.
    if (self.tracking) {
      [self rngh_sendActionsForControlEvents:UIControlEventTouchDragInside withEvent:event];
    }
  } else {
    if (_isTouchInsideBounds) {
      [self rngh_sendActionsForControlEvents:UIControlEventTouchDragExit withEvent:event];
      _isTouchInsideBounds = NO;
    }

    // Targets may call `cancelTrackingWithEvent:` in response to DragExit.
    if (self.tracking) {
      [self rngh_sendActionsForControlEvents:UIControlEventTouchDragOutside withEvent:event];
    }
  }

  _suppressSuperControlActionDispatch = YES;

  // If `cancelTrackingWithEvent` was called, `self.tracking` will be NO.
  return self.tracking;
}

- (void)endTrackingWithTouch:(UITouch *)touch withEvent:(UIEvent *)event
{
  // Same rationale as `continueTrackingWithTouch:` — we dispatch the final
  // Up* event ourselves using strict hitslop bounds, then set the suppress
  // flag so UIControl's default dispatch in `touchesEnded:` gets swallowed.

  if (touch != nil) {
    CGPoint location = [touch locationInView:self];
    CGRect hitFrame = UIEdgeInsetsInsetRect(self.bounds, self.hitTestEdgeInsets);
    BOOL inside = CGRectContainsPoint(hitFrame, location);

    // A hovering pointer (trackpad / Apple Pencil) is still hovering after the
    // touch ends iff it lifted inside the bounds; settle press-out on the
    // matching resting state. Set before dispatching Up* (which drives
    // handleAnimatePressOut, reading restingOpacity). A finger never hovers, so
    // `_isHovered` is left untouched for finger touches.
    if ([self isHoveringTouch:touch]) {
      _isHovered = inside;
    }

    if (inside) {
      [self rngh_sendActionsForControlEvents:UIControlEventTouchUpInside withEvent:event];
    } else {
      [self rngh_sendActionsForControlEvents:UIControlEventTouchUpOutside withEvent:event];
    }

    _suppressSuperControlActionDispatch = YES;
  }

  _isTouchInsideBounds = NO;
}

- (void)cancelTrackingWithEvent:(UIEvent *)event
{
  // A cancelled touch (e.g. a scroll view stealing the gesture) aborts the
  // press entirely; drop the hover state so the TouchCancel-driven press-out
  // settles on the default rather than the hover values. Cleared before super
  // dispatches the cancel action so restingOpacity reads the new value. Cancel
  // coordinates/tool are unreliable, so this is unconditional (matching the
  // Android ACTION_CANCEL handling).
  _isHovered = NO;
  _isTouchInsideBounds = NO;
  [super cancelTrackingWithEvent:event];
}

- (BOOL)shouldHandleTouch:(RNGHUIView *)view atPoint:(CGPoint)point
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

  BOOL gestureRecognizerWantsEvent = NO;
  for (UIGestureRecognizer *recognizer in enabledGestureRecognizers) {
    RNGestureHandler *handler = [RNGestureHandler findGestureHandlerByRecognizer:recognizer];
    if (handler != nil) {
      CGPoint pointInView = [self convertPoint:point toView:handler.recognizer.view];
      gestureRecognizerWantsEvent = [handler wantsToHandleEventsAtPoint:pointInView];
    } else {
      gestureRecognizerWantsEvent = YES;
    }
    if (gestureRecognizerWantsEvent) {
      break;
    }
  }

#if !TARGET_OS_OSX
  return [view isKindOfClass:[UIControl class]] || gestureRecognizerWantsEvent;
#else
  return [view isKindOfClass:[NSControl class]] || [enabledGestureRecognizers count] > 0;
#endif
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
        if (hitView != nil && [self shouldHandleTouch:hitView atPoint:point]) {
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
  while (inner && ![self shouldHandleTouch:inner atPoint:point]) {
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
