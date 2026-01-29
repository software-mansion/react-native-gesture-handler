//
//  RNNativeViewHandler.m
//  RNGestureHandler
//
//  Created by Krzysztof Magiera on 12/10/2017.
//  Copyright © 2017 Software Mansion. All rights reserved.
//

#import "RNNativeViewHandler.h"

#if !TARGET_OS_OSX
#import <UIKit/UIGestureRecognizerSubclass.h>
#endif

#import <React/RCTConvert.h>
#import <React/RCTScrollViewComponentView.h>
#import <React/UIView+React.h>

#pragma mark RNDummyGestureRecognizer

@implementation RNDummyGestureRecognizer {
  __weak RNGestureHandler *_gestureHandler;
}

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler
{
  if ((self = [super initWithTarget:gestureHandler action:@selector(handleGesture:fromReset:)])) {
    _gestureHandler = gestureHandler;
  }
  return self;
}

#if !TARGET_OS_OSX
- (void)touchesBegan:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
  [_gestureHandler setCurrentPointerType:event];
  [_gestureHandler.pointerTracker touchesBegan:touches withEvent:event];
}

- (void)touchesMoved:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
  [self updateStateIfScrollView];
  [_gestureHandler.pointerTracker touchesMoved:touches withEvent:event];
}

- (void)touchesEnded:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
  [_gestureHandler.pointerTracker touchesEnded:touches withEvent:event];
  self.state = UIGestureRecognizerStateFailed;

  // For now, we are handling only the scroll view case.
  // If more views need special treatment, then we can switch to a delegate pattern
  if ([_gestureHandler retrieveScrollView:self.view] == nil) {
    [self reset];
  }
}

- (void)touchesCancelled:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
  [_gestureHandler.pointerTracker touchesCancelled:touches withEvent:event];
  self.state = UIGestureRecognizerStateCancelled;
  [self reset];
}

#else
- (void)mouseDown:(NSEvent *)event
{
  [_gestureHandler setCurrentPointerTypeToMouse];

  self.state = NSGestureRecognizerStateBegan;
  [_gestureHandler.pointerTracker touchesBegan:[NSSet setWithObject:event] withEvent:event];
}

- (void)mouseDragged:(NSEvent *)event
{
  self.state = NSGestureRecognizerStateChanged;
  [_gestureHandler.pointerTracker touchesMoved:[NSSet setWithObject:event] withEvent:event];
}

- (void)mouseUp:(NSEvent *)event
{
  self.state = NSGestureRecognizerStateEnded;
  [_gestureHandler.pointerTracker touchesEnded:[NSSet setWithObject:event] withEvent:event];
  [self reset];
}

#endif

- (void)reset
{
  [_gestureHandler.pointerTracker reset];
  [super reset];
  [_gestureHandler reset];
}

- (void)updateStateIfScrollView
{
  RNGHUIScrollView *scrollView = [_gestureHandler retrieveScrollView:self.view];
  if (!scrollView) {
    return;
  }
  for (UIGestureRecognizer *scrollViewGestureRecognizer in scrollView.gestureRecognizers) {
    if ([_gestureHandler isUIScrollViewPanGestureRecognizer:scrollViewGestureRecognizer]) {
      self.state = scrollViewGestureRecognizer.state;
    }
  }
}

@end

#pragma mark RNNativeViewGestureHandler

@implementation RNNativeViewGestureHandler {
  BOOL _shouldActivateOnStart;
  BOOL _disallowInterruption;
}

- (instancetype)initWithTag:(NSNumber *)tag
{
  if ((self = [super initWithTag:tag])) {
    _recognizer = [[RNDummyGestureRecognizer alloc] initWithGestureHandler:self];
  }
  return self;
}

- (void)updateConfig:(NSDictionary *)config
{
  [super updateConfig:config];
  _shouldActivateOnStart = [RCTConvert BOOL:config[@"shouldActivateOnStart"]];
  _disallowInterruption = [RCTConvert BOOL:config[@"disallowInterruption"]];
}

#if !TARGET_OS_OSX

- (void)bindToView:(UIView *)view
{
  // For UIControl based views (UIButton, UISwitch) we provide special handling that would allow
  // for properties like `disallowInterruption` to work.
  if ([view isKindOfClass:[UIControl class]]) {
    UIControl *control = (UIControl *)view;
    [control addTarget:self action:@selector(handleTouchDown:forEvent:) forControlEvents:UIControlEventTouchDown];
    [control addTarget:self
                  action:@selector(handleTouchUpOutside:forEvent:)
        forControlEvents:UIControlEventTouchUpOutside];
    [control addTarget:self
                  action:@selector(handleTouchUpInside:forEvent:)
        forControlEvents:UIControlEventTouchUpInside];
    [control addTarget:self action:@selector(handleDragExit:forEvent:) forControlEvents:UIControlEventTouchDragExit];
    [control addTarget:self action:@selector(handleDragEnter:forEvent:) forControlEvents:UIControlEventTouchDragEnter];
    [control addTarget:self action:@selector(handleTouchCancel:forEvent:) forControlEvents:UIControlEventTouchCancel];
  } else {
    [super bindToView:view];
  }

  // We can restore default scrollview behaviour to delay touches to scrollview's children
  // because gesture handler system can handle cancellation of scroll recognizer when JS responder
  // is set
  UIScrollView *scrollView = [self retrieveScrollView:view];
  scrollView.delaysContentTouches = YES;
}

- (void)unbindFromView
{
  // Restore the React Native's overriden behavor for not delaying content touches
  UIScrollView *scrollView = [self retrieveScrollView:self.recognizer.view];
  scrollView.delaysContentTouches = NO;

  [super unbindFromView];
}

- (void)handleTouchDown:(UIView *)sender forEvent:(UIEvent *)event
{
  [self setCurrentPointerType:event];
  [self reset];

  if (_disallowInterruption) {
    // When `disallowInterruption` is set we cancel all gesture handlers when this UIControl
    // gets DOWN event
    for (RNGHUITouch *touch in [event allTouches]) {
      for (UIGestureRecognizer *recogn in [touch gestureRecognizers]) {
        recogn.enabled = NO;
        recogn.enabled = YES;
      }
    }
  }

  [self sendEventsInState:RNGestureHandlerStateActive
           forViewWithTag:sender.reactTag
            withExtraData:[RNGestureHandlerEventExtraData forPointerInside:YES withPointerType:_pointerType]];
}

- (void)handleTouchUpOutside:(UIView *)sender forEvent:(UIEvent *)event
{
  [self sendEventsInState:RNGestureHandlerStateEnd
           forViewWithTag:sender.reactTag
            withExtraData:[RNGestureHandlerEventExtraData forPointerInside:NO withPointerType:_pointerType]];
}

- (void)handleTouchUpInside:(UIView *)sender forEvent:(UIEvent *)event
{
  [self sendEventsInState:RNGestureHandlerStateEnd
           forViewWithTag:sender.reactTag
            withExtraData:[RNGestureHandlerEventExtraData forPointerInside:YES withPointerType:_pointerType]];
}

- (void)handleDragExit:(UIView *)sender forEvent:(UIEvent *)event
{
  // Pointer is moved outside of the view bounds, we cancel button when `shouldCancelWhenOutside` is set
  if (self.shouldCancelWhenOutside) {
    UIControl *control = (UIControl *)sender;
    [control cancelTrackingWithEvent:event];
    [self sendEventsInState:RNGestureHandlerStateEnd
             forViewWithTag:sender.reactTag
              withExtraData:[RNGestureHandlerEventExtraData forPointerInside:NO withPointerType:_pointerType]];
  } else {
    [self sendEventsInState:RNGestureHandlerStateActive
             forViewWithTag:sender.reactTag
              withExtraData:[RNGestureHandlerEventExtraData forPointerInside:NO withPointerType:_pointerType]];
  }
}

- (void)handleDragEnter:(UIView *)sender forEvent:(UIEvent *)event
{
  [self sendEventsInState:RNGestureHandlerStateActive
           forViewWithTag:sender.reactTag
            withExtraData:[RNGestureHandlerEventExtraData forPointerInside:YES withPointerType:_pointerType]];
}

- (void)handleTouchCancel:(UIView *)sender forEvent:(UIEvent *)event
{
  [self sendEventsInState:RNGestureHandlerStateCancelled
           forViewWithTag:sender.reactTag
            withExtraData:[RNGestureHandlerEventExtraData forPointerInside:NO withPointerType:_pointerType]];
}

- (BOOL)wantsToAttachDirectlyToView
{
  return YES;
}

#else

- (RNGestureHandlerEventExtraData *)eventExtraData:(RNDummyGestureRecognizer *)recognizer
{
  return [RNGestureHandlerEventExtraData forPointerInside:[self containsPointInView]
                                          withPointerType:RNGestureHandlerMouse];
}

#endif

@end
