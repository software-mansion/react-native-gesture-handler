#import "RNGestureHandler.h"

@interface RNCustomGestureRecognizer : UIGestureRecognizer

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler;
- (void)manageState:(UIGestureRecognizerState)state;
@end

@interface RNCustomGestureHandler : RNGestureHandler
- (void) setState:(nonnull NSNumber *)state;
@end
