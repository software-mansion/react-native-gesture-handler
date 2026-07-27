//
//  RNHoverHandler.m
//  RNGestureHandler
//
//  Created by Jakub Piasecki on 31/03/2023.
//

#import "RNHoverHandler.h"
#import <React/UIView+React.h>

#if !TARGET_OS_OSX

#import <React/RCTConvert.h>
#import <UIKit/UIGestureRecognizerSubclass.h>

typedef NS_ENUM(NSInteger, RNGestureHandlerHoverEffect) {
  RNGestureHandlerHoverEffectNone = 0,
  RNGestureHandlerHoverEffectLift,
  RNGestureHandlerHoverEffectHightlight,
};

#if !TARGET_OS_TV

@interface RNBetterHoverGestureRecognizer : UIHoverGestureRecognizer <UIPointerInteractionDelegate>

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler;

@property (nonatomic) RNGestureHandlerHoverEffect hoverEffect;

@end

@implementation RNBetterHoverGestureRecognizer {
  __weak RNGestureHandler *_gestureHandler;
}

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler
{
  if ((self = [super initWithTarget:self action:@selector(handleGesture:)])) {
    _gestureHandler = gestureHandler;
    _hoverEffect = RNGestureHandlerHoverEffectNone;
  }
  return self;
}

- (void)handleGesture:(UIHoverGestureRecognizer *)recognizer
{
  if (recognizer.state == UIGestureRecognizerStateBegan) {
    [_gestureHandler setCurrentPointerType:RNGestureHandlerMouse];
  }

  [_gestureHandler handleGesture:self];
}

- (void)reset
{
  [super reset];
  [_gestureHandler reset];
}

- (UIPointerStyle *)pointerInteraction:(UIPointerInteraction *)interaction styleForRegion:(UIPointerRegion *)region
{
  if (interaction.view != nil && _hoverEffect != RNGestureHandlerHoverEffectNone) {
    UITargetedPreview *preview = [[UITargetedPreview alloc] initWithView:interaction.view];
    UIPointerEffect *effect = nil;

    if (_hoverEffect == RNGestureHandlerHoverEffectLift) {
      effect = [UIPointerLiftEffect effectWithPreview:preview];
    } else if (_hoverEffect == RNGestureHandlerHoverEffectHightlight) {
      effect = [UIPointerHoverEffect effectWithPreview:preview];
    }

    return [UIPointerStyle styleWithEffect:effect shape:nil];
  }

  return nil;
}

@end

#endif

@implementation RNHoverGestureHandler {
#if !TARGET_OS_TV
  UIPointerInteraction *_pointerInteraction;
#endif
}

- (instancetype)initWithTag:(NSNumber *)tag
{
#if TARGET_OS_TV
  RCTLogWarn(@"HoverGestureHandler is not supported on tvOS");
#endif

  if ((self = [super initWithTag:tag])) {
#if !TARGET_OS_TV
    _recognizer = [[RNBetterHoverGestureRecognizer alloc] initWithGestureHandler:self];
    _pointerInteraction = [[UIPointerInteraction alloc] initWithDelegate:(id<UIPointerInteractionDelegate>)_recognizer];
#endif
  }
  return self;
}

- (void)bindToView:(UIView *)view
{
#if !TARGET_OS_TV
  [super bindToView:view];
  [view addInteraction:_pointerInteraction];
#endif
}

- (void)unbindFromView
{
#if !TARGET_OS_TV
  [self.recognizer.view removeInteraction:_pointerInteraction];
  [super unbindFromView];
#endif
}

- (void)resetConfig
{
  [super resetConfig];

#if !TARGET_OS_TV
  RNBetterHoverGestureRecognizer *recognizer = (RNBetterHoverGestureRecognizer *)_recognizer;
  recognizer.hoverEffect = RNGestureHandlerHoverEffectNone;
#endif
}

- (void)updateConfig:(NSDictionary *)config
{
  [super updateConfig:config];

#if !TARGET_OS_TV
  RNBetterHoverGestureRecognizer *recognizer = (RNBetterHoverGestureRecognizer *)_recognizer;
  APPLY_INT_PROP(hoverEffect);
#endif
}

- (void)setCurrentPointerType:(RNGestureHandlerPointerType)pointerType
{
  _pointerType = pointerType;

#if !TARGET_OS_TV
  if (@available(iOS 16.1, *)) {
    if (((UIHoverGestureRecognizer *)self.recognizer).zOffset > 0.0) {
      _pointerType = RNGestureHandlerStylus;
    }
  }
#endif
}

- (RNGestureHandlerEventExtraData *)eventExtraData:(UIGestureRecognizer *)recognizer
{
  return [RNGestureHandlerEventExtraData forPosition:[recognizer locationInView:self.coordinateView]
                                withAbsolutePosition:[recognizer locationInView:recognizer.view.window]
                                     withPointerType:_pointerType];
}

- (BOOL)isContinuous
{
  return YES;
}

@end

#else

@implementation RNHoverGestureHandler {
  NSTrackingArea *trackingArea;
  RNGHUIView *_view;
}

- (instancetype)initWithTag:(NSNumber *)tag
{
  if ((self = [super initWithTag:tag])) {
    _recognizer = [NSGestureRecognizer alloc];
    _pointerType = RNGestureHandlerMouse;
  }

  return self;
}

- (BOOL)isContinuous
{
  return YES;
}

- (void)bindToView:(RNGHUIView *)view
{
  _view = view;

  NSTrackingAreaOptions options =
      NSTrackingMouseEnteredAndExited | NSTrackingActiveInActiveApp | NSTrackingInVisibleRect;

  trackingArea = [[NSTrackingArea alloc] initWithRect:_view.bounds options:options owner:self userInfo:nil];
  [_view addTrackingArea:trackingArea];
}

- (void)unbindFromView
{
  [_view removeTrackingArea:trackingArea];
  _view = nil;
}

- (RNGestureHandlerEventExtraData *)extraDataForEvent:(NSEvent *)event
{
  CGPoint windowLocation = [event locationInWindow];
  CGPoint relativePos = [_view convertPoint:windowLocation fromView:nil];
  CGPoint absolutePos = [_view.window.contentView convertPoint:windowLocation fromView:nil];

  return [RNGestureHandlerEventExtraData forPosition:relativePos
                                withAbsolutePosition:absolutePos
                                 withNumberOfTouches:1
                                     withPointerType:_pointerType];
}

- (void)mouseEntered:(NSEvent *)event
{
  RNGestureHandlerEventExtraData *extraData = [self extraDataForEvent:event];
  [self sendEventsInState:RNGestureHandlerStateBegan forViewWithTag:_view.reactTag withExtraData:extraData];
  [self sendEventsInState:RNGestureHandlerStateActive forViewWithTag:_view.reactTag withExtraData:extraData];
}

- (void)mouseExited:(NSEvent *)event
{
  RNGestureHandlerEventExtraData *extraData = [self extraDataForEvent:event];
  [self sendEventsInState:RNGestureHandlerStateEnd forViewWithTag:_view.reactTag withExtraData:extraData];
  [self sendEventsInState:RNGestureHandlerStateUndetermined forViewWithTag:_view.reactTag withExtraData:extraData];
}

@end

#endif
