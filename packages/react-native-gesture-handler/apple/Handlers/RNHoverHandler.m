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

#define CHECK_TARGET(__VERSION__)                                                \
  defined(__IPHONE_OS_VERSION_MAX_ALLOWED) && defined(__IPHONE_##__VERSION__) && \
      __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_##__VERSION__ && !TARGET_OS_TV

typedef NS_ENUM(NSInteger, RNGestureHandlerHoverEffect) {
  RNGestureHandlerHoverEffectNone = 0,
  RNGestureHandlerHoverEffectLift,
  RNGestureHandlerHoverEffectHightlight,
};

#if CHECK_TARGET(13_4)

API_AVAILABLE(ios(13.4))
@interface RNBetterHoverGestureRecognizer : UIHoverGestureRecognizer <UIPointerInteractionDelegate>

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler;

@property (nonatomic) RNGestureHandlerHoverEffect hoverEffect;

@end

@implementation RNBetterHoverGestureRecognizer {
  __weak RNGestureHandler *_gestureHandler;
}

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler
{
  if ((self = [super initWithTarget:gestureHandler action:@selector(handleGesture:)])) {
    _gestureHandler = gestureHandler;
    _hoverEffect = RNGestureHandlerHoverEffectNone;
  }
  return self;
}

- (void)triggerAction
{
  [_gestureHandler handleGesture:self];
}

- (void)cancel
{
  self.enabled = NO;
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
#if CHECK_TARGET(13_4)
  UIPointerInteraction *_pointerInteraction;
#endif
}

- (instancetype)initWithTag:(NSNumber *)tag
{
#if TARGET_OS_TV
  RCTLogWarn(@"HoverGestureHandler is not supported on tvOS");
#endif

  if ((self = [super initWithTag:tag])) {
#if CHECK_TARGET(13_4)
    if (@available(iOS 13.4, *)) {
      _recognizer = [[RNBetterHoverGestureRecognizer alloc] initWithGestureHandler:self];
      _pointerInteraction =
          [[UIPointerInteraction alloc] initWithDelegate:(id<UIPointerInteractionDelegate>)_recognizer];
    }
#endif
  }
  return self;
}

- (void)bindToView:(UIView *)view
{
#if CHECK_TARGET(13_4)
  if (@available(iOS 13.4, *)) {
    [super bindToView:view];
    [view addInteraction:_pointerInteraction];
  }
#endif
}

- (void)unbindFromView
{
#if CHECK_TARGET(13_4)
  if (@available(iOS 13.4, *)) {
    [super unbindFromView];
    [self.recognizer.view removeInteraction:_pointerInteraction];
  }
#endif
}

- (void)resetConfig
{
  [super resetConfig];

#if CHECK_TARGET(13_4)
  if (@available(iOS 13.4, *)) {
    RNBetterHoverGestureRecognizer *recognizer = (RNBetterHoverGestureRecognizer *)_recognizer;
    recognizer.hoverEffect = RNGestureHandlerHoverEffectNone;
  }
#endif
}

- (void)updateConfig:(NSDictionary *)config
{
  [super updateConfig:config];

#if CHECK_TARGET(13_4)
  if (@available(iOS 13.4, *)) {
    RNBetterHoverGestureRecognizer *recognizer = (RNBetterHoverGestureRecognizer *)_recognizer;
    APPLY_INT_PROP(hoverEffect);
  }
#endif
}

- (RNGestureHandlerEventExtraData *)eventExtraData:(UIGestureRecognizer *)recognizer
{
  return [RNGestureHandlerEventExtraData forPosition:[recognizer locationInView:recognizer.view]
                                withAbsolutePosition:[recognizer locationInView:recognizer.view.window]
                                     withPointerType:UITouchTypePencil];
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
  }

  return self;
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

- (void)mouseEntered:(NSEvent *)event
{
  [self sendEventsInState:RNGestureHandlerStateBegan
           forViewWithTag:_view.reactTag
            withExtraData:[RNGestureHandlerEventExtraData forPointerInside:YES withPointerType:_pointerType]];
  [self sendEventsInState:RNGestureHandlerStateActive
           forViewWithTag:_view.reactTag
            withExtraData:[RNGestureHandlerEventExtraData forPointerInside:YES withPointerType:_pointerType]];
}

- (void)mouseExited:(NSEvent *)theEvent
{
  [self sendEventsInState:RNGestureHandlerStateEnd
           forViewWithTag:_view.reactTag
            withExtraData:[RNGestureHandlerEventExtraData forPointerInside:YES withPointerType:_pointerType]];

  [self sendEventsInState:RNGestureHandlerStateUndetermined
           forViewWithTag:_view.reactTag
            withExtraData:[RNGestureHandlerEventExtraData forPointerInside:YES withPointerType:_pointerType]];
}

@end

#endif
