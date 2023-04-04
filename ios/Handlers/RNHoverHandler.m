//
//  RNHoverHandler.m
//  RNGestureHandler
//
//  Created by Jakub Piasecki on 31/03/2023.
//

#import "RNHoverHandler.h"

#import <React/RCTConvert.h>
#import <UIKit/UIGestureRecognizerSubclass.h>

// TODO: handle iOS versions lower than 13?

typedef NS_ENUM(NSInteger, RNGestureHandlerHoverEffect) {
  RNGestureHandlerHoverEffectNone = 0,
  RNGestureHandlerHoverEffectLift,
  RNGestureHandlerHoverEffectHightlight,
};

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

@implementation RNHoverGestureHandler {
  UIPointerInteraction *_pointerInteraction;
}

- (instancetype)initWithTag:(NSNumber *)tag
{
  if ((self = [super initWithTag:tag])) {
    _recognizer = [[RNBetterHoverGestureRecognizer alloc] initWithGestureHandler:self];
    _pointerInteraction = [[UIPointerInteraction alloc] initWithDelegate:(id<UIPointerInteractionDelegate>)_recognizer];
  }
  return self;
}

- (void)bindToView:(UIView *)view
{
  [super bindToView:view];
  [view addInteraction:_pointerInteraction];
}

- (void)unbindFromView
{
  [super unbindFromView];
  [self.recognizer.view removeInteraction:_pointerInteraction];
}

- (void)resetConfig
{
  [super resetConfig];
  RNBetterHoverGestureRecognizer *recognizer = (RNBetterHoverGestureRecognizer *)_recognizer;
  recognizer.hoverEffect = RNGestureHandlerHoverEffectNone;
}

- (void)configure:(NSDictionary *)config
{
  [super configure:config];
  RNBetterHoverGestureRecognizer *recognizer = (RNBetterHoverGestureRecognizer *)_recognizer;

  APPLY_INT_PROP(hoverEffect);
}

- (RNGestureHandlerEventExtraData *)eventExtraData:(UIGestureRecognizer *)recognizer
{
  return [RNGestureHandlerEventExtraData forPosition:[recognizer locationInView:recognizer.view]
                                withAbsolutePosition:[recognizer locationInView:recognizer.view.window]];
}

@end
