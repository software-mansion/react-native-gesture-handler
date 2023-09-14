#if !TARGET_OS_OSX

#import <UIKit/UIKit.h>

#define RCTPlatformView UIView

#else

#import <React/RCTUIKit.h>

#define UITouch UIEvent

#endif
