#import "RNFlingHandler.h"

@implementation RNFlingGestureHandler

static const UISwipeGestureRecognizerDirection defaultDirection = UISwipeGestureRecognizerDirectionRight;
static const NSUInteger defaultNumberOfTouchesRequired = 1;

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
        recognizer.direction = [RCTConvert NSInteger:prop];
    } else {
        recognizer.direction = defaultDirection;
    }
    
#if !TARGET_OS_TV
    prop = config[@"numberOfPointers"];
    if (prop != nil) {
        recognizer.numberOfTouchesRequired = [RCTConvert NSInteger:prop];
    } else {
        recognizer.numberOfTouchesRequired = defaultNumberOfTouchesRequired;
    }
#endif
}

@end

