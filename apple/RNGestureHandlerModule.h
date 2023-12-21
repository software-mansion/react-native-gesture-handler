#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTUIManager.h>

#ifdef RCT_NEW_ARCH_ENABLED
// TODO: needed to be able to use namespace, but can be done better for sure
#import <ReactCommon/RCTTurboModule.h>
using namespace facebook;
using namespace react;
#endif // RCT_NEW_ARCH_ENABLED

@interface RNGestureHandlerModule : RCTEventEmitter <RCTBridgeModule>

#ifdef RCT_NEW_ARCH_ENABLED
+ (void)installWithRuntime:(jsi::Runtime *)runtime;
#endif // RCT_NEW_ARCH_ENABLED

@end
