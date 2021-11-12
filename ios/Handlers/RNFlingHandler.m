#import "RNFlingHandler.h"

@interface RNBetterSwipeRecognizer : UISwipeGestureRecognizer

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler;

@end

@implementation RNBetterSwipeRecognizer {
  __weak RNGestureHandler *_gestureHandler;
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
  [super touchesBegan:touches withEvent:event];
  [_gestureHandler.touchTracker touchesBegan:touches withEvent:event];
}

- (void)touchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesMoved:touches withEvent:event];
  [_gestureHandler.touchTracker touchesMoved:touches withEvent:event];
}

- (void)touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesEnded:touches withEvent:event];
  [_gestureHandler.touchTracker touchesEnded:touches withEvent:event];
}

- (void)touchesCancelled:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [super touchesCancelled:touches withEvent:event];
  [_gestureHandler.touchTracker touchesCancelled:touches withEvent:event];
}

- (void)reset
{
  [_gestureHandler.touchTracker reset];
  [super reset];
}

@end


@implementation RNFlingGestureHandler

- (instancetype)initWithTag:(NSNumber *)tag
{
    if ((self = [super initWithTag:tag])) {
        _recognizer = [[RNBetterSwipeRecognizer alloc] initWithGestureHandler:self];
        
    }
    return self;
}
- (void)resetConfig
{
  [super resetConfig];
  UISwipeGestureRecognizer *recognizer = (UISwipeGestureRecognizer *)_recognizer;
  recognizer.direction = UISwipeGestureRecognizerDirectionRight;
  recognizer.numberOfTouchesRequired = 1;
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

@end

