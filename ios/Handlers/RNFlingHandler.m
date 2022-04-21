#import "RNFlingHandler.h"

@interface RNBetterSwipeGestureRecognizer : UISwipeGestureRecognizer

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler;

@end

@implementation RNBetterSwipeGestureRecognizer {
  __weak RNGestureHandler* _gestureHandler;
}

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler
{
  if ((self = [super initWithTarget:gestureHandler action:@selector(handleGesture:)])) {
    _gestureHandler = gestureHandler;
  }
  return self;
}

- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  // TODO: BEGAN event has the same coordinates as ACTIVE and END
  [_gestureHandler reset];
  [super touchesBegan:touches withEvent:event];
  [self triggerAction];
  [_gestureHandler.pointerTracker touchesBegan:touches withEvent:event];
}

- (void)touchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesMoved:touches withEvent:event];
  [_gestureHandler.pointerTracker touchesMoved:touches withEvent:event];
}

- (void)touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesEnded:touches withEvent:event];
  [_gestureHandler.pointerTracker touchesEnded:touches withEvent:event];
}

- (void)touchesCancelled:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesCancelled:touches withEvent:event];
  [_gestureHandler.pointerTracker touchesCancelled:touches withEvent:event];
}

- (void)triggerAction
{
  [_gestureHandler handleGesture:self];
}

- (void)reset
{
  // TODO: When gesture fails, sending FAILED event in reset causes the coordinates to be wrong, absolute position is (0, 0) and relative position is negative absolute position of the view
  [self triggerAction];
  [_gestureHandler.pointerTracker reset];
  [super reset];
}

@end

@implementation RNFlingGestureHandler

- (instancetype)initWithTag:(NSNumber *)tag
{
  if ((self = [super initWithTag:tag])) {
    _recognizer = [[RNBetterSwipeGestureRecognizer alloc] initWithGestureHandler:self];
  }
  return self;
}
- (void)resetConfig
{
  [super resetConfig];
  UISwipeGestureRecognizer *recognizer = (UISwipeGestureRecognizer *)_recognizer;
  recognizer.direction = UISwipeGestureRecognizerDirectionRight;
#if !TARGET_OS_TV
  recognizer.numberOfTouchesRequired = 1;
#endif
}

- (void)configure:(NSDictionary *)config
{
    [super configure:config];
    UISwipeGestureRecognizer *recognizer = (UISwipeGestureRecognizer *)_recognizer;

    id prop = config[@"direction"];
    if (prop != nil) {
        recognizer.direction = [RCTConvert NSInteger:prop];
    }
    
#if !TARGET_OS_TV
    prop = config[@"numberOfPointers"];
    if (prop != nil) {
        recognizer.numberOfTouchesRequired = [RCTConvert NSInteger:prop];
    }
#endif
}

- (BOOL)gestureRecognizerShouldBegin:(UIGestureRecognizer *)gestureRecognizer
{
    RNGestureHandlerState savedState = _lastState;
    BOOL shouldBegin = [super gestureRecognizerShouldBegin:gestureRecognizer];
    _lastState = savedState;
    
    return shouldBegin;
}

- (RNGestureHandlerEventExtraData *)eventExtraData:(id)_recognizer
{
    // For some weird reason [recognizer locationInView:recognizer.view.window] returns (0, 0).
    // To calculate the correct absolute position, first calculate the absolute position of the
    // view inside the root view controller (https://stackoverflow.com/a/7448573) and then
    // add the relative touch position to it.
    
    UISwipeGestureRecognizer *recognizer = (UISwipeGestureRecognizer *)_recognizer;
    
    CGPoint viewAbsolutePosition = [recognizer.view convertPoint:recognizer.view.bounds.origin toView:[UIApplication sharedApplication].keyWindow.rootViewController.view];
    CGPoint locationInView = [recognizer locationInView:recognizer.view];
    
    return [RNGestureHandlerEventExtraData
            forPosition:locationInView
            withAbsolutePosition:CGPointMake(viewAbsolutePosition.x + locationInView.x, viewAbsolutePosition.y + locationInView.y)
            withNumberOfTouches:recognizer.numberOfTouches];
}

@end

