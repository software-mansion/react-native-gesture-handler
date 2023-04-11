//
//  RNHoverHandler.m
//  RNGestureHandler
//
//  Created by Jakub Piasecki on 31/03/2023.
//

#import "RNHoverHandler.h"

#import <React/RCTConvert.h>
#import <UIKit/UIGestureRecognizerSubclass.h>

typedef NS_ENUM(NSInteger, RNGestureHandlerHoverFeedback) {
  RNGestureHandlerHoverFeedbackNone = 0,
  RNGestureHandlerHoverFeedbackLift,
  RNGestureHandlerHoverFeedbackHightlight,
};

#if defined(__IPHONE_OS_VERSION_MAX_ALLOWED) && defined(__IPHONE_13_4) && \
    __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_13_4

API_AVAILABLE(ios(13.4))
@interface RNBetterHoverGestureRecognizer : UIHoverGestureRecognizer <UIPointerInteractionDelegate>

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler;

@property (nonatomic) RNGestureHandlerHoverFeedback hoverFeedback;

@end

@implementation RNBetterHoverGestureRecognizer {
  __weak RNGestureHandler *_gestureHandler;
}

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler
{
  if ((self = [super initWithTarget:gestureHandler action:@selector(handleGesture:)])) {
    _gestureHandler = gestureHandler;
    _hoverFeedback = RNGestureHandlerHoverFeedbackNone;
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

- (UIPointerStyle *)pointerInteraction:(UIPointerInteraction *)interaction styleForRegion:(UIPointerRegion *)region
{
  if (interaction.view != nil && _hoverFeedback != RNGestureHandlerHoverFeedbackNone) {
    UITargetedPreview *preview = [[UITargetedPreview alloc] initWithView:interaction.view];
    UIPointerEffect *effect = nil;

    if (_hoverFeedback == RNGestureHandlerHoverFeedbackLift) {
      effect = [UIPointerLiftEffect effectWithPreview:preview];
    } else if (_hoverFeedback == RNGestureHandlerHoverFeedbackHightlight) {
      effect = [UIPointerHoverEffect effectWithPreview:preview];
    }

    return [UIPointerStyle styleWithEffect:effect shape:nil];
  }

  return nil;
}

@end

#endif

@implementation RNHoverGestureHandler {
#if defined(__IPHONE_OS_VERSION_MAX_ALLOWED) && defined(__IPHONE_13_4) && \
    __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_13_4
  UIPointerInteraction *_pointerInteraction;
#endif
}

- (instancetype)initWithTag:(NSNumber *)tag
{
  if ((self = [super initWithTag:tag])) {
#if defined(__IPHONE_OS_VERSION_MAX_ALLOWED) && defined(__IPHONE_13_4) && \
    __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_13_4
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
#if defined(__IPHONE_OS_VERSION_MAX_ALLOWED) && defined(__IPHONE_13_4) && \
    __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_13_4
  if (@available(iOS 13.4, *)) {
    [super bindToView:view];
    [view addInteraction:_pointerInteraction];
  }
#endif
}

- (void)unbindFromView
{
#if defined(__IPHONE_OS_VERSION_MAX_ALLOWED) && defined(__IPHONE_13_4) && \
    __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_13_4
  if (@available(iOS 13.4, *)) {
    [super unbindFromView];
    [self.recognizer.view removeInteraction:_pointerInteraction];
  }
#endif
}

- (void)resetConfig
{
  [super resetConfig];

#if defined(__IPHONE_OS_VERSION_MAX_ALLOWED) && defined(__IPHONE_13_4) && \
    __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_13_4
  if (@available(iOS 13.4, *)) {
    RNBetterHoverGestureRecognizer *recognizer = (RNBetterHoverGestureRecognizer *)_recognizer;
    recognizer.hoverFeedback = RNGestureHandlerHoverFeedbackNone;
  }
#endif
}

- (void)configure:(NSDictionary *)config
{
  [super configure:config];

#if defined(__IPHONE_OS_VERSION_MAX_ALLOWED) && defined(__IPHONE_13_4) && \
    __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_13_4
  if (@available(iOS 13.4, *)) {
    RNBetterHoverGestureRecognizer *recognizer = (RNBetterHoverGestureRecognizer *)_recognizer;
    APPLY_INT_PROP(hoverFeedback);
  }
#endif
}

- (RNGestureHandlerEventExtraData *)eventExtraData:(UIGestureRecognizer *)recognizer
{
  return [RNGestureHandlerEventExtraData forPosition:[recognizer locationInView:recognizer.view]
                                withAbsolutePosition:[recognizer locationInView:recognizer.view.window]];
}

@end
