#if !TARGET_OS_OSX

#import <UIKit/UIKit.h>

typedef UIView RNGHUIView;

#else // TARGET_OS_OSX [

#import <React/RCTUIKit.h>

typedef RCTUIView RNGHUIView;

#endif // ] TARGET_OS_OSX