#import <React/RCTEventDispatcherProtocol.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTInitializing.h>
#import <React/RCTUIManager.h>
#import <rngesturehandler_codegen/rngesturehandler_codegen.h>

#import "RNGestureHandlerManager.h"

@interface RNGestureHandlerModule
    : RCTEventEmitter <NativeRNGestureHandlerModuleSpec, RCTJSDispatcherModule, RCTInitializing>

+ (RNGestureHandlerManager *)handlerManagerForModuleId:(int)moduleId;

// Whether a module with this id was ever registered. The manager may still be nil
// after the module is invalidated - invalidation nulls the entry without erasing it.
+ (BOOL)hasModuleWithId:(int)moduleId;

@end
