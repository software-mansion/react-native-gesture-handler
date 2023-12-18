#if !TARGET_OS_OSX

#import <UIKit/UIKit.h>

typedef UIView RNGHUIView;
typedef UITouch RNGHUITouch;

#define RNGHGestureRecognizerStateFailed UIGestureRecognizerStateFailed;
#define RNGHGestureRecognizerStatePossible UIGestureRecognizerStatePossible;
#define RNGHGestureRecognizerStateCancelled UIGestureRecognizerStateCancelled;
#define RNGHGestureRecognizerStateBegan UIGestureRecognizerStateBegan;
#define RNGHGestureRecognizerStateEnded UIGestureRecognizerStateEnded;

#else // TARGET_OS_OSX [

#import <React/RCTUIKit.h>

typedef RCTUIView RNGHUIView;
typedef RCTUITouch RNGHUITouch;

#define RNGHGestureRecognizerStateFailed NSGestureRecognizerStateFailed;
#define RNGHGestureRecognizerStatePossible NSGestureRecognizerStatePossible;
#define RNGHGestureRecognizerStateCancelled NSGestureRecognizerStateCancelled;
#define RNGHGestureRecognizerStateBegan NSGestureRecognizerStateBegan;
#define RNGHGestureRecognizerStateEnded NSGestureRecognizerStateEnded;

#endif // ] TARGET_OS_OSX
