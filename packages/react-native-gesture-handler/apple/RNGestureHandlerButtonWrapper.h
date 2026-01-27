#if !TARGET_OS_OSX
#import <UIKit/UIKit.h>
#else
#import <React/RCTUIKit.h>
#endif

#import <React/RCTViewComponentView.h>

#import <react/renderer/components/rngesturehandler_codegen/EventEmitters.h>

using namespace facebook::react;

NS_ASSUME_NONNULL_BEGIN

@interface RNGestureHandlerButtonWrapper : RCTViewComponentView

@end

NS_ASSUME_NONNULL_END
