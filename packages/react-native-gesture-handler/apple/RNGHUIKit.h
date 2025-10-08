#if !TARGET_OS_OSX

#import <UIKit/UIKit.h>

typedef UIView RNGHUIView;
typedef UITouch RNGHUITouch;
typedef UIScrollView RNGHUIScrollView;

#define RNGHGestureRecognizerStateFailed UIGestureRecognizerStateFailed;
#define RNGHGestureRecognizerStatePossible UIGestureRecognizerStatePossible;
#define RNGHGestureRecognizerStateCancelled UIGestureRecognizerStateCancelled;
#define RNGHGestureRecognizerStateBegan UIGestureRecognizerStateBegan;
#define RNGHGestureRecognizerStateEnded UIGestureRecognizerStateEnded;

#define iOS_VERSION [[[UIDevice currentDevice] systemVersion] floatValue]

#else // TARGET_OS_OSX [

#import <React/RCTUIKit.h>

typedef RCTUIView RNGHUIView;
typedef RCTUITouch RNGHUITouch;
typedef NSScrollView RNGHUIScrollView;

#define RNGHGestureRecognizerStateFailed NSGestureRecognizerStateFailed;
#define RNGHGestureRecognizerStatePossible NSGestureRecognizerStatePossible;
#define RNGHGestureRecognizerStateCancelled NSGestureRecognizerStateCancelled;
#define RNGHGestureRecognizerStateBegan NSGestureRecognizerStateBegan;
#define RNGHGestureRecognizerStateEnded NSGestureRecognizerStateEnded;

#endif // ] TARGET_OS_OSX
