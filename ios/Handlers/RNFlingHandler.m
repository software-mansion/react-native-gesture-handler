#import "RNFlingHandler.h"

@implementation RCTConvert (UISwipeGestureRecognizerDirection)
RCT_ENUM_CONVERTER(UISwipeGestureRecognizerDirection, (@{
                                                        @(RNGestureHandlerDirectionLeft): @(UISwipeGestureRecognizerDirectionLeft),
                                                        @(RNGestureHandlerDirectionRight): @(UISwipeGestureRecognizerDirectionRight),
                                                        @(RNGestureHandlerDirectionUp): @(UISwipeGestureRecognizerDirectionUp),
                                                        @(RNGestureHandlerDirectionDown): @(UISwipeGestureRecognizerDirectionDown),
                                                        }), UISwipeGestureRecognizerDirectionLeft, integerValue)
@end

@implementation RNFlingGestureHandler

- (instancetype)initWithTag:(NSNumber *)tag
{
    if ((self = [super initWithTag:tag])) {
        _recognizer = [[UISwipeGestureRecognizer alloc] initWithTarget:self action:@selector(handleGesture:)];
        
    }
    return self;
}

- (void)configure:(NSDictionary *)config
{
    [super configure:config];
    UISwipeGestureRecognizer *recognizer = (UISwipeGestureRecognizer *)_recognizer;

    id prop = config[@"direction"];
    if (prop != nil) {
        RNGestureHandlerDirection direction = [RCTConvert NSInteger:prop];
        recognizer.direction = [RCTConvert UISwipeGestureRecognizerDirection:prop];
    }
    
    prop = config[@"numberOfTouches"];
    if (prop != nil) {
        recognizer.numberOfTouchesRequired = [RCTConvert NSInteger:prop];
    }
}

@end

