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
//- (BOOL)shouldFailUnderCustomCriteria
//{
//  return NO;
//}
//
//- (void)reset
//{
//  if (self.state == UIGestureRecognizerStateFailed) {
//    [self triggerAction];
//  }
//  [_gestureHandler.pointerTracker reset];
//
//  [NSObject cancelPreviousPerformRequestsWithTarget:self selector:@selector(cancel) object:nil];
//  _tapsSoFar = 0;
//  _maxNumberOfTouches = 0;
//  self.enabled = YES;
//  [super reset];
//}

//- (UIPointerStyle *)pointerInteraction:(UIPointerInteraction *)interaction styleForRegion:(UIPointerRegion *)region
//{
//    if (interaction.view != nil) {
//        UITargetedPreview *preview = [[UITargetedPreview alloc] initWithView:interaction.view];
//        UIPointerEffect *effect = [UIPointerLiftEffect effectWithPreview:preview];
//
//        return [UIPointerStyle styleWithEffect:effect shape:nil];
//    }
//
//    return nil;
//}
//
//- (void)pointerInteraction:(UIPointerInteraction *)interaction willEnterRegion:(UIPointerRegion *)region
// animator:(id<UIPointerInteractionAnimating>)animator
//{
////    interaction.view.alpha = 0.5;
//}
//
//- (void)pointerInteraction:(UIPointerInteraction *)interaction willExitRegion:(UIPointerRegion *)region
// animator:(id<UIPointerInteractionAnimating>)animator
//{
////    interaction.view.alpha = 1;
//}

@end

@implementation RNHoverGestureHandler {
  RNGestureHandlerEventExtraData *_lastData;
}

- (instancetype)initWithTag:(NSNumber *)tag
{
  if ((self = [super initWithTag:tag])) {
    _recognizer = [[RNBetterHoverGestureRecognizer alloc] initWithGestureHandler:self];
  }
  return self;
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
//    RNBetterHoverGestureRecognizer *recognizer = (RNBetterHoverGestureRecognizer *)_recognizer;
//}

- (RNGestureHandlerEventExtraData *)eventExtraData:(UIGestureRecognizer *)recognizer
{
  if (recognizer.state == UIGestureRecognizerStateEnded) {
    return _lastData;
  }

  _lastData = [super eventExtraData:recognizer];
  return _lastData;
}

//- (BOOL)gestureRecognizerShouldBegin:(UIGestureRecognizer *)gestureRecognizer
//{
//  // UNDETERMINED -> BEGAN state change event is sent before this method is called,
//  // in RNGestureHandler it resets _lastSatate variable, making is seem like handler
//  // went from UNDETERMINED to BEGAN and then from UNDETERMINED to ACTIVE.
//  // This way we preserve _lastState between events and keep correct state flow.
//  RNGestureHandlerState savedState = _lastState;
//  BOOL shouldBegin = [super gestureRecognizerShouldBegin:gestureRecognizer];
//  _lastState = savedState;
//
//  return shouldBegin;
//}

@end
