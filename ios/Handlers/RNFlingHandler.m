#import "RNFlingHandler.h"

@interface RNBetterSwipeGestureRecognizer : UISwipeGestureRecognizer

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler;

@end

@implementation RNBetterSwipeGestureRecognizer {
    __weak RNGestureHandler* _gestureHandler;
}

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler
{
    if (self == [super initWithTarget:gestureHandler action:@selector(handleGesture:)]) {
        _gestureHandler = gestureHandler;
    }
    
    return self;
}

- (void)triggerAction
{
    [_gestureHandler handleGesture:self];
}

- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
    [_gestureHandler reset];
    [self triggerAction];
    [super touchesBegan:touches withEvent:event];
}

- (void)reset
{
    [self triggerAction];
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

- (BOOL)gestureRecognizerShouldBegin:(UIGestureRecognizer *)gestureRecognizer
{
    RNGestureHandlerState savedState = _lastState;
    BOOL shouldBegin = [super gestureRecognizerShouldBegin:gestureRecognizer];
    _lastState = savedState;
    
    return shouldBegin;
}

@end

