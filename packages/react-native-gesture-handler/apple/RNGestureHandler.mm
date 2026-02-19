#import "RNGestureHandler.h"
#import "RNManualActivationRecognizer.h"

#import "Handlers/RNNativeViewHandler.h"

#if !TARGET_OS_OSX
#import <UIKit/UIGestureRecognizerSubclass.h>
#import <UIKit/UIPanGestureRecognizer.h>
#endif

#import <React/UIView+React.h>

#import <React/RCTEnhancedScrollView.h>
#import <React/RCTParagraphComponentView.h>
#import <React/RCTScrollViewComponentView.h>

@interface UIGestureRecognizer (GestureHandler)
@property (nonatomic, readonly) RNGestureHandler *gestureHandler;
@end

@implementation UIGestureRecognizer (GestureHandler)

- (RNGestureHandler *)gestureHandler
{
  id delegate = self.delegate;
  if ([delegate isKindOfClass:[RNGestureHandler class]]) {
    return (RNGestureHandler *)delegate;
  }
  return nil;
}

@end

typedef struct RNGHHitSlop {
  CGFloat top, left, bottom, right, width, height;
} RNGHHitSlop;

static RNGHHitSlop RNGHHitSlopEmpty = {NAN, NAN, NAN, NAN, NAN, NAN};

#define RNGH_HIT_SLOP_GET(key) (prop[key] == nil ? NAN : [prop[key] doubleValue])
#define RNGH_HIT_SLOP_IS_SET(hitSlop) \
  (!isnan(hitSlop.left) || !isnan(hitSlop.right) || !isnan(hitSlop.top) || !isnan(hitSlop.bottom))
#define RNGH_HIT_SLOP_INSET(key) (isnan(hitSlop.key) ? 0. : hitSlop.key)

CGRect RNGHHitSlopInsetRect(CGRect rect, RNGHHitSlop hitSlop)
{
  rect.origin.x -= RNGH_HIT_SLOP_INSET(left);
  rect.origin.y -= RNGH_HIT_SLOP_INSET(top);

  if (!isnan(hitSlop.width)) {
    if (!isnan(hitSlop.right)) {
      rect.origin.x = rect.size.width - hitSlop.width + RNGH_HIT_SLOP_INSET(right);
    }
    rect.size.width = hitSlop.width;
  } else {
    rect.size.width += (RNGH_HIT_SLOP_INSET(left) + RNGH_HIT_SLOP_INSET(right));
  }
  if (!isnan(hitSlop.height)) {
    if (!isnan(hitSlop.bottom)) {
      rect.origin.y = rect.size.height - hitSlop.height + RNGH_HIT_SLOP_INSET(bottom);
    }
    rect.size.height = hitSlop.height;
  } else {
    rect.size.height += (RNGH_HIT_SLOP_INSET(top) + RNGH_HIT_SLOP_INSET(bottom));
  }
  return rect;
}

static NSHashTable<RNGestureHandler *> *allGestureHandlers;

@implementation RNGestureHandler {
  RNGestureHandlerPointerTracker *_pointerTracker;
  RNGestureHandlerState _state;
  RNManualActivationRecognizer *_manualActivationRecognizer;
  NSArray<NSNumber *> *_handlersToWaitFor;
  NSArray<NSNumber *> *_handlersThatShouldWait;
  NSArray<NSNumber *> *_simultaneousHandlers;
  RNGHHitSlop _hitSlop;
  uint16_t _eventCoalescingKey;
}

- (instancetype)initWithTag:(NSNumber *)tag
{
  if ((self = [super init])) {
    _pointerTracker = [[RNGestureHandlerPointerTracker alloc] initWithGestureHandler:self];
    _tag = tag;
    _lastState = RNGestureHandlerStateUndetermined;
    _hitSlop = RNGHHitSlopEmpty;
    _state = RNGestureHandlerStateBegan;
    _manualActivationRecognizer = nil;

    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
      allGestureHandlers = [NSHashTable weakObjectsHashTable];
    });

    [allGestureHandlers addObject:self];
  }
  return self;
}

- (void)resetConfig
{
  self.enabled = YES;
  self.testID = nil;
  self.manualActivation = NO;
  _shouldCancelWhenOutside = NO;
  _hitSlop = RNGHHitSlopEmpty;
  _needsPointerData = NO;
  _dispatchesAnimatedEvents = NO;
  _dispatchesReanimatedEvents = NO;
#if !TARGET_OS_OSX
  _recognizer.cancelsTouchesInView = YES;
#endif
}

- (void)setConfig:(NSDictionary *)config
{
  [self resetConfig];
  [self updateConfig:config];
}

- (void)updateConfig:(NSDictionary *)config
{
  id prop = config[@"enabled"];
  if (prop != nil) {
    self.enabled = [RCTConvert BOOL:prop];
  }

  prop = config[@"testID"];
  if (prop != nil) {
    self.testID = [RCTConvert NSString:prop];
  }

  prop = config[@"shouldCancelWhenOutside"];
  if (prop != nil) {
    _shouldCancelWhenOutside = [RCTConvert BOOL:prop];
  }

#if !TARGET_OS_OSX
  prop = config[@"cancelsTouchesInView"];
  if (prop != nil) {
    _recognizer.cancelsTouchesInView = [RCTConvert BOOL:prop];
  }
#endif

  prop = config[@"needsPointerData"];
  if (prop != nil) {
    _needsPointerData = [RCTConvert BOOL:prop];
  }

  prop = config[@"dispatchesAnimatedEvents"];
  if (prop != nil) {
    _dispatchesAnimatedEvents = [RCTConvert BOOL:prop];
  }

  prop = config[@"dispatchesReanimatedEvents"];
  if (prop != nil) {
    _dispatchesReanimatedEvents = [RCTConvert BOOL:prop];
  }

  prop = config[@"manualActivation"];
  if (prop != nil) {
    self.manualActivation = [RCTConvert BOOL:prop];
  }

  prop = config[@"hitSlop"];
  if ([prop isKindOfClass:[NSNumber class]]) {
    _hitSlop.left = _hitSlop.right = _hitSlop.top = _hitSlop.bottom = [prop doubleValue];
  } else if (prop != nil) {
    _hitSlop.left = _hitSlop.right = RNGH_HIT_SLOP_GET(@"horizontal");
    _hitSlop.top = _hitSlop.bottom = RNGH_HIT_SLOP_GET(@"vertical");
    _hitSlop.left = RNGH_HIT_SLOP_GET(@"left");
    _hitSlop.right = RNGH_HIT_SLOP_GET(@"right");
    _hitSlop.top = RNGH_HIT_SLOP_GET(@"top");
    _hitSlop.bottom = RNGH_HIT_SLOP_GET(@"bottom");
    _hitSlop.width = RNGH_HIT_SLOP_GET(@"width");
    _hitSlop.height = RNGH_HIT_SLOP_GET(@"height");
    if (isnan(_hitSlop.left) && isnan(_hitSlop.right) && !isnan(_hitSlop.width)) {
      RCTLogError(@"When width is set one of left or right pads need to be defined");
    }
    if (!isnan(_hitSlop.width) && !isnan(_hitSlop.left) && !isnan(_hitSlop.right)) {
      RCTLogError(@"Cannot have all of left, right and width defined");
    }
    if (isnan(_hitSlop.top) && isnan(_hitSlop.bottom) && !isnan(_hitSlop.height)) {
      RCTLogError(@"When height is set one of top or bottom pads need to be defined");
    }
    if (!isnan(_hitSlop.height) && !isnan(_hitSlop.top) && !isnan(_hitSlop.bottom)) {
      RCTLogError(@"Cannot have all of top, bottom and height defined");
    }
  }
}

- (void)updateRelations:(NSDictionary *)relations
{
  _handlersToWaitFor = [RCTConvert NSNumberArray:relations[@"waitFor"]];
  _simultaneousHandlers = [RCTConvert NSNumberArray:relations[@"simultaneousHandlers"]];
  _handlersThatShouldWait = [RCTConvert NSNumberArray:relations[@"blocksHandlers"]];
}

- (void)setEnabled:(BOOL)enabled
{
  _enabled = enabled;
  self.recognizer.enabled = enabled;
}

#if !TARGET_OS_OSX
- (void)setCurrentPointerType:(UIEvent *)event
{
  UITouch *touch = [[event allTouches] anyObject];

  switch (touch.type) {
    case UITouchTypeDirect:
      _pointerType = RNGestureHandlerTouch;
      break;
    case UITouchTypePencil:
      _pointerType = RNGestureHandlerStylus;
      break;
    case UITouchTypeIndirectPointer:
      _pointerType = RNGestureHandlerMouse;
      break;
    default:
      _pointerType = RNGestureHandlerOtherPointer;
      break;
  }
}
#else
- (void)setCurrentPointerTypeToMouse
{
  _pointerType = RNGestureHandlerMouse;
}
#endif

- (UITouchType)getPointerType
{
  return (UITouchType)_pointerType;
}

- (BOOL)usesNativeOrVirtualDetector
{
  return _actionType == RNGestureHandlerActionTypeNativeDetector ||
      _actionType == RNGestureHandlerActionTypeVirtualDetector;
}

- (BOOL)isViewParagraphComponent:(RNGHUIView *)view
{
  return [view isKindOfClass:[RCTParagraphComponentView class]];
}

- (void)bindToView:(RNGHUIView *)view
{
  self.recognizer.delegate = self;

  // Starting from react-native 0.79 `RCTParagraphTextView` overrides `hitTest` method to return `nil`.
  // This results in native `UIGestureRecognizer` not responding to gestures.
  // To fix this issue, we attach recognizer to its parent, i.e. `RCTParagraphComponentView`.
  RNGHUIView *recognizerView = [self isViewParagraphComponent:view.superview] ? view.superview : view;

#if !TARGET_OS_OSX
  recognizerView.userInteractionEnabled = YES;
#endif

  [recognizerView addGestureRecognizer:self.recognizer];
  [self bindManualActivationToView:recognizerView];

  self.viewTag = view.reactTag;
}

- (void)unbindFromView
{
  [self.recognizer.view removeGestureRecognizer:self.recognizer];
  self.recognizer.delegate = nil;

  self.hostDetectorView = nil;
  self.virtualViewTag = nil;
  self.viewTag = nil;

  [self unbindManualActivation];
}

- (RNGestureHandlerEventExtraData *)eventExtraData:(UIGestureRecognizer *)recognizer
{
#if TARGET_OS_OSX
  return [RNGestureHandlerEventExtraData forPosition:[recognizer locationInView:recognizer.view]
                                withAbsolutePosition:[recognizer locationInView:recognizer.view.window.contentView]
                                 withNumberOfTouches:1
                                     withPointerType:RNGestureHandlerMouse];
#else
  return [RNGestureHandlerEventExtraData forPosition:[recognizer locationInView:recognizer.view]
                                withAbsolutePosition:[recognizer locationInView:recognizer.view.window]
                                 withNumberOfTouches:recognizer.numberOfTouches
                                     withPointerType:_pointerType];
#endif
}

/**
 This method is used in `handleGesture` to choose appropriate view. `reactTag` in `RCTParagraphComponentView`
 is `nil`, therefore we want to use `reactTag` from `RCTParagraphTextView`.
 */
- (RNGHUIView *)chooseViewForInteraction:(UIGestureRecognizer *)recognizer
{
  return [self isViewParagraphComponent:recognizer.view] ? recognizer.view.subviews[0] : recognizer.view;
}

- (void)handleGesture:(UIGestureRecognizer *)recognizer fromReset:(BOOL)fromReset
{
  // Don't dispatch state changes from undetermined when resetting handler. There will be no follow-up
  // since the handler is being reset, so these events are wrong.
  if (fromReset && _lastState == RNGestureHandlerStateUndetermined) {
    return;
  }

  RNGHUIView *view = [self chooseViewForInteraction:recognizer];

  // it may happen that the gesture recognizer is reset after it's been unbound from the view,
  // it that recognizer tried to send event, the app would crash because the target of the event
  // would be nil.
  if (view.reactTag == nil && _actionType != RNGestureHandlerActionTypeNativeDetector &&
      _actionType != RNGestureHandlerActionTypeVirtualDetector) {
    return;
  }

  _state = [self recognizerState];

  // From iOS 26.0 when recognizers are reset, their state is also changed to UIGestureRecognizerStatePossible.
  // This means that our logic that relies on sending events in `reset` methods doesn't work properly. The bug that
  // `onFinalize` was not send after `onBegin` happened because both recognizer states, `Began` and `Possible`, are
  // mapped to our internal `Began` state. Because of that, _lastState had the same value as `_state` and callbacks were
  // not triggered.
  //
  // While this solution is not great, we decided to check whether sending events was triggered from `reset` method.
  // This way we can detect double Began mapping by checking previous sent state and current state of recognizer.
  if (fromReset && _lastState == RNGestureHandlerStateBegan &&
      self.recognizer.state == UIGestureRecognizerStatePossible) {
    _state = RNGestureHandlerStateFailed;
  }

  [self handleGesture:recognizer inState:_state];
}

- (void)handleGesture:(UIGestureRecognizer *)recognizer inState:(RNGestureHandlerState)state
{
  _state = state;

  RNGestureHandlerEventExtraData *eventData = [self eventExtraData:recognizer];

  NSNumber *tag = [self chooseViewForInteraction:recognizer].reactTag;

  if (tag == nil && _actionType == RNGestureHandlerActionTypeNativeDetector) {
    tag = @(recognizer.view.tag);
  }

  if (_virtualViewTag != nil && _actionType == RNGestureHandlerActionTypeVirtualDetector) {
    tag = _virtualViewTag;
  }

  react_native_assert(tag != nil && "Tag should be defined when dispatching an event");

  [self sendEventsInState:self.state forViewWithTag:tag withExtraData:eventData];
}

- (RNGestureHandlerEventHandlerType)eventHandlerType
{
  return _dispatchesAnimatedEvents  ? RNGestureHandlerEventHandlerTypeAnimated
      : _dispatchesReanimatedEvents ? RNGestureHandlerEventHandlerTypeReanimated
                                    : RNGestureHandlerEventHandlerTypeJS;
}

- (void)sendEventsInState:(RNGestureHandlerState)state
           forViewWithTag:(nonnull NSNumber *)reactTag
            withExtraData:(RNGestureHandlerEventExtraData *)extraData
{
  if (state != _lastState) {
    // don't send change events from END to FAILED or CANCELLED, this may happen when gesture is ended in `onTouchesUp`
    // callback
    if (_lastState == RNGestureHandlerStateEnd &&
        (state == RNGestureHandlerStateFailed || state == RNGestureHandlerStateCancelled)) {
      return;
    }

    // Recognizers don't respect manually changing their state (that happens when we are activating handler
    // under custom conditions). If we send a custom event in state ACTIVE and the recognizer will later update its
    // state, we will end up sending ACTIVE->BEGAN and BEGAN->ACTIVE chain. To prevent this, we simply detect the first
    // weird state change and stop it (then we don't update _lastState), so the second call ends up without state change
    // and is fine.
    if (state == RNGestureHandlerStateBegan && _lastState == RNGestureHandlerStateActive) {
      return;
    }

    if (state == RNGestureHandlerStateActive) {
      // Generate a unique coalescing-key each time the gesture-handler becomes active. All events will have
      // the same coalescing-key allowing RCTEventDispatcher to coalesce RNGestureHandlerEvents when events are
      // generated faster than they can be treated by JS thread
      static uint16_t nextEventCoalescingKey = 0;
      self->_eventCoalescingKey = nextEventCoalescingKey++;

    } else if (state == RNGestureHandlerStateEnd && _lastState != RNGestureHandlerStateActive && !_manualActivation) {
      id event = [[RNGestureHandlerStateChange alloc] initWithReactTag:reactTag
                                                            handlerTag:_tag
                                                                 state:RNGestureHandlerStateActive
                                                             prevState:_lastState
                                                             extraData:extraData];
      [self sendEvent:event];
      _lastState = RNGestureHandlerStateActive;
    }
    id stateEvent = [[RNGestureHandlerStateChange alloc] initWithReactTag:reactTag
                                                               handlerTag:_tag
                                                                    state:state
                                                                prevState:_lastState
                                                                extraData:extraData];
    [self sendEvent:stateEvent];
    _lastState = state;
  }

  if (state == RNGestureHandlerStateActive) {
    id touchEvent = [[RNGestureHandlerEvent alloc] initWithReactTag:reactTag
                                                         handlerTag:_tag
                                                              state:state
                                                          extraData:extraData
                                                     forHandlerType:[self eventHandlerType]
                                                      coalescingKey:self->_eventCoalescingKey];
    [self sendEvent:touchEvent];
  }
}

- (RNGHUIView *)findViewForEvents
{
  return [self usesNativeOrVirtualDetector] ? self.hostDetectorView : self.recognizer.view;
}

- (void)sendEvent:(RNGestureHandlerStateChange *)event
{
  [self.emitter sendEvent:event
           withActionType:self.actionType
           forHandlerType:[self eventHandlerType]
                  forView:[self findViewForEvents]];
}

- (void)sendTouchEventInState:(RNGestureHandlerState)state forViewWithTag:(NSNumber *)reactTag
{
  if (_actionType == RNGestureHandlerActionTypeNativeDetector) {
    [self.emitter sendNativeTouchEventForGestureHandler:self
                                        withPointerType:_pointerType
                                         forHandlerType:[self eventHandlerType]];
  } else {
    id extraData = [RNGestureHandlerEventExtraData forEventType:_pointerTracker.eventType
                                            withChangedPointers:_pointerTracker.changedPointersData
                                                withAllPointers:_pointerTracker.allPointersData
                                            withNumberOfTouches:_pointerTracker.trackedPointersCount
                                                withPointerType:_pointerType];
    id event = [[RNGestureHandlerEvent alloc] initWithReactTag:reactTag
                                                    handlerTag:_tag
                                                         state:state
                                                     extraData:extraData
                                                forHandlerType:[self eventHandlerType]
                                                 coalescingKey:[_tag intValue]];

    [self.emitter sendEvent:event
             withActionType:self.actionType
             forHandlerType:[self eventHandlerType]
                    forView:self.recognizer.view];
  }
}

- (RNGestureHandlerState)recognizerState
{
  switch (_recognizer.state) {
    case UIGestureRecognizerStateBegan:
    case UIGestureRecognizerStatePossible:
      return RNGestureHandlerStateBegan;
    case UIGestureRecognizerStateEnded:
      return RNGestureHandlerStateEnd;
    case UIGestureRecognizerStateFailed:
      return RNGestureHandlerStateFailed;
    case UIGestureRecognizerStateCancelled:
      return RNGestureHandlerStateCancelled;
    case UIGestureRecognizerStateChanged:
      return RNGestureHandlerStateActive;
  }
  return RNGestureHandlerStateUndetermined;
}

- (RNGestureHandlerState)state
{
  // instead of mapping state of the recognizer directly, use value mapped when handleGesture was
  // called, making it correct while awaiting for another handler failure
  return _state;
}

#pragma mark Manual activation

- (void)stopActivationBlocker
{
  if (_manualActivationRecognizer != nil) {
    [_manualActivationRecognizer fail];
  }
}

- (void)setManualActivation:(BOOL)manualActivation
{
  _manualActivation = manualActivation;

  if (manualActivation) {
    _manualActivationRecognizer = [[RNManualActivationRecognizer alloc] initWithGestureHandler:self];

    if (_recognizer.view != nil) {
      [_recognizer.view addGestureRecognizer:_manualActivationRecognizer];
    }
  } else if (_manualActivationRecognizer != nil) {
    [_manualActivationRecognizer.view removeGestureRecognizer:_manualActivationRecognizer];
    _manualActivationRecognizer = nil;
  }
}

- (void)bindManualActivationToView:(RNGHUIView *)view
{
  if (_manualActivationRecognizer != nil) {
    [view addGestureRecognizer:_manualActivationRecognizer];
  }
}

- (void)unbindManualActivation
{
  if (_manualActivationRecognizer != nil) {
    [_manualActivationRecognizer.view removeGestureRecognizer:_manualActivationRecognizer];
  }
}

#pragma mark UIGestureRecognizerDelegate

+ (RNGestureHandler *)findGestureHandlerByRecognizer:(UIGestureRecognizer *)recognizer
{
  RNGestureHandler *handler = recognizer.gestureHandler;
  if (handler != nil) {
    return handler;
  }

  // We may try to extract "DummyGestureHandler" in case when "otherGestureRecognizer" belongs to
  // a native view being wrapped with "NativeViewGestureHandler"
  RNGHUIView *reactView = recognizer.view;
  while (reactView != nil && reactView.reactTag == nil) {
    reactView = reactView.superview;
  }

  for (UIGestureRecognizer *recognizer in reactView.gestureRecognizers) {
    if ([recognizer isKindOfClass:[RNDummyGestureRecognizer class]]) {
      return recognizer.gestureHandler;
    }
  }

  return nil;
}

- (BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer
    shouldBeRequiredToFailByGestureRecognizer:(UIGestureRecognizer *)otherGestureRecognizer
{
  RNGestureHandler *handler = [RNGestureHandler findGestureHandlerByRecognizer:otherGestureRecognizer];
  if ([handler isKindOfClass:[RNNativeViewGestureHandler class]]) {
    for (NSNumber *handlerTag in handler->_handlersToWaitFor) {
      if ([_tag isEqual:handlerTag]) {
        return YES;
      }
    }
  }

  if (handler != nil) {
    for (NSNumber *handlerTag in _handlersThatShouldWait) {
      if ([handler.tag isEqual:handlerTag]) {
        return YES;
      }
    }
  }

  return NO;
}

- (BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer
    shouldRequireFailureOfGestureRecognizer:(UIGestureRecognizer *)otherGestureRecognizer
{
  RNGestureHandler *handler = [RNGestureHandler findGestureHandlerByRecognizer:otherGestureRecognizer];
  if (handler == nil) {
    return NO;
  }

  for (NSNumber *handlerTag in _handlersToWaitFor) {
    if ([handler.tag isEqual:handlerTag]) {
      return YES;
    }
  }

  for (NSNumber *handlerTag in handler->_handlersThatShouldWait) {
    if ([_tag isEqual:handlerTag]) {
      return YES;
    }
  }

  return NO;
}

- (BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer
    shouldRecognizeSimultaneouslyWithGestureRecognizer:(UIGestureRecognizer *)otherGestureRecognizer
{
  if (_recognizer.state == UIGestureRecognizerStateBegan && _recognizer.state == UIGestureRecognizerStatePossible) {
    return YES;
  }

  if ([self areScrollViewRecognizersCompatible:gestureRecognizer otherRecognizer:otherGestureRecognizer]) {
    return YES;
  }

  RNGestureHandler *handler = [RNGestureHandler findGestureHandlerByRecognizer:otherGestureRecognizer];
  if (handler != nil) {
    if ([_simultaneousHandlers count]) {
      for (NSNumber *handlerTag in _simultaneousHandlers) {
        if ([handler.tag isEqual:handlerTag]) {
          return YES;
        }
      }
    }

    if (handler->_simultaneousHandlers) {
      for (NSNumber *handlerTag in handler->_simultaneousHandlers) {
        if ([self.tag isEqual:handlerTag]) {
          return YES;
        }
      }
    }
  }
  return NO;
}

- (BOOL)areScrollViewRecognizersCompatible:(UIGestureRecognizer *)gestureRecognizer
                           otherRecognizer:(UIGestureRecognizer *)otherGestureRecognizer
{
  if ([self isUIScrollViewPanGestureRecognizer:otherGestureRecognizer] &&
      [gestureRecognizer isKindOfClass:[RNDummyGestureRecognizer class]]) {
    RNGHUIScrollView *scrollView = [self retrieveScrollView:gestureRecognizer.view];
    if (scrollView && scrollView == otherGestureRecognizer.view) {
      return YES;
    }
  }

  return NO;
}

#if !TARGET_OS_OSX
// is UIPanGestureRecognizer and has scrollView property
- (BOOL)isUIScrollViewPanGestureRecognizer:(UIGestureRecognizer *)gestureRecognizer
{
  return [gestureRecognizer isKindOfClass:[UIPanGestureRecognizer class]] &&
      [gestureRecognizer respondsToSelector:@selector(scrollView)];
}

#else

- (BOOL)isUIScrollViewPanGestureRecognizer:(NSGestureRecognizer *)gestureRecognizer
{
  return NO;
}

#endif

- (RNGHUIScrollView *)retrieveScrollView:(RNGHUIView *)view
{
  if ([view isKindOfClass:[RCTEnhancedScrollView class]]) {
    return (RCTEnhancedScrollView *)view;
  }

  if ([view isKindOfClass:[RCTScrollViewComponentView class]]) {
    RNGHUIScrollView *scrollView = ((RCTScrollViewComponentView *)view).scrollView;
    return scrollView;
  }

  return nil;
}

- (void)reset
{
  // do not reset states while gesture is tracking pointers, as gestureRecognizerShouldBegin
  // might be called after some pointers are down, and after state manipulation by the user.
  // Pointer tracker calls this method when it resets, and in that case it no longer tracks
  // any pointers, thus entering this if
  if (!_needsPointerData || _pointerTracker.trackedPointersCount == 0) {
    _lastState = RNGestureHandlerStateUndetermined;
    _state = RNGestureHandlerStateBegan;
  }
}

- (BOOL)containsPointInView
{
  RNGHUIView *viewToHitTest = _recognizer.view;

  if (_shouldCancelWhenOutside && [self usesNativeOrVirtualDetector] && [_recognizer.view.subviews count] > 0) {
    viewToHitTest = _recognizer.view.subviews[0];
  }

  CGPoint location = [_recognizer locationInView:viewToHitTest];
  CGRect hitFrame = RNGHHitSlopInsetRect(viewToHitTest.bounds, _hitSlop);

  return CGRectContainsPoint(hitFrame, location);
}

- (BOOL)gestureRecognizerShouldBegin:(UIGestureRecognizer *)gestureRecognizer
{
  if ([_handlersToWaitFor count]) {
    for (RNGestureHandler *handler in [allGestureHandlers allObjects]) {
      if (handler != nil &&
          (handler.state == RNGestureHandlerStateActive ||
           handler->_recognizer.state == UIGestureRecognizerStateBegan)) {
        for (NSNumber *handlerTag in _handlersToWaitFor) {
          if ([handler.tag isEqual:handlerTag]) {
            return NO;
          }
        }
      }
    }
  }

  // Logic detector has a virtual view tag set only if the real hierarchy was folded into a single View
  if (_actionType == RNGestureHandlerActionTypeVirtualDetector && _virtualViewTag != nil) {
    // In this case, logic detector is attached to the DetectorView, which has a single subview representing
    // the actual target view in the RN hierarchy
    RNGHUIView *view = _recognizer.view.subviews[0];
    if ([view respondsToSelector:@selector(touchEventEmitterAtPoint:)]) {
      // If the view has touchEventEmitterAtPoint: method, it can be used to determine the viewtag
      // of the view under the touch point
      facebook::react::SharedTouchEventEmitter eventEmitter =
          [(id<RCTTouchableComponentViewProtocol>)view touchEventEmitterAtPoint:[_recognizer locationInView:view]];
      auto viewUnderTouch = eventEmitter->getEventTarget()->getTag();

      if (viewUnderTouch != [_virtualViewTag intValue]) {
        return NO;
      }
    }
  }

  [self reset];
  return YES;
}

- (BOOL)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer shouldReceiveTouch:(RNGHUITouch *)touch
{
  // If hitSlop is set we use it to determine if a given gesture recognizer should start processing
  // touch stream. This only works for negative values of hitSlop as this method won't be triggered
  // unless touch startes in the bounds of the attached view. To acheve similar effect with positive
  // values of hitSlop one should set hitSlop for the underlying view. This limitation is due to the
  // fact that hitTest method is only available at the level of UIView
  if (RNGH_HIT_SLOP_IS_SET(_hitSlop)) {
#if TARGET_OS_OSX
    CGPoint location = [gestureRecognizer.view convertPoint:touch.locationInWindow fromView:nil];
#else
    CGPoint location = [touch locationInView:gestureRecognizer.view];
#endif
    CGRect hitFrame = RNGHHitSlopInsetRect(gestureRecognizer.view.bounds, _hitSlop);
    return CGRectContainsPoint(hitFrame, location);
  }
  return YES;
}

- (BOOL)wantsToAttachDirectlyToView
{
  return NO;
}

@end
