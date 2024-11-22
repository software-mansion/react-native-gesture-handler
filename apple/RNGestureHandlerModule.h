#import <React/RCTEventEmitter.h>
#import <React/RCTUIManager.h>

#import <React/RCTEventDispatcherProtocol.h>
#import <React/RCTInitializing.h>
#import <rngesturehandler_codegen/rngesturehandler_codegen.h>

@interface RNGestureHandlerModule : RCTEventEmitter <NativeRNGestureHandlerModuleSpec, RCTJSDispatcherModule, RCTInitializing>

@end
