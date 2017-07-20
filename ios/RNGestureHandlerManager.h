#import <Foundation/Foundation.h>

#import <React/RCTBridgeModule.h>
#import <React/RCTUIManager.h>

@interface RNGestureHandlerManager : NSObject

- (nonnull instancetype)initWithUIManager:(RCTUIManager *)uiManager
                          eventDispatcher:(RCTEventDispatcher *)eventDispatcher;

- (void)createGestureHandler:(nonnull NSNumber *)viewTag
                    withName:(nonnull NSString *)handlerName
                         tag:(nonnull NSNumber *)handlerTag
                      config:(NSDictionary *)config;

- (void)dropGestureHandlersForView:(nonnull NSNumber *)viewTag;

- (void)handleSetJSResponder:(nonnull NSNumber *)viewTag
        blockNativeResponder:(nonnull NSNumber *)blockNativeResponder;

- (void)handleClearJSResponder;

@end
