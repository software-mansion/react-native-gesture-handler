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
#import <React/RCTTextInputComponentView.h>
#import <React/UIView+React.h>

#if !TARGET_OS_OSX
@interface RNNativeViewGestureHandler ()
- (void)handleTextViewTouchDown:(UIEvent *)event;
- (void)handleTextViewTouchUp:(UIEvent *)event;
- (void)handleTextViewTouchCancel:(UIEvent *)event;
@end
#endif

#pragma mark RNDummyGestureRecognizer

@implementation RNDummyGestureRecognizer {
  __weak RNGestureHandler *_gestureHandler;
}

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler
{
  if ((self = [super initWithTarget:gestureHandler action:@selector(handleGesture:)])) {
    _gestureHandler = gestureHandler;
  }
  return self;
}

#if !TARGET_OS_OSX
- (BOOL)isAttachedToTextView
{
  return [self.view isKindOfClass:[UITextView class]];
}

- (void)touchesBegan:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event
{
  [_gestureHandler setCurrentPointerTypeForEvent:event];

  if ([self isAttachedToTextView]) {
    [(RNNativeViewGestureHandler *)_gestureHandler handleTextViewTouchDown:event];
  }

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

  if ([self isAttachedToTextView]) {
    [(RNNativeViewGestureHandler *)_gestureHandler handleTextViewTouchUp:event];
  }

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

  if ([self isAttachedToTextView]) {
    [(RNNativeViewGestureHandler *)_gestureHandler handleTextViewTouchCancel:event];
  }

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
  RNGestureHandlerEventExtraData *_lastActiveExtraData;
#if !TARGET_OS_OSX
  __weak UIControl *_control;
#endif
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
  UIView *textInputChild = nil;

  // For UIControl based views (UIButton, UISwitch) we provide special handling that would allow
  // for properties like `disallowInterruption` to work.
  if ([view isKindOfClass:[UIControl class]]) {
    _control = (UIControl *)view;
  } else if ([view isKindOfClass:[RCTTextInputComponentView class]]) {
    // TextInput (RCTTextInputComponentView) contains a UITextField (single-line) or UITextView (multi-line) as a
    // subview. UITextField is a UIControl, so we can use UIControl events. UITextView is not a UIControl, so we need to
    // attach the gesture recognizer to it directly.
    for (UIView *subview in view.subviews) {
      if ([subview isKindOfClass:[UITextField class]]) {
        _control = (UIControl *)subview;
        break;
      } else if ([subview isKindOfClass:[UITextView class]]) {
        textInputChild = subview;
        break;
      }
    }
  }

  if (_control) {
    // Pressing UISwitch triggers only touchUp and valueChanged callbacks. In order to align its behavior
    // with other UIControls, we have to dispatch full Gesture Handler events flow in one callback, as
    // touchesDown is not executed.
    if ([_control isKindOfClass:[UISwitch class]]) {
      _pointerType = RNGestureHandlerTouch;
      [_control addTarget:self action:@selector(handleSwitch:) forControlEvents:UIControlEventValueChanged];
    } else {
      [_control addTarget:self action:@selector(handleTouchDown:forEvent:) forControlEvents:UIControlEventTouchDown];
      [_control addTarget:self
                    action:@selector(handleTouchUpOutside:forEvent:)
          forControlEvents:UIControlEventTouchUpOutside];
      [_control addTarget:self
                    action:@selector(handleTouchUpInside:forEvent:)
          forControlEvents:UIControlEventTouchUpInside];
      [_control addTarget:self action:@selector(handleDragExit:forEvent:) forControlEvents:UIControlEventTouchDragExit];
      [_control addTarget:self
                    action:@selector(handleDragInside:forEvent:)
          forControlEvents:UIControlEventTouchDragInside];
      [_control addTarget:self
                    action:@selector(handleDragOutside:forEvent:)
          forControlEvents:UIControlEventTouchDragOutside];
      [_control addTarget:self
                    action:@selector(handleDragEnter:forEvent:)
          forControlEvents:UIControlEventTouchDragEnter];
      [_control addTarget:self
                    action:@selector(handleTouchCancel:forEvent:)
          forControlEvents:UIControlEventTouchCancel];
    }
  } else {
    // For multiline TextInput (UITextView), bind to the child view so the recognizer receives
    // touch events directly, then restore viewTag to the parent's react tag.
    if (textInputChild != nil) {
      [super bindToView:textInputChild];
      self.viewTag = view.reactTag;
    } else {
      [super bindToView:view];
    }
  }

  // We can restore default scrollview behaviour to delay touches to scrollview's children
  // because gesture handler system can handle cancellation of scroll recognizer when JS responder
  // is set
  UIScrollView *scrollView = [self retrieveScrollView:view];
  scrollView.delaysContentTouches = YES;
}

- (void)unbindFromView
{
  UIView *view = self.recognizer.view;

  if (_control) {
    [_control removeTarget:self action:NULL forControlEvents:UIControlEventAllEvents];
    _control = nil;
  }

  // Restore the React Native's overriden behavor for not delaying content touches
  UIScrollView *scrollView = [self retrieveScrollView:view];
  scrollView.delaysContentTouches = NO;

  [super unbindFromView];
}

- (void)sendActiveStateEventIfChangedForView:(UIView *)sender extraData:(RNGestureHandlerEventExtraData *)extraData
{
  if ([_lastActiveExtraData.data isEqualToDictionary:extraData.data]) {
    return;
  }

  _lastActiveExtraData = extraData;
  [self sendEventsInState:RNGestureHandlerStateActive forViewWithTag:sender.reactTag withExtraData:extraData];
}

- (void)handleSwitch:(UIView *)sender
{
  [self sendEventsInState:RNGestureHandlerStateBegan
           forViewWithTag:sender.reactTag
            withExtraData:[RNGestureHandlerEventExtraData forPointerInside:YES
                                                       withNumberOfTouches:1
                                                           withPointerType:_pointerType]];
  [self sendEventsInState:RNGestureHandlerStateActive
           forViewWithTag:sender.reactTag
            withExtraData:[RNGestureHandlerEventExtraData forPointerInside:YES
                                                       withNumberOfTouches:1
                                                           withPointerType:_pointerType]];
  [self sendEventsInState:RNGestureHandlerStateEnd
           forViewWithTag:sender.reactTag
            withExtraData:[RNGestureHandlerEventExtraData forPointerInside:YES
                                                       withNumberOfTouches:1
                                                           withPointerType:_pointerType]];

  [self reset];
}

- (void)handleTextViewTouchDown:(UIEvent *)event
{
  [self reset];

  RNGestureHandlerEventExtraData *extraData = [RNGestureHandlerEventExtraData forPointerInside:YES
                                                                           withNumberOfTouches:event.allTouches.count
                                                                               withPointerType:_pointerType];

  [self sendEventsInState:RNGestureHandlerStateBegan forViewWithTag:self.viewTag withExtraData:extraData];
  [self sendEventsInState:RNGestureHandlerStateActive forViewWithTag:self.viewTag withExtraData:extraData];
  _lastActiveExtraData = extraData;
}

- (void)handleTextViewTouchUp:(UIEvent *)event
{
  [self sendEventsInState:RNGestureHandlerStateEnd
           forViewWithTag:self.viewTag
            withExtraData:[RNGestureHandlerEventExtraData forPointerInside:YES
                                                       withNumberOfTouches:event.allTouches.count
                                                           withPointerType:_pointerType]];
}

- (void)handleTextViewTouchCancel:(UIEvent *)event
{
  [self sendEventsInState:RNGestureHandlerStateCancelled
           forViewWithTag:self.viewTag
            withExtraData:[RNGestureHandlerEventExtraData forPointerInside:NO
                                                       withNumberOfTouches:event.allTouches.count
                                                           withPointerType:_pointerType]];
}

- (void)handleTouchDown:(UIView *)sender forEvent:(UIEvent *)event
{
  [self setCurrentPointerTypeForEvent:event];
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

  [self sendEventsInState:RNGestureHandlerStateBegan
           forViewWithTag:sender.reactTag
            withExtraData:[RNGestureHandlerEventExtraData forPointerInside:YES
                                                       withNumberOfTouches:event.allTouches.count
                                                           withPointerType:_pointerType]];

  _lastActiveExtraData = nil;
  [self sendActiveStateEventIfChangedForView:sender
                                   extraData:[RNGestureHandlerEventExtraData forPointerInside:YES
                                                                          withNumberOfTouches:event.allTouches.count
                                                                              withPointerType:_pointerType]];
}

- (void)handleTouchUpOutside:(UIView *)sender forEvent:(UIEvent *)event
{
  if (self.shouldCancelWhenOutside) {
    return;
  }

  [self sendEventsInState:RNGestureHandlerStateEnd
           forViewWithTag:sender.reactTag
            withExtraData:[RNGestureHandlerEventExtraData forPointerInside:NO
                                                       withNumberOfTouches:event.allTouches.count
                                                           withPointerType:_pointerType]];
}

- (void)handleTouchUpInside:(UIView *)sender forEvent:(UIEvent *)event
{
  [self sendEventsInState:RNGestureHandlerStateEnd
           forViewWithTag:sender.reactTag
            withExtraData:[RNGestureHandlerEventExtraData forPointerInside:YES
                                                       withNumberOfTouches:event.allTouches.count
                                                           withPointerType:_pointerType]];
}

- (void)handleDragExit:(UIView *)sender forEvent:(UIEvent *)event
{
  // Pointer is moved outside of the view bounds, we cancel button when `shouldCancelWhenOutside` is set
  if (self.shouldCancelWhenOutside) {
    UIControl *control = (UIControl *)sender;
    [control cancelTrackingWithEvent:event];
  } else {
    [self sendActiveStateEventIfChangedForView:sender
                                     extraData:[RNGestureHandlerEventExtraData forPointerInside:NO
                                                                            withNumberOfTouches:event.allTouches.count
                                                                                withPointerType:_pointerType]];
  }
}

- (void)handleDragEnter:(UIView *)sender forEvent:(UIEvent *)event
{
  [self sendActiveStateEventIfChangedForView:sender
                                   extraData:[RNGestureHandlerEventExtraData forPointerInside:YES
                                                                          withNumberOfTouches:event.allTouches.count
                                                                              withPointerType:_pointerType]];
}

- (void)handleDragInside:(UIView *)sender forEvent:(UIEvent *)event
{
  [self sendActiveStateEventIfChangedForView:sender
                                   extraData:[RNGestureHandlerEventExtraData forPointerInside:YES
                                                                          withNumberOfTouches:event.allTouches.count
                                                                              withPointerType:_pointerType]];
}

- (void)handleDragOutside:(UIView *)sender forEvent:(UIEvent *)event
{
  if (self.shouldCancelWhenOutside) {
    return;
  }

  [self sendActiveStateEventIfChangedForView:sender
                                   extraData:[RNGestureHandlerEventExtraData forPointerInside:NO
                                                                          withNumberOfTouches:event.allTouches.count
                                                                              withPointerType:_pointerType]];
}

- (void)handleTouchCancel:(UIView *)sender forEvent:(UIEvent *)event
{
  [self sendEventsInState:RNGestureHandlerStateCancelled
           forViewWithTag:sender.reactTag
            withExtraData:[RNGestureHandlerEventExtraData forPointerInside:NO
                                                       withNumberOfTouches:event.allTouches.count
                                                           withPointerType:_pointerType]];
}

- (BOOL)wantsToAttachDirectlyToView
{
  return YES;
}

#else

- (RNGestureHandlerEventExtraData *)eventExtraData:(RNDummyGestureRecognizer *)recognizer
{
  return [RNGestureHandlerEventExtraData forPointerInside:[self containsPointInView]
                                      withNumberOfTouches:1
                                          withPointerType:RNGestureHandlerMouse];
}

#endif

@end
