#import <Foundation/Foundation.h>

#import <React/RCTBridgeModule.h>

#import "RNGestureHandler.h"
#import "RNGestureHandlerDetector.h"
#import "RNGestureHandlerRegistry.h"

@class RCTUIManager;
@class RCTEventDispatcher;

@interface RNGestureHandlerManager : NSObject

#ifdef RCT_NEW_ARCH_ENABLED
@property (nonatomic, strong, readonly, nonnull) RNGestureHandlerRegistry *registry;

- (nonnull instancetype)initWithModuleRegistry:(nonnull RCTModuleRegistry *)moduleRegistry
                                  viewRegistry:(nonnull RCTViewRegistry *)viewRegistry;
#else
- (nonnull instancetype)initWithUIManager:(nonnull RCTUIManager *)uiManager
                          eventDispatcher:(nonnull id<RCTEventDispatcherProtocol>)eventDispatcher;
#endif // RCT_NEW_ARCH_ENABLED

- (void)createGestureHandler:(nonnull NSString *)handlerName
                         tag:(nonnull NSNumber *)handlerTag
                      config:(nonnull NSDictionary *)config;

- (void)attachGestureHandler:(nonnull NSNumber *)handlerTag
               toViewWithTag:(nonnull NSNumber *)viewTag
              withActionType:(RNGestureHandlerActionType)actionType;

- (void)updateGestureHandler:(nonnull NSNumber *)handlerTag config:(nonnull NSDictionary *)config;

- (void)dropGestureHandler:(nonnull NSNumber *)handlerTag;

- (void)dropAllGestureHandlers;

- (void)handleSetJSResponder:(nonnull NSNumber *)viewTag blockNativeResponder:(BOOL)blockNativeResponder;

- (void)handleClearJSResponder;

- (nullable RNGestureHandler *)handlerWithTag:(nonnull NSNumber *)handlerTag;

@end
