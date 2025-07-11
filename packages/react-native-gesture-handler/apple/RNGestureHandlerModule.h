#import <React/RCTEventEmitter.h>
#import <React/RCTUIManager.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTEventDispatcherProtocol.h>
#import <React/RCTInitializing.h>
#import <rngesturehandler_codegen/rngesturehandler_codegen.h>
#else
#import <React/RCTBridgeModule.h>
#endif

#import "RNGestureHandlerManager.h"

@interface RNGestureHandlerModule : RCTEventEmitter
#ifdef RCT_NEW_ARCH_ENABLED
                                    <NativeRNGestureHandlerModuleSpec, RCTJSDispatcherModule, RCTInitializing>

+ (RNGestureHandlerManager *)handlerManagerForModuleId:(int)moduleId;
#else
                                    <RCTBridgeModule>
#endif

@end
