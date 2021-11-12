#import "RNGestureHandlerTouchTracker.h"
#import "RNGestureHandler.h"

#import <React/UIView+React.h>

@implementation RNGestureHandlerTouchTracker {
  __weak RNGestureHandler *_gestureHandler;
  UITouch *_trackedTouches[MAX_TOUCHES_COUNT];
  int _trackedTouchesCount;
}

- (id)initWithGestureHandler:(id)gestureHandler
{
  _gestureHandler = gestureHandler;
  _trackedTouchesCount = 0;
  _touchesData = nil;
  
  for (int i = 0; i < MAX_TOUCHES_COUNT; i++) {
    _trackedTouches[i] = nil;
  }
  
  return self;
}

- (int)registerTouch:(UITouch *)touch
{
  for (int index = 0; index < MAX_TOUCHES_COUNT; index++) {
    if (_trackedTouches[index] == nil) {
      _trackedTouches[index] = touch;
      return index;
    }
  }
  
  return -1;
}

- (int)unregisterTouch:(UITouch *)touch
{
  for (int index = 0; index < MAX_TOUCHES_COUNT; index++) {
    if (_trackedTouches[index] == touch) {
      _trackedTouches[index] = nil;
      return index;
    }
  }
  
  return -1;
}

- (int)findTouchIndex:(UITouch *)touch
{
  for (int index = 0; index < MAX_TOUCHES_COUNT; index++) {
    if (_trackedTouches[index] == touch) {
      return index;
    }
  }
  return -1;
}

- (int)registeredTouchesCount
{
  int count = 0;
  for (int i = 0; i < MAX_TOUCHES_COUNT; i++) {
    if (_trackedTouches[i] != nil) {
      count++;
    }
  }
  return count;
}

- (NSDictionary *)extractTouchData:(int)index
                            forTouch:(UITouch *)touch
{
  CGPoint relativePos = [touch locationInView:_gestureHandler.recognizer.view];
  CGPoint absolutePos = [touch locationInView:_gestureHandler.recognizer.view.window];
  
  return @{@"touchId": @(index),
              @"x": @(relativePos.x),
              @"y": @(relativePos.y),
              @"absoluteX": @(absolutePos.x),
              @"absoluteY": @(absolutePos.y)};
}

- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  if (!_gestureHandler.needsTouchData) {
    return;
  }
  
  _eventType = RNTouchEventTypeTouchesDown;
  
  NSDictionary *data[touches.count];
  
  for (int i = 0; i < [touches count]; i++) {
    UITouch *touch = [[touches allObjects] objectAtIndex:i];
    int index = [self registerTouch:touch];
    if (index >= 0) {
      _trackedTouchesCount++;
    }

    data[i] = [self extractTouchData:index forTouch:touch];
  }
  
  _touchesData = [[NSArray alloc] initWithObjects:data count:[touches count]];
  [self sendEvent];
}

- (void)touchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  if (!_gestureHandler.needsTouchData) {
    return;
  }
  
  _eventType = RNTouchEventTypeTouchesMove;
  
  NSDictionary *data[touches.count];
  
  for (int i = 0; i < [touches count]; i++) {
    UITouch *touch = [[touches allObjects] objectAtIndex:i];
    int index = [self findTouchIndex:touch];
    data[i] = [self extractTouchData:index forTouch:touch];
  }
  
  _touchesData = [[NSArray alloc] initWithObjects:data count:[touches count]];
  [self sendEvent];
}

- (void)touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  if (!_gestureHandler.needsTouchData) {
    return;
  }
  
  _eventType = RNTouchEventTypeTouchesUp;
  
  NSDictionary *data[touches.count];
  
  for (int i = 0; i < [touches count]; i++) {
    UITouch *touch = [[touches allObjects] objectAtIndex:i];
    int index = [self unregisterTouch:touch];
    if (index >= 0) {
      _trackedTouchesCount--;
    }

    data[i] = [self extractTouchData:index forTouch:touch];
  }
  
  _touchesData = [[NSArray alloc] initWithObjects:data count:[touches count]];
  [self sendEvent];
}

- (void)touchesCancelled:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  if (!_gestureHandler.needsTouchData) {
    return;
  }
  
  [self reset];
}

- (void)reset
{
  if (!_gestureHandler.needsTouchData) {
    return;
  }
  
  if (_trackedTouchesCount == 0) {
    // gesture has finished because all pointers were lifted, reset event type to send state change event
    _eventType = RNTouchEventTypeUndetermined;
  } else {
    // turns out that the gesture may be made to fail without calling touchesCancelled in that case there
    // are still tracked pointers but the recognizer state is already set to UIGestureRecognizerStateFailed
    // we need to clear the pointers and send info about their cancellation
    [self cancelTouches];
  }
  
  [_gestureHandler reset];
}

- (void)cancelTouches
{
  int registeredTouches = [self registeredTouchesCount];
  
  if (registeredTouches > 0) {
    int nextIndex = 0;
    NSDictionary *data[registeredTouches];
    
    for (int i = 0; i < MAX_TOUCHES_COUNT; i++) {
      UITouch *touch = _trackedTouches[i];
      if (touch != nil) {
        data[nextIndex++] = [self extractTouchData:i forTouch:touch];
        [self unregisterTouch:touch];
      }
    }
    
    _eventType = RNTouchEventTypeCancelled;
    _touchesData = [[NSArray alloc] initWithObjects:data count:registeredTouches];
    [self sendEvent];
    _trackedTouchesCount = 0;
  }
}

- (void)sendEvent
{
  if (!_gestureHandler.needsTouchData) {
    return;
  }
  
  [_gestureHandler sendTouchEventInState:[_gestureHandler state] forViewWithTag:_gestureHandler.recognizer.view.reactTag];
}

@end
