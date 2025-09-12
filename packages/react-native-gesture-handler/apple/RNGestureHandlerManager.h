#import <Foundation/Foundation.h>

#import <React/RCTBridgeModule.h>

#import "RNGestureHandler.h"
#import "RNGestureHandlerDetector.h"
#import "RNGestureHandlerRegistry.h"

@class RCTUIManager;
@class RCTEventDispatcher;

@interface RNGestureHandlerManager : NSObject

@property (nonatomic, strong, readonly, nonnull) RNGestureHandlerRegistry *registry;

- (nonnull instancetype)initWithModuleRegistry:(nonnull RCTModuleRegistry *)moduleRegistry
                                  viewRegistry:(nonnull RCTViewRegistry *)viewRegistry;

- (void)createGestureHandler:(nonnull NSString *)handlerName
                         tag:(nonnull NSNumber *)handlerTag
                      config:(nonnull NSDictionary *)config;

- (void)attachGestureHandler:(nonnull NSNumber *)handlerTag
               toViewWithTag:(nonnull NSNumber *)viewTag
              withActionType:(RNGestureHandlerActionType)actionType;

- (void)setGestureHandlerConfig:(nonnull NSNumber *)handlerTag config:(nonnull NSDictionary *)config;

- (void)updateGestureHandlerConfig:(nonnull NSNumber *)handlerTag config:(nonnull NSDictionary *)config;

- (void)dropGestureHandler:(nonnull NSNumber *)handlerTag;

- (void)dropAllGestureHandlers;

- (void)handleSetJSResponder:(nonnull NSNumber *)viewTag blockNativeResponder:(BOOL)blockNativeResponder;

- (void)handleClearJSResponder;

- (nullable RNGestureHandler *)handlerWithTag:(nonnull NSNumber *)handlerTag;

- (nullable RNGHUIView *)viewForReactTag:(nonnull NSNumber *)reactTag;
@end
