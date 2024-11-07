#ifdef RCT_NEW_ARCH_ENABLED

#if !TARGET_OS_OSX
#import <UIKit/UIKit.h>
#else
#import <React/RCTUIKit.h>
#endif

#import <React/RCTViewComponentView.h>

#import "RNGestureHandlerButton.h"

NS_ASSUME_NONNULL_BEGIN

@interface RNGestureHandlerButtonComponentView : RCTViewComponentView

@end

NS_ASSUME_NONNULL_END

#endif // RCT_NEW_ARCH_ENABLED
