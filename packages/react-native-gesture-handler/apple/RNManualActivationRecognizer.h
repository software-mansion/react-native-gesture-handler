#if !TARGET_OS_OSX
#import <UIKit/UIGestureRecognizerSubclass.h>
#else
#import <Appkit/NSGestureRecognizer.h>
#endif

@class RNGestureHandler;

#if !TARGET_OS_OSX
@interface RNManualActivationRecognizer : UIGestureRecognizer <UIGestureRecognizerDelegate>
#else
@interface RNManualActivationRecognizer : NSGestureRecognizer <NSGestureRecognizerDelegate>
#endif

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler;
- (void)fail;

@end
