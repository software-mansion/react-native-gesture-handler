#import "RNGestureHandlerManager.h"

#import <React/RCTLog.h>
#import <React/RCTViewManager.h>
#import <React/RCTComponent.h>

#import "RNGestureHandlerState.h"
#import "RNGestureHandler.h"

@interface RNGestureHandlerManager () <RNGestureHandlerEventEmitter>

@end

@implementation RNGestureHandlerManager
{
    RNGestureHandlerRegistry *_registry;
    RCTUIManager *_uiManager;
    RCTEventDispatcher *_eventDispatcher;
}

- (instancetype)initWithUIManager:(RCTUIManager *)uiManager
                  eventDispatcher:(RCTEventDispatcher *)eventDispatcher
{
    if ((self = [super init])) {
        _uiManager = uiManager;
        _eventDispatcher = eventDispatcher;
        _registry = [RNGestureHandlerRegistry new];
    }
    return self;
}

- (void)createGestureHandler:(NSNumber *)viewTag
                    withName:(NSString *)handlerName
                         tag:(NSNumber *)handlerTag
                      config:(NSDictionary *)config
{
    static NSDictionary *map;
    static dispatch_once_t mapToken;
    dispatch_once(&mapToken, ^{
        map = @{
                @"PanGestureHandler" : [RNPanGestureHandler class],
                @"TapGestureHandler" : [RNTapGestureHandler class],
                @"LongPressGestureHandler": [RNLongPressGestureHandler class],
                @"NativeViewGestureHandler": [RNNativeViewGestureHandler class],
                @"PinchGestureHandler": [RNPinchGestureHandler class],
                @"RotationGestureHandler": [RNRotationGestureHandler class],
                };
    });
    
    Class nodeClass = map[handlerName];
    if (!nodeClass) {
        RCTLogError(@"Gesture handler type %@ is not supported", handlerName);
        return;
    }
    
    RNGestureHandler *gestureHandler = [[nodeClass alloc] initWithTag:handlerTag config:config];
    [_registry registerGestureHandler:gestureHandler forViewWithTag:viewTag];
    
    __weak id<RNGestureHandlerEventEmitter> emitter = self;
    gestureHandler.emitter = emitter;
        
    UIView *view = [_uiManager viewForReactTag:viewTag];
    [gestureHandler bindToView:view];
}

- (void)dropGestureHandlersForView:(NSNumber *)viewTag
{
    [_registry dropGestureHandlersForViewWithTag:viewTag];
}

- (void)handleSetJSResponder:(NSNumber *)viewTag blockNativeResponder:(NSNumber *)blockNativeResponder
{
    // TODO: js responder support
}

- (void)handleClearJSResponder
{
    // TODO: js responder support
}

#pragma mark Events

- (void)sendTouchEvent:(RNGestureHandlerEvent *)event
{
    [_eventDispatcher sendEvent:event];
}

- (void)sendStateChangeEvent:(RNGestureHandlerStateChange *)event
{
    [_eventDispatcher sendEvent:event];
}

@end
