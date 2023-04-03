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

@interface RNBetterHoverGestureRecognizer : UIHoverGestureRecognizer <UIPointerInteractionDelegate>

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler;

@end

@implementation RNBetterHoverGestureRecognizer {
  __weak RNGestureHandler *_gestureHandler;
}

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler
{
  if ((self = [super initWithTarget:gestureHandler action:@selector(handleGesture:)])) {
    _gestureHandler = gestureHandler;
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
  // TODO: figure out whether this stays or not
  //    if (interaction.view != nil) {
  //        UITargetedPreview *preview = [[UITargetedPreview alloc] initWithView:interaction.view];
  //        UIPointerEffect *effect = [UIPointerLiftEffect effectWithPreview:preview];
  //
  //        return [UIPointerStyle styleWithEffect:effect shape:nil];
  //    }

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

//- (void)resetConfig
//{
//  [super resetConfig];
//  RNBetterHoverGestureRecognizer *recognizer = (RNBetterHoverGestureRecognizer *)_recognizer;
//}
//
//- (void)configure:(NSDictionary *)config
//{
//  [super configure:config];
//  RNBetterHoverGestureRecognizer *recognizer = (RNBetterHoverGestureRecognizer *)_recognizer;
//}

- (RNGestureHandlerEventExtraData *)eventExtraData:(UIGestureRecognizer *)recognizer
{
  return [RNGestureHandlerEventExtraData forPosition:[recognizer locationInView:recognizer.view]
                                withAbsolutePosition:[recognizer locationInView:recognizer.view.window]];
}

@end
