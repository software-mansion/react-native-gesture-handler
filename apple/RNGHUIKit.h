#if !TARGET_OS_OSX

#import <UIKit/UIKit.h>

typedef UIView RNGHUIView;
typedef UITouch RNGHUITouch;

#else // TARGET_OS_OSX [

#import <React/RCTUIKit.h>

typedef RCTUIView RNGHUIView;
typedef RCTUITouch RNGHUITouch;

#endif // ] TARGET_OS_OSX
